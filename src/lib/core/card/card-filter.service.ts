import { Injectable } from '@angular/core';

import { Card, Rarity } from '@mtg-devs/api';


@Injectable({ providedIn: 'root' })
export class CardFilterService {

  byRarity(cards: Card[], rarity: Rarity): Card[] {
    return cards.filter(card => card.rarity === rarity);
  }

  bySuperType(cards: Card[], type: string): Card[] {
    return cards.filter(card => card.supertypes && card.supertypes.includes(type));
  }

  byConvertedManacost(cards: Card[], cmc: number): Card[] {
    return cards.filter(card => card.convertedManaCost === cmc);
  }

  byRandomness(cards: Card[]): Card[] {
    const cardCopy = [...cards];

    for (let i = cardCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardCopy[i], cardCopy[j]] = [cardCopy[j], cardCopy[i]];
    }

    return cardCopy;
  }
}
