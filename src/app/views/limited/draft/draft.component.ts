import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import {
  takeUntil,
  map,
  filter,
  withLatestFrom,
  startWith,
  switchMap,
  shareReplay,
  tap
} from 'rxjs/operators';

import { CardService, Card } from '@mtg-devs/api';

import { DraftStoreService } from './draft-store.service';
import { LimitedBase } from '../limited-base';
import { FormControl, Validators } from '@angular/forms';
import { DraftPackQueueStoreService } from './draft-pack-queue-store.service';
import { PlayService } from './play.service';
import { ScoreService } from '../score/score.service';
import { DraftSideboardStoreService } from './draft-sidebard-store.service';
import { Pod } from './pod-model';
import { PodService } from './pod.service';


@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-draft'
  }
})
export class DraftComponent extends LimitedBase {

  nickFormControl = new FormControl('', Validators.required);
  maxPlayersFormControl = new FormControl(8, [Validators.required, Validators.min(1), Validators.max(8)]);

  pods$: Observable<Pod[]>;
  scoredPod$: Observable<Pod>;
  sideboard$: Observable<Card[]>;
  playing$: Observable<boolean>;
  pickCounter$: Observable<number>;
  packCounter$: Observable<number>;
  draftDirection$: Observable<boolean>;
  draftInformation$: Observable<string>;
  deckError$: Observable<string | null>;
  finished$: Observable<boolean>;
  displayedColumns: string[] = ['name', 'power', 'mana', 'curve'];

  private basics$: Observable<Card[]>;
  private pickSub = new Subject<Card>();
  private hostSub = new BehaviorSubject<boolean>(false);
  private joinSub = new BehaviorSubject<Pod>(null);

  constructor(private draftStoreService: DraftStoreService,
    private draftSideboardStoreService: DraftSideboardStoreService,
    private draftPackQueueStoreService: DraftPackQueueStoreService,
    private podService: PodService,
    private playService: PlayService,
    private cardService: CardService,
    private scoreService: ScoreService) {
    super();
  }

  get hostingDisabled() {
    return this.hostSub.value;
  }

  get activePodKey() {
    return this.podService.getActivePodKey();
  }

  onCardSelected(card: Card) {
    this.pickSub.next(card);
    this.draftStoreService.add(card);
  }

  onCardRemoved(card: Card) {
    this.draftStoreService.remove(card);
    this.draftSideboardStoreService.add(card);
  }

  onSideboardCardRemoved(card: Card) {
    this.draftStoreService.add(card);
    this.draftSideboardStoreService.remove(card);
  }

  host(): void {
    this.hostSub.next(true);
  }

  drop(): void {
    this.hostSub.next(false);
    this.playService.stop();
    this.podService.drop();
    this.draftStoreService.clear();
    this.draftPackQueueStoreService.clear();
    this.draftSideboardStoreService.clear();
  }

  join(pod: Pod): void {
    if (pod.key !== this.activePodKey) {
      this.joinSub.next(pod);
    }
  }

  protected buildObservables() {
    this.buildCardObservables();
    this.buildDraftInfoObservables();
    this.buildPodObservables();
    this.buildDisconnectObservables();
  }

  private buildDraftInfoObservables(): void {
    const draftedCards$ = combineLatest([this.mainDeck$, this.sideboard$, this.basics$]).pipe(
      map(([mainDeck, sideboard, basics]) => [...mainDeck, ...sideboard].filter(card => !basics.includes(card))),
      shareReplay(1)
    );

    this.pickCounter$ = draftedCards$.pipe(
      withLatestFrom(this.playService.getBoosterLength()),
      map(([cards, boosterLength]) => 1 + cards.length % boosterLength)
    );

    this.packCounter$ = combineLatest([draftedCards$, this.playService.getBoosterLength()]).pipe(
      map(([cards, boosterLength]) => 1 + Math.floor(cards.length / boosterLength))
    );

    this.draftDirection$ = this.packCounter$.pipe(
      map(packCounter => !!(packCounter % 2))
    );

    this.finished$ = this.packCounter$.pipe(
      map(packCounter => packCounter === 4)
    );

    this.draftInformation$ = this.podService.getActivePod().pipe(
      map(activePod => {
        return (activePod && activePod.players)
          ? `${activePod.players.length} player${activePod.players.length > 1 ? 's' : ''} in draft`
          : '';
      })
    );

    this.packCounter$
      .pipe(takeUntil(this.destroySub))
      .subscribe(counter => this.playService.setPackCounter(counter));
  }

  private buildPodObservables(): void {
    const set$ = this.setFormControl.valueChanges.pipe(
      startWith(this.setFormControl.value)
    );

    const hostRequest$ = this.hostSub.pipe(
      filter(host => host && this.formValid()),
      map<boolean, string>(() => this.setFormControl.value)
    );

    const joinRequest$ = this.joinSub.pipe(
      filter(() => this.nickFormControl.valid)
    );

    const scoreRequest$ = this.submitSub.pipe(
      withLatestFrom(this.finished$),
      filter(([, finished]) => finished),
      withLatestFrom(this.mainDeck$),
      map(([, cards]) => cards),
      filter(cards => !this.getLimitedDeckError(cards)),
      withLatestFrom(this.playService.getSet()),
      map(([cards, set]) => this.scoreService.score(cards, set))
    );

    this.cards$ = this.draftPackQueueStoreService.get().pipe(
      map(queue => queue.sort((a, b) => b.length - a.length)),
      map(boosters => boosters[0] || [])
    );

    this.scoredPod$ = this.podService.getPodScored();

    const pickedBooster$ = this.pickSub.pipe(
      withLatestFrom(this.basics$),
      filter(([pick, basics]) => !basics.includes(pick)),
      withLatestFrom(this.cards$),
      map(([[pick], cards]) => [cards.filter(card => card.name !== pick.name), cards])
    );

    this.pods$ = combineLatest([this.podService.getPods(), set$]).pipe(
      map(([pods, set]) => set ? pods.filter(pod => pod.set === set) : pods)
    );

    this.playing$ = this.playService.getPlaying();

    const addBasics$ = this.finished$.pipe(
      filter(finished => finished),
      switchMap(() => this.basics$)
    );

    hostRequest$
      .pipe(takeUntil(this.destroySub))
      .subscribe(set => this.podService.host(this.nickFormControl.value, this.maxPlayersFormControl.value, set));

    joinRequest$
      .pipe(takeUntil(this.destroySub))
      .subscribe(pod => this.podService.join(this.nickFormControl.value, pod));

    pickedBooster$
      .pipe(withLatestFrom(this.draftDirection$), takeUntil(this.destroySub))
      .subscribe(([[pickedBooster, originalBooster], draftDirection]) => {
        this.draftPackQueueStoreService.remove(originalBooster);
        if (pickedBooster.length > 0) {
          this.playService.pick(pickedBooster, draftDirection);
        }
      });

    addBasics$
      .pipe(takeUntil(this.destroySub))
      .subscribe(cards => this.draftPackQueueStoreService.add(cards));

    scoreRequest$
      .pipe(takeUntil(this.destroySub))
      .subscribe(score => {
        this.draftPackQueueStoreService.clear();
        this.podService.score(score);
      });
  }

  private buildDisconnectObservables(): void {
    combineLatest([this.draftPackQueueStoreService.get(), this.draftDirection$])
      .pipe(takeUntil(this.destroySub))
      .subscribe(([boosters, forward]) => this.playService.updateDraftPackQueue(boosters, forward));

    this.playService.getBoostersFromLeavingPlayer()
      .pipe(withLatestFrom(this.cards$.pipe(filter(cards => cards.length > 0))), takeUntil(this.destroySub))
      .subscribe(([boosters, previousBooster]) => {
        boosters
          .filter(booster => booster.length !== previousBooster.length)
          .forEach(booster => this.draftPackQueueStoreService.add(booster));
      });
  }

  private buildCardObservables(): void {
    this.mainDeck$ = this.draftStoreService.get();
    this.sideboard$ = this.draftSideboardStoreService.get();
    this.basics$ = this.cardService.getBasics();
    this.deckError$ = this.mainDeck$.pipe(
      map(cards => this.getLimitedDeckError(cards))
    );
  }

  private formValid(): boolean {
    return this.nickFormControl.valid && this.setFormControl.valid && this.maxPlayersFormControl.valid;
  }
}
