import { Injectable } from '@angular/core';

import { Card } from '@mtg-devs/api';
import { StoreBase } from '@mtg-devs/core';


@Injectable({ providedIn: 'root' })
export class PlayTestExileStore extends StoreBase<Card> {
  constructor() {
    super('card');
  }
}
