import { Injectable } from '@angular/core';

import { Card, CardSet } from '@mtg-devs/api';

import { Score, OPTIMAL_CURVE } from './score-model';


@Injectable({ providedIn: 'root' })
export class ScoreService {

  score(cards: Card[], cardSet: CardSet): Score {
    const nonBasics = cards.filter(card => !card.supertypes || !card.supertypes.includes('Basic'));
    const nonLands = cards.filter(card => !card.types.includes('Land'));

    const power = this.getPowerScore(nonBasics, cardSet);
    const mana = this.getManaScore(cards);
    const curve = this.getCurveScore(nonLands);
    return { power, mana, curve, setCode: cardSet.code, date: new Date().toDateString() };
  }

  private getPowerScore(cards: Card[], cardSet: CardSet) {
    if (!cardSet.score) {
      console.warn(`No power level found for set ${cardSet.code}.`);
      return 0;
    }

    const totalPickOrder = cards.reduce((acc, curr) => {
      if (cardSet.score[curr.name]) {
        return acc + cardSet.score[curr.name];
      } else {
        console.warn(`No power level found for card ${curr.name}.`);
        return acc;
      }
    }, 0);

    return totalPickOrder / cards.length;
  }

  private getManaScore(cards: Card[]): number {
    const allSymbols = cards.reduce((acc, curr) => acc + curr.manaCost, '');
    const colorSymbols = [
      allSymbols.split('W').length - 1,
      allSymbols.split('U').length - 1,
      allSymbols.split('B').length - 1,
      allSymbols.split('R').length - 1,
      allSymbols.split('G').length - 1
    ];

    const numberOfColorSymbols = colorSymbols.reduce((acc, curr) => acc + curr, 0);

    if (numberOfColorSymbols === 0) {
      return 0;
    }

    // https://en.wikipedia.org/wiki/Variance#Discrete_random_variable
    const mu = colorSymbols.reduce((acc, curr) => acc + curr * (curr / numberOfColorSymbols), 0);

    const variance = colorSymbols.reduce((acc, curr) => {
      const p = curr / numberOfColorSymbols;
      return acc + p * Math.pow((curr - mu), 2);
    }, 0);

    const standardDeviation = Math.sqrt(variance);

    console.log('variance', variance);
    console.log('standardDeviation', standardDeviation);

    return standardDeviation;
  }

  private getCurveScore(cards: Card[]): number {
    const numberOfWithCmc = (cmc: number) => cards.filter(card => card.convertedManaCost === cmc).length;

    const totalCurveDiff = OPTIMAL_CURVE.reduce((acc, curr, index) => {
      return acc + Math.abs(curr - numberOfWithCmc(index + 1));
    }, 0);

    return totalCurveDiff;
  }
}
