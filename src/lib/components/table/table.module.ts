import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialSharedModule } from '@mtg-devs/core';

import { TableComponent } from './table.component';
import { CardDisplayModule } from '../card-display';


@NgModule({
  declarations: [
    TableComponent
  ],
  imports: [
    CommonModule,
    CardDisplayModule,
    MaterialSharedModule
  ],
  exports: [
    TableComponent
  ]
})
export class TableModule { }
