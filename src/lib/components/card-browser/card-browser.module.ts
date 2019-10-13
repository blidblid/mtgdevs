import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { CardBrowserComponent } from './card-browser.component';
import { CardDisplayModule } from '../card-display/card-display.module';


@NgModule({
  declarations: [
    CardBrowserComponent
  ],
  exports: [
    CardBrowserComponent
  ],
  imports: [
    CommonModule,
    CardDisplayModule,
    MaterialSharedModule
  ]
})
export class CardBrowserModule { }
