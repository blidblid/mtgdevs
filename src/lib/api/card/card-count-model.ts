import { Card } from './card-model';


export enum CardCountable {
  Full = 'type',
  Type = 'types',
  CMC = 'convertedManaCost',
  Rarity = 'rarity'
}

export interface TypeWithCount {
  name: string;
  numberOf: number;
  cardWithCounts: CardWithCount[];
}

export interface CardWithCount {
  card: Card;
  numberOf: number;
}

export interface CardNameWithCount {
  cardName: string;
  numberOf: number;
}
