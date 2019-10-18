import { InjectionToken } from '@angular/core';

import { Type, Card } from '@mtg-devs/api';
import { TableZone } from '@mtg-devs/components';

export interface AiPlay {
  template: AiPlayTemplate;
  target?: Card;
  source?: TableZone;

  /** Fraction between target cmc and play cmc. */
  score?: number;
}

export interface AiPlayTemplate {
  cardName: string;
  card: Card;
  type: AiPlayType;

  target?: AiTargetCriteria;

  /** Effect that happens if card is on the battlefield the next turn. */
  effects?: AiPermanentEffect[];

  /** If resolution moves target to zone. */
  resolutionZone?: TableZone;
}

export interface AiPermanent {
  cardName: string;
}

export interface AiTargetCriteria {
  types: Type[];
  zones: TableZone[];
}

export interface AiPermanentEffect {
  amount: number;
  type: AiEffectType;
}

export enum AiEffectType {
  Mill,
  Damage,
  Heal,
  Draw
}

export enum AiPlayType {
  Interaction,
  Permanent
}

export const AI_PLAY = new InjectionToken<AiPlayTemplate>('AI Plays');
