import { InjectionToken } from '@angular/core';

import { TableCardClicked, TableCardMoved, TableZone, toCardMovedEvent } from '@mtg-devs/components';


export const PLAY_TEST_CLICK_HANDLER = new InjectionToken<PlayTestClickHandler>('PLAY_TEST_CLICK_HANDLER');
export type PlayTestClickHandler = { handles: TableZone, fn: PlayTestClickHandlerFn };
export type PlayTestClickHandlerFn = (event: TableCardClicked) => TableCardMoved;

export function handClickHandler(event: TableCardClicked): TableCardMoved {
  const types = event.card.types;
  if (types.includes('Land')) {
    return toCardMovedEvent(event, TableZone.Land);
  } else if (types.some(type => ['Creature', 'Enchantment', 'Artifact', 'Planeswalker'].includes(type))) {
    return toCardMovedEvent(event, TableZone.Battlefield);
  } else if (types.some(type => ['Sorcery', 'Instant'].includes(type))) {
    return toCardMovedEvent(event, TableZone.Graveyard);
  }
}
export const HAND_CLICK_HANDLER_PROVIDER = {
  provide: PLAY_TEST_CLICK_HANDLER,
  useValue: { handles: TableZone.Hand, fn: handClickHandler },
  multi: true
}

export function battlefieldClickHandler(): void { }
export const BATTLEFIELD_CLICK_HANDLER_PROVIDER = {
  provide: PLAY_TEST_CLICK_HANDLER,
  useValue: { handles: TableZone.Battlefield, fn: battlefieldClickHandler },
  multi: true
}

export function landClickHandler(): void { }
export const LAND_CLICK_HANDLER_PROVIDER = {
  provide: PLAY_TEST_CLICK_HANDLER,
  useValue: { handles: TableZone.Land, fn: landClickHandler },
  multi: true
}

export const ALL_CLICK_HANDLER_PROVIDERS = [
  HAND_CLICK_HANDLER_PROVIDER,
  BATTLEFIELD_CLICK_HANDLER_PROVIDER,
  LAND_CLICK_HANDLER_PROVIDER
];
