import { InjectionToken } from '@angular/core';


export const FOILS_PER_BOOSTER = 0.23;
export const COMMON_FOIL_CHANCE = 0.5714;
export const UNCOMMON_FOIL_CHANCE = 0.2857;
export const RARE_FOIL_CHANCE = 0.1429;

export const BOOSTER_LAND_RULE = new InjectionToken<LandRule>('booster-land-rule');
export type LandRule = (setCode: string) => number[];

export const DEFAULT_BOOSTER_V3 = [
  'rare',
  'uncommon',
  'uncommon',
  'uncommon',
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'land',
  'marketing'
];