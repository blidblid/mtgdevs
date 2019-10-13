import { Injectable } from '@angular/core';

import { Card } from '@mtg-devs/api';


@Injectable({ providedIn: 'root' })
export class CardAnalyzeService {

  decorateCard(card: Card): Card {
    return {
      ...card,
      hasDeathtouch: this.hasDeathtouch(card),
      hasFirstStrike: this.hasFirstStrike(card),
      hasDoubleStrike: this.hasDoubleStrike(card),
      hasIndestructible: this.hasIndestructible(card)
    }
  }

  isPlaneswalker(card: Card): boolean {
    return card.types.includes('Planeswalker');
  }

  hasDeathtouch(card: Card): boolean {
    return !!card.text && card.text.includes('Deathtouch');
  }

  hasFirstStrike(card: Card): boolean {
    return !!card.text && card.text.includes('First strike');
  }

  hasDoubleStrike(card: Card): boolean {
    return !!card.text && card.text.includes('Double strike');
  }

  hasIndestructible(card: Card): boolean {
    return !!card.text && card.text.includes('Double strike');
  }
}
