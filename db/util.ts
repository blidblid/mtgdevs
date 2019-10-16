import { Card } from '../src/lib/api/card/card-model';


export function removeInvalid(removeFrom: any) {
  Object.keys(removeFrom).forEach(key => {
    // Remove keys that are non-compatible with Firebase.
    if (key.match(/[\$\#\[\]\/\.]/g)) {
      delete removeFrom[key];
    }
    // Remove duplicates, i.e. keys with (b), (c), ... (d) etc.
    else if (key.match(/\([b-z]\)/g)) {
      delete removeFrom[key];
    }
    // Rename all keys with (a) in them.
    else if (key.includes(' (a)')) {
      const newKey = (key + '').replace(' (a)', '')
      delete Object.assign(removeFrom, { [newKey]: removeFrom[key] })[key];
    }
  });
}

export function withoutKeyValue(cards: Card[], key: string, value: any) {
  return cards.filter(card => card[key] !== value);
}

export function minify(removeFrom: any, includedKeys: string[]) {
  Object.keys(removeFrom).forEach(key => {
    if (!includedKeys.includes(key)) {
      delete removeFrom[key];
    }
  });
};

export function addKeyFromCards(cards: Card[], addFrom: Card[], key: string) {
  cards.forEach(card => {
    const fromCard = addFrom.find(c => c.name === card.name);
    if (fromCard && fromCard[key]) {
      card[key] = fromCard[key];
    }
  });
}

export function buildDictionaries(cards: Card[], cacheTimeStamp: string) {
  const dictionaries = {
    standard: { name: 'standard', cacheTimeStamp, cards: {} },
    modern: { name: 'modern', cacheTimeStamp, cards: {}, },
    legacy: { name: 'legacy', cacheTimeStamp, cards: {} },
    vintage: { name: 'vintage', cacheTimeStamp, cards: {} },
    commander: { name: 'commander', cacheTimeStamp, cards: {} },
    pauper: { name: 'pauper', cacheTimeStamp, cards: {} }
  };

  cards.forEach(card => {
    Object.values(dictionaries).forEach((dictionary: any) => {
      if (card['legalities'] && card['legalities'][dictionary.name] === 'Legal') {
        dictionary.cards[card.name] = card;
      }
    });
  });

  Object.values(dictionaries).forEach(dictionary => {
    dictionary.cards = Object.values(dictionary.cards).map((card: any) => {
      return {
        name: card.name,
        type: card.type
      }
    })
  });

  return dictionaries;
}