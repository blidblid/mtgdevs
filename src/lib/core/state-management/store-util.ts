import { Card } from '@mtg-devs/api';


export const removeCardFromArray = (card: Card, cards: Card[]): Card[] => {
  const index = cards.findIndex(c => c.name === card.name);
  const cardsCopy = [...cards];

  if (index >= 0) {
    cardsCopy.splice(index, 1);
  }

  return cardsCopy;
};

export function removeFromArray<T>(toRemove: T, array: T[]): T[] {
  const arrayCopy = [...array];
  arrayCopy.splice(array.indexOf(toRemove), 1);
  return arrayCopy;
}

export function updateInArray<T>(newValue: T, target: T, array: T[]): T[] {
  const index = array.indexOf(target);

  if (index < 0) {
    return array;
  }

  const arrayCopy = [...array];
  arrayCopy[index] = newValue;
  return arrayCopy;
}

export function addToArray<T>(toAdd: T, array: T[]): T[] {
  if (toAdd) {
    return [...array, toAdd];
  }

  return [...array];
}

export function toArrayWithKey<T>(object: any): (T & { key: string; })[] {
  return Object.keys(object)
    .map(key => {
      return { ...object[key], key };
    });
}
