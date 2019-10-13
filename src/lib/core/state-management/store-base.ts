import { Observable, Subject } from 'rxjs';
import { scan, shareReplay, take, startWith, map } from 'rxjs/operators';

import { Action, StoreAction } from './store-model';
import { addToArray, removeFromArray, updateInArray } from './store-util';


export class StoreBase<T> {

  private entities$: Observable<T[]>;

  private actionSub: Subject<StoreAction<T>> = new Subject();

  constructor(private entityKey: string, private sortWith?: (entitites: T[]) => T[]) {
    this.buildObservables();
    this.addAllFromLocalStorage();
  }

  get(): Observable<T[]> {
    return this.entities$;
  }

  add(entity: T, numberOf: number = 1, addToLocalStorage: boolean = false): void {
    while (numberOf--) {
      this.actionSub.next({ action: Action.Add, [this.entityKey]: entity });

      if (addToLocalStorage) {
        const localStorageArray = this.getFromLocalStorage();
        localStorageArray.push(entity);
        localStorage.setItem(this.entityKey, JSON.stringify(localStorageArray));
      }
    }
  }

  update(entity: T, target: T): void {
    this.actionSub.next({ action: Action.Update, [this.entityKey]: entity, target });
  }

  clear(): void {
    this.actionSub.next({ action: Action.Clear });
  }

  push(): void {
    this.actionSub.next({ action: Action.Push });
  }

  pop(): void {
    this.actionSub.next({ action: Action.Pop });
  }

  remove(entity: T, numberOf: number = 1, removeFromLocalStorageByKeys?: (keyof T)[]): void {
    while (numberOf--) {
      this.actionSub.next({ action: Action.Remove, [this.entityKey]: entity });

      if (removeFromLocalStorageByKeys) {
        const localStorageArray = this.getFromLocalStorage().filter(e => {
          return removeFromLocalStorageByKeys.some(key => e[key] !== entity[key])
        });

        localStorage.setItem(this.entityKey, JSON.stringify(localStorageArray));
      }
    }
  }

  private buildObservables(): void {
    this.entities$ = this.actionSub.pipe(
      scan<StoreAction<T>, T[]>((acc, current) => {
        switch (current.action) {
          case (Action.Add): {
            return addToArray(current[this.entityKey], acc);
          }

          case (Action.Remove): {
            return removeFromArray(current[this.entityKey], acc);
          }

          case (Action.Update): {
            return updateInArray(current[this.entityKey], current.target, acc);
          }

          case (Action.Push): {
            return [...acc];
          }

          case (Action.Pop): {
            return [...acc].slice(0, acc.length - 1);
          }

          case (Action.Clear): {
            return [];
          }

        }

        return [...acc];
      }, []),
      startWith([]),
      map(entities => this.sortWith ? this.sortWith(entities) : entities),
      shareReplay(1)
    );

    this.entities$.pipe(take(1)).subscribe();
  }

  protected getFromLocalStorage(): T[] {
    return JSON.parse(localStorage.getItem(this.entityKey) || '[]');
  }

  private addAllFromLocalStorage(): void {
    this.getFromLocalStorage().forEach(item => this.add(item));
  }
}
