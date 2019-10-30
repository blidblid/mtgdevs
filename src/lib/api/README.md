# @mtgdevs/api
This is the entry point to the Firebase backend used to fetch for example cards and sets. Every entity is exposed as an Observable.

## Card
The card API fetches data from Firebase using the card name as an identifyer. To get for example Shock into your component, inject `CardService` and use it to call `cardService.getCard('Shock')`. Similarly, you can get fetch sets using the set-code `cardService.getSet('ktk')`.

## Dictionaries
To simplify card search mtgdevs creates dictionaries of all cards. They are loaded via `DictionaryService`.

## Decks
Decks are saved as Firebase-generated hashes via `DeckService`. The hash refers to a saved deck with card names and card counts. When a deck is fetched, it first gets the saved format and then fetches the cards via `CardService`.

## Caching
Every card, set, dictionary and deck is cached in LocalStorage. A timestamp keeps the cache up to date with the latest version of the Firebase database.
