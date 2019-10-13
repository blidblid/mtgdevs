import { InjectionToken } from "@angular/core";

export interface ArenaEvent {
  /** Name of the event. */
  name: string;

  /** Whether a match is best of three. */
  bestOfThree: boolean;

  /** Gold cost to buy into the event. */
  gold: number;

  /** Gem cost to buy into the event. */
  gems: number;

  /** Number of losses before elimination. */
  losses: number;

  /** Number of maximum wins. */
  wins: number;

  /** Payout for a win. */
  payouts: Payout[];
}

/** Rewards per win. */
export interface Payout {
  gold: number;
  gems: number;
  packs: number;
  uncommons: number;
  rares: number;
  mythics: number;
  normalized?: number;
}

export interface DisplayResult {
  name: string;
  result: number[];
}

export type DisplayPayout = Payout & { name: string; }

export interface Normalizer {
  goldPerGem: number;
  goldPerPack: number;
  goldPerUncommon: number;
  goldPerRare: number;
  goldPerMythic: number;
}

// https://magic.wizards.com/en/promotions/drop-rates
const UNCOMMON_TO_RARE_RATE = 1 / 10;
const UNCOMMON_TO_MYTHIC_RATE = 1 / 20;
const RARE_TO_MYTHIC_RATE = 33 / 100;

function uncommonReward(uncommons: number = 0) {
  return uncommons * (1 - UNCOMMON_TO_RARE_RATE) * (1 - UNCOMMON_TO_MYTHIC_RATE);
}

function rareReward(uncommons: number = 0, rares: number = 0) {
  return uncommons * UNCOMMON_TO_RARE_RATE + rares * (1 - RARE_TO_MYTHIC_RATE);
}

function mythicReward(uncommons: number = 0, rares: number = 0) {
  return uncommons * UNCOMMON_TO_MYTHIC_RATE + rares * RARE_TO_MYTHIC_RATE
}

export const ARENA_EVENT: InjectionToken<ArenaEvent> = new InjectionToken('Arena event.');

const DRAFT_EVENT: ArenaEvent = {
  name: 'Draft',
  bestOfThree: false,
  gold: 5000,
  gems: 750,
  losses: 3,
  wins: 7,
  payouts: [{
    gold: 0,
    gems: 50,
    packs: 1.2,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 100,
    packs: 1.22,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 200,
    packs: 1.24,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 300,
    packs: 1.26,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 450,
    packs: 1.3,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 650,
    packs: 1.35,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 850,
    packs: 1.4,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 950,
    packs: 2,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }]
};

export const CONSTRUCTED_EVENT: ArenaEvent = {
  name: 'Constructed',
  bestOfThree: false,
  gold: 500,
  gems: 95,
  losses: 3,
  wins: 7,
  payouts: [{
    gold: 100,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 200,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 300,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 400,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 500,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 600,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(2),
    rares: rareReward(2, 1),
    mythics: mythicReward(2, 1)
  }, {
    gold: 800,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(1),
    rares: rareReward(1, 2),
    mythics: mythicReward(1, 2)
  }, {
    gold: 1000,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(1),
    rares: rareReward(1, 2),
    mythics: mythicReward(1, 2)
  }]
};

export const TRADITIONAL_DRAFT_EVENT: ArenaEvent = {
  name: 'Traditional Draft',
  bestOfThree: true,
  gold: 0,
  gems: 1500,
  losses: 2,
  wins: 5,
  payouts: [{
    gold: 0,
    gems: 0,
    packs: 1,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 0,
    packs: 2,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 800,
    packs: 3,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 1500,
    packs: 4,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 1800,
    packs: 5,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }, {
    gold: 0,
    gems: 2100,
    packs: 6,
    uncommons: 0,
    rares: 0,
    mythics: 0
  }]
};

export const TRADITIONAL_CONSTRUCTED_EVENT: ArenaEvent = {
  name: 'Traditional Constructed',
  bestOfThree: true,
  gold: 1000,
  gems: 190,
  losses: 2,
  wins: 5,
  payouts: [{
    gold: 0,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 500,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 1000,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(3),
    rares: rareReward(3),
    mythics: mythicReward(3)
  }, {
    gold: 1500,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(2),
    rares: rareReward(2, 1),
    mythics: mythicReward(2, 1)
  }, {
    gold: 1700,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(1),
    rares: rareReward(1, 2),
    mythics: mythicReward(1, 2)
  }, {
    gold: 2100,
    gems: 0,
    packs: 0,
    uncommons: uncommonReward(1),
    rares: rareReward(1, 2),
    mythics: mythicReward(1, 2)
  }]
};

export const DRAFT_EVENT_GOLD: ArenaEvent = Object.assign({}, DRAFT_EVENT, { gems: 0, name: 'Draft (gold)' });
export const DRAFT_EVENT_GEMS: ArenaEvent = Object.assign({}, DRAFT_EVENT, { gold: 0, name: 'Draft (gems)' });
export const CONSTRUCTED_EVENT_GOLD: ArenaEvent = Object.assign({}, CONSTRUCTED_EVENT, { gems: 0, name: 'Constructed (gold)' });
export const CONSTRUCTED_EVENT_GEMS: ArenaEvent = Object.assign({}, CONSTRUCTED_EVENT, { gold: 0, name: 'Constructed (gems)' });
export const TRADITIONAL_CONSTRUCTED_EVENT_GOLD: ArenaEvent = Object.assign({}, TRADITIONAL_CONSTRUCTED_EVENT, { gems: 0, name: 'Traditional Constructed (gold)' });
export const TRADITIONAL_CONSTRUCTED_EVENT_GEMS: ArenaEvent = Object.assign({}, TRADITIONAL_CONSTRUCTED_EVENT, { gold: 0, name: 'Traditional Constructed (gems)' });
