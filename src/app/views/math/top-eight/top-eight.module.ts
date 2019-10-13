import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { LayoutModule } from '@mtg-devs/components';

import { TopEightComponent } from './top-eight.component';
import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';


const component: SideNavItem = {
  name: 'Top Eight',
  component: TopEightComponent,
  link: 'top-eight',
  icon: 'arrow_upward',
  subcategory: SideNavItemSubcategory.Math
}

@NgModule({
  entryComponents: [
    TopEightComponent
  ],
  declarations: [
    TopEightComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutModule,
    MaterialSharedModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true }
  ]
})
export class TopEightModule { }
