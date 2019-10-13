import { Injectable } from '@angular/core';

import { Card } from '@mtg-devs/api';
import { StoreBase } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class PlayTestHandStore extends StoreBase<Card> {
  constructor() {
    super('card');
  }
}
