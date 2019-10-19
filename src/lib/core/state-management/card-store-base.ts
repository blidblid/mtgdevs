import { Observable, Subject, of, combineLatest } from 'rxjs';
import { scan, shareReplay, map, switchMap, startWith } from 'rxjs/operators';

import { CardService, Card } from '@mtg-devs/api';

import { Action, CardAction } from './store-model';
import { removeCardFromArray, addToArray } from './store-util';
import { CardSorterService } from '../card/card-sorter.service';


export class CardStoreBase {

  private cards$: Observable<Card[]>;

  private cardActionSub: Subject<CardAction> = new Subject();

  constructor(protected cardService: CardService, protected cardSorterService: CardSorterService) {
    this.buildObservables();
  }

  get(): Observable<Card[]> {
    return this.cards$;
  }

  add(card: Card | string, numberOf: number = 1): void {
    this.cardActionSub.next({ action: Action.Add, card, numberOf });
  }

  clear(): void {
    this.cardActionSub.next({ action: Action.Clear });
  }

  remove(card: Card | string, numberOf: number = 1): void {
    while (numberOf--) {
      this.cardActionSub.next({ action: Action.Remove, card });
    }
  }

  private buildObservables(): void {
    const cards$ = this.cardActionSub.pipe(
      switchMap(action => this.getCardFromAction(action)),
      scan<CardAction, Card[]>((acc, current) => {
        switch (current.action) {

          case (Action.Add): {
            return addToArray(current.card as Card, acc, current.numberOf);
          }

          case (Action.Remove): {
            return removeCardFromArray(current.card as Card, acc);
          }

          case (Action.Clear): {
            return [];
          }

        }

        return [...acc];
      }, [])
    );

    this.cards$ = combineLatest([cards$, this.cardSorterService.getSortBy()]).pipe(
      map(([cards, sorter]) => sorter(cards)),
      shareReplay(1),
      startWith([])
    );
  }

  private getCardFromAction(cardAction: CardAction): Observable<CardAction> {
    const action = cardAction.action;
    const card = cardAction.card;
    const numberOf = cardAction.numberOf;

    if (typeof card !== 'string') {
      return of({
        action,
        card,
        numberOf
      });
    }

    return this.cardService.getCard(cardAction.card as string).pipe(
      map(fetchedCard => {
        return {
          action,
          card: fetchedCard,
          numberOf
        };
      })
    );
  }
}
