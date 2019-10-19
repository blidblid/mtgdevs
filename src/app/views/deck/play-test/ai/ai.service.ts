import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, zip, merge, of } from 'rxjs';
import { withLatestFrom, map, switchMap, filter, tap, startWith, takeUntil, share, scan, delay } from 'rxjs/operators';

import { CardService, Card } from '@mtg-devs/api';
import { TableZone, TableCardMoved } from '@mtg-devs/components';

import { AiPlayTemplate, AiPlay, AI_PLAY, AiPlayType } from './ai-model';
import { PlayTestAiHandStore } from '../store/play-test-ai-hand-store';
import { PlayTestBattlefieldStore } from '../store/play-test-battlefield-store';
import { PlayTestLandStore } from '../store/play-test-land-store';


@Injectable({ providedIn: 'root' })
export class AiService implements OnDestroy {

  private tickSub = new Subject<void>();
  private responseSub = new Subject<boolean>();
  private destroySub = new Subject<void>();
  private drawModuloSub = new Subject<number>();

  private hand$: Observable<AiPlayTemplate[]>;
  private playCard$: Observable<AiPlay | null>;
  private battlefield$: Observable<Card[]> = this.battlefield.get();
  private land$: Observable<Card[]> = this.land.get();
  private cardOnStack$: Observable<Card | null>;
  private resolvedPlay$: Observable<AiPlay>;

  private aiPlays: AiPlayTemplate[] = [];

  constructor(
    private cardService: CardService,
    private hand: PlayTestAiHandStore,
    private battlefield: PlayTestBattlefieldStore,
    private land: PlayTestLandStore
  ) {
    this.buildObservables();
  }

  tick(): void {
    this.tickSub.next();
  }

  respond(resolve: boolean): void {
    this.responseSub.next(resolve);
  }

  init(drawModulo: number, aiPlays: AiPlayTemplate[]): void {
    this.hand.clear();
    this.aiPlays = aiPlays;
    this.drawModuloSub.next(drawModulo);
  }

  getAiMovedCard(): Observable<TableCardMoved> {
    return this.resolvedPlay$.pipe(
      filter(play => play && play.template.type === AiPlayType.Interaction),
      map(play => {
        return {
          card: play.target,
          source: play.source,
          target: play.template.resolutionZone
        };
      })
    );
  }

  getCardOnStack(): Observable<Card | null> {
    return this.cardOnStack$;
  }

  getAiAddPermanent(): Observable<AiPlayTemplate> {
    return this.resolvedPlay$.pipe(
      filter(play => play && play.template.type === AiPlayType.Permanent),
      map(play => play.template)
    );
  }

  getAiHandSize(): Observable<number> {
    return this.hand.get().pipe(
      map(plays => plays.length)
    );
  }

  drawCard(amount: number = 1): void {
    while (amount--) {
      this.hand.add(this.getRandom(this.aiPlays));
    }
  }

  discardCard(amount: number = 1): void {
    while (amount--) {
      this.hand.pop();
    }
  }

  private buildObservables(): void {
    this.hand$ = this.hand.get().pipe(
      switchMap(plays => {
        if (plays.length === 0) {
          return of([]);
        }

        return zip(...plays.map(play => {
          return this.cardService.getCard(play.cardName).pipe(
            map(card => Object.assign(play, { card }))
          );
        }));
      })
    );

    this.playCard$ = this.tickSub.pipe(
      delay(0), // wait for stores to update at beginning of turn
      withLatestFrom(this.hand$, this.battlefield$, this.land$),
      map(([, cards, battlefield, land]) => this.findPlay(cards, battlefield, land)),
      share()
    );

    this.resolvedPlay$ = this.playCard$.pipe(
      filter(play => !!play),
      switchMap(card => this.responseSub.pipe(map(resolve => resolve ? card : null)))
    );

    this.cardOnStack$ = merge(this.responseSub, this.playCard$).pipe(
      map(response => (!response || typeof response === 'boolean') ? null : response.template.card),
      startWith(null)
    );

    this.resolvedPlay$
      .pipe(takeUntil(this.destroySub))
      .subscribe(play => this.hand.remove(play.template));

    const drawCard$ = merge(this.drawModuloSub, this.tickSub).pipe(
      scan((acc, curr) => typeof curr === 'number' ? 0 : acc + 1, 0),
      withLatestFrom(this.drawModuloSub),
      filter(([counter, drawModulo]) => counter % drawModulo === 0)
    );

    drawCard$
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => this.drawCard());
  }

  private findPlay(hand: AiPlayTemplate[], battlefield: Card[], land: Card[]): AiPlay | null {
    const interactions = hand.filter(play => play.type === AiPlayType.Interaction);
    const permanents = hand.filter(play => play.type === AiPlayType.Permanent);

    return this.findInteractionPlay(interactions, battlefield, land) || this.findPermanentPlay(permanents);
  }

  private findPermanentPlay(permanents: AiPlayTemplate[]): AiPlay | null {
    const play = this.getRandom(permanents);
    return play ? { template: play } : null;
  }

  private findInteractionPlay(hand: AiPlayTemplate[], battlefield: Card[], land: Card[]): AiPlay | null {
    const plays = [
      this.findInteractionPlayInZone(hand, battlefield, TableZone.Battlefield),
      this.findInteractionPlayInZone(hand, land, TableZone.Land)
    ];

    return plays
      .filter(play => !!play)
      .sort((a, b) => b.score - a.score)[0] || null;
  }

  private findInteractionPlayInZone(plays: AiPlayTemplate[], cards: Card[], zone: TableZone): AiPlay | null {
    const playsForZone = plays.filter(play => this.legalZone(play, zone));

    const optimalPlay = playsForZone.reduce((acc, curr) => {
      const target = this.legalTargetWithHighestCmc(curr, cards);

      if (!curr.card) {
        console.warn(`AI tried to play ${curr.cardName}, but found no such card in magic.`); // tslint:disable-line
        return acc;
      }

      if (target) {
        const score = target.convertedManaCost / (curr.card.convertedManaCost || 1);
        if (!acc || score > acc.score) {
          return {
            template: curr,
            source: zone,
            score,
            target
          };
        }
      }

      return acc;
    }, null as AiPlay | null);

    return optimalPlay;
  }

  private legalTargetWithHighestCmc(play: AiPlayTemplate, cards: Card[]): Card | null {
    const legalTargets = cards
      .filter(card => card.types.some(type => play.target.types.includes(type)))
      .sort((a, b) => b.convertedManaCost - a.convertedManaCost);

    return legalTargets[0] || null;
  }

  private legalZone(play: AiPlayTemplate, zone: TableZone): boolean {
    return play.target.zones.some(z => z === zone);
  }

  private getRandom(plays: AiPlayTemplate[]): AiPlayTemplate {
    return plays[Math.floor(Math.random() * plays.length)];
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
