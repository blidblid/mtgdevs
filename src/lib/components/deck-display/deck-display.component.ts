import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { TypeWithCount, CardCountable, CardWithCount, Card } from '@mtg-devs/api';
import { CardCountService } from '@mtg-devs/core';


@Component({
  selector: 'app-deck-display',
  templateUrl: './deck-display.component.html',
  styleUrls: ['./deck-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-deck-display',
    '[class.grid-component-large]': 'true'
  }
})
export class DeckDisplayComponent implements OnDestroy, OnInit {

  /** Main deck. */
  @Input()
  set cards(value: Card[]) {
    if (Array.isArray(value)) {
      const previousLength = this.cardsSub.value.length;
      this.cardsSub.next(value);
      if (previousLength !== value.length || value.length === 0) {
        this.reflow();
      }
    }
  }
  private cardsSub: BehaviorSubject<Card[]> = new BehaviorSubject([]);

  /** Sideboard. */
  @Input()
  set sideboard(value: Card[]) {
    if (Array.isArray(value)) {
      this.sideboardSub.next(value);
    }
  }
  private sideboardSub: BehaviorSubject<Card[]> = new BehaviorSubject([]);

  @Input()
  get disableRemoving() {
    return this._disableRemoving;
  }
  set disableRemoving(value: boolean) {
    this._disableRemoving = coerceBooleanProperty(value);
  }
  private _disableRemoving: boolean;

  @Output() cardAdded = new EventEmitter<Card>();
  @Output() cardRemoved = new EventEmitter<Card>();
  @Output() sideboardCardRemoved = new EventEmitter<Card>();

  cardCountables = Object.keys(CardCountable);

  typeWithCounts$: Observable<TypeWithCount[]>;
  sideboard$: Observable<CardWithCount[]>;

  private countBySub = new BehaviorSubject<CardCountable>(CardCountable.Type);
  private reflowSub = new BehaviorSubject<null>(null);

  trackBy = (index: number, item: Card) => item.name;

  constructor(private cardCountService: CardCountService) { }

  countBy(key: string): void {
    this.countBySub.next(CardCountable[key]);
  }

  reflow(): void {
    this.cardCountService.reset();
    this.reflowSub.next(null);
  }

  private buildObservables(): void {
    this.typeWithCounts$ = combineLatest([this.cardsSub, this.countBySub, this.reflowSub]).pipe(
      map(([cards, countBy]) => this.cardCountService.countTypes(cards, countBy))
    );

    this.sideboard$ = this.sideboardSub.pipe(
      map(cards => cards.reduce((acc, curr) => this.cardCountService.countCards(curr, acc), []))
    );
  }

  ngOnDestroy(): void {
    this.reflow();
  }

  ngOnInit() {
    this.buildObservables();
  }
}
