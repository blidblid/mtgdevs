import { TableZone } from '@mtg-devs/components';
import { TypesHelper } from '@mtg-devs/api';

import { AiPlayTemplate, AiPlayType } from '../ai-model';


export const UNSUMMON: AiPlayTemplate = {
  cardName: 'Unsummon',
  type: AiPlayType.Interaction,
  card: null,
  resolutionZone: TableZone.Hand,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.creature]
  }
};

export const MURDER: AiPlayTemplate = {
  cardName: 'Murder',
  type: AiPlayType.Interaction,
  card: null,
  resolutionZone: TableZone.Graveyard,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.creature]
  }
};

export const STONE_RAIN: AiPlayTemplate = {
  cardName: 'Stone rain',
  type: AiPlayType.Interaction,
  card: null,
  resolutionZone: TableZone.Graveyard,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.land]
  }
};

export const HEROS_DOWNFALL: AiPlayTemplate = {
  cardName: 'Hero\'s Downfall',
  type: AiPlayType.Interaction,
  card: null,
  resolutionZone: TableZone.Graveyard,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.creature, TypesHelper.planeswalker]
  }
};

export const AI_INTERACTIONS = [
  UNSUMMON,
  MURDER,
  HEROS_DOWNFALL,
  STONE_RAIN
];
