import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

import { ObservableCache } from '../cache';
import { Dictionary, DictionaryName } from './dictionary-model';


@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  private cache = new ObservableCache();

  constructor(private db: AngularFireDatabase) { }

  getDictionary(dictionary: DictionaryName): Observable<Dictionary> {
    return this.cache.get(dictionary, () => this.db.object<Dictionary>(`/db/dictionary/${dictionary}`).valueChanges());
  }
}
