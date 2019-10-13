import { Card, CardWithCount } from '@mtg-devs/api';

export function toCardMovedEvent(event: TableCardClicked, target: TableZone): TableCardMoved {
  return { card: event.card, source: event.zone, target };
}

export interface TableCardMoved {
  card: Card;
  source: TableZone;
  target: TableZone;
}

export interface TableCardClicked {
  card: Card;
  zone: TableZone;
}

export interface TableCardCounterChanged {
  card: Card;
  change: number;
  zone: TableZone;
}

export enum TableZone {
  Battlefield = 'battlefield',
  Hand = 'hand',
  Library = 'library',
  Graveyard = 'graveyard',
  Land = 'land',
  Exile = 'exile'
}

export interface TableZoneContext {
  title: string;
  count?: number;
  cards?: CardWithCount[];
}