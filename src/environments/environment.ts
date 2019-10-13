// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDB-X6p0KL2qNXDllHsRi_XI3EEgV3p6r8",
    authDomain: "open-mtg.firebaseapp.com",
    databaseURL: "https://open-mtg.firebaseio.com",
    projectId: "open-mtg",
    storageBucket: "open-mtg.appspot.com",
    messagingSenderId: "60501384657"
  }
};
