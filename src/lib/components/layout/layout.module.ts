import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { LayoutComponent } from './layout.component';
import { TopComponent } from './top/top.component';
import { BottomComponent } from './bottom/bottom.component';
import { MiddleComponent } from './middle/middle.component';
import { BottomToggleLeftDirective } from './bottom/bottom-toggle-left.component';
import { BottomToggleRightDirective } from './bottom/bottom-toggle-right.component';
import { TopActionsComponent } from './top/top-actions.component';
import { RightComponent } from './right/right.component';


const components = [
  BottomComponent,
  BottomToggleLeftDirective,
  BottomToggleRightDirective,
  LayoutComponent,
  MiddleComponent,
  RightComponent,
  TopComponent,
  TopActionsComponent
];

@NgModule({
  imports: [
    CommonModule,
    MaterialSharedModule
  ],
  declarations: components,
  exports: components
})
export class LayoutModule { }
