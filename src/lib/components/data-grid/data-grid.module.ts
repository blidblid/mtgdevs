import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataGridComponent } from './data-grid.component';
import { MaterialSharedModule } from 'lib/core/shared-modules';


@NgModule({
  declarations: [
    DataGridComponent
  ],
  exports: [
    DataGridComponent
  ],
  imports: [
    CommonModule,
    MaterialSharedModule
  ]
})
export class DataGridModule { }
