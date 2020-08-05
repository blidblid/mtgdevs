/** Calculates the binomial coefficient of n and k. */
export function binom(n: number, k: number): number {
  let coeff = 1;

  for (let i = n - k + 1; i <= n; i++) {
    coeff *= i;
  }

  for (let i = 1; i <= k; i++) {
    coeff /= i;
  }

  return coeff;
}

/** The probability of getting exactly k successes in n independent trials. */
export function probabilityMassFunction(trials: number, successes: number, p: number): number {
  return binom(trials, successes) * Math.pow(p, successes) * Math.pow(1 - p, trials - successes);
}

/** Calculate the hypergeometric distrubtion. */
export function hypergeom(toGet: number, successes: number, drawn: number, population: number): number {
  return (binom(successes, toGet) * binom(population - successes, drawn - toGet)) / binom(population, drawn);
}

/** Converts a normalized probability to percent with any given number of decimal points. */
export function toPercent(number: number, decimalPoints: number) {
  const multiplier = Math.pow(10, decimalPoints);
  return Math.round(number * 100 * multiplier) / multiplier;
}

/** Calculates best of three win percent given a best of one win percent. */
export function toBestOfThreeWinPercent(probability: number): number {
  return Math.pow(probability, 2) + 2 * Math.pow(probability, 2) * (1 - probability);
}
