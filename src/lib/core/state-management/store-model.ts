import { Card } from '@mtg-devs/api';


export enum Action {
  Add,
  Remove,
  Clear,
  Push,
  Pop,
  Update
}

export interface CardAction {
  action: Action;
  card?: Card | string;
  numberOf?: number;
}

export interface StoreAction<T> {
  action: Action;
  entity?: T;
  target?: T;
}

