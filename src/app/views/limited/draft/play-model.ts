import { CardSet } from '@mtg-devs/api';


export interface PlayConfig {
  podKey: string;
  playerKey: string;
  leftPlayerKey: string;
  rightPlayerKey: string;
  cardSet: CardSet;
}