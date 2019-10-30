# Database
All information on mtgdevs comes from scryfall.com and mtgjson.com.

## Generating a database
To run the database generation script, make sure to have `ts-node` installed. Once installed globally, cd to `mtgdevs/db` and run `ts-node generate`. If you do not have any source files locally, add a flag to download fresh ones: `ts-node generate --new`.
