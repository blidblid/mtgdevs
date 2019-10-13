import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Card, Rarity } from '@mtg-devs/api';


@Injectable({
  providedIn: 'root'
})
export class CardSorterService {

  private sortBySub = new BehaviorSubject<SortBy>(SortBy.Color);

  private sortBy$: Observable<(cards: Card[]) => Card[]>;

  constructor() {
    this.buildObservables();
  }

  getSortBy(): Observable<(cards: Card[]) => Card[]> {
    return this.sortBy$;
  }

  sortByColor(): void {
    this.sortBySub.next(SortBy.Color);
  }

  sortByName(): void {
    this.sortBySub.next(SortBy.Name);
  }

  sortByRarity(): void {
    this.sortBySub.next(SortBy.Rarity);
  }

  sortCardsByColor(cards: Card[]): Card[] {
    const cardsWithNoColor = cards.filter(card => !card.colors || card.colors.length === 0);
    const cardsWithOneColor = cards.filter(card => card.colors && card.colors.length === 1);
    const cardsWithMultipleColors = cards.filter(card => card.colors && card.colors.length > 1);

    const whiteCards = cardsWithOneColor.filter(card => card.colors[0] === 'W');
    const blueCards = cardsWithOneColor.filter(card => card.colors[0] === 'U');
    const blackCards = cardsWithOneColor.filter(card => card.colors[0] === 'B');
    const redCards = cardsWithOneColor.filter(card => card.colors[0] === 'R');
    const greenCards = cardsWithOneColor.filter(card => card.colors[0] === 'G');

    return this.sortCardsByName(whiteCards)
      .concat(this.sortCardsByName(blueCards))
      .concat(this.sortCardsByName(blackCards))
      .concat(this.sortCardsByName(redCards))
      .concat(this.sortCardsByName(greenCards))
      .concat(this.sortCardsByName(cardsWithMultipleColors))
      .concat(this.sortCardsByName(cardsWithNoColor))
  }

  sortCardsByName(cards: Card[]): Card[] {
    return cards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  sortByType(cards: Card[]): Card[] {
    return cards.sort((a, b) => a.type.localeCompare(b.type));
  }

  sortCardsByRarity(cards: Card[]): Card[] {
    return cards.sort((a, b) => Rarity.rarityAsNumber(b.rarity) - Rarity.rarityAsNumber(a.rarity));
  }

  private buildObservables(): void {
    this.sortBy$ = this.sortBySub.pipe(
      map(sortBy => {
        switch (sortBy) {
          case SortBy.Color:
            return this.sortCardsByColor.bind(this);
          case SortBy.Name:
            return this.sortCardsByName.bind(this);
          case SortBy.Rarity:
            return this.sortCardsByRarity.bind(this);
        }
      }),
      shareReplay(1)
    );
  }
}


enum SortBy {
  Color,
  Name,
  Rarity
}