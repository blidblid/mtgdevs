import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';


export class ObservableCache {

  private map: Map<string, Observable<any>> = new Map();

  get(key: string, fallbackApi: () => Observable<any>, disableLocalStorage?: boolean): Observable<any> {
    if (disableLocalStorage) {
      return this.getFromSessionCache(key, fallbackApi);
    }

    try {
      return this.getFromLocalStorage(key, fallbackApi);
    } catch {
      //tslint:disable-next-line
      console.warn('LocalStorage full. Consider deleting browser history for mtgdevs to enable persistant cache.');
      return this.getFromSessionCache(key, fallbackApi);
    }
  }

  private getFromLocalStorage(key: string, fallbackApi: () => Observable<any>) {
    const stringFromlocalStorage = localStorage.getItem(key);
    const fromLocalStorage = stringFromlocalStorage ? JSON.parse(stringFromlocalStorage) : null;

    if (fromLocalStorage) {
      return of(fromLocalStorage).pipe(shareReplay(1));
    } else {
      return this.getFromSessionCache(key, fallbackApi).pipe(
        tap(response => localStorage.setItem(key, JSON.stringify(response)))
      );
    }
  }

  private getFromSessionCache(key: string, fallbackApi: () => Observable<any>) {
    if (this.map.has(key)) {
      return this.map.get(key);
    } else {
      const observable = fallbackApi().pipe(shareReplay(1));
      this.map.set(key, observable);
      return observable;
    }
  }
}
