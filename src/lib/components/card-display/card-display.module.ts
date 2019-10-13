import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { CardDisplayComponent } from './card-display.component';
import { CounterModule } from '../counter';


@NgModule({
  declarations: [
    CardDisplayComponent
  ],
  entryComponents: [
    CardDisplayComponent
  ],
  imports: [
    CommonModule,
    CounterModule,
    MaterialSharedModule
  ],
  exports: [
    CardDisplayComponent
  ]
})
export class CardDisplayModule { }
