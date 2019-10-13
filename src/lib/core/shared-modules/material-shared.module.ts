import { NgModule } from '@angular/core';

import {
  MatInputModule,
  MatExpansionModule,
  MatButtonModule,
  MatTableModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSidenavModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatListModule,
  MatIconModule,
  MatCardModule,
  MatOptionModule,
  MatMenuModule,
  MatAutocompleteModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatBadgeModule,
  MatDialogModule,
  MatSortModule
} from '@angular/material';

import { DragDropModule } from '@angular/cdk/drag-drop';


const materialModules = [
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatOptionModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule
];

const cdkModules = [
  DragDropModule
];

@NgModule({
  imports: [...materialModules, ...cdkModules],
  exports: [...materialModules, ...cdkModules]
})
export class MaterialSharedModule { }
