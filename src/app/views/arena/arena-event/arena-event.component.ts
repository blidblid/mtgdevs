import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map, share, startWith, filter, shareReplay, distinctUntilChanged } from 'rxjs/operators';

import { MathService } from '@mtg-devs/core';

import { ARENA_EVENT, ArenaEvent, Payout, DisplayResult, DisplayPayout, Normalizer } from './arena-event-model';
import { NORMALIZE_ANIMATION } from './arena-event-animations';


@Component({
  selector: 'app-arena-event',
  templateUrl: './arena-event.component.html',
  styleUrls: ['./arena-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-arena-event'
  },
  animations: NORMALIZE_ANIMATION
})
export class ArenaEventComponent implements OnInit {

  normalizeFormGroup: FormGroup = new FormGroup({
    goldPerGem: new FormControl(7),
    goldPerPack: new FormControl(1000),
    goldPerUncommon: new FormControl(50),
    goldPerRare: new FormControl(150),
    goldPerMythic: new FormControl(250)
  });

  winPercentage = new FormControl(50);

  normalize: FormControl = new FormControl(true);

  expectedPayout$: Observable<DisplayPayout[]>;

  data$: Observable<number[][]>;

  payoutCategories: string[];

  eventCategories: string[];

  constructor(@Inject(ARENA_EVENT) private arenaEvents: ArenaEvent[], private mathService: MathService) { }


  private setDataGridProperties(): void {
    this.payoutCategories = [...Object.keys(this.arenaEvents[0].payouts[0]), 'Total Gold'];
    this.eventCategories = this.arenaEvents.map(event => event.name);
  }

  /** Builds observable of results from math service. */
  private buildResultObservables(): void {
    const winPercentage$: Observable<number> = this.winPercentage.valueChanges.pipe(
      startWith(this.winPercentage.value),
      filter(winPercentage => winPercentage !== null && winPercentage >= 0 && winPercentage <= 100),
      distinctUntilChanged(),
      share()
    );

    const normalizer$ = this.normalizeFormGroup.valueChanges.pipe(
      startWith(this.normalizeFormGroup.value),
      shareReplay(1)
    );

    const displayedResults$ = winPercentage$.pipe(
      map(winPercentage => this.arenaEvents.map(arenaEvent => {
        return {
          name: arenaEvent.name,
          result: this.eventResult(arenaEvent.losses, arenaEvent.wins, winPercentage / 100, arenaEvent.bestOfThree)
        }
      }))
    );

    this.expectedPayout$ = combineLatest(displayedResults$, normalizer$).pipe(
      map(([displayedResults, normalizer]) => this.resultToPayout(displayedResults, normalizer))
    );
  }

  /** Builds observables of data for child data grid component. */
  private buildDataGridObservables(): void {
    this.data$ = this.expectedPayout$.pipe(
      map(displayPayouts => displayPayouts.map(displayPayout => Object.values(displayPayout.payout)))
    );
  }

  private resultToPayout(eventResults: DisplayResult[], norm: Normalizer) {
    return eventResults.map(eventResult => {
      const arenaEvent = this.arenaEvents.find(event => event.name === eventResult.name);
      const payouts = arenaEvent.payouts;
      const payout = {} as Payout;

      payouts.forEach((winPayout, index) => {
        Object.keys(winPayout).forEach(key => {
          if (!payout.hasOwnProperty(key)) {
            payout[key] = arenaEvent[key] ? -arenaEvent[key] : 0;
          }

          // Add the EV to the result.
          payout[key] += eventResult.result[index] * winPayout[key];
        });
      });

      payout.normalized = this.normalizePayout(payout, norm);

      return {
        name: eventResult.name,
        payout
      };
    });
  }

  /** Normalizes the payout object using normalizing multipliers. */
  private normalizePayout(payout: Payout, norm: Normalizer): number {
    return Object.keys(payout).reduce((acc, key) => {
      switch (key) {
        case 'gold':
          acc += payout[key];
          break;
        case 'gems':
          acc += payout[key] * norm.goldPerGem;
          break;
        case 'packs':
          acc += payout[key] * norm.goldPerPack;
          break;
        case 'uncommons':
          acc += payout[key] * norm.goldPerUncommon;
          break;
        case 'rares':
          acc += payout[key] * norm.goldPerRare;
          break;
        case 'mythics':
          acc += payout[key] * norm.goldPerMythic;
          break;
      }
      return acc;
    }, 0);
  }

  /** Gets the expected result distribution for an event with max losses and max wins, given a win probability. */
  private eventResult(losses: number, wins: number, probability: number, bestOfThree: boolean): number[] {
    // Account for best of three.
    probability = bestOfThree
      ? Math.pow(probability, 2) + 2 * Math.pow(probability, 2) * (1 - probability)
      : probability;

    // Result matrix.
    const result: number[][] = [];
    for (let i = 0; i <= wins; i++) {
      result.push(Array(losses + 1));
    }

    // Create first row as starting point.
    const row = [];
    for (let i = 0; i <= losses; i++) {
      row.push(Math.pow((1 - probability), i));
    }

    // Create first column as starting point.
    const column = [];
    for (let i = 0; i <= wins; i++) {
      column.push(Math.pow(probability, i));
    }

    // Set first row and first column in result array.
    result[0] = row;
    for (let i = 0; i <= wins; i++) {
      result[i][0] = column[i];
    }

    // Iterate starting at first column and first row.
    for (let i = 1; i < column.length; i++) {
      for (let j = 1; j < row.length; j++) {
        if (i === column.length - 1) {
          result[i][j] = result[i - 1][j] * probability;
        } else if (j === row.length - 1) {
          result[i][j] = result[i][j - 1] * (1 - probability);
        } else {
          result[i][j] = result[i][j - 1] * (1 - probability) + result[i - 1][j] * probability;
        }
      }
    }

    // Explicitally set the last round probability.
    result[wins][losses] = result.reduce((acc, curr, index) => index !== wins ? acc - curr[losses] : acc, 1);

    // Only return results that gives elimination.
    const endResult = [];
    for (let i = 0; i < result.length; i++) {
      endResult.push(result[i][losses]);
    }

    return endResult;
  }

  ngOnInit() {
    this.setDataGridProperties();
    this.buildResultObservables();
    this.buildDataGridObservables();
  }
}
