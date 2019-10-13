import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { DeckDisplayComponent } from './deck-display.component';
import { CardDisplayModule } from '../card-display/card-display.module';


@NgModule({
  declarations: [
    DeckDisplayComponent
  ],
  exports: [
    DeckDisplayComponent
  ],
  imports: [
    CommonModule,
    CardDisplayModule,
    MaterialSharedModule
  ]
})
export class DeckDisplayModule { }
