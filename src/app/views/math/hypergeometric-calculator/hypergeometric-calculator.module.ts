import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';
import { LayoutModule } from '@mtg-devs/components';

import { HypergeometricCalculatorComponent } from './hypergeometric-calculator.component';
import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';


const component: SideNavItem = {
  name: 'Hypergeometric Calculator',
  component: HypergeometricCalculatorComponent,
  link: 'hypergeometric-calculator',
  icon: 'linear_scale',
  subcategory: SideNavItemSubcategory.Math
};

@NgModule({
  entryComponents: [HypergeometricCalculatorComponent],
  declarations: [HypergeometricCalculatorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialSharedModule,
    LayoutModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true }
  ]
})
export class HypergeometricCalculatorModule { }
