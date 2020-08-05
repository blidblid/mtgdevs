import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';

import { hypergeom, toPercent } from '@mtg-devs/core';

import { DisplayedHypergeomResult } from './hypergeometric-calculator-model';


@Component({
  selector: 'app-hypergeometric-calculator',
  templateUrl: './hypergeometric-calculator.component.html',
  styleUrls: ['./hypergeometric-calculator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'app-hypergeometric-calculator'
  }
})
export class HypergeometricCalculatorComponent implements OnInit {

  /** Observable of results of the hypergeometric distrubtion as displayed in the view. */
  displayedResults$: Observable<DisplayedHypergeomResult[]>;

  /** Observable of whether the the input is valid. */
  validInput$: Observable<boolean>;

  /** Input form to the hypergeometric distribution calculator. */
  input: FormGroup = new FormGroup({
    hits: new FormControl(null, [Validators.required, Validators.min(0)]),
    draws: new FormControl(null, [Validators.required, Validators.min(0)]),
    deckSize: new FormControl(60, [Validators.required, Validators.min(0)])
  });

  private buildObservables(): void {
    const results$: Observable<number[]> = this.input.valueChanges.pipe(
      filter(v => v.hits <= v.deckSize && v.draws <= v.deckSize),
      map(value => {
        const { hits, draws, deckSize } = value;

        const cases = hits > draws ? draws : hits;
        const results = [];

        for (let i = 0; i <= cases; i++) {
          results.push(toPercent(hypergeom(i, hits, draws, deckSize), 1));
        }

        return results;
      }),
      shareReplay(1)
    );

    this.validInput$ = results$.pipe(
      map(results => results.every(result => result >= 0 && ![NaN, Infinity, -Infinity].includes(result)))
    );

    this.displayedResults$ = results$.pipe(
      map(results => this.mapToDisplayedResults(results))
    );
  }

  private mapToDisplayedResults(results: number[]): DisplayedHypergeomResult[] {
    let sum = 0;
    const displayedResults: DisplayedHypergeomResult[] = [];

    for (let i = 0; i < results.length; i++) {
      if (results[i] === 0 && results[i + 1] === 0 && sum > 0) {
        displayedResults.push({
          title: `${i}+ hits`,
          result: '0%',
          titleWithSum: `${i}+ hits\n`,
          resultWithSum: `0%`
        });
        break;
      } else if (results[i] !== 0 || i === results.length - 1) {
        displayedResults.push({
          title: `${i} hit${i === 1 ? '' : 's'}`,
          result: `${results[i].toFixed(1)}%`,
          titleWithSum: `${i}+ hits\n`,
          resultWithSum: `${Math.abs(100 - sum).toFixed(1)}%`
        });
      }

      sum += results[i];
    }

    sum = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === 0 && results[i - 1] === 0 && sum > 0) {
        displayedResults.unshift({
          title: `${i}- hits`,
          result: '0%',
          titleWithSum: '',
          resultWithSum: `0%`
        });

        break;
      }

      sum += results[i];
    }

    return displayedResults;
  }

  ngOnInit() {
    this.buildObservables();
  }
}
