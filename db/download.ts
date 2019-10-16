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