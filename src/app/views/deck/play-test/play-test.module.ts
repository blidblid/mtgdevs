import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { TableModule, CounterModule, CardDisplayModule, LayoutModule } from '@mtg-devs/components';

import { PlayTestComponent } from './play-test.component';
import { SideNavItemSubcategory, SideNavItem, SIDE_NAV_ITEM } from '../../../main/main-model';
import { ALL_CLICK_HANDLER_PROVIDERS } from './play-test-click-handler';
import { AI_INTERACTIONS } from './ai/cards/ai-interaction';
import { AI_PLAY } from './ai/ai-model';
import { AI_PERMANENTS } from './ai/cards/ai-permament';


const component: SideNavItem = {
  name: 'Play Test',
  component: PlayTestComponent,
  link: 'play-test',
  icon: 'android',
  subcategory: SideNavItemSubcategory.Constructed
};

@NgModule({
  entryComponents: [
    PlayTestComponent
  ],
  declarations: [
    PlayTestComponent
  ],
  imports: [
    CardDisplayModule,
    CommonModule,
    CounterModule,
    ReactiveFormsModule,
    MaterialSharedModule,
    LayoutModule,
    TableModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true },
    {
      provide: AI_PLAY,
      useValue: [
        ...AI_INTERACTIONS,
        ...AI_PERMANENTS
      ]
    },
    ...ALL_CLICK_HANDLER_PROVIDERS
  ]
})
export class PlayTestModule { }
