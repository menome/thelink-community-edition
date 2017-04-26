// TODO: Get these somewhere secure.
var fs = require('fs');

// Secret is the secret we use for signing the JWT auth tokens.
module.exports = {
  apiOnly: false, // Set this to true if we want the API to run standalone, without a web frontend.
  instrumentation: { // Details for logging and stuff.
    enable: false, // True if we want to write logs + send data to datadog.
    ddogPrefix: 'thelink.', //  Prefix all messages with this string.
    statsDHost: 'datadog', // Hostname for dogstatsd server.
    statsDPort: 8125, // Port number for dogstatsd server.
  },
  defaultGroupCutoff: 50,
  sessionSecret: 'YOUR_BROWSER_SESSION_KEY_HERE',
  dbuser: 'neo4j',
  dbpass: 'password!',
  googleMapKey: 'YOUR_GOOGLE_MAP_API_KEY_HERE',
  dataDog: '',
  anonAccess: true, // Uses the anonymous user in the DB for all unauthenticated requests.
  autoLogin: 'anon', // Possible values are 'none' or 'anon'
  allowedOrigins: ['URL_OF_SITE'], // Allowed origins for CORS.
  ssl: {
    enable: false,
    certFile: "/srv/theLink/ext_config/cert.pem",
    keyFile: "/srv/theLink/ext_config/key.pem",
  }
};

// Load the external config file, if we can.
// External config overrides internal one.
try {
  var extconf = require('/srv/theLink/ext_config/conf');
  for (var key in extconf) {
    if (extconf.hasOwnProperty(key)) {
      module.exports[key] = extconf[key];
    }
  }
} catch (e) {
  console.log("Can not find external config file. Using defaults.");
  //Do nothing. Probably means the external config file wasn't found.  
}