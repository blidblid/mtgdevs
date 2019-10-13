import { Injectable } from '@angular/core';

import { Card } from '@mtg-devs/api';
import { StoreBase, CardSorterService } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class PlayTestBattlefieldStore extends StoreBase<Card> {
  constructor(private cardSorter: CardSorterService) {
    super('card', cardSorter.sortByType);
  }
}
