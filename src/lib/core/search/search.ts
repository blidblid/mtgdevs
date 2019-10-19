import { DictionaryEntry } from '@mtg-devs/api';


export function searchSubstring(filterBy: string, entries: DictionaryEntry[]): DictionaryEntry[] {
  return entries.filter(entry => entry.name.toLowerCase().includes(filterBy.toLowerCase()));
}
