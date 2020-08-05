import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { DeckDisplayModule, LayoutModule } from '@mtg-devs/components';

import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';
import { DeckBuilderComponent } from './deck-builder.component';


const component: SideNavItem = {
  name: 'Builder',
  component: DeckBuilderComponent,
  link: 'deck-builder',
  icon: 'add',
  subcategory: SideNavItemSubcategory.Constructed
};

@NgModule({
  entryComponents: [DeckBuilderComponent],
  declarations: [DeckBuilderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DeckDisplayModule,
    LayoutModule,
    MaterialSharedModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true }
  ]
})
export class DeckBuilderModule { }
