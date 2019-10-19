import { Card } from './card-model';


export type Type = 'Artifact' | 'Creature' | 'Enchantment' | 'Instant' | 'Land' | 'Sorcery' | 'Planeswalker' | 'Tribal';

const ALL_TYPES: Type[] = [
  'Artifact',
  'Creature',
  'Enchantment',
  'Instant',
  'Land',
  'Sorcery',
  'Planeswalker',
  'Tribal'
];

export class TypesHelper {
  static artifact: Type = 'Artifact';
  static creature: Type = 'Creature';
  static enchantment: Type = 'Enchantment';
  static instant: Type = 'Instant';
  static land: Type = 'Land';
  static sorcery: Type = 'Sorcery';
  static planeswalker: Type = 'Planeswalker';
  static tribal: Type = 'Tribal';

  static nonLand: Type[] = TypesHelper.allExcept([TypesHelper.land]);
  static nonCreature: Type[] = TypesHelper.allExcept([TypesHelper.creature]);
  static nonCreatureNonLand: Type[] = TypesHelper.allExcept([TypesHelper.creature, TypesHelper.land]);

  static allExcept(expect: Type[]): Type[] {
    return ALL_TYPES.filter(type => !expect.includes(type));
  }

  static isPlaneswalker(card: Card): boolean {
    return card.types.includes(this.planeswalker);
  }
}
