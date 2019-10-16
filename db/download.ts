import * as request from 'request-promise';
import * as fs from 'fs';


export async function requestMtgJson(target: string, download: boolean) {
  const options = {
    method: `GET`,
    json: true,
    uri: `https://mtgjson.com/json/${target}.json`,
  };

  if (download) {
    try {
      const response = await request(options);
      fs.writeFile(
        `./input/${target}.json`,
        JSON.stringify(response),
        () => console.log(`Successfully downloaded ${target}.json from mtgjson.com`)
      );
      return response;
    } catch (error) { return Promise.reject(error); }
  } else {
    return JSON.parse(fs.readFileSync(`./input/${target}.json`, 'utf8'));
  }
}

export async function requestScryfall(download: boolean) {
  const options = {
    method: `GET`,
    json: true,
    uri: `https://archive.scryfall.com/json/scryfall-oracle-cards.json`,
  };

  if (download) {
    try {
      const response = await request(options);
      fs.writeFile(
        `./input/scryfall.json`,
        JSON.stringify(response),
        () => console.log(`Successfully downloaded scryfall.json from scryfall.com`)
      );
      return response;
    } catch (error) { return Promise.reject(error); }
  } else {
    return JSON.parse(fs.readFileSync(`./input/scryfall.json`, 'utf8'));
  }
}
