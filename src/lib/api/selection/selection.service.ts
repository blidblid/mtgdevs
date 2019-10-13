import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

import { ObservableCache } from '../cache/observable-cache';



@Injectable({ providedIn: 'root' })
export class SelectionService {

  private cache = new ObservableCache();

  constructor(private db: AngularFireDatabase) { }

  getSelection(selectionName: string): Observable<string[]> {
    return this.cache.get(selectionName, () => this.db.object(`/db/selection/${selectionName}`).valueChanges());
  }
}
