import { Card } from '@mtg-devs/api';


export interface CombatStat {
  card: Card;
  wins: Card[];
  draws: Card[];
  losses: Card[];
  numberOfWins: number;
  numberOfDraws: number;
  numberOfLosses: number;
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;
}

export enum FightOutcome {
  Win = 'win',
  Draw = 'draw',
  Loss = 'loss'
}
