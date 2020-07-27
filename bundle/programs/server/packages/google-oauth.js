(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Google;

var require = meteorInstall({"node_modules":{"meteor":{"google-oauth":{"google_server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/google-oauth/google_server.js                                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let Google;
module.link("./namespace.js", {
  default(v) {
    Google = v;
  }

}, 0);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 1);
const hasOwn = Object.prototype.hasOwnProperty; // https://developers.google.com/accounts/docs/OAuth2Login#userinfocall

Google.whitelistedFields = ['id', 'email', 'verified_email', 'name', 'given_name', 'family_name', 'picture', 'locale', 'timezone', 'gender'];

const getServiceDataFromTokens = tokens => {
  const {
    accessToken,
    idToken
  } = tokens;
  const scopes = getScopes(accessToken);
  const identity = getIdentity(accessToken);
  const serviceData = {
    accessToken,
    idToken,
    scope: scopes
  };

  if (hasOwn.call(tokens, "expiresIn")) {
    serviceData.expiresAt = Date.now() + 1000 * parseInt(tokens.expiresIn, 10);
  }

  const fields = Object.create(null);
  Google.whitelistedFields.forEach(function (name) {
    if (hasOwn.call(identity, name)) {
      fields[name] = identity[name];
    }
  });
  Object.assign(serviceData, fields); // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)

  if (tokens.refreshToken) {
    serviceData.refreshToken = tokens.refreshToken;
  }

  return {
    serviceData,
    options: {
      profile: {
        name: identity.name
      }
    }
  };
};

Accounts.registerLoginHandler(request => {
  if (request.googleSignIn !== true) {
    return;
  }

  const tokens = {
    accessToken: request.accessToken,
    refreshToken: request.refreshToken,
    idToken: request.idToken
  };

  if (request.serverAuthCode) {
    Object.assign(tokens, getTokens({
      code: request.serverAuthCode
    }));
  }

  const result = getServiceDataFromTokens(tokens);
  return Accounts.updateOrCreateUserFromExternalService("google", _objectSpread({
    id: request.userId,
    idToken: request.idToken,
    accessToken: request.accessToken,
    email: request.email,
    picture: request.imageUrl
  }, result.serviceData), result.options);
});

const getServiceData = query => getServiceDataFromTokens(getTokens(query));

OAuth.registerService('google', 2, null, getServiceData); // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request

const getTokens = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'google'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let response;

  try {
    response = HTTP.post("https://accounts.google.com/o/oauth2/token", {
      params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('google', config),
        grant_type: 'authorization_code'
      }
    });
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Google. ".concat(err.message)), {
      response: err.response
    });
  }

  if (response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Google. ".concat(response.data.error));
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      idToken: response.data.id_token
    };
  }
};

const getIdentity = accessToken => {
  try {
    return HTTP.get("https://www.googleapis.com/oauth2/v1/userinfo", {
      params: {
        access_token: accessToken
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Google. ".concat(err.message)), {
      response: err.response
    });
  }
};

const getScopes = accessToken => {
  try {
    return HTTP.get("https://www.googleapis.com/oauth2/v1/tokeninfo", {
      params: {
        access_token: accessToken
      }
    }).data.scope.split(' ');
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch tokeninfo from Google. ".concat(err.message)), {
      response: err.response
    });
  }
};

Google.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/google-oauth/namespace.js                                                                        //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
!function (module1) {
  // The module.exports object of this module becomes the Google namespace
  // for other modules in this package.
  Google = module.exports; // So that api.export finds the "Google" property.

  Google.Google = Google;
}.call(this, module);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/google-oauth/google_server.js");
var exports = require("/node_modules/meteor/google-oauth/namespace.js");

/* Exports */
Package._define("google-oauth", exports, {
  Google: Google
});

})();

//# sourceURL=meteor://💻app/packages/google-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZ29vZ2xlLW9hdXRoL2dvb2dsZV9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2dvb2dsZS1vYXV0aC9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIkdvb2dsZSIsIkFjY291bnRzIiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJ3aGl0ZWxpc3RlZEZpZWxkcyIsImdldFNlcnZpY2VEYXRhRnJvbVRva2VucyIsInRva2VucyIsImFjY2Vzc1Rva2VuIiwiaWRUb2tlbiIsInNjb3BlcyIsImdldFNjb3BlcyIsImlkZW50aXR5IiwiZ2V0SWRlbnRpdHkiLCJzZXJ2aWNlRGF0YSIsInNjb3BlIiwiY2FsbCIsImV4cGlyZXNBdCIsIkRhdGUiLCJub3ciLCJwYXJzZUludCIsImV4cGlyZXNJbiIsImZpZWxkcyIsImNyZWF0ZSIsImZvckVhY2giLCJuYW1lIiwiYXNzaWduIiwicmVmcmVzaFRva2VuIiwib3B0aW9ucyIsInByb2ZpbGUiLCJyZWdpc3RlckxvZ2luSGFuZGxlciIsInJlcXVlc3QiLCJnb29nbGVTaWduSW4iLCJzZXJ2ZXJBdXRoQ29kZSIsImdldFRva2VucyIsImNvZGUiLCJyZXN1bHQiLCJ1cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlIiwiaWQiLCJ1c2VySWQiLCJlbWFpbCIsInBpY3R1cmUiLCJpbWFnZVVybCIsImdldFNlcnZpY2VEYXRhIiwicXVlcnkiLCJPQXV0aCIsInJlZ2lzdGVyU2VydmljZSIsImNvbmZpZyIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwicmVzcG9uc2UiLCJIVFRQIiwicG9zdCIsInBhcmFtcyIsImNsaWVudF9pZCIsImNsaWVudElkIiwiY2xpZW50X3NlY3JldCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJyZWRpcmVjdF91cmkiLCJfcmVkaXJlY3RVcmkiLCJncmFudF90eXBlIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwiZGF0YSIsImVycm9yIiwiYWNjZXNzX3Rva2VuIiwicmVmcmVzaF90b2tlbiIsImV4cGlyZXNfaW4iLCJpZF90b2tlbiIsImdldCIsInNwbGl0IiwicmV0cmlldmVDcmVkZW50aWFsIiwiY3JlZGVudGlhbFRva2VuIiwiY3JlZGVudGlhbFNlY3JldCIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsYUFBSjs7QUFBa0JDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLHNDQUFaLEVBQW1EO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNKLGlCQUFhLEdBQUNJLENBQWQ7QUFBZ0I7O0FBQTVCLENBQW5ELEVBQWlGLENBQWpGO0FBQWxCLElBQUlDLE1BQUo7QUFBV0osTUFBTSxDQUFDQyxJQUFQLENBQVksZ0JBQVosRUFBNkI7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0MsVUFBTSxHQUFDRCxDQUFQO0FBQVM7O0FBQXJCLENBQTdCLEVBQW9ELENBQXBEO0FBQXVELElBQUlFLFFBQUo7QUFBYUwsTUFBTSxDQUFDQyxJQUFQLENBQVksc0JBQVosRUFBbUM7QUFBQ0ksVUFBUSxDQUFDRixDQUFELEVBQUc7QUFBQ0UsWUFBUSxHQUFDRixDQUFUO0FBQVc7O0FBQXhCLENBQW5DLEVBQTZELENBQTdEO0FBRy9FLE1BQU1HLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxjQUFoQyxDLENBRUE7O0FBQ0FMLE1BQU0sQ0FBQ00saUJBQVAsR0FBMkIsQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixnQkFBaEIsRUFBa0MsTUFBbEMsRUFBMEMsWUFBMUMsRUFDUixhQURRLEVBQ08sU0FEUCxFQUNrQixRQURsQixFQUM0QixVQUQ1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QUNDLGVBQUQsRUFBa0JDLGdCQUFsQixLQUMxQmpDLEtBQUssQ0FBQytCLGtCQUFOLENBQXlCQyxlQUF6QixFQUEwQ0MsZ0JBQTFDLENBREYsQzs7Ozs7Ozs7Ozs7O0FDbkpBO0FBQ0E7QUFDQS9FLFFBQU0sR0FBR0osTUFBTSxDQUFDb0YsT0FBaEIsQyxDQUVBOztBQUNBaEYsUUFBTSxDQUFDQSxNQUFQLEdBQWdCQSxNQUFoQiIsImZpbGUiOiIvcGFja2FnZXMvZ29vZ2xlLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdvb2dsZSBmcm9tICcuL25hbWVzcGFjZS5qcyc7XG5pbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gJ21ldGVvci9hY2NvdW50cy1iYXNlJztcblxuY29uc3QgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vYWNjb3VudHMvZG9jcy9PQXV0aDJMb2dpbiN1c2VyaW5mb2NhbGxcbkdvb2dsZS53aGl0ZWxpc3RlZEZpZWxkcyA9IFsnaWQnLCAnZW1haWwnLCAndmVyaWZpZWRfZW1haWwnLCAnbmFtZScsICdnaXZlbl9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAnZmFtaWx5X25hbWUnLCAncGljdHVyZScsICdsb2NhbGUnLCAndGltZXpvbmUnLCAnZ2VuZGVyJ107XG5cbmNvbnN0IGdldFNlcnZpY2VEYXRhRnJvbVRva2VucyA9IHRva2VucyA9PiB7XG4gIGNvbnN0IHsgYWNjZXNzVG9rZW4sIGlkVG9rZW4gfSA9IHRva2VucztcbiAgY29uc3Qgc2NvcGVzID0gZ2V0U2NvcGVzKGFjY2Vzc1Rva2VuKTtcbiAgY29uc3QgaWRlbnRpdHkgPSBnZXRJZGVudGl0eShhY2Nlc3NUb2tlbik7XG4gIGNvbnN0IHNlcnZpY2VEYXRhID0ge1xuICAgIGFjY2Vzc1Rva2VuLFxuICAgIGlkVG9rZW4sXG4gICAgc2NvcGU6IHNjb3Blc1xuICB9O1xuXG4gIGlmIChoYXNPd24uY2FsbCh0b2tlbnMsIFwiZXhwaXJlc0luXCIpKSB7XG4gICAgc2VydmljZURhdGEuZXhwaXJlc0F0ID1cbiAgICAgIERhdGUubm93KCkgKyAxMDAwICogcGFyc2VJbnQodG9rZW5zLmV4cGlyZXNJbiwgMTApO1xuICB9XG5cbiAgY29uc3QgZmllbGRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgR29vZ2xlLndoaXRlbGlzdGVkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoaGFzT3duLmNhbGwoaWRlbnRpdHksIG5hbWUpKSB7XG4gICAgICBmaWVsZHNbbmFtZV0gPSBpZGVudGl0eVtuYW1lXTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5hc3NpZ24oc2VydmljZURhdGEsIGZpZWxkcyk7XG5cbiAgLy8gb25seSBzZXQgdGhlIHRva2VuIGluIHNlcnZpY2VEYXRhIGlmIGl0J3MgdGhlcmUuIHRoaXMgZW5zdXJlc1xuICAvLyB0aGF0IHdlIGRvbid0IGxvc2Ugb2xkIG9uZXMgKHNpbmNlIHdlIG9ubHkgZ2V0IHRoaXMgb24gdGhlIGZpcnN0XG4gIC8vIGxvZyBpbiBhdHRlbXB0KVxuICBpZiAodG9rZW5zLnJlZnJlc2hUb2tlbikge1xuICAgIHNlcnZpY2VEYXRhLnJlZnJlc2hUb2tlbiA9IHRva2Vucy5yZWZyZXNoVG9rZW47XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNlcnZpY2VEYXRhLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgbmFtZTogaWRlbnRpdHkubmFtZVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuQWNjb3VudHMucmVnaXN0ZXJMb2dpbkhhbmRsZXIocmVxdWVzdCA9PiB7XG4gIGlmIChyZXF1ZXN0Lmdvb2dsZVNpZ25JbiAhPT0gdHJ1ZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHRva2VucyA9IHtcbiAgICBhY2Nlc3NUb2tlbjogcmVxdWVzdC5hY2Nlc3NUb2tlbixcbiAgICByZWZyZXNoVG9rZW46IHJlcXVlc3QucmVmcmVzaFRva2VuLFxuICAgIGlkVG9rZW46IHJlcXVlc3QuaWRUb2tlbixcbiAgfTtcblxuICBpZiAocmVxdWVzdC5zZXJ2ZXJBdXRoQ29kZSkge1xuICAgIE9iamVjdC5hc3NpZ24odG9rZW5zLCBnZXRUb2tlbnMoe1xuICAgICAgY29kZTogcmVxdWVzdC5zZXJ2ZXJBdXRoQ29kZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGdldFNlcnZpY2VEYXRhRnJvbVRva2Vucyh0b2tlbnMpO1xuXG4gIHJldHVybiBBY2NvdW50cy51cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKFwiZ29vZ2xlXCIsIHtcbiAgICBpZDogcmVxdWVzdC51c2VySWQsXG4gICAgaWRUb2tlbjogcmVxdWVzdC5pZFRva2VuLFxuICAgIGFjY2Vzc1Rva2VuOiByZXF1ZXN0LmFjY2Vzc1Rva2VuLFxuICAgIGVtYWlsOiByZXF1ZXN0LmVtYWlsLFxuICAgIHBpY3R1cmU6IHJlcXVlc3QuaW1hZ2VVcmwsXG4gICAgLi4ucmVzdWx0LnNlcnZpY2VEYXRhLFxuICB9LCByZXN1bHQub3B0aW9ucyk7XG59KTtcblxuY29uc3QgZ2V0U2VydmljZURhdGEgPSBxdWVyeSA9PiBnZXRTZXJ2aWNlRGF0YUZyb21Ub2tlbnMoZ2V0VG9rZW5zKHF1ZXJ5KSk7XG5cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSgnZ29vZ2xlJywgMiwgbnVsbCwgZ2V0U2VydmljZURhdGEpO1xuXG4vLyByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nOlxuLy8gLSBhY2Nlc3NUb2tlblxuLy8gLSBleHBpcmVzSW46IGxpZmV0aW1lIG9mIHRva2VuIGluIHNlY29uZHNcbi8vIC0gcmVmcmVzaFRva2VuLCBpZiB0aGlzIGlzIHRoZSBmaXJzdCBhdXRob3JpemF0aW9uIHJlcXVlc3RcbmNvbnN0IGdldFRva2VucyA9IHF1ZXJ5ID0+IHtcbiAgY29uc3QgY29uZmlnID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZSh7c2VydmljZTogJ2dvb2dsZSd9KTtcbiAgaWYgKCFjb25maWcpXG4gICAgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKCk7XG5cbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlc3BvbnNlID0gSFRUUC5wb3N0KFxuICAgICAgXCJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdG9rZW5cIiwge3BhcmFtczoge1xuICAgICAgICBjb2RlOiBxdWVyeS5jb2RlLFxuICAgICAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRJZCxcbiAgICAgICAgY2xpZW50X3NlY3JldDogT0F1dGgub3BlblNlY3JldChjb25maWcuc2VjcmV0KSxcbiAgICAgICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoJ2dvb2dsZScsIGNvbmZpZyksXG4gICAgICAgIGdyYW50X3R5cGU6ICdhdXRob3JpemF0aW9uX2NvZGUnXG4gICAgICB9fSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBHb29nbGUuICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICk7XG4gIH1cblxuICBpZiAocmVzcG9uc2UuZGF0YS5lcnJvcikgeyAvLyBpZiB0aGUgaHR0cCByZXNwb25zZSB3YXMgYSBqc29uIG9iamVjdCB3aXRoIGFuIGVycm9yIGF0dHJpYnV0ZVxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEdvb2dsZS4gJHtyZXNwb25zZS5kYXRhLmVycm9yfWApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBhY2Nlc3NUb2tlbjogcmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW4sXG4gICAgICByZWZyZXNoVG9rZW46IHJlc3BvbnNlLmRhdGEucmVmcmVzaF90b2tlbixcbiAgICAgIGV4cGlyZXNJbjogcmVzcG9uc2UuZGF0YS5leHBpcmVzX2luLFxuICAgICAgaWRUb2tlbjogcmVzcG9uc2UuZGF0YS5pZF90b2tlblxuICAgIH07XG4gIH1cbn07XG5cbmNvbnN0IGdldElkZW50aXR5ID0gYWNjZXNzVG9rZW4gPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBIVFRQLmdldChcbiAgICAgIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL3VzZXJpbmZvXCIsXG4gICAgICB7cGFyYW1zOiB7YWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlbn19KS5kYXRhO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBPYmplY3QuYXNzaWduKFxuICAgICAgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggaWRlbnRpdHkgZnJvbSBHb29nbGUuICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICk7XG4gIH1cbn07XG5cbmNvbnN0IGdldFNjb3BlcyA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSFRUUC5nZXQoXG4gICAgICBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS90b2tlbmluZm9cIixcbiAgICAgIHtwYXJhbXM6IHthY2Nlc3NfdG9rZW46IGFjY2Vzc1Rva2VufX0pLmRhdGEuc2NvcGUuc3BsaXQoJyAnKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIHRva2VuaW5mbyBmcm9tIEdvb2dsZS4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9XG4gICAgKTtcbiAgfVxufTtcblxuR29vZ2xlLnJldHJpZXZlQ3JlZGVudGlhbCA9IChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpID0+XG4gIE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpO1xuIiwiLy8gVGhlIG1vZHVsZS5leHBvcnRzIG9iamVjdCBvZiB0aGlzIG1vZHVsZSBiZWNvbWVzIHRoZSBHb29nbGUgbmFtZXNwYWNlXG4vLyBmb3Igb3RoZXIgbW9kdWxlcyBpbiB0aGlzIHBhY2thZ2UuXG5Hb29nbGUgPSBtb2R1bGUuZXhwb3J0cztcblxuLy8gU28gdGhhdCBhcGkuZXhwb3J0IGZpbmRzIHRoZSBcIkdvb2dsZVwiIHByb3BlcnR5LlxuR29vZ2xlLkdvb2dsZSA9IEdvb2dsZTtcbiJdfQ==
