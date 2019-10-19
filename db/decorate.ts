import { Card } from '../src/lib/api/card/card-model';


export function decorateCard(card: Card): void {
  card.hasDeathtouch = hasDeathtouch(card);
  card.hasFirstStrike = hasFirstStrike(card);
  card.hasDoubleStrike = hasDoubleStrike(card);
  card.hasIndestructible = hasIndestructible(card);
}

function hasDeathtouch(card: Card): boolean {
  return checkForKeyword(card, 'Deathtouch');
}

function hasFirstStrike(card: Card): boolean {
  return checkForKeyword(card, 'First strike');
}

function hasDoubleStrike(card: Card): boolean {
  return checkForKeyword(card, 'Double strike');
}

function hasIndestructible(card: Card): boolean {
  return checkForKeyword(card, 'Indestructable');
}

function checkForKeyword(card: Card, keyword: string): boolean {
  if (!card.text) {
    return false;
  }

  return card.text.includes(keyword) || card.text.includes(`, ${keyword}`);
}
