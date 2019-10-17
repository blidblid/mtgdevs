import { Component } from '@angular/core';

import { CardSorterService } from '@mtg-devs/core';


@Component({
  selector: 'app-card-sorter',
  templateUrl: './card-sorter.component.html',
  styleUrls: ['./card-sorter.component.scss']
})
export class CardSorterComponent {

  constructor(private cardSorterService: CardSorterService) { }

  sortByColor(): void {
    this.cardSorterService.sortByColor();
  }

  sortByName(): void {
    this.cardSorterService.sortByName();
  }

  sortByRarity(): void {
    this.cardSorterService.sortByRarity();
  }
}
