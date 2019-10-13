import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { take } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class CacheValidatorService {

  constructor(private db: AngularFireDatabase) {
    this.clearOldCache();
  }

  private clearOldCache(): void {
    const cacheTimeStamp$ = this.db.object<string>('/db/cacheTimeStamp/').valueChanges().pipe(
      take(1)
    );

    cacheTimeStamp$
      .subscribe(timestamp => {
        Object.keys(localStorage).forEach(key => {
          let localStorageItem;

          try {
            localStorageItem = JSON.parse(localStorage.getItem(key));
          } catch { }

          if (localStorageItem) {
            const stamp = localStorageItem.cacheTimeStamp;

            if (stamp && stamp !== timestamp) {
              console.info(`Removed ${key} from cache.`);
              localStorage.removeItem(key);
            }
          }
        });
      });
  }
}
