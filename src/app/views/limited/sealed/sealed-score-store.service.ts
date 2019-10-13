import { Injectable } from '@angular/core';

import { StoreBase } from '@mtg-devs/core';

import { Score } from '../score/score-model';


@Injectable({ providedIn: 'root' })
export class SealedScoreStoreService extends StoreBase<Score> {
  constructor() {
    super('userSealedScore');
  }
}
