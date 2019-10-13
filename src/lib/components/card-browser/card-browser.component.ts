import { Component, OnInit, Input, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Card } from '@mtg-devs/api';



@Component({
  selector: 'app-card-browser',
  templateUrl: './card-browser.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-card-browser',
    '[class.grid-card]': '!smallCards',
    '[class.grid-card-small]': 'smallCards'
  }
})
export class CardBrowserComponent implements OnInit {

  @Input()
  set cards(cards: Card[]) {
    if (Array.isArray(cards)) {
      this.cardsSub.next(cards);
    }
  }
  private cardsSub: BehaviorSubject<Card[]> = new BehaviorSubject([]);

  @Input()
  set basics(basics: Card[]) {
    if (Array.isArray(basics)) {
      this.basicsSub.next(basics);
    }
  }
  private basicsSub: BehaviorSubject<Card[]> = new BehaviorSubject([]);

  @Input()
  smallCards: boolean;

  @Output()
  cardSelected = new EventEmitter<Card>();

  cards$: Observable<Card[]>;
  basics$: Observable<Card[]>;

  private buildObservables(): void {
    this.cards$ = this.cardsSub.asObservable();
    this.basics$ = this.basicsSub.asObservable();
  }

  ngOnInit(): void {
    this.buildObservables();
  }
}
