// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // serverUrl: 'http://127.0.0.1:3000/api',
  // wsUrl: 'http://localhost:3000/ws',
  serverUrl: "https://scrabble-production.up.railway.app/api", // TODO: Add remote server URL
  wsUrl: "wss://scrabble-production.up.railway.app/ws",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
