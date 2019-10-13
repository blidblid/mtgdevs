import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { DeckDisplayModule, CardBrowserModule, CardSorterModule, LayoutModule } from '@mtg-devs/components';

import { SealedComponent } from './sealed.component';
import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';
import { LimitedExplanationModule } from '../limited-explanation/limited-explanation.module';


const sealed: SideNavItem = {
  name: 'Sealed',
  component: SealedComponent,
  link: 'sealed',
  icon: 'dashboard',
  subcategory: SideNavItemSubcategory.Limited
};

@NgModule({
  entryComponents: [SealedComponent],
  declarations: [SealedComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutModule,
    CardBrowserModule,
    MaterialSharedModule,
    DeckDisplayModule,
    CardSorterModule,
    LimitedExplanationModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: sealed, multi: true }
  ]
})
export class SealedModule { }
