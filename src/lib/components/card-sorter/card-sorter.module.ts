import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { CardSorterComponent } from './card-sorter.component';


@NgModule({
  declarations: [
    CardSorterComponent
  ],
  imports: [
    CommonModule,
    MaterialSharedModule
  ],
  exports: [
    CardSorterComponent
  ]
})
export class CardSorterModule { }
