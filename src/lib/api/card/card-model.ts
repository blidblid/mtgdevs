import { Type } from './type-model';

export interface Card {
  // From MTGJSON
  colorIdentity: string[];
  colors: string[];
  convertedManaCost: number;
  manaCost: string;
  name: string;
  power: string;
  toughness: string;
  rulings: any[];
  starter: boolean;
  subtypes: string[];
  supertypes?: any[];
  text: string;
  type: string;
  types: Type[];
  rarity: string;
  loyalty: string;
  multiverseId?: number;

  // From scryfall
  scryfallImage: string;

  // Added by mtg-devs
  foil: boolean;
  cacheTimeStamp: string;
  counter?: number;
  tapped?: boolean;
  hasDeathtouch?: boolean;
  hasFirstStrike?: boolean;
  hasDoubleStrike?: boolean;
  hasIndestructible?: boolean;
}

export interface CardSet {
  code: string;
  boosterV3: string[];
  cards: Card[];
  score: { [key: string]: number };
  cacheTimeStamp: string;
}

export const CARDS_PER_BOOSTER = 15;

export class Rarity {
  static common = 'common';
  static uncommon = 'uncommon';
  static rare = 'rare';
  static mythicRare = 'mythicRare';

  static isRare(rarity: string | string[]) {
    rarity = Array.isArray(rarity) ? rarity : [rarity];
    return rarity.some(r => r === Rarity.rare || r === Rarity.mythicRare);
  }

  static rarityAsNumber(rarity: Rarity): number {
    if (rarity === Rarity.mythicRare) {
      return 4;
    } else if (rarity === Rarity.rare) {
      return 3;
    } else if (rarity === Rarity.uncommon) {
      return 2;
    } else if (rarity === Rarity.common) {
      return 1;
    }
  }
}
