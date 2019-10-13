import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { DeckDisplayModule, CardBrowserModule, CardSorterModule, LayoutModule } from '@mtg-devs/components';

import { DraftComponent } from './draft.component';
import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';
import { LimitedExplanationModule } from '../limited-explanation/limited-explanation.module';


const draft: SideNavItem = {
  name: 'Draft',
  component: DraftComponent,
  link: 'draft',
  icon: 'cached',
  subcategory: SideNavItemSubcategory.Limited
};

@NgModule({
  entryComponents: [DraftComponent],
  declarations: [DraftComponent],
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
    { provide: SIDE_NAV_ITEM, useValue: draft, multi: true }
  ]
})
export class DraftModule { }
