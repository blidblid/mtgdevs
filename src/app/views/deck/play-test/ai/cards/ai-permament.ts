import { AiPlayTemplate, AiPlayType, AiEffectType } from '../ai-model';


export const GRIZZLY_BEAR: AiPlayTemplate = {
  cardName: 'Grizzly Bears',
  type: AiPlayType.Permanent,
  effects: [{
    type: AiEffectType.Damage,
    amount: 2
  }],
  card: null,
  power: 50
};

export const HEALERS_HAWK: AiPlayTemplate = {
  cardName: 'Healer\'s Hawk',
  type: AiPlayType.Permanent,
  effects: [{
    type: AiEffectType.Damage,
    amount: 1
  }],
  card: null,
  power: 20
};
export const MEZA_UNICORN: AiPlayTemplate = {
  cardName: 'Mesa Unicorn',
  type: AiPlayType.Permanent,
  effects: [{
    type: AiEffectType.Damage,
    amount: 2
  }, {
    type: AiEffectType.Heal,
    amount: 2
  }],
  card: null,
  power: 20
};

export const AI_PERMANENTS = [
  GRIZZLY_BEAR,
  HEALERS_HAWK,
  MEZA_UNICORN
];
