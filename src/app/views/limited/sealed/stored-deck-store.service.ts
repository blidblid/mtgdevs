import { Injectable } from '@angular/core';

import { StoredDeck } from '@mtg-devs/api';
import { StoreBase } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class StoredDeckStoreService extends StoreBase<StoredDeck> {
  constructor() {
    super('userDeck');
  }
}
