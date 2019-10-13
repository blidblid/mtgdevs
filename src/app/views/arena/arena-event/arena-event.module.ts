import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialSharedModule } from '@mtg-devs/core';
import { LayoutModule } from '@mtg-devs/components';

import { ArenaEventComponent } from './arena-event.component';
import { SideNavItem, SIDE_NAV_ITEM, SideNavItemSubcategory } from '../../../main/main-model';
import {
  ARENA_EVENT,
  DRAFT_EVENT_GOLD,
  DRAFT_EVENT_GEMS,
  CONSTRUCTED_EVENT_GOLD,
  CONSTRUCTED_EVENT_GEMS,
  TRADITIONAL_DRAFT_EVENT,
  TRADITIONAL_CONSTRUCTED_EVENT_GEMS,
  TRADITIONAL_CONSTRUCTED_EVENT_GOLD
} from './arena-event-model';


const component: SideNavItem = {
  name: 'Event Value',
  component: ArenaEventComponent,
  link: 'arena-event',
  icon: 'attach_money',
  subcategory: SideNavItemSubcategory.Arena
};

@NgModule({
  entryComponents: [
    ArenaEventComponent
  ],
  declarations: [
    ArenaEventComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutModule,
    MaterialSharedModule
  ],
  providers: [
    { provide: SIDE_NAV_ITEM, useValue: component, multi: true },
    { provide: ARENA_EVENT, useValue: DRAFT_EVENT_GOLD, multi: true },
    { provide: ARENA_EVENT, useValue: DRAFT_EVENT_GEMS, multi: true },
    { provide: ARENA_EVENT, useValue: CONSTRUCTED_EVENT_GOLD, multi: true },
    { provide: ARENA_EVENT, useValue: CONSTRUCTED_EVENT_GEMS, multi: true },
    { provide: ARENA_EVENT, useValue: TRADITIONAL_DRAFT_EVENT, multi: true },
    { provide: ARENA_EVENT, useValue: TRADITIONAL_CONSTRUCTED_EVENT_GOLD, multi: true },
    { provide: ARENA_EVENT, useValue: TRADITIONAL_CONSTRUCTED_EVENT_GEMS, multi: true }
  ]
})
export class ArenaEventsModule { }
