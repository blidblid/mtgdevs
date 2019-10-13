export type DictionaryName = 'standard' | 'modern' | 'legacy' | 'vintage' | 'commander' | 'pauper';

export const AVAILABLE_DICTIONARIES: DictionaryName[] = [
  'standard',
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pauper'
];

export interface Dictionary {
  name: DictionaryName;
  cards: DictionaryEntry[];
}

export interface DictionaryEntry {
  name: string;
  type: string;
}