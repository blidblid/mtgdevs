import { Injectable } from '@angular/core';

import { StoreBase } from '@mtg-devs/core';
;
import { AiPlayTemplate } from '../ai/ai-model';


@Injectable({ providedIn: 'root' })
export class PlayTestAiHandStore extends StoreBase<AiPlayTemplate> {
  constructor() {
    super('card');
  }
}
