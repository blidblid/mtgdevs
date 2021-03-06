import * as fs from 'fs';

import {
  PLAINS_MULTIVERSEID,
  ISLAND_MULTIVERSEID,
  SWAMP_MULTIVERSEID,
  MOUNTAIN_MULTIVERSEID,
  FOREST_MULTIVERSEID,
  INCLUDED_CARD_PROPERTIES,
  INCLUDED_SET_PROPERTIES
} from './model';
import { requestMtgJson, requestScryfall } from './download';
import { removeInvalid, withoutKeyValue, minify, addKeyFromCards, buildDictionaries } from './util';
import { CardSet, Card } from '../src/lib/api/card/card-model';
import { decorateCard } from './decorate';


(async function writeDataBase() {
  const downloadNew = process.argv.includes('--new');

  const mtgJsonCard = await requestMtgJson('AllCards', downloadNew);
  const mtgJsonSet = await requestMtgJson('AllSets', downloadNew);
  const scryfallCards: Card[] = await requestScryfall(downloadNew);
  const mtgJsonCards: Card[] = Object.values(mtgJsonCard);
  const mtgJsonSets: CardSet[] = Object.values(mtgJsonSet);
  const mtgJsonSetCards: Card[] = mtgJsonSets.reduce((acc, curr) => [...acc, ...curr.cards], [] as Card[]);
  const score: any = JSON.parse(fs.readFileSync('./input/score.json', 'utf8'));

  // Remove invalid cards for firebase
  removeInvalid(mtgJsonCard);
  removeInvalid(mtgJsonSet);

  // Remove starter cards.
  mtgJsonSets.forEach(set => set.cards = withoutKeyValue(set.cards, 'isStarter', true));

  // Add cache time stamps.
  const cacheTimeStamp = new Date().toISOString();
  mtgJsonCards.forEach(card => card.cacheTimeStamp = cacheTimeStamp);
  mtgJsonSets.forEach(set => set.cacheTimeStamp = cacheTimeStamp);

  // Add scores to sets.
  Object.keys(score).forEach(key => mtgJsonSet[key].score = score[key]);

  const dictionaries = buildDictionaries(mtgJsonCards, cacheTimeStamp);
  const selection = { set: Object.keys(mtgJsonSet) };
  const basic = {
    plains: mtgJsonSetCards.find(card => card.multiverseId === PLAINS_MULTIVERSEID),
    island: mtgJsonSetCards.find(card => card.multiverseId === ISLAND_MULTIVERSEID),
    swamp: mtgJsonSetCards.find(card => card.multiverseId === SWAMP_MULTIVERSEID),
    mountain: mtgJsonSetCards.find(card => card.multiverseId === MOUNTAIN_MULTIVERSEID),
    forest: mtgJsonSetCards.find(card => card.multiverseId === FOREST_MULTIVERSEID)
  };
  const basics: Card[] = Object.values(basic) as Card[];

  // Decorate with new properties.
  mtgJsonCards.forEach(card => decorateCard(card));
  mtgJsonSets.forEach(set => set.cards.forEach(card => decorateCard(card)));
  basics.forEach(card => decorateCard(card));

  // Minify by removing unwanted properties.
  mtgJsonCards.forEach(card => minify(card, INCLUDED_CARD_PROPERTIES));
  mtgJsonSets.forEach(set => set.cards.forEach(card => minify(card, INCLUDED_CARD_PROPERTIES)));
  basics.forEach(card => minify(card, INCLUDED_CARD_PROPERTIES));
  mtgJsonSets.forEach(set => minify(set, INCLUDED_SET_PROPERTIES));

  // Add missing keys from other cards.
  addKeyFromCards(mtgJsonCards, mtgJsonSetCards, ['multiverseId']);
  addKeyFromCards(mtgJsonCards, scryfallCards, ['image_uris', 'normal'], 'scryfallImage');

  const db = {
    card: mtgJsonCard,
    set: mtgJsonSet,
    dictionary: dictionaries,
    selection,
    basic,
    cacheTimeStamp
  };

  fs.writeFile('./output/db.json', JSON.stringify(db), () => console.log(`DB written!`));
})();
