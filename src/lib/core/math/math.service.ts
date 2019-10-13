import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class MathService {

  /** Calculates the binomial coefficient of n and k. */
  binom(n: number, k: number): number {
    let coeff = 1;

    for (let i = n - k + 1; i <= n; i++) {
      coeff *= i;
    }

    for (let i = 1; i <= k; i++) {
      coeff /= i;
    }

    return coeff;
  }

  probabilityMassFunction(trials: number, successes: number, p: number): number {
    return this.binom(trials, successes) * Math.pow(p, successes) * Math.pow(1 - p, trials - successes);
  }

  /** Calculate the hypergeometric distrubtion. */
  hypergeom(toGet: number, successes: number, drawn: number, population: number): number {
    return (this.binom(successes, toGet) * this.binom(population - successes, drawn - toGet)) /
      this.binom(population, drawn);
  }

  /** Converts a normalized probability to percent with any given number of decimal points. */
  toPercent(toPercent: number, decimalPoints: number) {
    const multiplier = Math.pow(10, decimalPoints);
    return Math.round(toPercent * 100 * multiplier) / multiplier;
  }
}
