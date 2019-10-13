import { Component, OnInit, ViewEncapsulation, OnDestroy, Inject } from '@angular/core';
import { SPACE, D, S, X, UP_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import { FormControl, Validators } from '@angular/forms';
import { map, switchMap, takeUntil, withLatestFrom, filter, share, scan, startWith, tap, shareReplay } from 'rxjs/operators';
import { Observable, Subject, fromEvent, merge, combineLatest, BehaviorSubject } from 'rxjs';

import { Card, StoredDeck, DeckService } from '@mtg-devs/api';
import { CardFilterService, StoreBase, CardAnalyzeService } from '@mtg-devs/core';
import { TableZone, TableCardClicked, TableCardMoved, TableCardCounterChanged } from '@mtg-devs/components';

import { PlayTestBattlefieldStore } from './store/play-test-battlefield-store';
import { PlayTestExileStore } from './store/play-test-exile-store';
import { PlayTestGraveyardStore } from './store/play-test-graveyard-store';
import { PlayTestHandStore } from './store/play-test-hand-store';
import { PlayTestLandStore } from './store/play-test-land-store';
import { PlayTestLibraryStore } from './store/play-test-library-store';
import { StoredDeckStoreService } from 'app/views/limited/sealed/stored-deck-store.service';
import { PLAY_TEST_CLICK_HANDLER, PlayTestClickHandler } from './play-test-click-handler';
import { AiService } from './ai/ai.service';
import { PlayTestAiPermanentStore } from './store/play-test-ai-permanent-store';
import { AiPlayTemplate, AiEffectType, AiPermanentEffect } from './ai/ai-model';


@Component({
  selector: 'app-play-test',
  templateUrl: './play-test.component.html',
  styleUrls: ['./play-test.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-play-test'
  }
})
export class PlayTestComponent implements OnDestroy, OnInit {

  deckFormControl = new FormControl(null, Validators.required);
  aiEnabledFormControl = new FormControl(true);

  battlefield$: Observable<Card[]>;
  exile$: Observable<Card[]>;
  graveyard$: Observable<Card[]>;
  hand$: Observable<Card[]>;
  land$: Observable<Card[]>;
  library$: Observable<Card[]>;
  started$: Observable<boolean>;
  playerLifeIcon$: Observable<string>;
  opponentLifeIcon$: Observable<string>;
  passDisabled$: Observable<boolean>;
  playerTurn$: Observable<boolean>;
  passTurnButtonLabel$: Observable<string>;
  cardOnStack$: Observable<Card> = this.ai.getCardOnStack();
  aiPermanents$: Observable<AiPlayTemplate[]> = this.aiPermanents.get();
  aiHandSize$: Observable<number> = this.ai.getAiHandSize()
  storedDecks$: Observable<StoredDeck[]> = this.storedDeckStore.get();

  lifeSub = new BehaviorSubject<number>(20);
  opponentLifeSub = new BehaviorSubject<number>(20);

  private zoneStores = [this.battlefield, this.exile, this.graveyard, this.hand, this.land, this.library];
  private drawSub = new Subject<void>();
  private destroySub = new Subject<void>();
  private passTurnSub = new Subject<void>();
  private deckKeySub = new Subject<string>();

  get aiEnabled(): boolean {
    return this.aiEnabledFormControl.value;
  }

  constructor(
    private battlefield: PlayTestBattlefieldStore,
    private exile: PlayTestExileStore,
    private graveyard: PlayTestGraveyardStore,
    private hand: PlayTestHandStore,
    private land: PlayTestLandStore,
    private library: PlayTestLibraryStore,
    private filter: CardFilterService,
    private storedDeckStore: StoredDeckStoreService,
    private deckService: DeckService,
    private cardAnalyze: CardAnalyzeService,
    private ai: AiService,
    private aiPermanents: PlayTestAiPermanentStore,
    @Inject(PLAY_TEST_CLICK_HANDLER) private clickHandlers: PlayTestClickHandler[]
  ) { }

  start(): void {
    this.clear();

    if (this.deckFormControl.valid) {
      this.deckKeySub.next(this.deckFormControl.value);
      this.lifeSub.next(20);
      this.opponentLifeSub.next(20);

      if (this.aiEnabled)
        this.ai.init();
    }
  }

  draw(): void {
    this.drawSub.next();
  }

  passTurn(): void {
    this.passTurnSub.next();
  }

  aiDiscard(): void {
    this.ai.discardCard();
  }

  onCardClicked(event: TableCardClicked): void {
    const handler = this.clickHandlers.find(handler => handler.handles === event.zone);

    if (handler) {
      const move = handler.fn(event);

      if (move && move.source !== move.target) {
        this.moveFromZoneToZone(move.card, move.source, move.target);
      } else {
        event.card.tapped = !event.card.tapped;
      }
    }
  }

  onCardMoved(event: TableCardMoved): void {
    this.moveFromZoneToZone(event.card, event.source, event.target);
    event.card.tapped = false;
  }

  onCardCounterChanged(event: TableCardCounterChanged): void {
    const card = event.card;
    this.getStoreForZone(event.zone).update({ ...card, counter: event.change }, card);
  }

  clear(clearDeck?: boolean): void {
    this.zoneStores.forEach(store => store.clear());
    this.aiPermanents.clear();
    if (clearDeck) {
      this.deckFormControl.reset(null, { emitEvent: false });
    }
  }

  respondToAi(response: boolean): void {
    this.ai.respond(response);
  }

  destroyAiPermanent(permanent: AiPlayTemplate): void {
    this.aiPermanents.remove(permanent);
  }

  private buildStartObservables(): void {
    const cards$ = this.deckKeySub.pipe(
      switchMap(deckKey => this.deckService.getDeck(deckKey)),
      map(userDeck => userDeck.cards),
      map(cards => this.filter.byRandomness(cards))
    );

    cards$
      .pipe(takeUntil(this.destroySub))
      .subscribe(cards => {
        while (cards.length > 7) {
          this.library.add(cards.shift());
        }

        while (cards.length) {
          this.hand.add(cards.pop());
        }
      });
  };

  private buildGamePlayObservables(): void {
    const keydown$ = fromEvent<KeyboardEvent>(document.body, 'keydown');
    const keyCode$ = keydown$.pipe(map(event => !event.ctrlKey && event.keyCode));
    const ctrlKeyCode$ = keydown$.pipe(map(event => event.ctrlKey && event.keyCode));

    const draw$ = merge(keyCode$.pipe(filter(k => k === D)), this.drawSub);
    const stop$ = keyCode$.pipe(filter(k => k === X));
    const start$ = merge(this.deckFormControl.valueChanges, keyCode$.pipe(filter(k => k === S)));
    const space$ = keyCode$.pipe(filter(k => k === SPACE && document.activeElement.tagName !== 'BUTTON'));
    const upArrow$ = keyCode$.pipe(filter(k => k === UP_ARROW));
    const downArrow$ = keyCode$.pipe(filter(k => k === DOWN_ARROW));
    const ctrlUpArrow$ = ctrlKeyCode$.pipe(filter(k => k === UP_ARROW));
    const ctrlDownArrow$ = ctrlKeyCode$.pipe(filter(k => k === DOWN_ARROW));
    this.passDisabled$ = this.ai.getCardOnStack().pipe(map(card => !!card));

    this.playerTurn$ = merge(this.passTurnSub, space$).pipe(
      withLatestFrom(this.passDisabled$),
      filter(([, passDisabled]) => !passDisabled),
      scan<[void, boolean], boolean>(acc => !this.aiEnabled || !acc, true),
      startWith(true),
      shareReplay(1)
    );

    this.passTurnButtonLabel$ = this.playerTurn$.pipe(
      map(turn => {
        if (!this.aiEnabled) {
          return 'Next turn';
        } else {
          return turn ? 'AI turn' : 'My turn';
        }
      })
    );

    const playerTurn$ = this.playerTurn$.pipe(filter(turn => turn));
    const aiTurn$ = this.playerTurn$.pipe(filter(turn => !turn && this.aiEnabled));

    const cardToDraw$ = merge(draw$, playerTurn$).pipe(
      withLatestFrom(this.library$),
      filter(([, library]) => library.length > 0),
      map(([, library]) => library[0])
    );

    const cardsToUntap$ = playerTurn$.pipe(
      withLatestFrom(this.battlefield$, this.land$),
      map(([, battlefield, land]) => [...battlefield, ...land])
    );

    cardToDraw$
      .pipe(takeUntil(this.destroySub))
      .subscribe(card => {
        this.library.remove(card);
        this.hand.add(card);
      });

    cardsToUntap$
      .pipe(takeUntil(this.destroySub))
      .subscribe(cards => {
        cards.forEach(card => card.tapped = false);
        this.battlefield.push();
        this.land.push();
      });

    start$
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => this.start());

    stop$
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => this.clear(true));

    aiTurn$
      .pipe(withLatestFrom(this.aiPermanents$), takeUntil(this.destroySub))
      .subscribe(([, aiPermanents]) => {
        this.ai.tick();
        const effects: AiPermanentEffect[] = aiPermanents.reduce((acc, curr) => {
          return curr.effects ? [...acc, ...curr.effects] : acc;
        }, [])
        this.triggerAiEffects(effects);
      });

    this.ai.getAiPassed()
      .pipe(takeUntil(this.destroySub))
      .subscribe(() => this.passTurn());

    merge(upArrow$, downArrow$)
      .pipe(takeUntil(this.destroySub))
      .subscribe(keyCode => this.changeLife(keyCode === UP_ARROW ? 1 : -1));

    merge(ctrlUpArrow$, ctrlDownArrow$)
      .pipe(takeUntil(this.destroySub))
      .subscribe(keyCode => this.changeLife(keyCode === UP_ARROW ? 1 : -1, false));
  }

  private buildStoreObservables(): void {
    const addDefaults = (source: Observable<Card[]>, counter?: number) => {
      return source.pipe(map(cards => cards.map(card => {
        if (card.counter === undefined && counter !== undefined) {
          card.counter = this.cardAnalyze.isPlaneswalker(card) ? parseInt(card.loyalty) : counter;
        } else if (counter === undefined) {
          card.counter = undefined;
        }
        return card;
      })));
    }

    this.exile$ = addDefaults(this.exile.get());
    this.graveyard$ = addDefaults(this.graveyard.get());
    this.hand$ = addDefaults(this.hand.get());
    this.land$ = addDefaults(this.land.get());
    this.library$ = addDefaults(this.library.get());
    this.land$ = addDefaults(this.land.get(), 0);
    this.battlefield$ = addDefaults(this.battlefield.get(), 0);
    this.started$ = combineLatest(
      this.battlefield$,
      this.exile$,
      this.graveyard$,
      this.hand$,
      this.land$,
      this.library$
    ).pipe(
      map(cards => cards.reduce((acc, curr) => [...acc, ...curr], []).length > 0),
      share()
    )
  }

  private buildLifeCounterObservables(): void {
    const iconByLifeTotal = (life: number) => {
      if (life >= 20) {
        return 'sentiment_very_satisfied'
      } else if (life >= 10) {
        return 'sentiment_satisfied'
      } else if (life >= 1) {
        return 'sentiment_dissatisfied'
      } else {
        return 'sentiment_very_dissatisfied'
      }
    }

    this.playerLifeIcon$ = this.lifeSub.pipe(
      map(life => iconByLifeTotal(life))
    );

    this.opponentLifeIcon$ = this.opponentLifeSub.pipe(
      map(life => iconByLifeTotal(life))
    );
  }

  private subscribeToAi(): void {
    this.ai.getAiMovedCard()
      .pipe(takeUntil(this.destroySub))
      .subscribe(cardMoved => this.moveFromZoneToZone(cardMoved.card, cardMoved.source, cardMoved.target));

    this.ai.getAiAddPermanent()
      .pipe(takeUntil(this.destroySub))
      .subscribe(play => this.aiPermanents.add(play));
  }

  private moveFromZoneToZone(card: Card, source: TableZone, target: TableZone): void {
    this.getStoreForZone(source).remove(card);
    this.getStoreForZone(target).add(card);
  }

  private getStoreForZone(zone: TableZone): StoreBase<Card> {
    switch (zone) {
      case (TableZone.Battlefield):
        return this.battlefield;
      case (TableZone.Exile):
        return this.exile;
      case (TableZone.Graveyard):
        return this.graveyard;
      case (TableZone.Hand):
        return this.hand;
      case (TableZone.Land):
        return this.land;
      case (TableZone.Library):
        return this.library;
    }
  }

  private triggerAiEffects(effects: AiPermanentEffect[]): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case (AiEffectType.Damage):
          this.changeLife(-effect.amount);
          break;
        case (AiEffectType.Heal):
          this.changeLife(effect.amount, false);
          break;
        case (AiEffectType.Draw):
          this.ai.drawCard(effect.amount);
          break;
      }
    })
  }

  private changeLife(changeWith: number, player: boolean = true): void {
    if (player) {
      this.lifeSub.next(this.lifeSub.value + changeWith);
    } else {
      this.opponentLifeSub.next(this.opponentLifeSub.value + changeWith);
    }
  }

  ngOnInit(): void {
    this.buildStoreObservables();
    this.buildStartObservables();
    this.buildGamePlayObservables();
    this.buildLifeCounterObservables();
    this.subscribeToAi();
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
