var fs = require('fs');
var request = require('request-promise');

const PLAINS_MULTIVERSEID = 401992
const ISLAND_MULTIVERSEID = 401927;
const SWAMP_MULTIVERSEID = 402058;
const MOUNTAIN_MULTIVERSEID = 401956;
const FOREST_MULTIVERSEID = 401886;

const cacheTimeStamp = new Date().toISOString();

const INCLUDED_CARD_PROPERTIES = [
  'colors',
  'convertedManaCost',
  'loyalty',
  'manaCost',
  'name',
  'starter',
  'power',
  'toughness',
  'subtypes',
  'supertypes',
  'type',
  'types',
  'rarity',
  'multiverseId',
  'cacheTimeStamp'
];

const INCLUDED_SET_PROPERTIES = [
  'boosterV3',
  'cards',
  'score',
  'code',
  'cacheTimeStamp'
];

 async function requestMtgJson(target) {
    const options = {
      method: `GET`,
      json: true,
      uri: `https://mtgjson.com/json/${target}.json`,
    };
    try {
      const response = await request(options);
      console.log(`Successfully downloaded ${target}.json from mtgjson.com`);
      return response;
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

(async function writeDataBase() {
  const mtgJsonCard = await requestMtgJson('AllCards');
  const mtgJsonSet = await requestMtgJson('AllSets');
  const mtgJsonSetCards = Object.values(mtgJsonSet).reduce((acc, curr) => [...acc, ...curr.cards], []);
  const score = JSON.parse(fs.readFileSync('./input/score.json', 'utf8'));

  removeInvalid(mtgJsonCard);
  removeInvalid(mtgJsonSet);
  Object.values(mtgJsonSet).forEach(set => {
    set.cards = withoutKeyValue(set.cards, 'isStarter', true)
  });

  addCacheTimeStamp();

  Object.keys(score).forEach(key => mtgJsonSet[key].score = score[key]);

  const dictionaries = buildDictionaries();
  const selection = { set: buildSetSelection() };
  const basic = {
    plains: mtgJsonSetCards.find(card => card.multiverseId === PLAINS_MULTIVERSEID),
    island: mtgJsonSetCards.find(card => card.multiverseId === ISLAND_MULTIVERSEID),
    swamp: mtgJsonSetCards.find(card => card.multiverseId === SWAMP_MULTIVERSEID),
    mountain: mtgJsonSetCards.find(card => card.multiverseId === MOUNTAIN_MULTIVERSEID),
    forest: mtgJsonSetCards.find(card => card.multiverseId === FOREST_MULTIVERSEID)
  }

  Object.values(mtgJsonCard).forEach(card => minify(card, INCLUDED_CARD_PROPERTIES));
  Object.values(mtgJsonSet).forEach(set => set.cards.forEach(card => minify(card, INCLUDED_CARD_PROPERTIES)));
  Object.values(basic).forEach(card => minify(card, INCLUDED_CARD_PROPERTIES));
  Object.values(mtgJsonSet).forEach(set => minify(set, INCLUDED_SET_PROPERTIES));
  addKeyFromCards(mtgJsonCard, mtgJsonSetCards, 'multiverseId');

  const db = {
    card: mtgJsonCard,
    set: mtgJsonSet,
    dictionary: dictionaries,
    selection,
    basic,
    cacheTimeStamp
  };

  fs.writeFile('./output/db.json', JSON.stringify(db), () => console.log(`DB written!`));

  function minify(removeFrom, includedKeys) {
    Object.keys(removeFrom).forEach(key => {
      if (!includedKeys.includes(key)) {
        delete removeFrom[key];
      }
    });
  };

  function removeInvalid(removeFrom) {
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

  function withoutKeyValue(cards, key, value) {
     return cards.filter(card => card[key] !== value);
  }

  function buildDictionaries() {
    const dictionaries = {
      standard: { name: 'standard', cacheTimeStamp, cards: {} },
      modern: { name: 'modern', cacheTimeStamp, cards: {}, },
      legacy: { name: 'legacy', cacheTimeStamp, cards: {} },
      vintage: { name: 'vintage', cacheTimeStamp, cards: {} },
      commander: { name: 'commander', cacheTimeStamp, cards: {} },
      pauper: { name: 'pauper', cacheTimeStamp, cards: {} }
    };

    Object.values(mtgJsonCard).forEach(card => {
      Object.values(dictionaries).forEach(dictionary => {
        if (card.legalities && card.legalities[dictionary.name] === 'Legal') {
          dictionary.cards[card.name] = card;
        }
      });
    });

    Object.values(dictionaries).forEach(dictionary => {
      dictionary.cards = Object.values(dictionary.cards).map(card => {
        return {
          name: card.name,
          type: card.type
        }
      })
    });

    return dictionaries;
  }

  function buildSetSelection() {
    return Object.keys(mtgJsonSet);
  }

  function addCacheTimeStamp() {
    Object.values(mtgJsonCard).forEach(value => {
      value.cacheTimeStamp = cacheTimeStamp;
    });

    Object.values(mtgJsonSet).forEach(value => {
      value.cacheTimeStamp = cacheTimeStamp;
    });
  }

  function addKeyFromCards(addTo, addFrom, key) {
    Object.values(addTo).forEach(card => {
      const fromCard = addFrom.find(c => c.name === card.name);
      if (fromCard && fromCard[key]) {
        card[key] = fromCard[key];
      }
    });
  }
})();
