import { Component } from '@angular/core';

import { CardSorterService } from '@mtg-devs/core';


@Component({
  selector: 'app-card-sorter',
  templateUrl: './card-sorter.component.html',
  styleUrls: ['./card-sorter.component.scss']
})
export class CardSorterComponent {

  sortByColor(): void {
    this.cardSorterService.sortByColor();
  }

  sortByName(): void {
    this.cardSorterService.sortByName();
  }

  sortByRarity(): void {
    this.cardSorterService.sortByRarity();
  }

  constructor(private cardSorterService: CardSorterService) { }
}
