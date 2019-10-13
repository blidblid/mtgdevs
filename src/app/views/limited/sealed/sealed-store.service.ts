import { Injectable } from '@angular/core';

import { CardService } from '@mtg-devs/api';
import { CardSorterService, CardStoreBase } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class SealedStoreService extends CardStoreBase {
  constructor(protected cardService: CardService, protected cardSorterService: CardSorterService) {
    super(cardService, cardSorterService);
  }
}
