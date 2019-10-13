import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { CounterComponent } from './counter.component';


@NgModule({
  declarations: [
    CounterComponent
  ],
  imports: [
    CommonModule,
    MaterialSharedModule
  ],
  exports: [
    CounterComponent
  ]
})
export class CounterModule { }
