import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import {
  map,
  switchMap,
  filter,
  share,
  distinctUntilChanged,
  tap,
  shareReplay,
  throttleTime,
  scan,
  skip,
  take
} from 'rxjs/operators';

import { CardService } from '@mtg-devs/api';
import { toArrayWithKey } from '@mtg-devs/core';

import { Pod, Player, PLAYER_LEFT_KEY, PLAYER_RIGHT_KEY, PodHashMap, DELETE_DELAY } from './pod-model';
import { PlayService } from './play.service';
import { Score } from '../score/score-model';


@Injectable({ providedIn: 'root' })
export class PodService implements OnDestroy {

  get activePodKey() {
    return this.activePodKeySub.value;
  }
  private activePodKeySub = new BehaviorSubject<string>(null);

  get activePlayerKey() {
    return this.activePlayerKeySub.value;
  }
  private activePlayerKeySub = new BehaviorSubject<string>(null);

  private pods$: Observable<Pod[]>;
  private activePod$: Observable<Pod | null>;
  private podReady$: Observable<Pod | null>;
  private podScored$: Observable<Pod>;
  private podsToDelete$: Observable<Pod[]>;
  private podFilled$: Observable<Pod>;

  private leftPlayerKey: string;
  private rightPlayerKey: string;

  constructor(private db: AngularFireDatabase, private playService: PlayService, private cardService: CardService) {
    this.buildObservables();
    this.subscribe();
  }

  getPods(): Observable<Pod[]> {
    return this.pods$;
  }

  getPodReady(): Observable<Pod> {
    return this.podReady$;
  }

  getPodScored(): Observable<Pod> {
    return this.podScored$;
  }

  getActivePod(): Observable<Pod> {
    return this.activePod$;
  }

  getActivePodKey(): string {
    return this.activePodKey;
  }

  getActivePlayerKey(): string {
    return this.activePlayerKey;
  }

  host(name: string, maxPlayers: number, setCode: string): void {
    this.drop();

    this.removePlayerFromExisting().then(() => {
      const promise = this.db.list<Pod>('/pod/').push({
        maxPlayers,
        set: setCode
      });

      promise.then(reference => {
        this.activePodKeySub.next(reference.key);
        this.addPlayerToPod(name, reference.key);
      });
    });
  }

  join(name: string, pod: Pod): void {
    this.drop();

    this.removePlayerFromExisting().then(() => {
      this.activePodKeySub.next(pod.key);
      this.addPlayerToPod(name, this.activePodKey);
    });
  }

  drop(): void {
    this.removePlayerFromExisting().then(() => {
      this.activePodKeySub.next(null);
      this.activePlayerKeySub.next(null);
      this.leftPlayerKey = this.rightPlayerKey = null;
    });
  }

  score(score: Score): void {
    if (this.haveKeys()) {
      this.db.object(`/pod/${this.activePodKey}/players/${this.activePlayerKey}/score`).update(score);
    }
  }

  private buildObservables(): void {
    const allPods$: Observable<Pod[]> = this.db.object<PodHashMap>('/pod/').valueChanges().pipe(
      filter(podHashMap => !!podHashMap),
      map(podHashMap => toArrayWithKey<Pod>(podHashMap)),
      share()
    );

    const podsWithPlayers$: Observable<Pod[]> = allPods$.pipe(
      map(pods => pods.filter(pod => !!pod.players)),
      map(pods => {
        return pods.map(pod => {
          return { ...pod, players: toArrayWithKey<Player>(pod.players) };
        });
      }),
      share()
    );

    this.activePod$ = combineLatest([podsWithPlayers$, this.activePodKeySub]).pipe(
      map(([pods, podKey]) => (podKey && pods.find(pod => pod.key === podKey)) || null),
      shareReplay(1)
    );

    this.podFilled$ = combineLatest([this.activePod$, this.activePlayerKeySub]).pipe(
      filter(([activePod, playerKey]) => !!activePod && !!activePod.players && !!playerKey),
      map(([pod]) => pod),
      filter(pod => this.podIsFilled(pod)),
      tap(() => console.info('DRAFT FILLED')), // tslint:disable-line
      share()
    );

    this.podReady$ = this.podFilled$.pipe(
      filter(pod => this.playersHaveKeys(pod, [PLAYER_LEFT_KEY, PLAYER_RIGHT_KEY])),
      distinctUntilChanged((a, b) => a.key === b.key),
      tap(() => console.info('DRAFT READY')) // tslint:disable-line
    );

    this.podScored$ = combineLatest([this.activePod$, this.activePlayerKeySub]).pipe(
      filter(([activePod, playerKey]) => this.playerHaveKeys(activePod, playerKey, ['score'])),
      map(([pod]) => {
        pod.players = pod.players.filter(player => player.score);
        return pod;
      })
    );

    // Delete any pods that are empty and then still empty some delay later.
    this.podsToDelete$ = allPods$.pipe(
      throttleTime(DELETE_DELAY, undefined, { leading: true, trailing: true }),
      map(pods => pods.filter(pod => !pod.players)),
      scan<Pod[], Pod[]>((acc, curr) => acc.length > 0 ? curr.filter(c => acc.some(a => a.key === c.key)) : curr, []),
      skip(1),
      take(1)
    );

    this.pods$ = podsWithPlayers$.pipe(
      map(pods => {
        return pods
          .filter(pod => pod.players.length > 0 &&
            !this.podIsFilled(pod) &&
            !this.playersHaveKeys(pod, [PLAYER_LEFT_KEY, PLAYER_RIGHT_KEY])
          );
      }),
      shareReplay(1)
    );
  }

  private removePlayerFromExisting(): Promise<void> {
    if (!this.haveKeys()) {
      return Promise.resolve();
    }

    return this.db.object(`/pod/${this.activePodKey}/players/${this.activePlayerKey}`).remove();
  }

  private addPlayerToPod(name: string, podKey: string): void {
    const promise = this.db.list<Player>(`/pod/${podKey}/players/`).push({
      name
    });

    promise.then(reference => {
      this.activePlayerKeySub.next(reference.key);
      this.db.database.ref(`/pod/${podKey}/players/${reference.key}`).onDisconnect().remove();
    });
  }

  private subscribe(): void {
    this.podFilled$
      .pipe(filter(pod => !this.playersHaveKeys(pod, [PLAYER_LEFT_KEY, PLAYER_RIGHT_KEY])))
      .subscribe(pod => {
        const players = pod.players;
        const playerIndex = players.findIndex(player => player.key === this.activePlayerKey);

        this.rightPlayerKey = (players[playerIndex + 1] || players[0]).key;
        this.leftPlayerKey = (players[playerIndex - 1] || players[players.length - 1]).key;

        this.db
          .object(`/pod/${this.activePodKey}/players/${this.activePlayerKey}`)
          .update({
            leftPlayerKey: this.leftPlayerKey,
            rightPlayerKey: this.rightPlayerKey
          });
      });

    const readyPodWithSet$ = this.podReady$.pipe(
      switchMap(pod => this.cardService.getSet(pod.set))
    );

    this.podsToDelete$.subscribe(pods => {
      pods.forEach(pod => this.db.object(`/pod/${pod.key}`).remove());
    });

    readyPodWithSet$.subscribe(set => {
      this.playService.start(this.activePodKey, this.activePlayerKey, this.leftPlayerKey, this.rightPlayerKey, set);
    });
  }

  private podIsFilled(pod: Pod): boolean {
    return pod.players && pod.players.length === pod.maxPlayers;
  }

  private playersHaveKeys(pod: Pod, keys: string[]): boolean {
    return !!pod && !!pod.players && pod.players.every(player => keys.every(key => !!player[key]));
  }

  private playerHaveKeys(pod: Pod, playerKey: string, keys: string[]): boolean {
    if (!pod || !pod.players) {
      return false;
    }

    const player = pod.players.find(p => p.key === playerKey);

    return keys.every(key => !!player[key]);
  }

  private haveKeys(): boolean {
    return !!this.activePlayerKey && !!this.activePodKey;
  }

  ngOnDestroy(): void {
    this.removePlayerFromExisting();
  }
}
