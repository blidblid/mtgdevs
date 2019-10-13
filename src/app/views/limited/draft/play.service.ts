import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, BehaviorSubject, of, Subject, merge, combineLatest } from 'rxjs';
import { switchMap, filter, map, shareReplay, withLatestFrom, auditTime, distinctUntilChanged } from 'rxjs/operators';

import { Card, CardSet } from '@mtg-devs/api';
import { BoosterService } from '@mtg-devs/core';

import { PlayConfig } from './play-model';
import { DraftPackQueueStoreService } from './draft-pack-queue-store.service';


@Injectable({ providedIn: 'root' })
export class PlayService {

  private startSub = new BehaviorSubject<PlayConfig>(null);
  private boosterLengthSub = new Subject<number>();
  private pickSub = new Subject<[Card[], boolean]>();
  private packCounterSub = new Subject<number>();
  private draftPackQueueSub = new Subject<[Card[][], boolean]>();

  private passedBooster$: Observable<Card[]>;
  private boostersFromLeavingPlayer$: Observable<Card[][]>;
  private boosterLength$: Observable<number>;
  private playing$: Observable<boolean>;
  private set$: Observable<CardSet | null>;
  private lastPlayerLeftKey$: Observable<string | null>;
  private lastPlayerRightKey$: Observable<string | null>;

  constructor(
    private db: AngularFireDatabase,
    private generatorService: BoosterService,
    private draftPackQueueStoreService: DraftPackQueueStoreService
  ) {
    this.buildObservables();
    this.buildDisconnectObservables();
    this.buildRequestObservables();
    this.subscribe();
  }

  stop(): void {
    this.startSub.next(null);
  }

  start(podKey: string, playerKey: string, leftPlayerKey: string, rightPlayerKey: string, cardSet: CardSet) {
    this.startSub.next({
      podKey,
      playerKey,
      leftPlayerKey,
      rightPlayerKey,
      cardSet
    });

    this.openBooster();
  }

  getBoosterLength(): Observable<number> {
    return this.boosterLength$;
  }

  getPlaying(): Observable<boolean> {
    return this.playing$;
  }

  getSet(): Observable<CardSet | null> {
    return this.set$;
  }

  getBoostersFromLeavingPlayer(): Observable<Card[][]> {
    return this.boostersFromLeavingPlayer$;
  }

  pick(booster: Card[], forward: boolean): void {
    if (booster.length > 0) {
      this.pickSub.next([booster, forward]);
    }
  }

  setPackCounter(counter: number): void {
    this.packCounterSub.next(counter);
  }

  updateDraftPackQueue(boosters: Card[][], forward: boolean): void {
    this.draftPackQueueSub.next([boosters, forward]);
  }

  private buildObservables(): void {
    this.passedBooster$ = this.startSub.pipe(
      switchMap(config => {
        return config
          ? this.db.object<Card[]>(`/play/${config.podKey}/${config.playerKey}/booster`).valueChanges()
          : of([]);
      }),
      filter(booster => !!booster)
    );

    this.playing$ = this.startSub.pipe(
      map(config => !!config)
    );

    this.boosterLength$ = this.boosterLengthSub.pipe(
      shareReplay(1)
    );

    this.set$ = this.startSub.pipe(
      map(config => config ? config.cardSet : null)
    );

    const newPack$ = this.packCounterSub.pipe(
      filter(packCounter => packCounter === 2 || packCounter === 3),
      distinctUntilChanged()
    );

    newPack$.subscribe(() => this.openBooster());
  }

  private buildDisconnectObservables(): void {
    const validConfig$: Observable<PlayConfig> = this.startSub.pipe(filter(config => !!config));
    const invalidConfig$: Observable<null> = this.startSub.pipe(filter((config): config is null => !config));

    const initialLeft$ = validConfig$.pipe(map(config => config.leftPlayerKey));
    const updatedLeft$ = validConfig$.pipe(
      switchMap(config => this.db.object<string>(`/play/${config.podKey}/${config.playerKey}/leftKey`).valueChanges()),
      filter(key => !!key)
    );

    const initialRight$ = validConfig$.pipe(map(config => config.rightPlayerKey));
    const updatedRight$ = validConfig$.pipe(
      switchMap(config => this.db.object<string>(`/play/${config.podKey}/${config.playerKey}/rightKey`).valueChanges()),
      filter(key => !!key)
    );

    const lastPodKey$ = validConfig$.pipe(map(config => config.podKey));
    this.lastPlayerLeftKey$ = merge(initialLeft$, updatedLeft$);
    this.lastPlayerRightKey$ = merge(initialRight$, updatedRight$);

    // Player disconnecting.
    combineLatest(this.lastPlayerLeftKey$, this.lastPlayerRightKey$, lastPodKey$)
      .subscribe(([leftKey, rightKey, podKey]) => {
        this.swapPlayerKeys(podKey, leftKey, rightKey, true, true);
        this.swapPlayerKeys(podKey, leftKey, rightKey, false, true);
      });

    const draftQueueWithKeys$ = this.draftPackQueueSub.pipe(
      withLatestFrom(this.lastPlayerLeftKey$, this.lastPlayerRightKey$, lastPodKey$)
    );

    draftQueueWithKeys$.subscribe(([[boosters, forward], leftKey, rightKey, podKey]) => {
      this.passBoostersToPlayer(podKey, leftKey, rightKey, forward, boosters, true);
    });

    // Player dropping.
    invalidConfig$
      .pipe(withLatestFrom(this.lastPlayerLeftKey$, this.lastPlayerRightKey$, lastPodKey$))
      .subscribe(([, leftKey, rightKey, podKey]) => {
        this.swapPlayerKeys(podKey, leftKey, rightKey, true, false);
        this.swapPlayerKeys(podKey, leftKey, rightKey, false, false);
      });

    invalidConfig$
      .pipe(withLatestFrom(draftQueueWithKeys$))
      .subscribe(([, [[boosters, forward], leftKey, rightKey, podKey]]) => {
        this.passBoostersToPlayer(podKey, leftKey, rightKey, forward, boosters, false);
      });

    this.boostersFromLeavingPlayer$ = this.startSub.pipe(
      switchMap(config => {
        return config
          ? this.db.list<Card[]>(`/play/${config.podKey}/${config.playerKey}/boostersFromLeavingPlayer`)
            .valueChanges()
            .pipe(auditTime(100))
          : of([]);
      }),
      filter(boosters => boosters.length > 0)
    )
  }

  private passBoostersToPlayer(podKey: string, leftKey: string, rightKey: string, forward: boolean, boosters: Card[][], onDisconnect: boolean): void {
    const passingTo = forward ? leftKey : rightKey;
    const refPath = `/play/${podKey}/${passingTo}/boostersFromLeavingPlayer`;

    if (onDisconnect) {
      this.db.database.ref(refPath).onDisconnect().set(boosters);
    } else {
      this.db.object(refPath).set(boosters);
    }
  }

  private swapPlayerKeys(podKey: string, leftKey: string, rightKey: string, forward: boolean, onDisconnect: boolean) {
    const to = forward ? leftKey : rightKey;
    const from = forward ? rightKey : leftKey;
    const target = forward ? 'rightKey' : 'leftKey';
    const refPath = `/play/${podKey}/${to}/${target}`;

    if (onDisconnect) {
      this.db.database.ref(refPath).onDisconnect().set(from);
    } else {
      this.db.object(refPath).set(from);
    }
  };

  private buildRequestObservables(): void {
    const pickRequest$ = this.pickSub.pipe(
      withLatestFrom(this.lastPlayerLeftKey$),
      withLatestFrom(this.lastPlayerRightKey$)
    );

    pickRequest$.subscribe(([[[cards, forward], leftPlayerKey], rightPlayerKey]) => {
      if (leftPlayerKey && rightPlayerKey) {
        this.passPlayerBooster(forward ? leftPlayerKey : rightPlayerKey, cards);
      }
    });
  }

  private passPlayerBooster(playerKey: string, booster: Card[]): void {
    this.db.object(`/play/${this.startSub.value.podKey}/${playerKey}`).update({ booster });
  }

  private openBooster(): void {
    console.log('OPENING BOOSTER'); // tslint:disable-line
    const booster = this.generatorService.generateBoosterFromSet(this.startSub.value.cardSet);
    this.boosterLengthSub.next(booster.length);

    this.passPlayerBooster(this.startSub.value.playerKey, booster);
  }

  private subscribe(): void {
    this.passedBooster$
      .pipe(filter(booster => booster.length > 0))
      .subscribe(booster => this.draftPackQueueStoreService.add(booster));
  }
}
