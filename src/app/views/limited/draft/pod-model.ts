import { Card } from '@mtg-devs/api';

import { Score } from '../score/score-model';

export const PLAYER_LEFT_KEY = 'leftPlayerKey';
export const PLAYER_RIGHT_KEY = 'leftPlayerKey';
export const DELETE_DELAY = 10000;

export interface Pod {
  set: string;
  maxPlayers: number;
  players?: Player[];
  key?: string;
}

export interface Player {
  name: string;
  score?: Score;
  booster?: Card[];
  key?: string;
  [PLAYER_LEFT_KEY]?: string;
  [PLAYER_RIGHT_KEY]?: string;
}

export interface PodHashMap {
  [key: string]: Pod;
}

export const PACKS_PER_DRAFT = 3;

