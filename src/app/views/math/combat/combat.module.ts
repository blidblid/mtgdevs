import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { LayoutModule } from '@mtg-devs/components';

import { CombatComponent } from './combat.component';
import { SideNavItem, SideNavItemSubcategory, SIDE_NAV_ITEM } from '../../../main/main-model';


const component: SideNavItem = {
  name: 'Combat',
  component: CombatComponent,
  link: 'combat',
  icon: 'casino',
  subcategory: SideNavItemSubcategory.Math
};

@NgModule({
  declarations: [
    CombatComponent
  ],
  entryComponents: [
    CombatComponent
  ],
  imports: [
    MaterialSharedModule,
    CommonModule,
    ReactiveFormsModule,
    LayoutModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true }
  ]
})
export class CombatModule { }
