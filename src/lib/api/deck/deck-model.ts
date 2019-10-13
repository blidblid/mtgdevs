import { Card } from '../card/card-model';
import { CardNameWithCount } from '../card/card-count-model';


export interface SavedDeck {
  name: string;
  cards: CardNameWithCount[];
}

export interface UserDeck {
  name: string;
  cards: Card[];
}

export interface StoredDeck {
  name: string;
  deckKey: string;
}
