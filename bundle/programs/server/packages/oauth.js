(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Log = Package.logging.Log;
var URL = Package.url.URL;
var URLSearchParams = Package.url.URLSearchParams;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OAuth, OAuthTest, Oauth;

var require = meteorInstall({"node_modules":{"meteor":{"oauth":{"oauth_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/oauth_server.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let bodyParser;
module.link("body-parser", {
  default(v) {
    bodyParser = v;
  }

}, 0);
OAuth = {};
OAuthTest = {};
RoutePolicy.declare('/_oauth/', 'network');
const registeredServices = {}; // Internal: Maps from service version to handler function. The
// 'oauth1' and 'oauth2' packages manipulate this directly to register
// for callbacks.

OAuth._requestHandlers = {}; // Register a handler for an OAuth service. The handler will be called
// when we get an incoming http request on /_oauth/{serviceName}. This
// handler should use that information to fetch data about the user
// logging in.
//
// @param name {String} e.g. "google", "facebook"
// @param version {Number} OAuth version (1 or 2)
// @param urls   For OAuth1 only, specify the service's urls
// @param handleOauthRequest {Function(oauthBinding|query)}
//   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider
//   - (For OAuth2 only) query {Object} parameters passed in query string
//   - return value is:
//     - {serviceData:, (optional options:)} where serviceData should end
//       up in the user's services[name] field
//     - `null` if the user declined to give permissions
//

OAuth.registerService = (name, version, urls, handleOauthRequest) => {
  if (registeredServices[name]) throw new Error("Already registered the ".concat(name, " OAuth service"));
  registeredServices[name] = {
    serviceName: name,
    version,
    urls,
    handleOauthRequest
  };
}; // For test cleanup.


OAuthTest.unregisterService = name => {
  delete registeredServices[name];
};

OAuth.retrieveCredential = (credentialToken, credentialSecret) => OAuth._retrievePendingCredential(credentialToken, credentialSecret); // The state parameter is normally generated on the client using
// `btoa`, but for tests we need a version that runs on the server.
//


OAuth._generateState = (loginStyle, credentialToken, redirectUrl) => {
  return Buffer.from(JSON.stringify({
    loginStyle: loginStyle,
    credentialToken: credentialToken,
    redirectUrl: redirectUrl
  })).toString('base64');
};

OAuth._stateFromQuery = query => {
  let string;

  try {
    string = Buffer.from(query.state, 'base64').toString('binary');
  } catch (e) {
    Log.warn("Unable to base64 decode state from OAuth query: ".concat(query.state));
    throw e;
  }

  try {
    return JSON.parse(string);
  } catch (e) {
    Log.warn("Unable to parse state from OAuth query: ".concat(string));
    throw e;
  }
};

OAuth._loginStyleFromQuery = query => {
  let style; // For backwards-compatibility for older clients, catch any errors
  // that result from parsing the state parameter. If we can't parse it,
  // set login style to popup by default.

  try {
    style = OAuth._stateFromQuery(query).loginStyle;
  } catch (err) {
    style = "popup";
  }

  if (style !== "popup" && style !== "redirect") {
    throw new Error("Unrecognized login style: ".concat(style));
  }

  return style;
};

OAuth._credentialTokenFromQuery = query => {
  let state; // For backwards-compatibility for older clients, catch any errors
  // that result from parsing the state parameter. If we can't parse it,
  // assume that the state parameter's value is the credential token, as
  // it used to be for older clients.

  try {
    state = OAuth._stateFromQuery(query);
  } catch (err) {
    return query.state;
  }

  return state.credentialToken;
};

OAuth._isCordovaFromQuery = query => {
  try {
    return !!OAuth._stateFromQuery(query).isCordova;
  } catch (err) {
    // For backwards-compatibility for older clients, catch any errors
    // that result from parsing the state parameter. If we can't parse
    // it, assume that we are not on Cordova, since older Meteor didn't
    // do Cordova.
    return false;
  }
}; // Checks if the `redirectUrl` matches the app host.
// We export this function so that developers can override this
// behavior to allow apps from external domains to login using the
// redirect OAuth flow.


OAuth._checkRedirectUrlOrigin = redirectUrl => {
  const appHost = Meteor.absoluteUrl();
  const appHostReplacedLocalhost = Meteor.absoluteUrl(undefined, {
    replaceLocalhost: true
  });
  return redirectUrl.substr(0, appHost.length) !== appHost && redirectUrl.substr(0, appHostReplacedLocalhost.length) !== appHostReplacedLocalhost;
};

const middleware = (req, res, next) => {
  let requestData; // Make sure to catch any exceptions because otherwise we'd crash
  // the runner

  try {
    const serviceName = oauthServiceName(req);

    if (!serviceName) {
      // not an oauth request. pass to next middleware.
      next();
      return;
    }

    const service = registeredServices[serviceName]; // Skip everything if there's no service set by the oauth middleware

    if (!service) throw new Error("Unexpected OAuth service ".concat(serviceName)); // Make sure we're configured

    ensureConfigured(serviceName);
    const handler = OAuth._requestHandlers[service.version];
    if (!handler) throw new Error("Unexpected OAuth version ".concat(service.version));

    if (req.method === 'GET') {
      requestData = req.query;
    } else {
      requestData = req.body;
    }

    handler(service, requestData, res);
  } catch (err) {
    var _requestData;

    // if we got thrown an error, save it off, it will get passed to
    // the appropriate login call (if any) and reported there.
    //
    // The other option would be to display it in the popup tab that
    // is still open at this point, ignoring the 'close' or 'redirect'
    // we were passed. But then the developer wouldn't be able to
    // style the error or react to it in any way.
    if (((_requestData = requestData) === null || _requestData === void 0 ? void 0 : _requestData.state) && err instanceof Error) {
      try {
        // catch any exceptions to avoid crashing runner
        OAuth._storePendingCredential(OAuth._credentialTokenFromQuery(requestData), err);
      } catch (err) {
        // Ignore the error and just give up. If we failed to store the
        // error, then the login will just fail with a generic error.
        Log.warn("Error in OAuth Server while storing pending login result.\n" + err.stack || err.message);
      }
    } // close the popup. because nobody likes them just hanging
    // there.  when someone sees this multiple times they might
    // think to check server logs (we hope?)
    // Catch errors because any exception here will crash the runner.


    try {
      OAuth._endOfLoginResponse(res, {
        query: requestData,
        loginStyle: OAuth._loginStyleFromQuery(requestData),
        error: err
      });
    } catch (err) {
      Log.warn("Error generating end of login response\n" + (err && (err.stack || err.message)));
    }
  }
}; // Listen to incoming OAuth http requests


WebApp.connectHandlers.use('/_oauth', bodyParser.json());
WebApp.connectHandlers.use('/_oauth', bodyParser.urlencoded({
  extended: false
}));
WebApp.connectHandlers.use(middleware);
OAuthTest.middleware = middleware; // Handle /_oauth/* paths and extract the service name.
//
// @returns {String|null} e.g. "facebook", or null if this isn't an
// oauth request

const oauthServiceName = req => {
  // req.url will be "/_oauth/<service name>" with an optional "?close".
  const i = req.url.indexOf('?');
  let barePath;
  if (i === -1) barePath = req.url;else barePath = req.url.substring(0, i);
  const splitPath = barePath.split('/'); // Any non-oauth request will continue down the default
  // middlewares.

  if (splitPath[1] !== '_oauth') return null; // Find service based on url

  const serviceName = splitPath[2];
  return serviceName;
}; // Make sure we're configured


const ensureConfigured = serviceName => {
  if (!ServiceConfiguration.configurations.findOne({
    service: serviceName
  })) {
    throw new ServiceConfiguration.ConfigError();
  }
};

const isSafe = value => {
  // This matches strings generated by `Random.secret` and
  // `Random.id`.
  return typeof value === "string" && /^[a-zA-Z0-9\-_]+$/.test(value);
}; // Internal: used by the oauth1 and oauth2 packages


OAuth._renderOauthResults = (res, query, credentialSecret) => {
  // For tests, we support the `only_credential_secret_for_test`
  // parameter, which just returns the credential secret without any
  // surrounding HTML. (The test needs to be able to easily grab the
  // secret and use it to log in.)
  //
  // XXX only_credential_secret_for_test could be useful for other
  // things beside tests, like command-line clients. We should give it a
  // real name and serve the credential secret in JSON.
  if (query.only_credential_secret_for_test) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(credentialSecret, 'utf-8');
  } else {
    const details = {
      query,
      loginStyle: OAuth._loginStyleFromQuery(query)
    };

    if (query.error) {
      details.error = query.error;
    } else {
      const token = OAuth._credentialTokenFromQuery(query);

      const secret = credentialSecret;

      if (token && secret && isSafe(token) && isSafe(secret)) {
        details.credentials = {
          token: token,
          secret: secret
        };
      } else {
        details.error = "invalid_credential_token_or_secret";
      }
    }

    OAuth._endOfLoginResponse(res, details);
  }
}; // This "template" (not a real Spacebars template, just an HTML file
// with some ##PLACEHOLDER##s) communicates the credential secret back
// to the main window and then closes the popup.


OAuth._endOfPopupResponseTemplate = Assets.getText("end_of_popup_response.html");
OAuth._endOfRedirectResponseTemplate = Assets.getText("end_of_redirect_response.html"); // Renders the end of login response template into some HTML and JavaScript
// that closes the popup or redirects at the end of the OAuth flow.
//
// options are:
//   - loginStyle ("popup" or "redirect")
//   - setCredentialToken (boolean)
//   - credentialToken
//   - credentialSecret
//   - redirectUrl
//   - isCordova (boolean)
//

const renderEndOfLoginResponse = options => {
  // It would be nice to use Blaze here, but it's a little tricky
  // because our mustaches would be inside a <script> tag, and Blaze
  // would treat the <script> tag contents as text (e.g. encode '&' as
  // '&amp;'). So we just do a simple replace.
  const escape = s => {
    if (s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;").replace(/\//g, "&#x2F;");
    } else {
      return s;
    }
  }; // Escape everything just to be safe (we've already checked that some
  // of this data -- the token and secret -- are safe).


  const config = {
    setCredentialToken: !!options.setCredentialToken,
    credentialToken: escape(options.credentialToken),
    credentialSecret: escape(options.credentialSecret),
    storagePrefix: escape(OAuth._storageTokenPrefix),
    redirectUrl: escape(options.redirectUrl),
    isCordova: !!options.isCordova
  };
  let template;

  if (options.loginStyle === 'popup') {
    template = OAuth._endOfPopupResponseTemplate;
  } else if (options.loginStyle === 'redirect') {
    template = OAuth._endOfRedirectResponseTemplate;
  } else {
    throw new Error("invalid loginStyle: ".concat(options.loginStyle));
  }

  const result = template.replace(/##CONFIG##/, JSON.stringify(config)).replace(/##ROOT_URL_PATH_PREFIX##/, __meteor_runtime_config__.ROOT_URL_PATH_PREFIX);
  return "<!DOCTYPE html>\n".concat(result);
}; // Writes an HTTP response to the popup window at the end of an OAuth
// login flow. At this point, if the user has successfully authenticated
// to the OAuth server and authorized this app, we communicate the
// credentialToken and credentialSecret to the main window. The main
// window must provide both these values to the DDP `login` method to
// authenticate its DDP connection. After communicating these vaues to
// the main window, we close the popup.
//
// We export this function so that developers can override this
// behavior, which is particularly useful in, for example, some mobile
// environments where popups and/or `window.opener` don't work. For
// example, an app could override `OAuth._endOfPopupResponse` to put the
// credential token and credential secret in the popup URL for the main
// window to read them there instead of using `window.opener`. If you
// override this function, you take responsibility for writing to the
// request and calling `res.end()` to complete the request.
//
// Arguments:
//   - res: the HTTP response object
//   - details:
//      - query: the query string on the HTTP request
//      - credentials: { token: *, secret: * }. If present, this field
//        indicates that the login was successful. Return these values
//        to the client, who can use them to log in over DDP. If
//        present, the values have been checked against a limited
//        character set and are safe to include in HTML.
//      - error: if present, a string or Error indicating an error that
//        occurred during the login. This can come from the client and
//        so shouldn't be trusted for security decisions or included in
//        the response without sanitizing it first. Only one of `error`
//        or `credentials` should be set.


OAuth._endOfLoginResponse = (res, details) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  let redirectUrl;

  if (details.loginStyle === 'redirect') {
    redirectUrl = OAuth._stateFromQuery(details.query).redirectUrl;
    const appHost = Meteor.absoluteUrl();

    if (OAuth._checkRedirectUrlOrigin(redirectUrl)) {
      details.error = "redirectUrl (".concat(redirectUrl) + ") is not on the same host as the app (".concat(appHost, ")");
      redirectUrl = appHost;
    }
  }

  const isCordova = OAuth._isCordovaFromQuery(details.query);

  if (details.error) {
    Log.warn("Error in OAuth Server: " + (details.error instanceof Error ? details.error.message : details.error));
    res.end(renderEndOfLoginResponse({
      loginStyle: details.loginStyle,
      setCredentialToken: false,
      redirectUrl,
      isCordova
    }), "utf-8");
    return;
  } // If we have a credentialSecret, report it back to the parent
  // window, with the corresponding credentialToken. The parent window
  // uses the credentialToken and credentialSecret to log in over DDP.


  res.end(renderEndOfLoginResponse({
    loginStyle: details.loginStyle,
    setCredentialToken: true,
    credentialToken: details.credentials.token,
    credentialSecret: details.credentials.secret,
    redirectUrl,
    isCordova
  }), "utf-8");
};

const OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;

const usingOAuthEncryption = () => OAuthEncryption && OAuthEncryption.keyIsLoaded(); // Encrypt sensitive service data such as access tokens if the
// "oauth-encryption" package is loaded and the oauth secret key has
// been specified.  Returns the unencrypted plaintext otherwise.
//
// The user id is not specified because the user isn't known yet at
// this point in the oauth authentication process.  After the oauth
// authentication process completes the encrypted service data fields
// will be re-encrypted with the user id included before inserting the
// service data into the user document.
//


OAuth.sealSecret = plaintext => {
  if (usingOAuthEncryption()) return OAuthEncryption.seal(plaintext);else return plaintext;
}; // Unencrypt a service data field, if the "oauth-encryption"
// package is loaded and the field is encrypted.
//
// Throws an error if the "oauth-encryption" package is loaded and the
// field is encrypted, but the oauth secret key hasn't been specified.
//


OAuth.openSecret = (maybeSecret, userId) => {
  if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret)) return maybeSecret;
  return OAuthEncryption.open(maybeSecret, userId);
}; // Unencrypt fields in the service data object.
//


OAuth.openSecrets = (serviceData, userId) => {
  const result = {};
  Object.keys(serviceData).forEach(key => result[key] = OAuth.openSecret(serviceData[key], userId));
  return result;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pending_credentials.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/pending_credentials.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//
// When an oauth request is made, Meteor receives oauth credentials
// in one browser tab, and temporarily persists them while that
// tab is closed, then retrieves them in the browser tab that
// initiated the credential request.
//
// _pendingCredentials is the storage mechanism used to share the
// credential between the 2 tabs
//
// Collection containing pending credentials of oauth credential requests
// Has key, credential, and createdAt fields.
OAuth._pendingCredentials = new Mongo.Collection("meteor_oauth_pendingCredentials", {
  _preventAutopublish: true
});

OAuth._pendingCredentials._ensureIndex('key', {
  unique: true
});

OAuth._pendingCredentials._ensureIndex('credentialSecret');

OAuth._pendingCredentials._ensureIndex('createdAt'); // Periodically clear old entries that were never retrieved


const _cleanStaleResults = () => {
  // Remove credentials older than 1 minute
  const timeCutoff = new Date();
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 1);

  OAuth._pendingCredentials.remove({
    createdAt: {
      $lt: timeCutoff
    }
  });
};

const _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000); // Stores the key and credential in the _pendingCredentials collection.
// Will throw an exception if `key` is not a string.
//
// @param key {string}
// @param credential {Object}   The credential to store
// @param credentialSecret {string} A secret that must be presented in
//   addition to the `key` to retrieve the credential
//


OAuth._storePendingCredential = function (key, credential) {
  let credentialSecret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  check(key, String);
  check(credentialSecret, Match.Maybe(String));

  if (credential instanceof Error) {
    credential = storableError(credential);
  } else {
    credential = OAuth.sealSecret(credential);
  } // We do an upsert here instead of an insert in case the user happens
  // to somehow send the same `state` parameter twice during an OAuth
  // login; we don't want a duplicate key error.


  OAuth._pendingCredentials.upsert({
    key
  }, {
    key,
    credential,
    credentialSecret,
    createdAt: new Date()
  });
}; // Retrieves and removes a credential from the _pendingCredentials collection
//
// @param key {string}
// @param credentialSecret {string}
//


OAuth._retrievePendingCredential = function (key) {
  let credentialSecret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  check(key, String);

  const pendingCredential = OAuth._pendingCredentials.findOne({
    key,
    credentialSecret
  });

  if (pendingCredential) {
    OAuth._pendingCredentials.remove({
      _id: pendingCredential._id
    });

    if (pendingCredential.credential.error) return recreateError(pendingCredential.credential.error);else return OAuth.openSecret(pendingCredential.credential);
  } else {
    return undefined;
  }
}; // Convert an Error into an object that can be stored in mongo
// Note: A Meteor.Error is reconstructed as a Meteor.Error
// All other error classes are reconstructed as a plain Error.
// TODO: Can we do this more simply with EJSON?


const storableError = error => {
  const plainObject = {};
  Object.getOwnPropertyNames(error).forEach(key => plainObject[key] = error[key]); // Keep track of whether it's a Meteor.Error

  if (error instanceof Meteor.Error) {
    plainObject['meteorError'] = true;
  }

  return {
    error: plainObject
  };
}; // Create an error from the error format stored in mongo


const recreateError = errorDoc => {
  let error;

  if (errorDoc.meteorError) {
    error = new Meteor.Error();
    delete errorDoc.meteorError;
  } else {
    error = new Error();
  }

  Object.getOwnPropertyNames(errorDoc).forEach(key => error[key] = errorDoc[key]);
  return error;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/oauth_common.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";

OAuth._redirectUri = (serviceName, config, params, absoluteUrlOptions) => {
  // XXX COMPAT WITH 0.9.0
  // The redirect URI used to have a "?close" query argument.  We
  // detect whether we need to be backwards compatible by checking for
  // the absence of the `loginStyle` field, which wasn't used in the
  // code which had the "?close" argument.
  // This logic is duplicated in the tool so that the tool can do OAuth
  // flow with <= 0.9.0 servers (tools/auth.js).
  const query = config.loginStyle ? null : "close"; // Clone because we're going to mutate 'params'. The 'cordova' and
  // 'android' parameters are only used for picking the host of the
  // redirect URL, and not actually included in the redirect URL itself.

  let isCordova = false;
  let isAndroid = false;

  if (params) {
    params = _objectSpread({}, params);
    isCordova = params.cordova;
    isAndroid = params.android;
    delete params.cordova;
    delete params.android;

    if (Object.keys(params).length === 0) {
      params = undefined;
    }
  }

  if (Meteor.isServer && isCordova) {
    const url = Npm.require('url');

    let rootUrl = process.env.MOBILE_ROOT_URL || __meteor_runtime_config__.ROOT_URL;

    if (isAndroid) {
      // Match the replace that we do in cordova boilerplate
      // (boilerplate-generator package).
      // XXX Maybe we should put this in a separate package or something
      // that is used here and by boilerplate-generator? Or maybe
      // `Meteor.absoluteUrl` should know how to do this?
      const parsedRootUrl = url.parse(rootUrl);

      if (parsedRootUrl.hostname === "localhost") {
        parsedRootUrl.hostname = "10.0.2.2";
        delete parsedRootUrl.host;
      }

      rootUrl = url.format(parsedRootUrl);
    }

    absoluteUrlOptions = _objectSpread({}, absoluteUrlOptions, {
      // For Cordova clients, redirect to the special Cordova root url
      // (likely a local IP in development mode).
      rootUrl
    });
  }

  return URL._constructUrl(Meteor.absoluteUrl("_oauth/".concat(serviceName), absoluteUrlOptions), query, params);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"deprecated.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/deprecated.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// XXX COMPAT WITH 0.8.0
Oauth = OAuth;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"body-parser":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/oauth/node_modules/body-parser/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "body-parser",
  "version": "1.19.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/oauth/node_modules/body-parser/index.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/oauth/oauth_server.js");
require("/node_modules/meteor/oauth/pending_credentials.js");
require("/node_modules/meteor/oauth/oauth_common.js");
require("/node_modules/meteor/oauth/deprecated.js");

/* Exports */
Package._define("oauth", {
  OAuth: OAuth,
  OAuthTest: OAuthTest,
  Oauth: Oauth
});

})();

//# sourceURL=meteor://💻app/packages/oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgvb2F1dGhfc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9wZW5kaW5nX2NyZWRlbnRpYWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9vYXV0aF9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29hdXRoL2RlcHJlY2F0ZWQuanMiXSwibmFtZXMiOlsiYm9keVBhcnNlciIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIk9BdXRoIiwiT0F1dGhUZXN0IiwiUm91dGVQb2xpY3kiLCJkZWNsYXJlIiwicmVnaXN0ZXJlZFNlcnZpY2VzIiwiX3JlcXVlc3RIYW5kbGVycyIsInJlZ2lzdGVyU2VydmljZSIsIm5hbWUiLCJ2ZXJzaW9uIiwidXJscyIsImhhbmRsZU9hdXRoUmVxdWVzdCIsIkVycm9yIiwic2VydmljZU5hbWUiLCJ1bnJlZ2lzdGVyU2VydmljZSIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiLCJfcmV0cmlldmVQZW5kaW5nQ3JlZGVudGlhbCIsIl9nZW5lcmF0ZVN0YXRlIiwibG9naW5TdHlsZSIsInJlZGlyZWN0VXJsIiwiQnVmZmVyIiwiZnJvbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIl9zdGF0ZUZyb21RdWVyeSIsInF1ZXJ5Iiwic3RyaW5nIiwic3RhdGUiLCJlIiwiTG9nIiwid2FybiIsInBhcnNlIiwiX2xvZ2luU3R5bGVGcm9tUXVlcnkiLCJzdHlsZSIsImVyciIsIl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkiLCJfaXNDb3Jkb3ZhRnJvbVF1ZXJ5IiwiaXNDb3Jkb3ZhIiwiX2NoZWNrUmVkaXJlY3RVcmxPcmlnaW4iLCJhcHBIb3N0IiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJhcHBIb3N0UmVwbGFjZWRMb2NhbGhvc3QiLCJ1bmRlZmluZWQiLCJyZXBsYWNlTG9jYWxob3N0Iiwic3Vic3RyIiwibGVuZ3RoIiwibWlkZGxld2FyZSIsInJlcSIsInJlcyIsIm5leHQiLCJyZXF1ZXN0RGF0YSIsIm9hdXRoU2VydmljZU5hbWUiLCJzZXJ2aWNlIiwiZW5zdXJlQ29uZmlndXJlZCIsImhhbmRsZXIiLCJtZXRob2QiLCJib2R5IiwiX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwiLCJzdGFjayIsIm1lc3NhZ2UiLCJfZW5kT2ZMb2dpblJlc3BvbnNlIiwiZXJyb3IiLCJXZWJBcHAiLCJjb25uZWN0SGFuZGxlcnMiLCJ1c2UiLCJqc29uIiwidXJsZW5jb2RlZCIsImV4dGVuZGVkIiwiaSIsInVybCIsImluZGV4T2YiLCJiYXJlUGF0aCIsInN1YnN0cmluZyIsInNwbGl0UGF0aCIsInNwbGl0IiwiU2VydmljZUNvbmZpZ3VyYXRpb24iLCJjb25maWd1cmF0aW9ucyIsImZpbmRPbmUiLCJDb25maWdFcnJvciIsImlzU2FmZSIsInZhbHVlIiwidGVzdCIsIl9yZW5kZXJPYXV0aFJlc3VsdHMiLCJvbmx5X2NyZWRlbnRpYWxfc2VjcmV0X2Zvcl90ZXN0Iiwid3JpdGVIZWFkIiwiZW5kIiwiZGV0YWlscyIsInRva2VuIiwic2VjcmV0IiwiY3JlZGVudGlhbHMiLCJfZW5kT2ZQb3B1cFJlc3BvbnNlVGVtcGxhdGUiLCJBc3NldHMiLCJnZXRUZXh0IiwiX2VuZE9mUmVkaXJlY3RSZXNwb25zZVRlbXBsYXRlIiwicmVuZGVyRW5kT2ZMb2dpblJlc3BvbnNlIiwib3B0aW9ucyIsImVzY2FwZSIsInMiLCJyZXBsYWNlIiwiY29uZmlnIiwic2V0Q3JlZGVudGlhbFRva2VuIiwic3RvcmFnZVByZWZpeCIsIl9zdG9yYWdlVG9rZW5QcmVmaXgiLCJ0ZW1wbGF0ZSIsInJlc3VsdCIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJST09UX1VSTF9QQVRIX1BSRUZJWCIsIk9BdXRoRW5jcnlwdGlvbiIsIlBhY2thZ2UiLCJ1c2luZ09BdXRoRW5jcnlwdGlvbiIsImtleUlzTG9hZGVkIiwic2VhbFNlY3JldCIsInBsYWludGV4dCIsInNlYWwiLCJvcGVuU2VjcmV0IiwibWF5YmVTZWNyZXQiLCJ1c2VySWQiLCJpc1NlYWxlZCIsIm9wZW4iLCJvcGVuU2VjcmV0cyIsInNlcnZpY2VEYXRhIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJfcGVuZGluZ0NyZWRlbnRpYWxzIiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiX3ByZXZlbnRBdXRvcHVibGlzaCIsIl9lbnN1cmVJbmRleCIsInVuaXF1ZSIsIl9jbGVhblN0YWxlUmVzdWx0cyIsInRpbWVDdXRvZmYiLCJEYXRlIiwic2V0TWludXRlcyIsImdldE1pbnV0ZXMiLCJyZW1vdmUiLCJjcmVhdGVkQXQiLCIkbHQiLCJfY2xlYW51cEhhbmRsZSIsInNldEludGVydmFsIiwiY3JlZGVudGlhbCIsImNoZWNrIiwiU3RyaW5nIiwiTWF0Y2giLCJNYXliZSIsInN0b3JhYmxlRXJyb3IiLCJ1cHNlcnQiLCJwZW5kaW5nQ3JlZGVudGlhbCIsIl9pZCIsInJlY3JlYXRlRXJyb3IiLCJwbGFpbk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJlcnJvckRvYyIsIm1ldGVvckVycm9yIiwiX29iamVjdFNwcmVhZCIsIl9yZWRpcmVjdFVyaSIsInBhcmFtcyIsImFic29sdXRlVXJsT3B0aW9ucyIsImlzQW5kcm9pZCIsImNvcmRvdmEiLCJhbmRyb2lkIiwiaXNTZXJ2ZXIiLCJOcG0iLCJyZXF1aXJlIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJNT0JJTEVfUk9PVF9VUkwiLCJST09UX1VSTCIsInBhcnNlZFJvb3RVcmwiLCJob3N0bmFtZSIsImhvc3QiLCJmb3JtYXQiLCJVUkwiLCJfY29uc3RydWN0VXJsIiwiT2F1dGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLFVBQUo7QUFBZUMsTUFBTSxDQUFDQyxJQUFQLENBQVksYUFBWixFQUEwQjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixjQUFVLEdBQUNJLENBQVg7QUFBYTs7QUFBekIsQ0FBMUIsRUFBcUQsQ0FBckQ7QUFFZkMsS0FBSyxHQUFHLEVBQVI7QUFDQUMsU0FBUyxHQUFHLEVBQVo7QUFFQUMsV0FBVyxDQUFDQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLFNBQWhDO0FBRUEsTUFBTUMsa0JBQWtCLEdBQUcsRUFBM0IsQyxDQUVBO0FBQ0E7QUFDQTs7QUFDQUosS0FBSyxDQUFDSyxnQkFBTixHQUF5QixFQUF6QixDLENBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0FMLEtBQUssQ0FBQ00sZUFBTixHQUF3QixDQUFDQyxJQUFELEVBQU9DLE9BQVAsRUFBZ0JDLElBQWhCLEVBQXNCQyxrQkFBdEIsS0FBNkM7QUFDbkUsTUFBSU4sa0JBQWtCLENBQUNHLElBQUQsQ0FBdEIsRUFDRSxNQUFNLElBQUlJLEtBQUosa0NBQW9DSixJQUFwQyxvQkFBTjtBQUVGSCxvQkFBa0IsQ0FBQ0csSUFBRCxDQUFsQixHQUEyQjtBQUN6QkssZUFBVyxFQUFFTCxJQURZO0FBRXpCQyxXQUZ5QjtBQUd6QkMsUUFIeUI7QUFJekJDO0FBSnlCLEdBQTNCO0FBTUQsQ0FWRCxDLENBWUE7OztBQUNBVCxTQUFTLENBQUNZLGlCQUFWLEdBQThCTixJQUFJLElBQUk7QUFDcEMsU0FBT0gsa0JBQWtCLENBQUNHLElBQUQsQ0FBekI7QUFDRCxDQUZEOztBQUtBUCxLQUFLLENBQUNjLGtCQUFOLEdBQTJCLENBQUNDLGVBQUQsRUFBa0JDLGdCQUFsQixLQUN6QmhCLEtBQUssQ0FBQ2lCLDBCQUFOLENBQWlDRixlQUFqQyxFQUFrREMsZ0JBQWxELENBREYsQyxDQUlBO0FBQ0E7QUFDQTs7O0FBQ0FoQixLQUFLLENBQUNrQixjQUFOLEdBQXVCLENBQUNDLFVBQUQsRUFBYUosZUFBYixFQUE4QkssV0FBOUIsS0FBOEM7QUFDbkUsU0FBT0MsTUFBTSxDQUFDQyxJQUFQLENBQVlDLElBQUksQ0FBQ0MsU0FBTCxDQUFlO0FBQ2hDTCxjQUFVLEVBQUVBLFVBRG9CO0FBRWhDSixtQkFBZSxFQUFFQSxlQUZlO0FBR2hDSyxlQUFXLEVBQUVBO0FBSG1CLEdBQWYsQ0FBWixFQUd1QkssUUFIdkIsQ0FHZ0MsUUFIaEMsQ0FBUDtBQUlELENBTEQ7O0FBT0F6QixLQUFLLENBQUMwQixlQUFOLEdBQXdCQyxLQUFLLElBQUk7QUFDL0IsTUFBSUMsTUFBSjs7QUFDQSxNQUFJO0FBQ0ZBLFVBQU0sR0FBR1AsTUFBTSxDQUFDQyxJQUFQLENBQVlLLEtBQUssQ0FBQ0UsS0FBbEIsRUFBeUIsUUFBekIsRUFBbUNKLFFBQW5DLENBQTRDLFFBQTVDLENBQVQ7QUFDRCxHQUZELENBRUUsT0FBT0ssQ0FBUCxFQUFVO0FBQ1ZDLE9BQUcsQ0FBQ0MsSUFBSiwyREFBNERMLEtBQUssQ0FBQ0UsS0FBbEU7QUFDQSxVQUFNQyxDQUFOO0FBQ0Q7O0FBRUQsTUFBSTtBQUNGLFdBQU9QLElBQUksQ0FBQ1UsS0FBTCxDQUFXTCxNQUFYLENBQVA7QUFDRCxHQUZELENBRUUsT0FBT0UsQ0FBUCxFQUFVO0FBQ1ZDLE9BQUcsQ0FBQ0MsSUFBSixtREFBb0RKLE1BQXBEO0FBQ0EsVUFBTUUsQ0FBTjtBQUNEO0FBQ0YsQ0FmRDs7QUFpQkE5QixLQUFLLENBQUNrQyxvQkFBTixHQUE2QlAsS0FBSyxJQUFJO0FBQ3BDLE1BQUlRLEtBQUosQ0FEb0MsQ0FFcEM7QUFDQTtBQUNBOztBQUNBLE1BQUk7QUFDRkEsU0FBSyxHQUFHbkMsS0FBSyxDQUFDMEIsZUFBTixDQUFzQkMsS0FBdEIsRUFBNkJSLFVBQXJDO0FBQ0QsR0FGRCxDQUVFLE9BQU9pQixHQUFQLEVBQVk7QUFDWkQsU0FBSyxHQUFHLE9BQVI7QUFDRDs7QUFDRCxNQUFJQSxLQUFLLEtBQUssT0FBVixJQUFxQkEsS0FBSyxLQUFLLFVBQW5DLEVBQStDO0FBQzdDLFVBQU0sSUFBSXhCLEtBQUoscUNBQXVDd0IsS0FBdkMsRUFBTjtBQUNEOztBQUNELFNBQU9BLEtBQVA7QUFDRCxDQWREOztBQWdCQW5DLEtBQUssQ0FBQ3FDLHlCQUFOLEdBQWtDVixLQUFLLElBQUk7QUFDekMsTUFBSUUsS0FBSixDQUR5QyxDQUV6QztBQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFJO0FBQ0ZBLFNBQUssR0FBRzdCLEtBQUssQ0FBQzBCLGVBQU4sQ0FBc0JDLEtBQXRCLENBQVI7QUFDRCxHQUZELENBRUUsT0FBT1MsR0FBUCxFQUFZO0FBQ1osV0FBT1QsS0FBSyxDQUFDRSxLQUFiO0FBQ0Q7O0FBQ0QsU0FBT0EsS0FBSyxDQUFDZCxlQUFiO0FBQ0QsQ0FaRDs7QUFjQWYsS0FBSyxDQUFDc0MsbUJBQU4sR0FBNEJYLEtBQUssSUFBSTtBQUNuQyxNQUFJO0FBQ0YsV0FBTyxDQUFDLENBQUUzQixLQUFLLENBQUMwQixlQUFOLENBQXNCQyxLQUF0QixFQUE2QlksU0FBdkM7QUFDRCxHQUZELENBRUUsT0FBT0gsR0FBUCxFQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGLENBVkQsQyxDQVlBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQXBDLEtBQUssQ0FBQ3dDLHVCQUFOLEdBQWdDcEIsV0FBVyxJQUFJO0FBQzdDLFFBQU1xQixPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsV0FBUCxFQUFoQjtBQUNBLFFBQU1DLHdCQUF3QixHQUFHRixNQUFNLENBQUNDLFdBQVAsQ0FBbUJFLFNBQW5CLEVBQThCO0FBQzdEQyxvQkFBZ0IsRUFBRTtBQUQyQyxHQUE5QixDQUFqQztBQUdBLFNBQ0UxQixXQUFXLENBQUMyQixNQUFaLENBQW1CLENBQW5CLEVBQXNCTixPQUFPLENBQUNPLE1BQTlCLE1BQTBDUCxPQUExQyxJQUNBckIsV0FBVyxDQUFDMkIsTUFBWixDQUFtQixDQUFuQixFQUFzQkgsd0JBQXdCLENBQUNJLE1BQS9DLE1BQTJESix3QkFGN0Q7QUFJRCxDQVREOztBQVdBLE1BQU1LLFVBQVUsR0FBRyxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsSUFBWCxLQUFvQjtBQUNyQyxNQUFJQyxXQUFKLENBRHFDLENBR3JDO0FBQ0E7O0FBQ0EsTUFBSTtBQUNGLFVBQU16QyxXQUFXLEdBQUcwQyxnQkFBZ0IsQ0FBQ0osR0FBRCxDQUFwQzs7QUFDQSxRQUFJLENBQUN0QyxXQUFMLEVBQWtCO0FBQ2hCO0FBQ0F3QyxVQUFJO0FBQ0o7QUFDRDs7QUFFRCxVQUFNRyxPQUFPLEdBQUduRCxrQkFBa0IsQ0FBQ1EsV0FBRCxDQUFsQyxDQVJFLENBVUY7O0FBQ0EsUUFBSSxDQUFDMkMsT0FBTCxFQUNFLE1BQU0sSUFBSTVDLEtBQUosb0NBQXNDQyxXQUF0QyxFQUFOLENBWkEsQ0FjRjs7QUFDQTRDLG9CQUFnQixDQUFDNUMsV0FBRCxDQUFoQjtBQUVBLFVBQU02QyxPQUFPLEdBQUd6RCxLQUFLLENBQUNLLGdCQUFOLENBQXVCa0QsT0FBTyxDQUFDL0MsT0FBL0IsQ0FBaEI7QUFDQSxRQUFJLENBQUNpRCxPQUFMLEVBQ0UsTUFBTSxJQUFJOUMsS0FBSixvQ0FBc0M0QyxPQUFPLENBQUMvQyxPQUE5QyxFQUFOOztBQUVGLFFBQUkwQyxHQUFHLENBQUNRLE1BQUosS0FBZSxLQUFuQixFQUEwQjtBQUN4QkwsaUJBQVcsR0FBR0gsR0FBRyxDQUFDdkIsS0FBbEI7QUFDRCxLQUZELE1BRU87QUFDTDBCLGlCQUFXLEdBQUdILEdBQUcsQ0FBQ1MsSUFBbEI7QUFDRDs7QUFFREYsV0FBTyxDQUFDRixPQUFELEVBQVVGLFdBQVYsRUFBdUJGLEdBQXZCLENBQVA7QUFDRCxHQTVCRCxDQTRCRSxPQUFPZixHQUFQLEVBQVk7QUFBQTs7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUksaUJBQUFpQixXQUFXLFVBQVgsb0RBQWF4QixLQUFiLEtBQXNCTyxHQUFHLFlBQVl6QixLQUF6QyxFQUFnRDtBQUM5QyxVQUFJO0FBQUU7QUFDSlgsYUFBSyxDQUFDNEQsdUJBQU4sQ0FBOEI1RCxLQUFLLENBQUNxQyx5QkFBTixDQUFnQ2dCLFdBQWhDLENBQTlCLEVBQTRFakIsR0FBNUU7QUFDRCxPQUZELENBRUUsT0FBT0EsR0FBUCxFQUFZO0FBQ1o7QUFDQTtBQUNBTCxXQUFHLENBQUNDLElBQUosQ0FBUyxnRUFDQUksR0FBRyxDQUFDeUIsS0FESixJQUNhekIsR0FBRyxDQUFDMEIsT0FEMUI7QUFFRDtBQUNGLEtBakJXLENBbUJaO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxRQUFJO0FBQ0Y5RCxXQUFLLENBQUMrRCxtQkFBTixDQUEwQlosR0FBMUIsRUFBK0I7QUFDN0J4QixhQUFLLEVBQUUwQixXQURzQjtBQUU3QmxDLGtCQUFVLEVBQUVuQixLQUFLLENBQUNrQyxvQkFBTixDQUEyQm1CLFdBQTNCLENBRmlCO0FBRzdCVyxhQUFLLEVBQUU1QjtBQUhzQixPQUEvQjtBQUtELEtBTkQsQ0FNRSxPQUFPQSxHQUFQLEVBQVk7QUFDWkwsU0FBRyxDQUFDQyxJQUFKLENBQVMsOENBQ0NJLEdBQUcsS0FBS0EsR0FBRyxDQUFDeUIsS0FBSixJQUFhekIsR0FBRyxDQUFDMEIsT0FBdEIsQ0FESixDQUFUO0FBRUQ7QUFDRjtBQUNGLENBbkVELEMsQ0FxRUE7OztBQUNBRyxNQUFNLENBQUNDLGVBQVAsQ0FBdUJDLEdBQXZCLENBQTJCLFNBQTNCLEVBQXNDeEUsVUFBVSxDQUFDeUUsSUFBWCxFQUF0QztBQUNBSCxNQUFNLENBQUNDLGVBQVAsQ0FBdUJDLEdBQXZCLENBQTJCLFNBQTNCLEVBQXNDeEUsVUFBVSxDQUFDMEUsVUFBWCxDQUFzQjtBQUFFQyxVQUFRLEVBQUU7QUFBWixDQUF0QixDQUF0QztBQUNBTCxNQUFNLENBQUNDLGVBQVAsQ0FBdUJDLEdBQXZCLENBQTJCbEIsVUFBM0I7QUFFQWhELFNBQVMsQ0FBQ2dELFVBQVYsR0FBdUJBLFVBQXZCLEMsQ0FFQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNSyxnQkFBZ0IsR0FBR0osR0FBRyxJQUFJO0FBQzlCO0FBQ0EsUUFBTXFCLENBQUMsR0FBR3JCLEdBQUcsQ0FBQ3NCLEdBQUosQ0FBUUMsT0FBUixDQUFnQixHQUFoQixDQUFWO0FBQ0EsTUFBSUMsUUFBSjtBQUNBLE1BQUlILENBQUMsS0FBSyxDQUFDLENBQVgsRUFDRUcsUUFBUSxHQUFHeEIsR0FBRyxDQUFDc0IsR0FBZixDQURGLEtBR0VFLFFBQVEsR0FBR3hCLEdBQUcsQ0FBQ3NCLEdBQUosQ0FBUUcsU0FBUixDQUFrQixDQUFsQixFQUFxQkosQ0FBckIsQ0FBWDtBQUNGLFFBQU1LLFNBQVMsR0FBR0YsUUFBUSxDQUFDRyxLQUFULENBQWUsR0FBZixDQUFsQixDQVI4QixDQVU5QjtBQUNBOztBQUNBLE1BQUlELFNBQVMsQ0FBQyxDQUFELENBQVQsS0FBaUIsUUFBckIsRUFDRSxPQUFPLElBQVAsQ0FiNEIsQ0FlOUI7O0FBQ0EsUUFBTWhFLFdBQVcsR0FBR2dFLFNBQVMsQ0FBQyxDQUFELENBQTdCO0FBQ0EsU0FBT2hFLFdBQVA7QUFDRCxDQWxCRCxDLENBb0JBOzs7QUFDQSxNQUFNNEMsZ0JBQWdCLEdBQUc1QyxXQUFXLElBQUk7QUFDdEMsTUFBSSxDQUFDa0Usb0JBQW9CLENBQUNDLGNBQXJCLENBQW9DQyxPQUFwQyxDQUE0QztBQUFDekIsV0FBTyxFQUFFM0M7QUFBVixHQUE1QyxDQUFMLEVBQTBFO0FBQ3hFLFVBQU0sSUFBSWtFLG9CQUFvQixDQUFDRyxXQUF6QixFQUFOO0FBQ0Q7QUFDRixDQUpEOztBQU1BLE1BQU1DLE1BQU0sR0FBR0MsS0FBSyxJQUFJO0FBQ3RCO0FBQ0E7QUFDQSxTQUFPLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFDTCxvQkFBb0JDLElBQXBCLENBQXlCRCxLQUF6QixDQURGO0FBRUQsQ0FMRCxDLENBT0E7OztBQUNBbkYsS0FBSyxDQUFDcUYsbUJBQU4sR0FBNEIsQ0FBQ2xDLEdBQUQsRUFBTXhCLEtBQU4sRUFBYVgsZ0JBQWIsS0FBa0M7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE1BQUlXLEtBQUssQ0FBQzJELCtCQUFWLEVBQTJDO0FBQ3pDbkMsT0FBRyxDQUFDb0MsU0FBSixDQUFjLEdBQWQsRUFBbUI7QUFBQyxzQkFBZ0I7QUFBakIsS0FBbkI7QUFDQXBDLE9BQUcsQ0FBQ3FDLEdBQUosQ0FBUXhFLGdCQUFSLEVBQTBCLE9BQTFCO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsVUFBTXlFLE9BQU8sR0FBRztBQUNkOUQsV0FEYztBQUVkUixnQkFBVSxFQUFFbkIsS0FBSyxDQUFDa0Msb0JBQU4sQ0FBMkJQLEtBQTNCO0FBRkUsS0FBaEI7O0FBSUEsUUFBSUEsS0FBSyxDQUFDcUMsS0FBVixFQUFpQjtBQUNmeUIsYUFBTyxDQUFDekIsS0FBUixHQUFnQnJDLEtBQUssQ0FBQ3FDLEtBQXRCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTTBCLEtBQUssR0FBRzFGLEtBQUssQ0FBQ3FDLHlCQUFOLENBQWdDVixLQUFoQyxDQUFkOztBQUNBLFlBQU1nRSxNQUFNLEdBQUczRSxnQkFBZjs7QUFDQSxVQUFJMEUsS0FBSyxJQUFJQyxNQUFULElBQ0FULE1BQU0sQ0FBQ1EsS0FBRCxDQUROLElBQ2lCUixNQUFNLENBQUNTLE1BQUQsQ0FEM0IsRUFDcUM7QUFDbkNGLGVBQU8sQ0FBQ0csV0FBUixHQUFzQjtBQUFFRixlQUFLLEVBQUVBLEtBQVQ7QUFBZ0JDLGdCQUFNLEVBQUVBO0FBQXhCLFNBQXRCO0FBQ0QsT0FIRCxNQUdPO0FBQ0xGLGVBQU8sQ0FBQ3pCLEtBQVIsR0FBZ0Isb0NBQWhCO0FBQ0Q7QUFDRjs7QUFFRGhFLFNBQUssQ0FBQytELG1CQUFOLENBQTBCWixHQUExQixFQUErQnNDLE9BQS9CO0FBQ0Q7QUFDRixDQWpDRCxDLENBbUNBO0FBQ0E7QUFDQTs7O0FBQ0F6RixLQUFLLENBQUM2RiwyQkFBTixHQUFvQ0MsTUFBTSxDQUFDQyxPQUFQLENBQ2xDLDRCQURrQyxDQUFwQztBQUdBL0YsS0FBSyxDQUFDZ0csOEJBQU4sR0FBdUNGLE1BQU0sQ0FBQ0MsT0FBUCxDQUNyQywrQkFEcUMsQ0FBdkMsQyxDQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUUsd0JBQXdCLEdBQUdDLE9BQU8sSUFBSTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUVBLFFBQU1DLE1BQU0sR0FBR0MsQ0FBQyxJQUFJO0FBQ2xCLFFBQUlBLENBQUosRUFBTztBQUNMLGFBQU9BLENBQUMsQ0FBQ0MsT0FBRixDQUFVLElBQVYsRUFBZ0IsT0FBaEIsRUFDTEEsT0FESyxDQUNHLElBREgsRUFDUyxNQURULEVBRUxBLE9BRkssQ0FFRyxJQUZILEVBRVMsTUFGVCxFQUdMQSxPQUhLLENBR0csS0FISCxFQUdVLFFBSFYsRUFJTEEsT0FKSyxDQUlHLEtBSkgsRUFJVSxRQUpWLEVBS0xBLE9BTEssQ0FLRyxLQUxILEVBS1UsUUFMVixDQUFQO0FBTUQsS0FQRCxNQU9PO0FBQ0wsYUFBT0QsQ0FBUDtBQUNEO0FBQ0YsR0FYRCxDQU4wQyxDQW1CMUM7QUFDQTs7O0FBQ0EsUUFBTUUsTUFBTSxHQUFHO0FBQ2JDLHNCQUFrQixFQUFFLENBQUMsQ0FBRUwsT0FBTyxDQUFDSyxrQkFEbEI7QUFFYnhGLG1CQUFlLEVBQUVvRixNQUFNLENBQUNELE9BQU8sQ0FBQ25GLGVBQVQsQ0FGVjtBQUdiQyxvQkFBZ0IsRUFBRW1GLE1BQU0sQ0FBQ0QsT0FBTyxDQUFDbEYsZ0JBQVQsQ0FIWDtBQUlid0YsaUJBQWEsRUFBRUwsTUFBTSxDQUFDbkcsS0FBSyxDQUFDeUcsbUJBQVAsQ0FKUjtBQUtickYsZUFBVyxFQUFFK0UsTUFBTSxDQUFDRCxPQUFPLENBQUM5RSxXQUFULENBTE47QUFNYm1CLGFBQVMsRUFBRSxDQUFDLENBQUUyRCxPQUFPLENBQUMzRDtBQU5ULEdBQWY7QUFTQSxNQUFJbUUsUUFBSjs7QUFDQSxNQUFJUixPQUFPLENBQUMvRSxVQUFSLEtBQXVCLE9BQTNCLEVBQW9DO0FBQ2xDdUYsWUFBUSxHQUFHMUcsS0FBSyxDQUFDNkYsMkJBQWpCO0FBQ0QsR0FGRCxNQUVPLElBQUlLLE9BQU8sQ0FBQy9FLFVBQVIsS0FBdUIsVUFBM0IsRUFBdUM7QUFDNUN1RixZQUFRLEdBQUcxRyxLQUFLLENBQUNnRyw4QkFBakI7QUFDRCxHQUZNLE1BRUE7QUFDTCxVQUFNLElBQUlyRixLQUFKLCtCQUFpQ3VGLE9BQU8sQ0FBQy9FLFVBQXpDLEVBQU47QUFDRDs7QUFFRCxRQUFNd0YsTUFBTSxHQUFHRCxRQUFRLENBQUNMLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I5RSxJQUFJLENBQUNDLFNBQUwsQ0FBZThFLE1BQWYsQ0FBL0IsRUFDWkQsT0FEWSxDQUVYLDBCQUZXLEVBRWlCTyx5QkFBeUIsQ0FBQ0Msb0JBRjNDLENBQWY7QUFLQSxvQ0FBMkJGLE1BQTNCO0FBQ0QsQ0E3Q0QsQyxDQStDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EzRyxLQUFLLENBQUMrRCxtQkFBTixHQUE0QixDQUFDWixHQUFELEVBQU1zQyxPQUFOLEtBQWtCO0FBQzVDdEMsS0FBRyxDQUFDb0MsU0FBSixDQUFjLEdBQWQsRUFBbUI7QUFBQyxvQkFBZ0I7QUFBakIsR0FBbkI7QUFFQSxNQUFJbkUsV0FBSjs7QUFDQSxNQUFJcUUsT0FBTyxDQUFDdEUsVUFBUixLQUF1QixVQUEzQixFQUF1QztBQUNyQ0MsZUFBVyxHQUFHcEIsS0FBSyxDQUFDMEIsZUFBTixDQUFzQitELE9BQU8sQ0FBQzlELEtBQTlCLEVBQXFDUCxXQUFuRDtBQUNBLFVBQU1xQixPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsV0FBUCxFQUFoQjs7QUFDQSxRQUFJM0MsS0FBSyxDQUFDd0MsdUJBQU4sQ0FBOEJwQixXQUE5QixDQUFKLEVBQWdEO0FBQzlDcUUsYUFBTyxDQUFDekIsS0FBUixHQUFnQix1QkFBZ0I1QyxXQUFoQixvREFDMkJxQixPQUQzQixNQUFoQjtBQUVBckIsaUJBQVcsR0FBR3FCLE9BQWQ7QUFDRDtBQUNGOztBQUVELFFBQU1GLFNBQVMsR0FBR3ZDLEtBQUssQ0FBQ3NDLG1CQUFOLENBQTBCbUQsT0FBTyxDQUFDOUQsS0FBbEMsQ0FBbEI7O0FBRUEsTUFBSThELE9BQU8sQ0FBQ3pCLEtBQVosRUFBbUI7QUFDakJqQyxPQUFHLENBQUNDLElBQUosQ0FBUyw2QkFDQ3lELE9BQU8sQ0FBQ3pCLEtBQVIsWUFBeUJyRCxLQUF6QixHQUNBOEUsT0FBTyxDQUFDekIsS0FBUixDQUFjRixPQURkLEdBQ3dCMkIsT0FBTyxDQUFDekIsS0FGakMsQ0FBVDtBQUdBYixPQUFHLENBQUNxQyxHQUFKLENBQVFTLHdCQUF3QixDQUFDO0FBQy9COUUsZ0JBQVUsRUFBRXNFLE9BQU8sQ0FBQ3RFLFVBRFc7QUFFL0JvRix3QkFBa0IsRUFBRSxLQUZXO0FBRy9CbkYsaUJBSCtCO0FBSS9CbUI7QUFKK0IsS0FBRCxDQUFoQyxFQUtJLE9BTEo7QUFNQTtBQUNELEdBM0IyQyxDQTZCNUM7QUFDQTtBQUNBOzs7QUFDQVksS0FBRyxDQUFDcUMsR0FBSixDQUFRUyx3QkFBd0IsQ0FBQztBQUMvQjlFLGNBQVUsRUFBRXNFLE9BQU8sQ0FBQ3RFLFVBRFc7QUFFL0JvRixzQkFBa0IsRUFBRSxJQUZXO0FBRy9CeEYsbUJBQWUsRUFBRTBFLE9BQU8sQ0FBQ0csV0FBUixDQUFvQkYsS0FITjtBQUkvQjFFLG9CQUFnQixFQUFFeUUsT0FBTyxDQUFDRyxXQUFSLENBQW9CRCxNQUpQO0FBSy9CdkUsZUFMK0I7QUFNL0JtQjtBQU4rQixHQUFELENBQWhDLEVBT0ksT0FQSjtBQVFELENBeENEOztBQTJDQSxNQUFNdUUsZUFBZSxHQUFHQyxPQUFPLENBQUMsa0JBQUQsQ0FBUCxJQUErQkEsT0FBTyxDQUFDLGtCQUFELENBQVAsQ0FBNEJELGVBQW5GOztBQUVBLE1BQU1FLG9CQUFvQixHQUFHLE1BQzNCRixlQUFlLElBQUlBLGVBQWUsQ0FBQ0csV0FBaEIsRUFEckIsQyxDQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQWpILEtBQUssQ0FBQ2tILFVBQU4sR0FBbUJDLFNBQVMsSUFBSTtBQUM5QixNQUFJSCxvQkFBb0IsRUFBeEIsRUFDRSxPQUFPRixlQUFlLENBQUNNLElBQWhCLENBQXFCRCxTQUFyQixDQUFQLENBREYsS0FHRSxPQUFPQSxTQUFQO0FBQ0gsQ0FMRCxDLENBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQW5ILEtBQUssQ0FBQ3FILFVBQU4sR0FBbUIsQ0FBQ0MsV0FBRCxFQUFjQyxNQUFkLEtBQXlCO0FBQzFDLE1BQUksQ0FBQ1IsT0FBTyxDQUFDLGtCQUFELENBQVIsSUFBZ0MsQ0FBQ0QsZUFBZSxDQUFDVSxRQUFoQixDQUF5QkYsV0FBekIsQ0FBckMsRUFDRSxPQUFPQSxXQUFQO0FBRUYsU0FBT1IsZUFBZSxDQUFDVyxJQUFoQixDQUFxQkgsV0FBckIsRUFBa0NDLE1BQWxDLENBQVA7QUFDRCxDQUxELEMsQ0FPQTtBQUNBOzs7QUFDQXZILEtBQUssQ0FBQzBILFdBQU4sR0FBb0IsQ0FBQ0MsV0FBRCxFQUFjSixNQUFkLEtBQXlCO0FBQzNDLFFBQU1aLE1BQU0sR0FBRyxFQUFmO0FBQ0FpQixRQUFNLENBQUNDLElBQVAsQ0FBWUYsV0FBWixFQUF5QkcsT0FBekIsQ0FBaUNDLEdBQUcsSUFDbENwQixNQUFNLENBQUNvQixHQUFELENBQU4sR0FBYy9ILEtBQUssQ0FBQ3FILFVBQU4sQ0FBaUJNLFdBQVcsQ0FBQ0ksR0FBRCxDQUE1QixFQUFtQ1IsTUFBbkMsQ0FEaEI7QUFHQSxTQUFPWixNQUFQO0FBQ0QsQ0FORCxDOzs7Ozs7Ozs7OztBQ2pkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0EzRyxLQUFLLENBQUNnSSxtQkFBTixHQUE0QixJQUFJQyxLQUFLLENBQUNDLFVBQVYsQ0FDMUIsaUNBRDBCLEVBQ1M7QUFDakNDLHFCQUFtQixFQUFFO0FBRFksQ0FEVCxDQUE1Qjs7QUFLQW5JLEtBQUssQ0FBQ2dJLG1CQUFOLENBQTBCSSxZQUExQixDQUF1QyxLQUF2QyxFQUE4QztBQUFFQyxRQUFNLEVBQUU7QUFBVixDQUE5Qzs7QUFDQXJJLEtBQUssQ0FBQ2dJLG1CQUFOLENBQTBCSSxZQUExQixDQUF1QyxrQkFBdkM7O0FBQ0FwSSxLQUFLLENBQUNnSSxtQkFBTixDQUEwQkksWUFBMUIsQ0FBdUMsV0FBdkMsRSxDQUlBOzs7QUFDQSxNQUFNRSxrQkFBa0IsR0FBRyxNQUFNO0FBQy9CO0FBQ0EsUUFBTUMsVUFBVSxHQUFHLElBQUlDLElBQUosRUFBbkI7QUFDQUQsWUFBVSxDQUFDRSxVQUFYLENBQXNCRixVQUFVLENBQUNHLFVBQVgsS0FBMEIsQ0FBaEQ7O0FBQ0ExSSxPQUFLLENBQUNnSSxtQkFBTixDQUEwQlcsTUFBMUIsQ0FBaUM7QUFBRUMsYUFBUyxFQUFFO0FBQUVDLFNBQUcsRUFBRU47QUFBUDtBQUFiLEdBQWpDO0FBQ0QsQ0FMRDs7QUFNQSxNQUFNTyxjQUFjLEdBQUdwRyxNQUFNLENBQUNxRyxXQUFQLENBQW1CVCxrQkFBbkIsRUFBdUMsS0FBSyxJQUE1QyxDQUF2QixDLENBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0F0SSxLQUFLLENBQUM0RCx1QkFBTixHQUFnQyxVQUFDbUUsR0FBRCxFQUFNaUIsVUFBTixFQUE4QztBQUFBLE1BQTVCaEksZ0JBQTRCLHVFQUFULElBQVM7QUFDNUVpSSxPQUFLLENBQUNsQixHQUFELEVBQU1tQixNQUFOLENBQUw7QUFDQUQsT0FBSyxDQUFDakksZ0JBQUQsRUFBbUJtSSxLQUFLLENBQUNDLEtBQU4sQ0FBWUYsTUFBWixDQUFuQixDQUFMOztBQUVBLE1BQUlGLFVBQVUsWUFBWXJJLEtBQTFCLEVBQWlDO0FBQy9CcUksY0FBVSxHQUFHSyxhQUFhLENBQUNMLFVBQUQsQ0FBMUI7QUFDRCxHQUZELE1BRU87QUFDTEEsY0FBVSxHQUFHaEosS0FBSyxDQUFDa0gsVUFBTixDQUFpQjhCLFVBQWpCLENBQWI7QUFDRCxHQVIyRSxDQVU1RTtBQUNBO0FBQ0E7OztBQUNBaEosT0FBSyxDQUFDZ0ksbUJBQU4sQ0FBMEJzQixNQUExQixDQUFpQztBQUMvQnZCO0FBRCtCLEdBQWpDLEVBRUc7QUFDREEsT0FEQztBQUVEaUIsY0FGQztBQUdEaEksb0JBSEM7QUFJRDRILGFBQVMsRUFBRSxJQUFJSixJQUFKO0FBSlYsR0FGSDtBQVFELENBckJELEMsQ0F3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0F4SSxLQUFLLENBQUNpQiwwQkFBTixHQUFtQyxVQUFDOEcsR0FBRCxFQUFrQztBQUFBLE1BQTVCL0csZ0JBQTRCLHVFQUFULElBQVM7QUFDbkVpSSxPQUFLLENBQUNsQixHQUFELEVBQU1tQixNQUFOLENBQUw7O0FBRUEsUUFBTUssaUJBQWlCLEdBQUd2SixLQUFLLENBQUNnSSxtQkFBTixDQUEwQmhELE9BQTFCLENBQWtDO0FBQzFEK0MsT0FEMEQ7QUFFMUQvRztBQUYwRCxHQUFsQyxDQUExQjs7QUFLQSxNQUFJdUksaUJBQUosRUFBdUI7QUFDckJ2SixTQUFLLENBQUNnSSxtQkFBTixDQUEwQlcsTUFBMUIsQ0FBaUM7QUFBRWEsU0FBRyxFQUFFRCxpQkFBaUIsQ0FBQ0M7QUFBekIsS0FBakM7O0FBQ0EsUUFBSUQsaUJBQWlCLENBQUNQLFVBQWxCLENBQTZCaEYsS0FBakMsRUFDRSxPQUFPeUYsYUFBYSxDQUFDRixpQkFBaUIsQ0FBQ1AsVUFBbEIsQ0FBNkJoRixLQUE5QixDQUFwQixDQURGLEtBR0UsT0FBT2hFLEtBQUssQ0FBQ3FILFVBQU4sQ0FBaUJrQyxpQkFBaUIsQ0FBQ1AsVUFBbkMsQ0FBUDtBQUNILEdBTkQsTUFNTztBQUNMLFdBQU9uRyxTQUFQO0FBQ0Q7QUFDRixDQWpCRCxDLENBb0JBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxNQUFNd0csYUFBYSxHQUFHckYsS0FBSyxJQUFJO0FBQzdCLFFBQU0wRixXQUFXLEdBQUcsRUFBcEI7QUFDQTlCLFFBQU0sQ0FBQytCLG1CQUFQLENBQTJCM0YsS0FBM0IsRUFBa0M4RCxPQUFsQyxDQUNFQyxHQUFHLElBQUkyQixXQUFXLENBQUMzQixHQUFELENBQVgsR0FBbUIvRCxLQUFLLENBQUMrRCxHQUFELENBRGpDLEVBRjZCLENBTTdCOztBQUNBLE1BQUcvRCxLQUFLLFlBQVl0QixNQUFNLENBQUMvQixLQUEzQixFQUFrQztBQUNoQytJLGVBQVcsQ0FBQyxhQUFELENBQVgsR0FBNkIsSUFBN0I7QUFDRDs7QUFFRCxTQUFPO0FBQUUxRixTQUFLLEVBQUUwRjtBQUFULEdBQVA7QUFDRCxDQVpELEMsQ0FjQTs7O0FBQ0EsTUFBTUQsYUFBYSxHQUFHRyxRQUFRLElBQUk7QUFDaEMsTUFBSTVGLEtBQUo7O0FBRUEsTUFBSTRGLFFBQVEsQ0FBQ0MsV0FBYixFQUEwQjtBQUN4QjdGLFNBQUssR0FBRyxJQUFJdEIsTUFBTSxDQUFDL0IsS0FBWCxFQUFSO0FBQ0EsV0FBT2lKLFFBQVEsQ0FBQ0MsV0FBaEI7QUFDRCxHQUhELE1BR087QUFDTDdGLFNBQUssR0FBRyxJQUFJckQsS0FBSixFQUFSO0FBQ0Q7O0FBRURpSCxRQUFNLENBQUMrQixtQkFBUCxDQUEyQkMsUUFBM0IsRUFBcUM5QixPQUFyQyxDQUE2Q0MsR0FBRyxJQUM5Qy9ELEtBQUssQ0FBQytELEdBQUQsQ0FBTCxHQUFhNkIsUUFBUSxDQUFDN0IsR0FBRCxDQUR2QjtBQUlBLFNBQU8vRCxLQUFQO0FBQ0QsQ0FmRCxDOzs7Ozs7Ozs7OztBQzlHQSxJQUFJOEYsYUFBSjs7QUFBa0JsSyxNQUFNLENBQUNDLElBQVAsQ0FBWSxzQ0FBWixFQUFtRDtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDK0osaUJBQWEsR0FBQy9KLENBQWQ7QUFBZ0I7O0FBQTVCLENBQW5ELEVBQWlGLENBQWpGO0FBQWxCQyxLQUFLLENBQUN5RyxtQkFBTixHQUE0QixnQ0FBNUI7O0FBRUF6RyxLQUFLLENBQUMrSixZQUFOLEdBQXFCLENBQUNuSixXQUFELEVBQWMwRixNQUFkLEVBQXNCMEQsTUFBdEIsRUFBOEJDLGtCQUE5QixLQUFxRDtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU10SSxLQUFLLEdBQUcyRSxNQUFNLENBQUNuRixVQUFQLEdBQW9CLElBQXBCLEdBQTJCLE9BQXpDLENBUndFLENBVXhFO0FBQ0E7QUFDQTs7QUFDQSxNQUFJb0IsU0FBUyxHQUFHLEtBQWhCO0FBQ0EsTUFBSTJILFNBQVMsR0FBRyxLQUFoQjs7QUFDQSxNQUFJRixNQUFKLEVBQVk7QUFDVkEsVUFBTSxxQkFBUUEsTUFBUixDQUFOO0FBQ0F6SCxhQUFTLEdBQUd5SCxNQUFNLENBQUNHLE9BQW5CO0FBQ0FELGFBQVMsR0FBR0YsTUFBTSxDQUFDSSxPQUFuQjtBQUNBLFdBQU9KLE1BQU0sQ0FBQ0csT0FBZDtBQUNBLFdBQU9ILE1BQU0sQ0FBQ0ksT0FBZDs7QUFDQSxRQUFJeEMsTUFBTSxDQUFDQyxJQUFQLENBQVltQyxNQUFaLEVBQW9CaEgsTUFBcEIsS0FBK0IsQ0FBbkMsRUFBc0M7QUFDcENnSCxZQUFNLEdBQUduSCxTQUFUO0FBQ0Q7QUFDRjs7QUFFRCxNQUFJSCxNQUFNLENBQUMySCxRQUFQLElBQW1COUgsU0FBdkIsRUFBa0M7QUFDaEMsVUFBTWlDLEdBQUcsR0FBRzhGLEdBQUcsQ0FBQ0MsT0FBSixDQUFZLEtBQVosQ0FBWjs7QUFDQSxRQUFJQyxPQUFPLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxlQUFaLElBQ1IvRCx5QkFBeUIsQ0FBQ2dFLFFBRGhDOztBQUdBLFFBQUlWLFNBQUosRUFBZTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFNVyxhQUFhLEdBQUdyRyxHQUFHLENBQUN2QyxLQUFKLENBQVV1SSxPQUFWLENBQXRCOztBQUNBLFVBQUlLLGFBQWEsQ0FBQ0MsUUFBZCxLQUEyQixXQUEvQixFQUE0QztBQUMxQ0QscUJBQWEsQ0FBQ0MsUUFBZCxHQUF5QixVQUF6QjtBQUNBLGVBQU9ELGFBQWEsQ0FBQ0UsSUFBckI7QUFDRDs7QUFDRFAsYUFBTyxHQUFHaEcsR0FBRyxDQUFDd0csTUFBSixDQUFXSCxhQUFYLENBQVY7QUFDRDs7QUFFRFosc0JBQWtCLHFCQUNiQSxrQkFEYTtBQUVoQjtBQUNBO0FBQ0FPO0FBSmdCLE1BQWxCO0FBTUQ7O0FBRUQsU0FBT1MsR0FBRyxDQUFDQyxhQUFKLENBQ0x4SSxNQUFNLENBQUNDLFdBQVAsa0JBQTZCL0IsV0FBN0IsR0FBNENxSixrQkFBNUMsQ0FESyxFQUVMdEksS0FGSyxFQUdMcUksTUFISyxDQUFQO0FBSUQsQ0F6REQsQzs7Ozs7Ozs7Ozs7QUNGQTtBQUVBbUIsS0FBSyxHQUFHbkwsS0FBUixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcblxuT0F1dGggPSB7fTtcbk9BdXRoVGVzdCA9IHt9O1xuXG5Sb3V0ZVBvbGljeS5kZWNsYXJlKCcvX29hdXRoLycsICduZXR3b3JrJyk7XG5cbmNvbnN0IHJlZ2lzdGVyZWRTZXJ2aWNlcyA9IHt9O1xuXG4vLyBJbnRlcm5hbDogTWFwcyBmcm9tIHNlcnZpY2UgdmVyc2lvbiB0byBoYW5kbGVyIGZ1bmN0aW9uLiBUaGVcbi8vICdvYXV0aDEnIGFuZCAnb2F1dGgyJyBwYWNrYWdlcyBtYW5pcHVsYXRlIHRoaXMgZGlyZWN0bHkgdG8gcmVnaXN0ZXJcbi8vIGZvciBjYWxsYmFja3MuXG5PQXV0aC5fcmVxdWVzdEhhbmRsZXJzID0ge307XG5cblxuLy8gUmVnaXN0ZXIgYSBoYW5kbGVyIGZvciBhbiBPQXV0aCBzZXJ2aWNlLiBUaGUgaGFuZGxlciB3aWxsIGJlIGNhbGxlZFxuLy8gd2hlbiB3ZSBnZXQgYW4gaW5jb21pbmcgaHR0cCByZXF1ZXN0IG9uIC9fb2F1dGgve3NlcnZpY2VOYW1lfS4gVGhpc1xuLy8gaGFuZGxlciBzaG91bGQgdXNlIHRoYXQgaW5mb3JtYXRpb24gdG8gZmV0Y2ggZGF0YSBhYm91dCB0aGUgdXNlclxuLy8gbG9nZ2luZyBpbi5cbi8vXG4vLyBAcGFyYW0gbmFtZSB7U3RyaW5nfSBlLmcuIFwiZ29vZ2xlXCIsIFwiZmFjZWJvb2tcIlxuLy8gQHBhcmFtIHZlcnNpb24ge051bWJlcn0gT0F1dGggdmVyc2lvbiAoMSBvciAyKVxuLy8gQHBhcmFtIHVybHMgICBGb3IgT0F1dGgxIG9ubHksIHNwZWNpZnkgdGhlIHNlcnZpY2UncyB1cmxzXG4vLyBAcGFyYW0gaGFuZGxlT2F1dGhSZXF1ZXN0IHtGdW5jdGlvbihvYXV0aEJpbmRpbmd8cXVlcnkpfVxuLy8gICAtIChGb3IgT0F1dGgxIG9ubHkpIG9hdXRoQmluZGluZyB7T0F1dGgxQmluZGluZ30gYm91bmQgdG8gdGhlIGFwcHJvcHJpYXRlIHByb3ZpZGVyXG4vLyAgIC0gKEZvciBPQXV0aDIgb25seSkgcXVlcnkge09iamVjdH0gcGFyYW1ldGVycyBwYXNzZWQgaW4gcXVlcnkgc3RyaW5nXG4vLyAgIC0gcmV0dXJuIHZhbHVlIGlzOlxuLy8gICAgIC0ge3NlcnZpY2VEYXRhOiwgKG9wdGlvbmFsIG9wdGlvbnM6KX0gd2hlcmUgc2VydmljZURhdGEgc2hvdWxkIGVuZFxuLy8gICAgICAgdXAgaW4gdGhlIHVzZXIncyBzZXJ2aWNlc1tuYW1lXSBmaWVsZFxuLy8gICAgIC0gYG51bGxgIGlmIHRoZSB1c2VyIGRlY2xpbmVkIHRvIGdpdmUgcGVybWlzc2lvbnNcbi8vXG5PQXV0aC5yZWdpc3RlclNlcnZpY2UgPSAobmFtZSwgdmVyc2lvbiwgdXJscywgaGFuZGxlT2F1dGhSZXF1ZXN0KSA9PiB7XG4gIGlmIChyZWdpc3RlcmVkU2VydmljZXNbbmFtZV0pXG4gICAgdGhyb3cgbmV3IEVycm9yKGBBbHJlYWR5IHJlZ2lzdGVyZWQgdGhlICR7bmFtZX0gT0F1dGggc2VydmljZWApO1xuXG4gIHJlZ2lzdGVyZWRTZXJ2aWNlc1tuYW1lXSA9IHtcbiAgICBzZXJ2aWNlTmFtZTogbmFtZSxcbiAgICB2ZXJzaW9uLFxuICAgIHVybHMsXG4gICAgaGFuZGxlT2F1dGhSZXF1ZXN0LFxuICB9O1xufTtcblxuLy8gRm9yIHRlc3QgY2xlYW51cC5cbk9BdXRoVGVzdC51bnJlZ2lzdGVyU2VydmljZSA9IG5hbWUgPT4ge1xuICBkZWxldGUgcmVnaXN0ZXJlZFNlcnZpY2VzW25hbWVdO1xufTtcblxuXG5PQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwgPSAoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KSA9PlxuICBPQXV0aC5fcmV0cmlldmVQZW5kaW5nQ3JlZGVudGlhbChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpO1xuXG5cbi8vIFRoZSBzdGF0ZSBwYXJhbWV0ZXIgaXMgbm9ybWFsbHkgZ2VuZXJhdGVkIG9uIHRoZSBjbGllbnQgdXNpbmdcbi8vIGBidG9hYCwgYnV0IGZvciB0ZXN0cyB3ZSBuZWVkIGEgdmVyc2lvbiB0aGF0IHJ1bnMgb24gdGhlIHNlcnZlci5cbi8vXG5PQXV0aC5fZ2VuZXJhdGVTdGF0ZSA9IChsb2dpblN0eWxlLCBjcmVkZW50aWFsVG9rZW4sIHJlZGlyZWN0VXJsKSA9PiB7XG4gIHJldHVybiBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeSh7XG4gICAgbG9naW5TdHlsZTogbG9naW5TdHlsZSxcbiAgICBjcmVkZW50aWFsVG9rZW46IGNyZWRlbnRpYWxUb2tlbixcbiAgICByZWRpcmVjdFVybDogcmVkaXJlY3RVcmx9KSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xufTtcblxuT0F1dGguX3N0YXRlRnJvbVF1ZXJ5ID0gcXVlcnkgPT4ge1xuICBsZXQgc3RyaW5nO1xuICB0cnkge1xuICAgIHN0cmluZyA9IEJ1ZmZlci5mcm9tKHF1ZXJ5LnN0YXRlLCAnYmFzZTY0JykudG9TdHJpbmcoJ2JpbmFyeScpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgTG9nLndhcm4oYFVuYWJsZSB0byBiYXNlNjQgZGVjb2RlIHN0YXRlIGZyb20gT0F1dGggcXVlcnk6ICR7cXVlcnkuc3RhdGV9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIExvZy53YXJuKGBVbmFibGUgdG8gcGFyc2Ugc3RhdGUgZnJvbSBPQXV0aCBxdWVyeTogJHtzdHJpbmd9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuT0F1dGguX2xvZ2luU3R5bGVGcm9tUXVlcnkgPSBxdWVyeSA9PiB7XG4gIGxldCBzdHlsZTtcbiAgLy8gRm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciBvbGRlciBjbGllbnRzLCBjYXRjaCBhbnkgZXJyb3JzXG4gIC8vIHRoYXQgcmVzdWx0IGZyb20gcGFyc2luZyB0aGUgc3RhdGUgcGFyYW1ldGVyLiBJZiB3ZSBjYW4ndCBwYXJzZSBpdCxcbiAgLy8gc2V0IGxvZ2luIHN0eWxlIHRvIHBvcHVwIGJ5IGRlZmF1bHQuXG4gIHRyeSB7XG4gICAgc3R5bGUgPSBPQXV0aC5fc3RhdGVGcm9tUXVlcnkocXVlcnkpLmxvZ2luU3R5bGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHN0eWxlID0gXCJwb3B1cFwiO1xuICB9XG4gIGlmIChzdHlsZSAhPT0gXCJwb3B1cFwiICYmIHN0eWxlICE9PSBcInJlZGlyZWN0XCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBsb2dpbiBzdHlsZTogJHtzdHlsZX1gKTtcbiAgfVxuICByZXR1cm4gc3R5bGU7XG59O1xuXG5PQXV0aC5fY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5ID0gcXVlcnkgPT4ge1xuICBsZXQgc3RhdGU7XG4gIC8vIEZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3Igb2xkZXIgY2xpZW50cywgY2F0Y2ggYW55IGVycm9yc1xuICAvLyB0aGF0IHJlc3VsdCBmcm9tIHBhcnNpbmcgdGhlIHN0YXRlIHBhcmFtZXRlci4gSWYgd2UgY2FuJ3QgcGFyc2UgaXQsXG4gIC8vIGFzc3VtZSB0aGF0IHRoZSBzdGF0ZSBwYXJhbWV0ZXIncyB2YWx1ZSBpcyB0aGUgY3JlZGVudGlhbCB0b2tlbiwgYXNcbiAgLy8gaXQgdXNlZCB0byBiZSBmb3Igb2xkZXIgY2xpZW50cy5cbiAgdHJ5IHtcbiAgICBzdGF0ZSA9IE9BdXRoLl9zdGF0ZUZyb21RdWVyeShxdWVyeSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBxdWVyeS5zdGF0ZTtcbiAgfVxuICByZXR1cm4gc3RhdGUuY3JlZGVudGlhbFRva2VuO1xufTtcblxuT0F1dGguX2lzQ29yZG92YUZyb21RdWVyeSA9IHF1ZXJ5ID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISEgT0F1dGguX3N0YXRlRnJvbVF1ZXJ5KHF1ZXJ5KS5pc0NvcmRvdmE7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIEZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3Igb2xkZXIgY2xpZW50cywgY2F0Y2ggYW55IGVycm9yc1xuICAgIC8vIHRoYXQgcmVzdWx0IGZyb20gcGFyc2luZyB0aGUgc3RhdGUgcGFyYW1ldGVyLiBJZiB3ZSBjYW4ndCBwYXJzZVxuICAgIC8vIGl0LCBhc3N1bWUgdGhhdCB3ZSBhcmUgbm90IG9uIENvcmRvdmEsIHNpbmNlIG9sZGVyIE1ldGVvciBkaWRuJ3RcbiAgICAvLyBkbyBDb3Jkb3ZhLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gQ2hlY2tzIGlmIHRoZSBgcmVkaXJlY3RVcmxgIG1hdGNoZXMgdGhlIGFwcCBob3N0LlxuLy8gV2UgZXhwb3J0IHRoaXMgZnVuY3Rpb24gc28gdGhhdCBkZXZlbG9wZXJzIGNhbiBvdmVycmlkZSB0aGlzXG4vLyBiZWhhdmlvciB0byBhbGxvdyBhcHBzIGZyb20gZXh0ZXJuYWwgZG9tYWlucyB0byBsb2dpbiB1c2luZyB0aGVcbi8vIHJlZGlyZWN0IE9BdXRoIGZsb3cuXG5PQXV0aC5fY2hlY2tSZWRpcmVjdFVybE9yaWdpbiA9IHJlZGlyZWN0VXJsID0+IHtcbiAgY29uc3QgYXBwSG9zdCA9IE1ldGVvci5hYnNvbHV0ZVVybCgpO1xuICBjb25zdCBhcHBIb3N0UmVwbGFjZWRMb2NhbGhvc3QgPSBNZXRlb3IuYWJzb2x1dGVVcmwodW5kZWZpbmVkLCB7XG4gICAgcmVwbGFjZUxvY2FsaG9zdDogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIChcbiAgICByZWRpcmVjdFVybC5zdWJzdHIoMCwgYXBwSG9zdC5sZW5ndGgpICE9PSBhcHBIb3N0ICYmXG4gICAgcmVkaXJlY3RVcmwuc3Vic3RyKDAsIGFwcEhvc3RSZXBsYWNlZExvY2FsaG9zdC5sZW5ndGgpICE9PSBhcHBIb3N0UmVwbGFjZWRMb2NhbGhvc3RcbiAgKTtcbn07XG5cbmNvbnN0IG1pZGRsZXdhcmUgPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgbGV0IHJlcXVlc3REYXRhO1xuXG4gIC8vIE1ha2Ugc3VyZSB0byBjYXRjaCBhbnkgZXhjZXB0aW9ucyBiZWNhdXNlIG90aGVyd2lzZSB3ZSdkIGNyYXNoXG4gIC8vIHRoZSBydW5uZXJcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IG9hdXRoU2VydmljZU5hbWUocmVxKTtcbiAgICBpZiAoIXNlcnZpY2VOYW1lKSB7XG4gICAgICAvLyBub3QgYW4gb2F1dGggcmVxdWVzdC4gcGFzcyB0byBuZXh0IG1pZGRsZXdhcmUuXG4gICAgICBuZXh0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZSA9IHJlZ2lzdGVyZWRTZXJ2aWNlc1tzZXJ2aWNlTmFtZV07XG5cbiAgICAvLyBTa2lwIGV2ZXJ5dGhpbmcgaWYgdGhlcmUncyBubyBzZXJ2aWNlIHNldCBieSB0aGUgb2F1dGggbWlkZGxld2FyZVxuICAgIGlmICghc2VydmljZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBPQXV0aCBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2UncmUgY29uZmlndXJlZFxuICAgIGVuc3VyZUNvbmZpZ3VyZWQoc2VydmljZU5hbWUpO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IE9BdXRoLl9yZXF1ZXN0SGFuZGxlcnNbc2VydmljZS52ZXJzaW9uXTtcbiAgICBpZiAoIWhhbmRsZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgT0F1dGggdmVyc2lvbiAke3NlcnZpY2UudmVyc2lvbn1gKTtcblxuICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgICAgcmVxdWVzdERhdGEgPSByZXEucXVlcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3REYXRhID0gcmVxLmJvZHk7XG4gICAgfVxuXG4gICAgaGFuZGxlcihzZXJ2aWNlLCByZXF1ZXN0RGF0YSwgcmVzKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gaWYgd2UgZ290IHRocm93biBhbiBlcnJvciwgc2F2ZSBpdCBvZmYsIGl0IHdpbGwgZ2V0IHBhc3NlZCB0b1xuICAgIC8vIHRoZSBhcHByb3ByaWF0ZSBsb2dpbiBjYWxsIChpZiBhbnkpIGFuZCByZXBvcnRlZCB0aGVyZS5cbiAgICAvL1xuICAgIC8vIFRoZSBvdGhlciBvcHRpb24gd291bGQgYmUgdG8gZGlzcGxheSBpdCBpbiB0aGUgcG9wdXAgdGFiIHRoYXRcbiAgICAvLyBpcyBzdGlsbCBvcGVuIGF0IHRoaXMgcG9pbnQsIGlnbm9yaW5nIHRoZSAnY2xvc2UnIG9yICdyZWRpcmVjdCdcbiAgICAvLyB3ZSB3ZXJlIHBhc3NlZC4gQnV0IHRoZW4gdGhlIGRldmVsb3BlciB3b3VsZG4ndCBiZSBhYmxlIHRvXG4gICAgLy8gc3R5bGUgdGhlIGVycm9yIG9yIHJlYWN0IHRvIGl0IGluIGFueSB3YXkuXG4gICAgaWYgKHJlcXVlc3REYXRhPy5zdGF0ZSAmJiBlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdHJ5IHsgLy8gY2F0Y2ggYW55IGV4Y2VwdGlvbnMgdG8gYXZvaWQgY3Jhc2hpbmcgcnVubmVyXG4gICAgICAgIE9BdXRoLl9zdG9yZVBlbmRpbmdDcmVkZW50aWFsKE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocmVxdWVzdERhdGEpLCBlcnIpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZXJyb3IgYW5kIGp1c3QgZ2l2ZSB1cC4gSWYgd2UgZmFpbGVkIHRvIHN0b3JlIHRoZVxuICAgICAgICAvLyBlcnJvciwgdGhlbiB0aGUgbG9naW4gd2lsbCBqdXN0IGZhaWwgd2l0aCBhIGdlbmVyaWMgZXJyb3IuXG4gICAgICAgIExvZy53YXJuKFwiRXJyb3IgaW4gT0F1dGggU2VydmVyIHdoaWxlIHN0b3JpbmcgcGVuZGluZyBsb2dpbiByZXN1bHQuXFxuXCIgK1xuICAgICAgICAgICAgICAgICBlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNsb3NlIHRoZSBwb3B1cC4gYmVjYXVzZSBub2JvZHkgbGlrZXMgdGhlbSBqdXN0IGhhbmdpbmdcbiAgICAvLyB0aGVyZS4gIHdoZW4gc29tZW9uZSBzZWVzIHRoaXMgbXVsdGlwbGUgdGltZXMgdGhleSBtaWdodFxuICAgIC8vIHRoaW5rIHRvIGNoZWNrIHNlcnZlciBsb2dzICh3ZSBob3BlPylcbiAgICAvLyBDYXRjaCBlcnJvcnMgYmVjYXVzZSBhbnkgZXhjZXB0aW9uIGhlcmUgd2lsbCBjcmFzaCB0aGUgcnVubmVyLlxuICAgIHRyeSB7XG4gICAgICBPQXV0aC5fZW5kT2ZMb2dpblJlc3BvbnNlKHJlcywge1xuICAgICAgICBxdWVyeTogcmVxdWVzdERhdGEsXG4gICAgICAgIGxvZ2luU3R5bGU6IE9BdXRoLl9sb2dpblN0eWxlRnJvbVF1ZXJ5KHJlcXVlc3REYXRhKSxcbiAgICAgICAgZXJyb3I6IGVyclxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBMb2cud2FybihcIkVycm9yIGdlbmVyYXRpbmcgZW5kIG9mIGxvZ2luIHJlc3BvbnNlXFxuXCIgK1xuICAgICAgICAgICAgICAgKGVyciAmJiAoZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlKSkpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gTGlzdGVuIHRvIGluY29taW5nIE9BdXRoIGh0dHAgcmVxdWVzdHNcbldlYkFwcC5jb25uZWN0SGFuZGxlcnMudXNlKCcvX29hdXRoJywgYm9keVBhcnNlci5qc29uKCkpO1xuV2ViQXBwLmNvbm5lY3RIYW5kbGVycy51c2UoJy9fb2F1dGgnLCBib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuV2ViQXBwLmNvbm5lY3RIYW5kbGVycy51c2UobWlkZGxld2FyZSk7XG5cbk9BdXRoVGVzdC5taWRkbGV3YXJlID0gbWlkZGxld2FyZTtcblxuLy8gSGFuZGxlIC9fb2F1dGgvKiBwYXRocyBhbmQgZXh0cmFjdCB0aGUgc2VydmljZSBuYW1lLlxuLy9cbi8vIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gZS5nLiBcImZhY2Vib29rXCIsIG9yIG51bGwgaWYgdGhpcyBpc24ndCBhblxuLy8gb2F1dGggcmVxdWVzdFxuY29uc3Qgb2F1dGhTZXJ2aWNlTmFtZSA9IHJlcSA9PiB7XG4gIC8vIHJlcS51cmwgd2lsbCBiZSBcIi9fb2F1dGgvPHNlcnZpY2UgbmFtZT5cIiB3aXRoIGFuIG9wdGlvbmFsIFwiP2Nsb3NlXCIuXG4gIGNvbnN0IGkgPSByZXEudXJsLmluZGV4T2YoJz8nKTtcbiAgbGV0IGJhcmVQYXRoO1xuICBpZiAoaSA9PT0gLTEpXG4gICAgYmFyZVBhdGggPSByZXEudXJsO1xuICBlbHNlXG4gICAgYmFyZVBhdGggPSByZXEudXJsLnN1YnN0cmluZygwLCBpKTtcbiAgY29uc3Qgc3BsaXRQYXRoID0gYmFyZVBhdGguc3BsaXQoJy8nKTtcblxuICAvLyBBbnkgbm9uLW9hdXRoIHJlcXVlc3Qgd2lsbCBjb250aW51ZSBkb3duIHRoZSBkZWZhdWx0XG4gIC8vIG1pZGRsZXdhcmVzLlxuICBpZiAoc3BsaXRQYXRoWzFdICE9PSAnX29hdXRoJylcbiAgICByZXR1cm4gbnVsbDtcblxuICAvLyBGaW5kIHNlcnZpY2UgYmFzZWQgb24gdXJsXG4gIGNvbnN0IHNlcnZpY2VOYW1lID0gc3BsaXRQYXRoWzJdO1xuICByZXR1cm4gc2VydmljZU5hbWU7XG59O1xuXG4vLyBNYWtlIHN1cmUgd2UncmUgY29uZmlndXJlZFxuY29uc3QgZW5zdXJlQ29uZmlndXJlZCA9IHNlcnZpY2VOYW1lID0+IHtcbiAgaWYgKCFTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiBzZXJ2aWNlTmFtZX0pKSB7XG4gICAgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKCk7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2FmZSA9IHZhbHVlID0+IHtcbiAgLy8gVGhpcyBtYXRjaGVzIHN0cmluZ3MgZ2VuZXJhdGVkIGJ5IGBSYW5kb20uc2VjcmV0YCBhbmRcbiAgLy8gYFJhbmRvbS5pZGAuXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiZcbiAgICAvXlthLXpBLVowLTlcXC1fXSskLy50ZXN0KHZhbHVlKTtcbn07XG5cbi8vIEludGVybmFsOiB1c2VkIGJ5IHRoZSBvYXV0aDEgYW5kIG9hdXRoMiBwYWNrYWdlc1xuT0F1dGguX3JlbmRlck9hdXRoUmVzdWx0cyA9IChyZXMsIHF1ZXJ5LCBjcmVkZW50aWFsU2VjcmV0KSA9PiB7XG4gIC8vIEZvciB0ZXN0cywgd2Ugc3VwcG9ydCB0aGUgYG9ubHlfY3JlZGVudGlhbF9zZWNyZXRfZm9yX3Rlc3RgXG4gIC8vIHBhcmFtZXRlciwgd2hpY2gganVzdCByZXR1cm5zIHRoZSBjcmVkZW50aWFsIHNlY3JldCB3aXRob3V0IGFueVxuICAvLyBzdXJyb3VuZGluZyBIVE1MLiAoVGhlIHRlc3QgbmVlZHMgdG8gYmUgYWJsZSB0byBlYXNpbHkgZ3JhYiB0aGVcbiAgLy8gc2VjcmV0IGFuZCB1c2UgaXQgdG8gbG9nIGluLilcbiAgLy9cbiAgLy8gWFhYIG9ubHlfY3JlZGVudGlhbF9zZWNyZXRfZm9yX3Rlc3QgY291bGQgYmUgdXNlZnVsIGZvciBvdGhlclxuICAvLyB0aGluZ3MgYmVzaWRlIHRlc3RzLCBsaWtlIGNvbW1hbmQtbGluZSBjbGllbnRzLiBXZSBzaG91bGQgZ2l2ZSBpdCBhXG4gIC8vIHJlYWwgbmFtZSBhbmQgc2VydmUgdGhlIGNyZWRlbnRpYWwgc2VjcmV0IGluIEpTT04uXG5cbiAgaWYgKHF1ZXJ5Lm9ubHlfY3JlZGVudGlhbF9zZWNyZXRfZm9yX3Rlc3QpIHtcbiAgICByZXMud3JpdGVIZWFkKDIwMCwgeydDb250ZW50LVR5cGUnOiAndGV4dC9odG1sJ30pO1xuICAgIHJlcy5lbmQoY3JlZGVudGlhbFNlY3JldCwgJ3V0Zi04Jyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGV0YWlscyA9IHtcbiAgICAgIHF1ZXJ5LFxuICAgICAgbG9naW5TdHlsZTogT0F1dGguX2xvZ2luU3R5bGVGcm9tUXVlcnkocXVlcnkpXG4gICAgfTtcbiAgICBpZiAocXVlcnkuZXJyb3IpIHtcbiAgICAgIGRldGFpbHMuZXJyb3IgPSBxdWVyeS5lcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdG9rZW4gPSBPQXV0aC5fY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5KHF1ZXJ5KTtcbiAgICAgIGNvbnN0IHNlY3JldCA9IGNyZWRlbnRpYWxTZWNyZXQ7XG4gICAgICBpZiAodG9rZW4gJiYgc2VjcmV0ICYmXG4gICAgICAgICAgaXNTYWZlKHRva2VuKSAmJiBpc1NhZmUoc2VjcmV0KSkge1xuICAgICAgICBkZXRhaWxzLmNyZWRlbnRpYWxzID0geyB0b2tlbjogdG9rZW4sIHNlY3JldDogc2VjcmV0fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRldGFpbHMuZXJyb3IgPSBcImludmFsaWRfY3JlZGVudGlhbF90b2tlbl9vcl9zZWNyZXRcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBPQXV0aC5fZW5kT2ZMb2dpblJlc3BvbnNlKHJlcywgZGV0YWlscyk7XG4gIH1cbn07XG5cbi8vIFRoaXMgXCJ0ZW1wbGF0ZVwiIChub3QgYSByZWFsIFNwYWNlYmFycyB0ZW1wbGF0ZSwganVzdCBhbiBIVE1MIGZpbGVcbi8vIHdpdGggc29tZSAjI1BMQUNFSE9MREVSIyNzKSBjb21tdW5pY2F0ZXMgdGhlIGNyZWRlbnRpYWwgc2VjcmV0IGJhY2tcbi8vIHRvIHRoZSBtYWluIHdpbmRvdyBhbmQgdGhlbiBjbG9zZXMgdGhlIHBvcHVwLlxuT0F1dGguX2VuZE9mUG9wdXBSZXNwb25zZVRlbXBsYXRlID0gQXNzZXRzLmdldFRleHQoXG4gIFwiZW5kX29mX3BvcHVwX3Jlc3BvbnNlLmh0bWxcIik7XG5cbk9BdXRoLl9lbmRPZlJlZGlyZWN0UmVzcG9uc2VUZW1wbGF0ZSA9IEFzc2V0cy5nZXRUZXh0KFxuICBcImVuZF9vZl9yZWRpcmVjdF9yZXNwb25zZS5odG1sXCIpO1xuXG4vLyBSZW5kZXJzIHRoZSBlbmQgb2YgbG9naW4gcmVzcG9uc2UgdGVtcGxhdGUgaW50byBzb21lIEhUTUwgYW5kIEphdmFTY3JpcHRcbi8vIHRoYXQgY2xvc2VzIHRoZSBwb3B1cCBvciByZWRpcmVjdHMgYXQgdGhlIGVuZCBvZiB0aGUgT0F1dGggZmxvdy5cbi8vXG4vLyBvcHRpb25zIGFyZTpcbi8vICAgLSBsb2dpblN0eWxlIChcInBvcHVwXCIgb3IgXCJyZWRpcmVjdFwiKVxuLy8gICAtIHNldENyZWRlbnRpYWxUb2tlbiAoYm9vbGVhbilcbi8vICAgLSBjcmVkZW50aWFsVG9rZW5cbi8vICAgLSBjcmVkZW50aWFsU2VjcmV0XG4vLyAgIC0gcmVkaXJlY3RVcmxcbi8vICAgLSBpc0NvcmRvdmEgKGJvb2xlYW4pXG4vL1xuY29uc3QgcmVuZGVyRW5kT2ZMb2dpblJlc3BvbnNlID0gb3B0aW9ucyA9PiB7XG4gIC8vIEl0IHdvdWxkIGJlIG5pY2UgdG8gdXNlIEJsYXplIGhlcmUsIGJ1dCBpdCdzIGEgbGl0dGxlIHRyaWNreVxuICAvLyBiZWNhdXNlIG91ciBtdXN0YWNoZXMgd291bGQgYmUgaW5zaWRlIGEgPHNjcmlwdD4gdGFnLCBhbmQgQmxhemVcbiAgLy8gd291bGQgdHJlYXQgdGhlIDxzY3JpcHQ+IHRhZyBjb250ZW50cyBhcyB0ZXh0IChlLmcuIGVuY29kZSAnJicgYXNcbiAgLy8gJyZhbXA7JykuIFNvIHdlIGp1c3QgZG8gYSBzaW1wbGUgcmVwbGFjZS5cblxuICBjb25zdCBlc2NhcGUgPSBzID0+IHtcbiAgICBpZiAocykge1xuICAgICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLlxuICAgICAgICByZXBsYWNlKC88L2csIFwiJmx0O1wiKS5cbiAgICAgICAgcmVwbGFjZSgvPi9nLCBcIiZndDtcIikuXG4gICAgICAgIHJlcGxhY2UoL1xcXCIvZywgXCImcXVvdDtcIikuXG4gICAgICAgIHJlcGxhY2UoL1xcJy9nLCBcIiYjeDI3O1wiKS5cbiAgICAgICAgcmVwbGFjZSgvXFwvL2csIFwiJiN4MkY7XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcztcbiAgICB9XG4gIH07XG5cbiAgLy8gRXNjYXBlIGV2ZXJ5dGhpbmcganVzdCB0byBiZSBzYWZlICh3ZSd2ZSBhbHJlYWR5IGNoZWNrZWQgdGhhdCBzb21lXG4gIC8vIG9mIHRoaXMgZGF0YSAtLSB0aGUgdG9rZW4gYW5kIHNlY3JldCAtLSBhcmUgc2FmZSkuXG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBzZXRDcmVkZW50aWFsVG9rZW46ICEhIG9wdGlvbnMuc2V0Q3JlZGVudGlhbFRva2VuLFxuICAgIGNyZWRlbnRpYWxUb2tlbjogZXNjYXBlKG9wdGlvbnMuY3JlZGVudGlhbFRva2VuKSxcbiAgICBjcmVkZW50aWFsU2VjcmV0OiBlc2NhcGUob3B0aW9ucy5jcmVkZW50aWFsU2VjcmV0KSxcbiAgICBzdG9yYWdlUHJlZml4OiBlc2NhcGUoT0F1dGguX3N0b3JhZ2VUb2tlblByZWZpeCksXG4gICAgcmVkaXJlY3RVcmw6IGVzY2FwZShvcHRpb25zLnJlZGlyZWN0VXJsKSxcbiAgICBpc0NvcmRvdmE6ICEhIG9wdGlvbnMuaXNDb3Jkb3ZhXG4gIH07XG5cbiAgbGV0IHRlbXBsYXRlO1xuICBpZiAob3B0aW9ucy5sb2dpblN0eWxlID09PSAncG9wdXAnKSB7XG4gICAgdGVtcGxhdGUgPSBPQXV0aC5fZW5kT2ZQb3B1cFJlc3BvbnNlVGVtcGxhdGU7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5sb2dpblN0eWxlID09PSAncmVkaXJlY3QnKSB7XG4gICAgdGVtcGxhdGUgPSBPQXV0aC5fZW5kT2ZSZWRpcmVjdFJlc3BvbnNlVGVtcGxhdGU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGxvZ2luU3R5bGU6ICR7b3B0aW9ucy5sb2dpblN0eWxlfWApO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gdGVtcGxhdGUucmVwbGFjZSgvIyNDT05GSUcjIy8sIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpXG4gICAgLnJlcGxhY2UoXG4gICAgICAvIyNST09UX1VSTF9QQVRIX1BSRUZJWCMjLywgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWFxuICAgICk7XG5cbiAgcmV0dXJuIGA8IURPQ1RZUEUgaHRtbD5cXG4ke3Jlc3VsdH1gO1xufTtcblxuLy8gV3JpdGVzIGFuIEhUVFAgcmVzcG9uc2UgdG8gdGhlIHBvcHVwIHdpbmRvdyBhdCB0aGUgZW5kIG9mIGFuIE9BdXRoXG4vLyBsb2dpbiBmbG93LiBBdCB0aGlzIHBvaW50LCBpZiB0aGUgdXNlciBoYXMgc3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcbi8vIHRvIHRoZSBPQXV0aCBzZXJ2ZXIgYW5kIGF1dGhvcml6ZWQgdGhpcyBhcHAsIHdlIGNvbW11bmljYXRlIHRoZVxuLy8gY3JlZGVudGlhbFRva2VuIGFuZCBjcmVkZW50aWFsU2VjcmV0IHRvIHRoZSBtYWluIHdpbmRvdy4gVGhlIG1haW5cbi8vIHdpbmRvdyBtdXN0IHByb3ZpZGUgYm90aCB0aGVzZSB2YWx1ZXMgdG8gdGhlIEREUCBgbG9naW5gIG1ldGhvZCB0b1xuLy8gYXV0aGVudGljYXRlIGl0cyBERFAgY29ubmVjdGlvbi4gQWZ0ZXIgY29tbXVuaWNhdGluZyB0aGVzZSB2YXVlcyB0b1xuLy8gdGhlIG1haW4gd2luZG93LCB3ZSBjbG9zZSB0aGUgcG9wdXAuXG4vL1xuLy8gV2UgZXhwb3J0IHRoaXMgZnVuY3Rpb24gc28gdGhhdCBkZXZlbG9wZXJzIGNhbiBvdmVycmlkZSB0aGlzXG4vLyBiZWhhdmlvciwgd2hpY2ggaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBpbiwgZm9yIGV4YW1wbGUsIHNvbWUgbW9iaWxlXG4vLyBlbnZpcm9ubWVudHMgd2hlcmUgcG9wdXBzIGFuZC9vciBgd2luZG93Lm9wZW5lcmAgZG9uJ3Qgd29yay4gRm9yXG4vLyBleGFtcGxlLCBhbiBhcHAgY291bGQgb3ZlcnJpZGUgYE9BdXRoLl9lbmRPZlBvcHVwUmVzcG9uc2VgIHRvIHB1dCB0aGVcbi8vIGNyZWRlbnRpYWwgdG9rZW4gYW5kIGNyZWRlbnRpYWwgc2VjcmV0IGluIHRoZSBwb3B1cCBVUkwgZm9yIHRoZSBtYWluXG4vLyB3aW5kb3cgdG8gcmVhZCB0aGVtIHRoZXJlIGluc3RlYWQgb2YgdXNpbmcgYHdpbmRvdy5vcGVuZXJgLiBJZiB5b3Vcbi8vIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24sIHlvdSB0YWtlIHJlc3BvbnNpYmlsaXR5IGZvciB3cml0aW5nIHRvIHRoZVxuLy8gcmVxdWVzdCBhbmQgY2FsbGluZyBgcmVzLmVuZCgpYCB0byBjb21wbGV0ZSB0aGUgcmVxdWVzdC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAgIC0gcmVzOiB0aGUgSFRUUCByZXNwb25zZSBvYmplY3Rcbi8vICAgLSBkZXRhaWxzOlxuLy8gICAgICAtIHF1ZXJ5OiB0aGUgcXVlcnkgc3RyaW5nIG9uIHRoZSBIVFRQIHJlcXVlc3Rcbi8vICAgICAgLSBjcmVkZW50aWFsczogeyB0b2tlbjogKiwgc2VjcmV0OiAqIH0uIElmIHByZXNlbnQsIHRoaXMgZmllbGRcbi8vICAgICAgICBpbmRpY2F0ZXMgdGhhdCB0aGUgbG9naW4gd2FzIHN1Y2Nlc3NmdWwuIFJldHVybiB0aGVzZSB2YWx1ZXNcbi8vICAgICAgICB0byB0aGUgY2xpZW50LCB3aG8gY2FuIHVzZSB0aGVtIHRvIGxvZyBpbiBvdmVyIEREUC4gSWZcbi8vICAgICAgICBwcmVzZW50LCB0aGUgdmFsdWVzIGhhdmUgYmVlbiBjaGVja2VkIGFnYWluc3QgYSBsaW1pdGVkXG4vLyAgICAgICAgY2hhcmFjdGVyIHNldCBhbmQgYXJlIHNhZmUgdG8gaW5jbHVkZSBpbiBIVE1MLlxuLy8gICAgICAtIGVycm9yOiBpZiBwcmVzZW50LCBhIHN0cmluZyBvciBFcnJvciBpbmRpY2F0aW5nIGFuIGVycm9yIHRoYXRcbi8vICAgICAgICBvY2N1cnJlZCBkdXJpbmcgdGhlIGxvZ2luLiBUaGlzIGNhbiBjb21lIGZyb20gdGhlIGNsaWVudCBhbmRcbi8vICAgICAgICBzbyBzaG91bGRuJ3QgYmUgdHJ1c3RlZCBmb3Igc2VjdXJpdHkgZGVjaXNpb25zIG9yIGluY2x1ZGVkIGluXG4vLyAgICAgICAgdGhlIHJlc3BvbnNlIHdpdGhvdXQgc2FuaXRpemluZyBpdCBmaXJzdC4gT25seSBvbmUgb2YgYGVycm9yYFxuLy8gICAgICAgIG9yIGBjcmVkZW50aWFsc2Agc2hvdWxkIGJlIHNldC5cbk9BdXRoLl9lbmRPZkxvZ2luUmVzcG9uc2UgPSAocmVzLCBkZXRhaWxzKSA9PiB7XG4gIHJlcy53cml0ZUhlYWQoMjAwLCB7J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWwnfSk7XG5cbiAgbGV0IHJlZGlyZWN0VXJsO1xuICBpZiAoZGV0YWlscy5sb2dpblN0eWxlID09PSAncmVkaXJlY3QnKSB7XG4gICAgcmVkaXJlY3RVcmwgPSBPQXV0aC5fc3RhdGVGcm9tUXVlcnkoZGV0YWlscy5xdWVyeSkucmVkaXJlY3RVcmw7XG4gICAgY29uc3QgYXBwSG9zdCA9IE1ldGVvci5hYnNvbHV0ZVVybCgpO1xuICAgIGlmIChPQXV0aC5fY2hlY2tSZWRpcmVjdFVybE9yaWdpbihyZWRpcmVjdFVybCkpIHtcbiAgICAgIGRldGFpbHMuZXJyb3IgPSBgcmVkaXJlY3RVcmwgKCR7cmVkaXJlY3RVcmx9YCArXG4gICAgICAgIGApIGlzIG5vdCBvbiB0aGUgc2FtZSBob3N0IGFzIHRoZSBhcHAgKCR7YXBwSG9zdH0pYDtcbiAgICAgIHJlZGlyZWN0VXJsID0gYXBwSG9zdDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBpc0NvcmRvdmEgPSBPQXV0aC5faXNDb3Jkb3ZhRnJvbVF1ZXJ5KGRldGFpbHMucXVlcnkpO1xuXG4gIGlmIChkZXRhaWxzLmVycm9yKSB7XG4gICAgTG9nLndhcm4oXCJFcnJvciBpbiBPQXV0aCBTZXJ2ZXI6IFwiICtcbiAgICAgICAgICAgICAoZGV0YWlscy5lcnJvciBpbnN0YW5jZW9mIEVycm9yID9cbiAgICAgICAgICAgICAgZGV0YWlscy5lcnJvci5tZXNzYWdlIDogZGV0YWlscy5lcnJvcikpO1xuICAgIHJlcy5lbmQocmVuZGVyRW5kT2ZMb2dpblJlc3BvbnNlKHtcbiAgICAgIGxvZ2luU3R5bGU6IGRldGFpbHMubG9naW5TdHlsZSxcbiAgICAgIHNldENyZWRlbnRpYWxUb2tlbjogZmFsc2UsXG4gICAgICByZWRpcmVjdFVybCxcbiAgICAgIGlzQ29yZG92YSxcbiAgICB9KSwgXCJ1dGYtOFwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiB3ZSBoYXZlIGEgY3JlZGVudGlhbFNlY3JldCwgcmVwb3J0IGl0IGJhY2sgdG8gdGhlIHBhcmVudFxuICAvLyB3aW5kb3csIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgY3JlZGVudGlhbFRva2VuLiBUaGUgcGFyZW50IHdpbmRvd1xuICAvLyB1c2VzIHRoZSBjcmVkZW50aWFsVG9rZW4gYW5kIGNyZWRlbnRpYWxTZWNyZXQgdG8gbG9nIGluIG92ZXIgRERQLlxuICByZXMuZW5kKHJlbmRlckVuZE9mTG9naW5SZXNwb25zZSh7XG4gICAgbG9naW5TdHlsZTogZGV0YWlscy5sb2dpblN0eWxlLFxuICAgIHNldENyZWRlbnRpYWxUb2tlbjogdHJ1ZSxcbiAgICBjcmVkZW50aWFsVG9rZW46IGRldGFpbHMuY3JlZGVudGlhbHMudG9rZW4sXG4gICAgY3JlZGVudGlhbFNlY3JldDogZGV0YWlscy5jcmVkZW50aWFscy5zZWNyZXQsXG4gICAgcmVkaXJlY3RVcmwsXG4gICAgaXNDb3Jkb3ZhLFxuICB9KSwgXCJ1dGYtOFwiKTtcbn07XG5cblxuY29uc3QgT0F1dGhFbmNyeXB0aW9uID0gUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0gJiYgUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0uT0F1dGhFbmNyeXB0aW9uO1xuXG5jb25zdCB1c2luZ09BdXRoRW5jcnlwdGlvbiA9ICgpID0+XG4gIE9BdXRoRW5jcnlwdGlvbiAmJiBPQXV0aEVuY3J5cHRpb24ua2V5SXNMb2FkZWQoKTtcblxuLy8gRW5jcnlwdCBzZW5zaXRpdmUgc2VydmljZSBkYXRhIHN1Y2ggYXMgYWNjZXNzIHRva2VucyBpZiB0aGVcbi8vIFwib2F1dGgtZW5jcnlwdGlvblwiIHBhY2thZ2UgaXMgbG9hZGVkIGFuZCB0aGUgb2F1dGggc2VjcmV0IGtleSBoYXNcbi8vIGJlZW4gc3BlY2lmaWVkLiAgUmV0dXJucyB0aGUgdW5lbmNyeXB0ZWQgcGxhaW50ZXh0IG90aGVyd2lzZS5cbi8vXG4vLyBUaGUgdXNlciBpZCBpcyBub3Qgc3BlY2lmaWVkIGJlY2F1c2UgdGhlIHVzZXIgaXNuJ3Qga25vd24geWV0IGF0XG4vLyB0aGlzIHBvaW50IGluIHRoZSBvYXV0aCBhdXRoZW50aWNhdGlvbiBwcm9jZXNzLiAgQWZ0ZXIgdGhlIG9hdXRoXG4vLyBhdXRoZW50aWNhdGlvbiBwcm9jZXNzIGNvbXBsZXRlcyB0aGUgZW5jcnlwdGVkIHNlcnZpY2UgZGF0YSBmaWVsZHNcbi8vIHdpbGwgYmUgcmUtZW5jcnlwdGVkIHdpdGggdGhlIHVzZXIgaWQgaW5jbHVkZWQgYmVmb3JlIGluc2VydGluZyB0aGVcbi8vIHNlcnZpY2UgZGF0YSBpbnRvIHRoZSB1c2VyIGRvY3VtZW50LlxuLy9cbk9BdXRoLnNlYWxTZWNyZXQgPSBwbGFpbnRleHQgPT4ge1xuICBpZiAodXNpbmdPQXV0aEVuY3J5cHRpb24oKSlcbiAgICByZXR1cm4gT0F1dGhFbmNyeXB0aW9uLnNlYWwocGxhaW50ZXh0KTtcbiAgZWxzZVxuICAgIHJldHVybiBwbGFpbnRleHQ7XG59O1xuXG4vLyBVbmVuY3J5cHQgYSBzZXJ2aWNlIGRhdGEgZmllbGQsIGlmIHRoZSBcIm9hdXRoLWVuY3J5cHRpb25cIlxuLy8gcGFja2FnZSBpcyBsb2FkZWQgYW5kIHRoZSBmaWVsZCBpcyBlbmNyeXB0ZWQuXG4vL1xuLy8gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBcIm9hdXRoLWVuY3J5cHRpb25cIiBwYWNrYWdlIGlzIGxvYWRlZCBhbmQgdGhlXG4vLyBmaWVsZCBpcyBlbmNyeXB0ZWQsIGJ1dCB0aGUgb2F1dGggc2VjcmV0IGtleSBoYXNuJ3QgYmVlbiBzcGVjaWZpZWQuXG4vL1xuT0F1dGgub3BlblNlY3JldCA9IChtYXliZVNlY3JldCwgdXNlcklkKSA9PiB7XG4gIGlmICghUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0gfHwgIU9BdXRoRW5jcnlwdGlvbi5pc1NlYWxlZChtYXliZVNlY3JldCkpXG4gICAgcmV0dXJuIG1heWJlU2VjcmV0O1xuXG4gIHJldHVybiBPQXV0aEVuY3J5cHRpb24ub3BlbihtYXliZVNlY3JldCwgdXNlcklkKTtcbn07XG5cbi8vIFVuZW5jcnlwdCBmaWVsZHMgaW4gdGhlIHNlcnZpY2UgZGF0YSBvYmplY3QuXG4vL1xuT0F1dGgub3BlblNlY3JldHMgPSAoc2VydmljZURhdGEsIHVzZXJJZCkgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+XG4gICAgcmVzdWx0W2tleV0gPSBPQXV0aC5vcGVuU2VjcmV0KHNlcnZpY2VEYXRhW2tleV0sIHVzZXJJZClcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvL1xuLy8gV2hlbiBhbiBvYXV0aCByZXF1ZXN0IGlzIG1hZGUsIE1ldGVvciByZWNlaXZlcyBvYXV0aCBjcmVkZW50aWFsc1xuLy8gaW4gb25lIGJyb3dzZXIgdGFiLCBhbmQgdGVtcG9yYXJpbHkgcGVyc2lzdHMgdGhlbSB3aGlsZSB0aGF0XG4vLyB0YWIgaXMgY2xvc2VkLCB0aGVuIHJldHJpZXZlcyB0aGVtIGluIHRoZSBicm93c2VyIHRhYiB0aGF0XG4vLyBpbml0aWF0ZWQgdGhlIGNyZWRlbnRpYWwgcmVxdWVzdC5cbi8vXG4vLyBfcGVuZGluZ0NyZWRlbnRpYWxzIGlzIHRoZSBzdG9yYWdlIG1lY2hhbmlzbSB1c2VkIHRvIHNoYXJlIHRoZVxuLy8gY3JlZGVudGlhbCBiZXR3ZWVuIHRoZSAyIHRhYnNcbi8vXG5cblxuLy8gQ29sbGVjdGlvbiBjb250YWluaW5nIHBlbmRpbmcgY3JlZGVudGlhbHMgb2Ygb2F1dGggY3JlZGVudGlhbCByZXF1ZXN0c1xuLy8gSGFzIGtleSwgY3JlZGVudGlhbCwgYW5kIGNyZWF0ZWRBdCBmaWVsZHMuXG5PQXV0aC5fcGVuZGluZ0NyZWRlbnRpYWxzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXG4gIFwibWV0ZW9yX29hdXRoX3BlbmRpbmdDcmVkZW50aWFsc1wiLCB7XG4gICAgX3ByZXZlbnRBdXRvcHVibGlzaDogdHJ1ZVxuICB9KTtcblxuT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5fZW5zdXJlSW5kZXgoJ2tleScsIHsgdW5pcXVlOiB0cnVlIH0pO1xuT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5fZW5zdXJlSW5kZXgoJ2NyZWRlbnRpYWxTZWNyZXQnKTtcbk9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuX2Vuc3VyZUluZGV4KCdjcmVhdGVkQXQnKTtcblxuXG5cbi8vIFBlcmlvZGljYWxseSBjbGVhciBvbGQgZW50cmllcyB0aGF0IHdlcmUgbmV2ZXIgcmV0cmlldmVkXG5jb25zdCBfY2xlYW5TdGFsZVJlc3VsdHMgPSAoKSA9PiB7XG4gIC8vIFJlbW92ZSBjcmVkZW50aWFscyBvbGRlciB0aGFuIDEgbWludXRlXG4gIGNvbnN0IHRpbWVDdXRvZmYgPSBuZXcgRGF0ZSgpO1xuICB0aW1lQ3V0b2ZmLnNldE1pbnV0ZXModGltZUN1dG9mZi5nZXRNaW51dGVzKCkgLSAxKTtcbiAgT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5yZW1vdmUoeyBjcmVhdGVkQXQ6IHsgJGx0OiB0aW1lQ3V0b2ZmIH0gfSk7XG59O1xuY29uc3QgX2NsZWFudXBIYW5kbGUgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoX2NsZWFuU3RhbGVSZXN1bHRzLCA2MCAqIDEwMDApO1xuXG5cbi8vIFN0b3JlcyB0aGUga2V5IGFuZCBjcmVkZW50aWFsIGluIHRoZSBfcGVuZGluZ0NyZWRlbnRpYWxzIGNvbGxlY3Rpb24uXG4vLyBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBga2V5YCBpcyBub3QgYSBzdHJpbmcuXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIGNyZWRlbnRpYWwge09iamVjdH0gICBUaGUgY3JlZGVudGlhbCB0byBzdG9yZVxuLy8gQHBhcmFtIGNyZWRlbnRpYWxTZWNyZXQge3N0cmluZ30gQSBzZWNyZXQgdGhhdCBtdXN0IGJlIHByZXNlbnRlZCBpblxuLy8gICBhZGRpdGlvbiB0byB0aGUgYGtleWAgdG8gcmV0cmlldmUgdGhlIGNyZWRlbnRpYWxcbi8vXG5PQXV0aC5fc3RvcmVQZW5kaW5nQ3JlZGVudGlhbCA9IChrZXksIGNyZWRlbnRpYWwsIGNyZWRlbnRpYWxTZWNyZXQgPSBudWxsKSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcbiAgY2hlY2soY3JlZGVudGlhbFNlY3JldCwgTWF0Y2guTWF5YmUoU3RyaW5nKSk7XG5cbiAgaWYgKGNyZWRlbnRpYWwgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGNyZWRlbnRpYWwgPSBzdG9yYWJsZUVycm9yKGNyZWRlbnRpYWwpO1xuICB9IGVsc2Uge1xuICAgIGNyZWRlbnRpYWwgPSBPQXV0aC5zZWFsU2VjcmV0KGNyZWRlbnRpYWwpO1xuICB9XG5cbiAgLy8gV2UgZG8gYW4gdXBzZXJ0IGhlcmUgaW5zdGVhZCBvZiBhbiBpbnNlcnQgaW4gY2FzZSB0aGUgdXNlciBoYXBwZW5zXG4gIC8vIHRvIHNvbWVob3cgc2VuZCB0aGUgc2FtZSBgc3RhdGVgIHBhcmFtZXRlciB0d2ljZSBkdXJpbmcgYW4gT0F1dGhcbiAgLy8gbG9naW47IHdlIGRvbid0IHdhbnQgYSBkdXBsaWNhdGUga2V5IGVycm9yLlxuICBPQXV0aC5fcGVuZGluZ0NyZWRlbnRpYWxzLnVwc2VydCh7XG4gICAga2V5LFxuICB9LCB7XG4gICAga2V5LFxuICAgIGNyZWRlbnRpYWwsXG4gICAgY3JlZGVudGlhbFNlY3JldCxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcbiAgfSk7XG59O1xuXG5cbi8vIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyBhIGNyZWRlbnRpYWwgZnJvbSB0aGUgX3BlbmRpbmdDcmVkZW50aWFscyBjb2xsZWN0aW9uXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIGNyZWRlbnRpYWxTZWNyZXQge3N0cmluZ31cbi8vXG5PQXV0aC5fcmV0cmlldmVQZW5kaW5nQ3JlZGVudGlhbCA9IChrZXksIGNyZWRlbnRpYWxTZWNyZXQgPSBudWxsKSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICBjb25zdCBwZW5kaW5nQ3JlZGVudGlhbCA9IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuZmluZE9uZSh7XG4gICAga2V5LFxuICAgIGNyZWRlbnRpYWxTZWNyZXQsXG4gIH0pO1xuXG4gIGlmIChwZW5kaW5nQ3JlZGVudGlhbCkge1xuICAgIE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMucmVtb3ZlKHsgX2lkOiBwZW5kaW5nQ3JlZGVudGlhbC5faWQgfSk7XG4gICAgaWYgKHBlbmRpbmdDcmVkZW50aWFsLmNyZWRlbnRpYWwuZXJyb3IpXG4gICAgICByZXR1cm4gcmVjcmVhdGVFcnJvcihwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsLmVycm9yKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gT0F1dGgub3BlblNlY3JldChwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59O1xuXG5cbi8vIENvbnZlcnQgYW4gRXJyb3IgaW50byBhbiBvYmplY3QgdGhhdCBjYW4gYmUgc3RvcmVkIGluIG1vbmdvXG4vLyBOb3RlOiBBIE1ldGVvci5FcnJvciBpcyByZWNvbnN0cnVjdGVkIGFzIGEgTWV0ZW9yLkVycm9yXG4vLyBBbGwgb3RoZXIgZXJyb3IgY2xhc3NlcyBhcmUgcmVjb25zdHJ1Y3RlZCBhcyBhIHBsYWluIEVycm9yLlxuLy8gVE9ETzogQ2FuIHdlIGRvIHRoaXMgbW9yZSBzaW1wbHkgd2l0aCBFSlNPTj9cbmNvbnN0IHN0b3JhYmxlRXJyb3IgPSBlcnJvciA9PiB7XG4gIGNvbnN0IHBsYWluT2JqZWN0ID0ge307XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGVycm9yKS5mb3JFYWNoKFxuICAgIGtleSA9PiBwbGFpbk9iamVjdFtrZXldID0gZXJyb3Jba2V5XVxuICApO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2Ygd2hldGhlciBpdCdzIGEgTWV0ZW9yLkVycm9yXG4gIGlmKGVycm9yIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yKSB7XG4gICAgcGxhaW5PYmplY3RbJ21ldGVvckVycm9yJ10gPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHsgZXJyb3I6IHBsYWluT2JqZWN0IH07XG59O1xuXG4vLyBDcmVhdGUgYW4gZXJyb3IgZnJvbSB0aGUgZXJyb3IgZm9ybWF0IHN0b3JlZCBpbiBtb25nb1xuY29uc3QgcmVjcmVhdGVFcnJvciA9IGVycm9yRG9jID0+IHtcbiAgbGV0IGVycm9yO1xuXG4gIGlmIChlcnJvckRvYy5tZXRlb3JFcnJvcikge1xuICAgIGVycm9yID0gbmV3IE1ldGVvci5FcnJvcigpO1xuICAgIGRlbGV0ZSBlcnJvckRvYy5tZXRlb3JFcnJvcjtcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyb3JEb2MpLmZvckVhY2goa2V5ID0+XG4gICAgZXJyb3Jba2V5XSA9IGVycm9yRG9jW2tleV1cbiAgKTtcblxuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiT0F1dGguX3N0b3JhZ2VUb2tlblByZWZpeCA9IFwiTWV0ZW9yLm9hdXRoLmNyZWRlbnRpYWxTZWNyZXQtXCI7XG5cbk9BdXRoLl9yZWRpcmVjdFVyaSA9IChzZXJ2aWNlTmFtZSwgY29uZmlnLCBwYXJhbXMsIGFic29sdXRlVXJsT3B0aW9ucykgPT4ge1xuICAvLyBYWFggQ09NUEFUIFdJVEggMC45LjBcbiAgLy8gVGhlIHJlZGlyZWN0IFVSSSB1c2VkIHRvIGhhdmUgYSBcIj9jbG9zZVwiIHF1ZXJ5IGFyZ3VtZW50LiAgV2VcbiAgLy8gZGV0ZWN0IHdoZXRoZXIgd2UgbmVlZCB0byBiZSBiYWNrd2FyZHMgY29tcGF0aWJsZSBieSBjaGVja2luZyBmb3JcbiAgLy8gdGhlIGFic2VuY2Ugb2YgdGhlIGBsb2dpblN0eWxlYCBmaWVsZCwgd2hpY2ggd2Fzbid0IHVzZWQgaW4gdGhlXG4gIC8vIGNvZGUgd2hpY2ggaGFkIHRoZSBcIj9jbG9zZVwiIGFyZ3VtZW50LlxuICAvLyBUaGlzIGxvZ2ljIGlzIGR1cGxpY2F0ZWQgaW4gdGhlIHRvb2wgc28gdGhhdCB0aGUgdG9vbCBjYW4gZG8gT0F1dGhcbiAgLy8gZmxvdyB3aXRoIDw9IDAuOS4wIHNlcnZlcnMgKHRvb2xzL2F1dGguanMpLlxuICBjb25zdCBxdWVyeSA9IGNvbmZpZy5sb2dpblN0eWxlID8gbnVsbCA6IFwiY2xvc2VcIjtcblxuICAvLyBDbG9uZSBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIG11dGF0ZSAncGFyYW1zJy4gVGhlICdjb3Jkb3ZhJyBhbmRcbiAgLy8gJ2FuZHJvaWQnIHBhcmFtZXRlcnMgYXJlIG9ubHkgdXNlZCBmb3IgcGlja2luZyB0aGUgaG9zdCBvZiB0aGVcbiAgLy8gcmVkaXJlY3QgVVJMLCBhbmQgbm90IGFjdHVhbGx5IGluY2x1ZGVkIGluIHRoZSByZWRpcmVjdCBVUkwgaXRzZWxmLlxuICBsZXQgaXNDb3Jkb3ZhID0gZmFsc2U7XG4gIGxldCBpc0FuZHJvaWQgPSBmYWxzZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHsgLi4ucGFyYW1zIH07XG4gICAgaXNDb3Jkb3ZhID0gcGFyYW1zLmNvcmRvdmE7XG4gICAgaXNBbmRyb2lkID0gcGFyYW1zLmFuZHJvaWQ7XG4gICAgZGVsZXRlIHBhcmFtcy5jb3Jkb3ZhO1xuICAgIGRlbGV0ZSBwYXJhbXMuYW5kcm9pZDtcbiAgICBpZiAoT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBpZiAoTWV0ZW9yLmlzU2VydmVyICYmIGlzQ29yZG92YSkge1xuICAgIGNvbnN0IHVybCA9IE5wbS5yZXF1aXJlKCd1cmwnKTtcbiAgICBsZXQgcm9vdFVybCA9IHByb2Nlc3MuZW52Lk1PQklMRV9ST09UX1VSTCB8fFxuICAgICAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkw7XG5cbiAgICBpZiAoaXNBbmRyb2lkKSB7XG4gICAgICAvLyBNYXRjaCB0aGUgcmVwbGFjZSB0aGF0IHdlIGRvIGluIGNvcmRvdmEgYm9pbGVycGxhdGVcbiAgICAgIC8vIChib2lsZXJwbGF0ZS1nZW5lcmF0b3IgcGFja2FnZSkuXG4gICAgICAvLyBYWFggTWF5YmUgd2Ugc2hvdWxkIHB1dCB0aGlzIGluIGEgc2VwYXJhdGUgcGFja2FnZSBvciBzb21ldGhpbmdcbiAgICAgIC8vIHRoYXQgaXMgdXNlZCBoZXJlIGFuZCBieSBib2lsZXJwbGF0ZS1nZW5lcmF0b3I/IE9yIG1heWJlXG4gICAgICAvLyBgTWV0ZW9yLmFic29sdXRlVXJsYCBzaG91bGQga25vdyBob3cgdG8gZG8gdGhpcz9cbiAgICAgIGNvbnN0IHBhcnNlZFJvb3RVcmwgPSB1cmwucGFyc2Uocm9vdFVybCk7XG4gICAgICBpZiAocGFyc2VkUm9vdFVybC5ob3N0bmFtZSA9PT0gXCJsb2NhbGhvc3RcIikge1xuICAgICAgICBwYXJzZWRSb290VXJsLmhvc3RuYW1lID0gXCIxMC4wLjIuMlwiO1xuICAgICAgICBkZWxldGUgcGFyc2VkUm9vdFVybC5ob3N0O1xuICAgICAgfVxuICAgICAgcm9vdFVybCA9IHVybC5mb3JtYXQocGFyc2VkUm9vdFVybCk7XG4gICAgfVxuXG4gICAgYWJzb2x1dGVVcmxPcHRpb25zID0ge1xuICAgICAgLi4uYWJzb2x1dGVVcmxPcHRpb25zLFxuICAgICAgLy8gRm9yIENvcmRvdmEgY2xpZW50cywgcmVkaXJlY3QgdG8gdGhlIHNwZWNpYWwgQ29yZG92YSByb290IHVybFxuICAgICAgLy8gKGxpa2VseSBhIGxvY2FsIElQIGluIGRldmVsb3BtZW50IG1vZGUpLlxuICAgICAgcm9vdFVybCxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIFVSTC5fY29uc3RydWN0VXJsKFxuICAgIE1ldGVvci5hYnNvbHV0ZVVybChgX29hdXRoLyR7c2VydmljZU5hbWV9YCwgYWJzb2x1dGVVcmxPcHRpb25zKSxcbiAgICBxdWVyeSxcbiAgICBwYXJhbXMpO1xufTtcbiIsIi8vIFhYWCBDT01QQVQgV0lUSCAwLjguMFxuXG5PYXV0aCA9IE9BdXRoO1xuIl19
