import { NgModule } from '@angular/core';
import {
  ShowOnDirtyErrorStateMatcher,
  ErrorStateMatcher,
  MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
  MatExpansionPanelDefaultOptions
} from '@angular/material';


export class MatExpansionPanelDefault implements MatExpansionPanelDefaultOptions {
  hideToggle = true;
  expandedHeight = '48px';
  collapsedHeight = '48px';
}

@NgModule({
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: MAT_EXPANSION_PANEL_DEFAULT_OPTIONS, useClass: MatExpansionPanelDefault }
  ]
})
export class MaterialServiceOverrideModule { }
