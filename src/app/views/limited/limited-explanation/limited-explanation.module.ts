import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { LimitedExplanationComponent } from './limited-explanation.component';


@NgModule({
  declarations: [
    LimitedExplanationComponent
  ],
  exports: [
    LimitedExplanationComponent
  ],
  imports: [
    CommonModule,
    MaterialSharedModule
  ]
})
export class LimitedExplanationModule { }
