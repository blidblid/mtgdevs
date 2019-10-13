import { TableZone } from '@mtg-devs/components';
import { TypesHelper } from '@mtg-devs/api';

import { AiPlayTemplate, AI_PLAY, AiPlayType } from '../ai-model';


export const UNSUMMON: AiPlayTemplate = {
  cardName: 'Unsummon',
  type: AiPlayType.Interaction,
  card: null,
  power: 50,
  resolutionZone: TableZone.Hand,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.creature]
  }
};

export const DURESS: AiPlayTemplate = {
  cardName: 'Duress',
  type: AiPlayType.Interaction,
  card: null,
  power: 50,
  resolutionZone: TableZone.Graveyard,
  target: {
    zones: [TableZone.Hand],
    types: TypesHelper.nonCreatureNonLand
  }
};

export const HEROS_DOWNFALL: AiPlayTemplate = {
  cardName: 'Hero\'s Downfall',
  type: AiPlayType.Interaction,
  card: null,
  power: 50,
  resolutionZone: TableZone.Graveyard,
  target: {
    zones: [TableZone.Battlefield, TableZone.Land],
    types: [TypesHelper.creature, TypesHelper.planeswalker]
  }
};

export const AI_INTERACTIONS = [
  UNSUMMON,
  DURESS,
  HEROS_DOWNFALL
];
