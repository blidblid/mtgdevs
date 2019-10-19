import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { switchMap, map, filter } from 'rxjs/operators';
import { Observable, zip, from } from 'rxjs';

import { CardNameWithCount } from '../card/card-count-model';
import { CardService } from '../card/card.service';
import { UserDeck, SavedDeck, StoredDeck } from './deck-model';


@Injectable({ providedIn: 'root' })
export class DeckService {

  constructor(
    private db: AngularFireDatabase,
    private cardService: CardService
  ) { }

  getDeck(deckKey: string): Observable<UserDeck> {
    return this.db.object<SavedDeck>(`/deck/${deckKey}`).valueChanges().pipe(
      filter(savedDeck => !!savedDeck && !!savedDeck.cards),
      switchMap(savedDeck => {
        return zip(...savedDeck.cards.map(cardWithCount => {
          return this.cardService.getCards(cardWithCount.cardName, cardWithCount.numberOf);
        })).pipe(
          map(cards => {
            return {
              cards: cards.reduce((acc, curr) => [...acc, ...curr], []),
              name: savedDeck.name
            };
          })
        );
      })
    );
  }

  saveDeck(cards: CardNameWithCount[], name: string): Observable<StoredDeck> {
    const promise = this.db.list<SavedDeck>(`/deck/`).push({ cards, name });

    return from(promise).pipe(
      map(entry => {
        return {
          deckKey: entry.key,
          name
        };
      })
    );
  }
}
