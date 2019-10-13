import { Injectable } from '@angular/core';

import { Card, TypeWithCount, CardWithCount, CardCountable, CardNameWithCount } from '@mtg-devs/api';



@Injectable({ providedIn: 'root' })
export class CardCountService {

  private previouslyIncludedTypes = new Map<CardCountable, TypeWithCount[]>();

  countTypes(cards: Card[], key: CardCountable): TypeWithCount[] {
    const typeWithCounts = cards.reduce((acc, curr) => {
      const names = (Array.isArray(curr[key]) ? curr[key] : [curr[key]]) as string[];

      names.forEach(name => {
        const typeWithCount = acc.find(t => t.name === name);

        if (typeWithCount) {
          typeWithCount.numberOf++;
          typeWithCount.cardWithCounts = this.countCards(curr, typeWithCount.cardWithCounts);
        } else {
          acc.push({ name, numberOf: 1, cardWithCounts: this.countCards(curr, []) });
        }
      });

      return acc;
    }, this.getSeed(key));

    typeWithCounts.forEach(typeWithCount => this.addIncludedType(key, typeWithCount.name));

    return [...typeWithCounts];
  }

  countAllCards(cards: Card[]): CardWithCount[] {
    return cards.reduce((acc, curr) => this.countCards(curr, acc), []);
  }

  countCards(card: Card, seed: CardWithCount[]): CardWithCount[] {
    const cardWithCount = seed.find(c => c.card.name === card.name);

    if (cardWithCount) {
      cardWithCount.numberOf++;
    } else {
      seed.push({ card, numberOf: 1 });
    }

    return seed;
  }

  countCardNames(cards: Card[]): CardNameWithCount[] {
    return cards.reduce((acc, curr) => {
      const countedCard = acc.find(c => c.cardName === curr.name);
      if (countedCard) {
        countedCard.numberOf++;
      } else {
        acc = [...acc, { cardName: curr.name, numberOf: 1 }]
      }
      return acc;
    }, [] as CardNameWithCount[]);
  }

  reset(): void {
    this.previouslyIncludedTypes = new Map<CardCountable, TypeWithCount[]>();
  }

  private addIncludedType(key: CardCountable, name: string) {
    const includedType = this.previouslyIncludedTypes.get(key);

    if (!includedType) {
      this.previouslyIncludedTypes.set(key, [{ name, numberOf: 0, cardWithCounts: [] }]);
    } else if (!includedType.some(typeWithCount => typeWithCount.name === name)) {
      this.previouslyIncludedTypes.set(key, [...includedType, { name, numberOf: 0, cardWithCounts: [] }]);
    }
  }

  private getSeed(key: CardCountable): TypeWithCount[] {
    return (this.previouslyIncludedTypes.get(key) || []).map(typeWithCount => {
      return { ...typeWithCount, numberOf: 0, cardWithCounts: [] };
    });
  }
}
