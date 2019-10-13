import { Injectable } from '@angular/core';

import { FOILS_PER_BOOSTER, COMMON_FOIL_CHANCE, UNCOMMON_FOIL_CHANCE, DEFAULT_BOOSTER_V3 } from './booster-model';
import { CardFilterService } from '../card/card-filter.service';
import { Card, CardSet, Rarity } from '../../api/card/card-model';


@Injectable({ providedIn: 'root' })
export class BoosterService {

  constructor(private filter: CardFilterService) { }

  generateBoosterFromSet(set: CardSet, numberOf: number = 1): Card[] {
    if (!set) {
      return [];
    }

    const cards: Card[] = [];

    while (numberOf--) {
      cards.push(...this.createBooster(set));
    }

    return cards;
  }

  private createBooster(set: CardSet): Card[] {
    const setCards = [...set.cards];

    const randomCardFromArray = (arr: Card[]) => {
      return { ...arr.splice(Math.floor(Math.random() * arr.length), 1)[0] };
    };

    const basics = this.filter.bySuperType(setCards, 'Basic');
    const nonBasicCommonSheet = this.filter.byRarity(setCards, Rarity.common).filter(card => !basics.includes(card));
    const commonFoilSheet = this.filter.byRarity(setCards, Rarity.common);
    const uncommonSheet = this.filter.byRarity(setCards, Rarity.uncommon);
    const uncommonFoilSheet = [...uncommonSheet];
    const rares = this.filter.byRarity(setCards, Rarity.rare);
    const mythics = this.filter.byRarity(setCards, Rarity.mythicRare);
    const rareSheet = [...rares, ...rares, ...mythics];
    const rareFoilSheet = [...rareSheet];
    const boosterV3 = set.boosterV3 || DEFAULT_BOOSTER_V3;

    const booster: Card[] = boosterV3.reduce((acc, curr) => {
      if (curr === Rarity.common) {
        return [...acc, randomCardFromArray(nonBasicCommonSheet)];
      } else if (curr === Rarity.uncommon) {
        return [...acc, randomCardFromArray(uncommonSheet)];
      } else if (Rarity.isRare(curr)) {
        return [...acc, randomCardFromArray(rareSheet)];
      } else {
        return acc;
      }
    }, []);

    if (FOILS_PER_BOOSTER > Math.random()) {
      booster.splice(booster.findIndex(card => card.rarity === Rarity.common), 1);
      const random = Math.random();
      const foilSheet = random < COMMON_FOIL_CHANCE
        ? commonFoilSheet
        : random < COMMON_FOIL_CHANCE + UNCOMMON_FOIL_CHANCE
          ? uncommonFoilSheet
          : rareFoilSheet;

      booster.unshift({ ...randomCardFromArray(foilSheet), foil: true });
    }

    booster.push(randomCardFromArray(basics));
    return booster;
  }
}
