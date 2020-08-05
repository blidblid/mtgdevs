import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, startWith, takeUntil, map, shareReplay, withLatestFrom, filter } from 'rxjs/operators';
import { combineLatest, Observable, merge } from 'rxjs';

import { CardService, Card } from '@mtg-devs/api';
import { CardSorterService, BoosterService } from '@mtg-devs/core';

import { SealedStoreService } from './sealed-store.service';
import { LimitedBase } from '../limited-base';
import { ScoreService } from '../score/score.service';
import { Score } from '../score/score-model';
import { SealedScoreStoreService } from './sealed-score-store.service';


@Component({
  selector: 'app-sealed',
  templateUrl: './sealed.component.html',
  styleUrls: ['./sealed.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-sealed'
  }
})
export class SealedComponent extends LimitedBase {

  poolLength$: Observable<number>;
  mainDeckLength$: Observable<number>;
  score$: Observable<Score[]>;
  draftScored$: Observable<boolean>;
  deckError$: Observable<string | null>;
  basics$: Observable<Card[]>;
  displayedColumns: string[] = ['power', 'mana', 'curve', 'setCode', 'date', 'remove'];

  constructor(
    private cardService: CardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sealedStoreService: SealedStoreService,
    private cardSorterService: CardSorterService,
    private scoreService: ScoreService,
    private generatorService: BoosterService,
    private sealedScoreStoreService: SealedScoreStoreService) {
    super();
    this.sealedStoreService.clear();
  }

  onCardSelected(card: Card) {
    this.sealedStoreService.add(card);
  }

  onCardRemoved(card: Card) {
    this.sealedStoreService.remove(card);
  }

  removeScore(score: Score) {
    this.sealedScoreStoreService.remove(score, 1, ['power', 'date']);
  }

  refresh(): void {
    this.sealedStoreService.clear();
    this.refreshSub.next(null);
  }

  protected buildObservables() {
    const set$ = this.activatedRoute.paramMap.pipe(
      startWith(this.activatedRoute.snapshot.paramMap),
      map(paramMap => paramMap.get('param'))
    );

    const pool$ = combineLatest(set$, this.refreshSub).pipe(
      switchMap(([set]) => this.cardService.getSet(set)),
      map(set => this.generatorService.generateBoosterFromSet(set, 6))
    );

    const sortedPool$ = combineLatest(pool$, this.cardSorterService.getSortBy()).pipe(
      map(([cards, sorter]) => sorter(cards)),
      shareReplay(1)
    );

    this.basics$ = this.cardService.getBasics();

    this.mainDeck$ = this.sealedStoreService.get();

    this.cards$ = combineLatest(sortedPool$, this.mainDeck$, this.basics$).pipe(
      map(([pool, mainDeck, basics]) => pool.filter(card => basics.includes(card) || !mainDeck.includes(card)))
    );

    this.mainDeckLength$ = this.mainDeck$.pipe(
      map(cards => cards.length)
    );

    this.poolLength$ = this.cards$.pipe(
      map(cards => cards.length)
    );

    set$
      .pipe(takeUntil(this.destroySub))
      .subscribe(set => {
        this.setFormControl.setValue(set, { emitEvent: false });
        this.sealedStoreService.clear();
      });

    const cardSet$ = set$.pipe(
      switchMap(set => this.cardService.getSet(set))
    );

    const scoreRequest$ = this.submitSub.pipe(
      withLatestFrom(this.mainDeck$),
      filter(([, cards]) => !this.getLimitedDeckError(cards)),
      withLatestFrom(cardSet$),
      map(([[, cards], set]) => this.scoreService.score(cards, set))
    );

    this.draftScored$ = merge(scoreRequest$, pool$).pipe(
      map(scoreOrPool => 'curve' in scoreOrPool && 'power' in scoreOrPool)
    );

    this.deckError$ = this.mainDeck$.pipe(
      map(cards => this.getLimitedDeckError(cards))
    );

    scoreRequest$
      .pipe(takeUntil(this.destroySub))
      .subscribe(score => this.sealedScoreStoreService.add(score, 1, true));

    this.setFormControl.valueChanges
      .pipe(takeUntil(this.destroySub))
      .subscribe(value => this.router.navigate([`sealed/${value}`]));

    this.score$ = this.sealedScoreStoreService.get();
  }
}
