import { FormControl, Validators } from '@angular/forms';
import { Directive } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { Card } from '@mtg-devs/api';

import {
  LIMITED_AVAILABLE_SETS,
  MIN_LANDS_PER_LIMITED_DECK,
  MAX_LANDS_PER_LIMITED_DECK,
  CARDS_PER_LIMITED_DECK
} from './limited-model';


@Directive({})
export abstract class LimitedBase { // tslint:disable-line

  availableSets = LIMITED_AVAILABLE_SETS;

  cards$: Observable<Card[]>;

  mainDeck$: Observable<Card[]>;

  setFormControl = new FormControl(null, Validators.required);

  cardSizeFormControl = new FormControl(false);

  cardSize$: Observable<boolean> = this.cardSizeFormControl.valueChanges;

  refreshSub = new BehaviorSubject<null>(null);

  protected readonly submitSub = new Subject<void>();
  protected readonly destroySub = new Subject<void>();

  protected abstract onCardSelected(card: Card);

  protected abstract buildObservables();

  submit(): void {
    this.submitSub.next();
  }

  getLimitedDeckError(cards: Card[]): string | null {
    const landCount = cards.filter(card => card.types.includes('Land')).length;
    const cardCount = cards.length;

    if (cardCount < CARDS_PER_LIMITED_DECK) {
      return `You need at least ${CARDS_PER_LIMITED_DECK} cards.`
    } else if (landCount < MIN_LANDS_PER_LIMITED_DECK || landCount > MAX_LANDS_PER_LIMITED_DECK) {
      return `You need between ${MIN_LANDS_PER_LIMITED_DECK} and ${MAX_LANDS_PER_LIMITED_DECK} lands.`
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    this.buildObservables();
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
