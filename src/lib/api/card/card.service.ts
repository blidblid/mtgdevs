import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Card, CardSet } from './card-model';
import { ObservableCache } from '../cache';


@Injectable({ providedIn: 'root' })
export class CardService {

  private cache = new ObservableCache();

  constructor(private db: AngularFireDatabase) { }

  getCard(cardName: string): Observable<Card> {
    return this.cache.get(cardName, () => this.db.object<Card>(`/db/card/${cardName}`).valueChanges());
  }

  getCards(cardName: string, numberOf: number): Observable<Card[]> {
    return this.getCard(cardName).pipe(
      map(card => Array(numberOf).fill(card).map(card => {
        return { ...card };
      }))
    );
  }

  getSet(setName: string): Observable<CardSet> {
    return this.cache.get(setName, () => this.db.object(`/db/set/${setName}`).valueChanges());
  }

  getBasics(): Observable<Card[]> {
    return this.cache.get('basics', () => this.db.list<Card>(`/db/basic/`).valueChanges(), true);
  }
}
