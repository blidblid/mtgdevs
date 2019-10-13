import { Injectable } from '@angular/core';

import { CardService } from '@mtg-devs/api';
import { CardStoreBase, CardSorterService } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class DraftStoreService extends CardStoreBase {
  constructor(protected cardService: CardService, protected cardSorterService: CardSorterService) {
    super(cardService, cardSorterService);
  }
}

