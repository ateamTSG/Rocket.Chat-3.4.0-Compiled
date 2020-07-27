(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var check = Package.check.check;
var Match = Package.check.Match;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var params, url, OAuth1Binding, OAuth1Test;

var require = meteorInstall({"node_modules":{"meteor":{"oauth1":{"oauth1_binding.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/oauth1/oauth1_binding.js                                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  OAuth1Binding: () => OAuth1Binding
});
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 0);
let querystring;
module.link("querystring", {
  default(v) {
    querystring = v;
  }

}, 1);
let urlModule;
module.link("url", {
  default(v) {
    urlModule = v;
  }

}, 2);

class OAuth1Binding {
  constructor(config, urls) {
    this._config = config;
    this._urls = urls;
  }

  prepareRequestToken(callbackUrl) {
    const headers = this._buildHeader({
      oauth_callback: callbackUrl
    });

    const response = this._call('POST', this._urls.requestToken, headers);

    const tokens = querystring.parse(response.content);
    if (!tokens.oauth_callback_confirmed) throw Object.assign(new Error("oauth_callback_confirmed false when requesting oauth1 token"), {
      response: response
    });
    this.requestToken = tokens.oauth_token;
    this.requestTokenSecret = tokens.oauth_token_secret;
  }

  prepareAccessToken(query, requestTokenSecret) {
    // support implementations that use request token secrets. This is
    // read by this._call.
    //
    // XXX make it a param to call, not something stashed on self? It's
    // kinda confusing right now, everything except this is passed as
    // arguments, but this is stored.
    if (requestTokenSecret) this.accessTokenSecret = requestTokenSecret;

    const headers = this._buildHeader({
      oauth_token: query.oauth_token,
      oauth_verifier: query.oauth_verifier
    });

    const response = this._call('POST', this._urls.accessToken, headers);

    const tokens = querystring.parse(response.content);

    if (!tokens.oauth_token || !tokens.oauth_token_secret) {
      const error = new Error("missing oauth token or secret"); // We provide response only if no token is available, we do not want to leak any tokens

      if (!tokens.oauth_token && !tokens.oauth_token_secret) {
        Object.assign(error, {
          response: response
        });
      }

      throw error;
    }

    this.accessToken = tokens.oauth_token;
    this.accessTokenSecret = tokens.oauth_token_secret;
  }

  call(method, url, params, callback) {
    const headers = this._buildHeader({
      oauth_token: this.accessToken
    });

    if (!params) {
      params = {};
    }

    return this._call(method, url, headers, params, callback);
  }

  get(url, params, callback) {
    return this.call('GET', url, params, callback);
  }

  post(url, params, callback) {
    return this.call('POST', url, params, callback);
  }

  _buildHeader(headers) {
    return _objectSpread({
      oauth_consumer_key: this._config.consumerKey,
      oauth_nonce: Random.secret().replace(/\W/g, ''),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: (new Date().valueOf() / 1000).toFixed().toString(),
      oauth_version: '1.0'
    }, headers);
  }

  _getSignature(method, url, rawHeaders, accessTokenSecret, params) {
    const headers = this._encodeHeader(_objectSpread({}, rawHeaders, {}, params));

    const parameters = Object.keys(headers).map(key => "".concat(key, "=").concat(headers[key])).sort().join('&');
    const signatureBase = [method, this._encodeString(url), this._encodeString(parameters)].join('&');
    const secret = OAuth.openSecret(this._config.secret);
    let signingKey = "".concat(this._encodeString(secret), "&");
    if (accessTokenSecret) signingKey += this._encodeString(accessTokenSecret);
    return crypto.createHmac('SHA1', signingKey).update(signatureBase).digest('base64');
  }

  _call(method, url) {
    let headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    let callback = arguments.length > 4 ? arguments[4] : undefined;

    // all URLs to be functions to support parameters/customization
    if (typeof url === "function") {
      url = url(this);
    } // Extract all query string parameters from the provided URL


    const parsedUrl = urlModule.parse(url, true); // Merge them in a way that params given to the method call have precedence

    params = _objectSpread({}, parsedUrl.query, {}, params); // Reconstruct the URL back without any query string parameters
    // (they are now in params)

    parsedUrl.query = {};
    parsedUrl.search = '';
    url = urlModule.format(parsedUrl); // Get the signature

    headers.oauth_signature = this._getSignature(method, url, headers, this.accessTokenSecret, params); // Make a authorization string according to oauth1 spec

    const authString = this._getAuthHeaderString(headers); // Make signed request


    try {
      const response = HTTP.call(method, url, {
        params,
        headers: {
          Authorization: authString
        }
      }, callback && ((error, response) => {
        if (!error) {
          response.nonce = headers.oauth_nonce;
        }

        callback(error, response);
      })); // We store nonce so that JWTs can be validated

      if (response) response.nonce = headers.oauth_nonce;
      return response;
    } catch (err) {
      throw Object.assign(new Error("Failed to send OAuth1 request to ".concat(url, ". ").concat(err.message)), {
        response: err.response
      });
    }
  }

  _encodeHeader(header) {
    return Object.keys(header).reduce((memo, key) => {
      memo[this._encodeString(key)] = this._encodeString(header[key]);
      return memo;
    }, {});
  }

  _encodeString(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
  }

  _getAuthHeaderString(headers) {
    return 'OAuth ' + Object.keys(headers).map(key => "".concat(this._encodeString(key), "=\"").concat(this._encodeString(headers[key]), "\"")).sort().join(', ');
  }

}

;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth1_server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/oauth1/oauth1_server.js                                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!function (module1) {
  let _objectSpread;

  module1.link("@babel/runtime/helpers/objectSpread2", {
    default(v) {
      _objectSpread = v;
    }

  }, 0);
  let url;
  module1.link("url", {
    default(v) {
      url = v;
    }

  }, 0);
  let OAuth1Binding;
  module1.link("./oauth1_binding", {
    OAuth1Binding(v) {
      OAuth1Binding = v;
    }

  }, 1);

  OAuth._queryParamsWithAuthTokenUrl = function (authUrl, oauthBinding) {
    let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let whitelistedQueryParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    const redirectUrlObj = url.parse(authUrl, true);
    Object.assign(redirectUrlObj.query, whitelistedQueryParams.reduce((prev, param) => params.query[param] ? _objectSpread({}, prev, {
      param: params.query[param]
    }) : prev, {}), {
      oauth_token: oauthBinding.requestToken
    }); // Clear the `search` so it is rebuilt by Node's `url` from the `query` above.
    // Using previous versions of the Node `url` module, this was just set to ""
    // However, Node 6 docs seem to indicate that this should be `undefined`.

    delete redirectUrlObj.search; // Reconstruct the URL back with provided query parameters merged with oauth_token

    return url.format(redirectUrlObj);
  }; // connect middleware


  OAuth._requestHandlers['1'] = (service, query, res) => {
    const config = ServiceConfiguration.configurations.findOne({
      service: service.serviceName
    });

    if (!config) {
      throw new ServiceConfiguration.ConfigError(service.serviceName);
    }

    const {
      urls
    } = service;
    const oauthBinding = new OAuth1Binding(config, urls);
    let credentialSecret;

    if (query.requestTokenAndRedirect) {
      // step 1 - get and store a request token
      const callbackUrl = OAuth._redirectUri(service.serviceName, config, {
        state: query.state,
        cordova: query.cordova === "true",
        android: query.android === "true"
      }); // Get a request token to start auth process


      oauthBinding.prepareRequestToken(callbackUrl); // Keep track of request token so we can verify it on the next step

      OAuth._storeRequestToken(OAuth._credentialTokenFromQuery(query), oauthBinding.requestToken, oauthBinding.requestTokenSecret); // support for scope/name parameters


      let redirectUrl;
      const authParams = {
        query
      };

      if (typeof urls.authenticate === "function") {
        redirectUrl = urls.authenticate(oauthBinding, authParams);
      } else {
        redirectUrl = OAuth._queryParamsWithAuthTokenUrl(urls.authenticate, oauthBinding, authParams);
      } // redirect to provider login, which will redirect back to "step 2" below


      res.writeHead(302, {
        'Location': redirectUrl
      });
      res.end();
    } else {
      // step 2, redirected from provider login - store the result
      // and close the window to allow the login handler to proceed
      // Get the user's request token so we can verify it and clear it
      const requestTokenInfo = OAuth._retrieveRequestToken(OAuth._credentialTokenFromQuery(query));

      if (!requestTokenInfo) {
        throw new Error("Unable to retrieve request token");
      } // Verify user authorized access and the oauth_token matches
      // the requestToken from previous step


      if (query.oauth_token && query.oauth_token === requestTokenInfo.requestToken) {
        // Prepare the login results before returning.  This way the
        // subsequent call to the `login` method will be immediate.
        // Get the access token for signing requests
        oauthBinding.prepareAccessToken(query, requestTokenInfo.requestTokenSecret); // Run service-specific handler.

        const oauthResult = service.handleOauthRequest(oauthBinding, {
          query: query
        });

        const credentialToken = OAuth._credentialTokenFromQuery(query);

        credentialSecret = Random.secret(); // Store the login result so it can be retrieved in another
        // browser tab by the result handler

        OAuth._storePendingCredential(credentialToken, {
          serviceName: service.serviceName,
          serviceData: oauthResult.serviceData,
          options: oauthResult.options
        }, credentialSecret);
      } // Either close the window, redirect, or render nothing
      // if all else fails


      OAuth._renderOauthResults(res, query, credentialSecret);
    }
  };
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth1_pending_request_tokens.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/oauth1/oauth1_pending_request_tokens.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
//
// _pendingRequestTokens are request tokens that have been received
// but not yet fully authorized (processed).
//
// During the oauth1 authorization process, the Meteor App opens
// a pop-up, requests a request token from the oauth1 service, and
// redirects the browser to the oauth1 service for the user
// to grant authorization.  The user is then returned to the
// Meteor Apps' callback url and the request token is verified.
//
// When Meteor Apps run on multiple servers, it's possible that
// 2 different servers may be used to generate the request token
// and to verify it in the callback once the user has authorized.
//
// For this reason, the _pendingRequestTokens are stored in the database
// so they can be shared across Meteor App servers.
//
// XXX This code is fairly similar to oauth/pending_credentials.js --
// maybe we can combine them somehow.
// Collection containing pending request tokens
// Has key, requestToken, requestTokenSecret, and createdAt fields.
OAuth._pendingRequestTokens = new Mongo.Collection("meteor_oauth_pendingRequestTokens", {
  _preventAutopublish: true
});

OAuth._pendingRequestTokens._ensureIndex('key', {
  unique: true
});

OAuth._pendingRequestTokens._ensureIndex('createdAt'); // Periodically clear old entries that never got completed


const _cleanStaleResults = () => {
  // Remove request tokens older than 5 minute
  const timeCutoff = new Date();
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 5);

  OAuth._pendingRequestTokens.remove({
    createdAt: {
      $lt: timeCutoff
    }
  });
};

const _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000); // Stores the key and request token in the _pendingRequestTokens collection.
// Will throw an exception if `key` is not a string.
//
// @param key {string}
// @param requestToken {string}
// @param requestTokenSecret {string}
//


OAuth._storeRequestToken = (key, requestToken, requestTokenSecret) => {
  check(key, String); // We do an upsert here instead of an insert in case the user happens
  // to somehow send the same `state` parameter twice during an OAuth
  // login; we don't want a duplicate key error.

  OAuth._pendingRequestTokens.upsert({
    key
  }, {
    key,
    requestToken: OAuth.sealSecret(requestToken),
    requestTokenSecret: OAuth.sealSecret(requestTokenSecret),
    createdAt: new Date()
  });
}; // Retrieves and removes a request token from the _pendingRequestTokens collection
// Returns an object containing requestToken and requestTokenSecret properties
//
// @param key {string}
//


OAuth._retrieveRequestToken = key => {
  check(key, String);

  const pendingRequestToken = OAuth._pendingRequestTokens.findOne({
    key: key
  });

  if (pendingRequestToken) {
    OAuth._pendingRequestTokens.remove({
      _id: pendingRequestToken._id
    });

    return {
      requestToken: OAuth.openSecret(pendingRequestToken.requestToken),
      requestTokenSecret: OAuth.openSecret(pendingRequestToken.requestTokenSecret)
    };
  } else {
    return undefined;
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/oauth1/oauth1_binding.js");
require("/node_modules/meteor/oauth1/oauth1_server.js");
require("/node_modules/meteor/oauth1/oauth1_pending_request_tokens.js");

/* Exports */
Package._define("oauth1", {
  OAuth1Binding: OAuth1Binding,
  OAuth1Test: OAuth1Test
});

})();

//# sourceURL=meteor://💻app/packages/oauth1.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgxL29hdXRoMV9iaW5kaW5nLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aDEvb2F1dGgxX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgxL29hdXRoMV9wZW5kaW5nX3JlcXVlc3RfdG9rZW5zLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJleHBvcnQiLCJPQXV0aDFCaW5kaW5nIiwiY3J5cHRvIiwicXVlcnlzdHJpbmciLCJ1cmxNb2R1bGUiLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsInVybHMiLCJfY29uZmlnIiwiX3VybHMiLCJwcmVwYXJlUmVxdWVzdFRva2VuIiwiY2FsbGJhY2tVcmwiLCJoZWFkZXJzIiwiX2J1aWxkSGVhZGVyIiwib2F1dGhfY2FsbGJhY2siLCJyZXNwb25zZSIsIl9jYWxsIiwicmVxdWVzdFRva2VuIiwidG9rZW5zIiwicGFyc2UiLCJjb250ZW50Iiwib2F1dGhfY2FsbGJhY2tfY29uZmlybWVkIiwiT2JqZWN0IiwiYXNzaWduIiwiRXJyb3IiLCJvYXV0aF90b2tlbiIsInJlcXVlc3RUb2tlblNlY3JldCIsIm9hdXRoX3Rva2VuX3NlY3JldCIsInByZXBhcmVBY2Nlc3NUb2tlbiIsInF1ZXJ5IiwiYWNjZXNzVG9rZW5TZWNyZXQiLCJvYXV0aF92ZXJpZmllciIsImFjY2Vzc1Rva2VuIiwiZXJyb3IiLCJjYWxsIiwibWV0aG9kIiwidXJsIiwicGFyYW1zIiwiY2FsbGJhY2siLCJnZXQiLCJwb3N0Iiwib2F1dGhfY29uc3VtZXJfa2V5IiwiY29uc3VtZXJLZXkiLCJvYXV0aF9ub25jZSIsIlJhbmRvbSIsInNlY3JldCIsInJlcGxhY2UiLCJvYXV0aF9zaWduYXR1cmVfbWV0aG9kIiwib2F1dGhfdGltZXN0YW1wIiwiRGF0ZSIsInZhbHVlT2YiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJvYXV0aF92ZXJzaW9uIiwiX2dldFNpZ25hdHVyZSIsInJhd0hlYWRlcnMiLCJfZW5jb2RlSGVhZGVyIiwicGFyYW1ldGVycyIsImtleXMiLCJtYXAiLCJrZXkiLCJzb3J0Iiwiam9pbiIsInNpZ25hdHVyZUJhc2UiLCJfZW5jb2RlU3RyaW5nIiwiT0F1dGgiLCJvcGVuU2VjcmV0Iiwic2lnbmluZ0tleSIsImNyZWF0ZUhtYWMiLCJ1cGRhdGUiLCJkaWdlc3QiLCJwYXJzZWRVcmwiLCJzZWFyY2giLCJmb3JtYXQiLCJvYXV0aF9zaWduYXR1cmUiLCJhdXRoU3RyaW5nIiwiX2dldEF1dGhIZWFkZXJTdHJpbmciLCJIVFRQIiwiQXV0aG9yaXphdGlvbiIsIm5vbmNlIiwiZXJyIiwibWVzc2FnZSIsImhlYWRlciIsInJlZHVjZSIsIm1lbW8iLCJzdHIiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJtb2R1bGUxIiwiX3F1ZXJ5UGFyYW1zV2l0aEF1dGhUb2tlblVybCIsImF1dGhVcmwiLCJvYXV0aEJpbmRpbmciLCJ3aGl0ZWxpc3RlZFF1ZXJ5UGFyYW1zIiwicmVkaXJlY3RVcmxPYmoiLCJwcmV2IiwicGFyYW0iLCJfcmVxdWVzdEhhbmRsZXJzIiwic2VydmljZSIsInJlcyIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lIiwic2VydmljZU5hbWUiLCJDb25maWdFcnJvciIsImNyZWRlbnRpYWxTZWNyZXQiLCJyZXF1ZXN0VG9rZW5BbmRSZWRpcmVjdCIsIl9yZWRpcmVjdFVyaSIsInN0YXRlIiwiY29yZG92YSIsImFuZHJvaWQiLCJfc3RvcmVSZXF1ZXN0VG9rZW4iLCJfY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5IiwicmVkaXJlY3RVcmwiLCJhdXRoUGFyYW1zIiwiYXV0aGVudGljYXRlIiwid3JpdGVIZWFkIiwiZW5kIiwicmVxdWVzdFRva2VuSW5mbyIsIl9yZXRyaWV2ZVJlcXVlc3RUb2tlbiIsIm9hdXRoUmVzdWx0IiwiaGFuZGxlT2F1dGhSZXF1ZXN0IiwiY3JlZGVudGlhbFRva2VuIiwiX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwiLCJzZXJ2aWNlRGF0YSIsIm9wdGlvbnMiLCJfcmVuZGVyT2F1dGhSZXN1bHRzIiwiX3BlbmRpbmdSZXF1ZXN0VG9rZW5zIiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiX3ByZXZlbnRBdXRvcHVibGlzaCIsIl9lbnN1cmVJbmRleCIsInVuaXF1ZSIsIl9jbGVhblN0YWxlUmVzdWx0cyIsInRpbWVDdXRvZmYiLCJzZXRNaW51dGVzIiwiZ2V0TWludXRlcyIsInJlbW92ZSIsImNyZWF0ZWRBdCIsIiRsdCIsIl9jbGVhbnVwSGFuZGxlIiwiTWV0ZW9yIiwic2V0SW50ZXJ2YWwiLCJjaGVjayIsIlN0cmluZyIsInVwc2VydCIsInNlYWxTZWNyZXQiLCJwZW5kaW5nUmVxdWVzdFRva2VuIiwiX2lkIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsYUFBSjs7QUFBa0JDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLHNDQUFaLEVBQW1EO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNKLGlCQUFhLEdBQUNJLENBQWQ7QUFBZ0I7O0FBQTVCLENBQW5ELEVBQWlGLENBQWpGO0FBQWxCSCxNQUFNLENBQUNJLE1BQVAsQ0FBYztBQUFDQyxlQUFhLEVBQUMsTUFBSUE7QUFBbkIsQ0FBZDtBQUFpRCxJQUFJQyxNQUFKO0FBQVdOLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLFFBQVosRUFBcUI7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0csVUFBTSxHQUFDSCxDQUFQO0FBQVM7O0FBQXJCLENBQXJCLEVBQTRDLENBQTVDO0FBQStDLElBQUlJLFdBQUo7QUFBZ0JQLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGFBQVosRUFBMEI7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0ksZUFBVyxHQUFDSixDQUFaO0FBQWM7O0FBQTFCLENB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QyxVQUFOLENBQWlCZ0YsbUJBQW1CLENBQUNqSSxZQUFyQyxDQURUO0FBRUxTLHdCQUFrQixFQUFFdUMsS0FBSyxDQUFDQyxVQUFOLENBQ2xCZ0YsbUJBQW1CLENBQUN4SCxrQkFERjtBQUZmLEtBQVA7QUFLRCxHQVBELE1BT087QUFDTCxXQUFPMEgsU0FBUDtBQUNEO0FBQ0YsQ0FkRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vYXV0aDEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgcXVlcnlzdHJpbmcgZnJvbSAncXVlcnlzdHJpbmcnO1xuaW1wb3J0IHVybE1vZHVsZSBmcm9tICd1cmwnO1xuXG4vLyBBbiBPQXV0aDEgd3JhcHBlciBhcm91bmQgaHR0cCBjYWxscyB3aGljaCBoZWxwcyBnZXQgdG9rZW5zIGFuZFxuLy8gdGFrZXMgY2FyZSBvZiBIVFRQIGhlYWRlcnNcbi8vXG4vLyBAcGFyYW0gY29uZmlnIHtPYmplY3R9XG4vLyAgIC0gY29uc3VtZXJLZXkgKFN0cmluZyk6IG9hdXRoIGNvbnN1bWVyIGtleVxuLy8gICAtIHNlY3JldCAoU3RyaW5nKTogb2F1dGggY29uc3VtZXIgc2VjcmV0XG4vLyBAcGFyYW0gdXJscyB7T2JqZWN0fVxuLy8gICAtIHJlcXVlc3RUb2tlbiAoU3RyaW5nKTogdXJsXG4vLyAgIC0gYXV0aG9yaXplIChTdHJpbmcpOiB1cmxcbi8vICAgLSBhY2Nlc3NUb2tlbiAoU3RyaW5nKTogdXJsXG4vLyAgIC0gYXV0aGVudGljYXRlIChTdHJpbmcpOiB1cmxcbmV4cG9ydCBjbGFzcyBPQXV0aDFCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IoY29uZmlnLCB1cmxzKSB7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX3VybHMgPSB1cmxzO1xuICB9XG5cbiAgcHJlcGFyZVJlcXVlc3RUb2tlbihjYWxsYmFja1VybCkge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB0aGlzLl9idWlsZEhlYWRlcih7XG4gICAgICBvYXV0aF9jYWxsYmFjazogY2FsbGJhY2tVcmxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gdGhpcy5fY2FsbCgnUE9TVCcsIHRoaXMuX3VybHMucmVxdWVzdFRva2VuLCBoZWFkZXJzKTtcbiAgICBjb25zdCB0b2tlbnMgPSBxdWVyeXN0cmluZy5wYXJzZShyZXNwb25zZS5jb250ZW50KTtcblxuICAgIGlmICghIHRva2Vucy5vYXV0aF9jYWxsYmFja19jb25maXJtZWQpXG4gICAgICB0aHJvdyBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihcIm9hdXRoX2NhbGxiYWNrX2NvbmZpcm1lZCBmYWxzZSB3aGVuIHJlcXVlc3Rpbmcgb2F1dGgxIHRva2VuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyZXNwb25zZTogcmVzcG9uc2V9KTtcblxuICAgIHRoaXMucmVxdWVzdFRva2VuID0gdG9rZW5zLm9hdXRoX3Rva2VuO1xuICAgIHRoaXMucmVxdWVzdFRva2VuU2VjcmV0ID0gdG9rZW5zLm9hdXRoX3Rva2VuX3NlY3JldDtcbiAgfVxuXG4gIHByZXBhcmVBY2Nlc3NUb2tlbihxdWVyeSwgcmVxdWVzdFRva2VuU2VjcmV0KSB7XG4gICAgLy8gc3VwcG9ydCBpbXBsZW1lbnRhdGlvbnMgdGhhdCB1c2UgcmVxdWVzdCB0b2tlbiBzZWNyZXRzLiBUaGlzIGlzXG4gICAgLy8gcmVhZCBieSB0aGlzLl9jYWxsLlxuICAgIC8vXG4gICAgLy8gWFhYIG1ha2UgaXQgYSBwYXJhbSB0byBjYWxsLCBub3Qgc29tZXRoaW5nIHN0YXNoZWQgb24gc2VsZj8gSXQnc1xuICAgIC8vIGtpbmRhIGNvbmZ1c2luZyByaWdodCBub3csIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoaXMgaXMgcGFzc2VkIGFzXG4gICAgLy8gYXJndW1lbnRzLCBidXQgdGhpcyBpcyBzdG9yZWQuXG4gICAgaWYgKHJlcXVlc3RUb2tlblNlY3JldClcbiAgICAgIHRoaXMuYWNjZXNzVG9rZW5TZWNyZXQgPSByZXF1ZXN0VG9rZW5TZWNyZXQ7XG5cbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5fYnVpbGRIZWFkZXIoe1xuICAgICAgb2F1dGhfdG9rZW46IHF1ZXJ5Lm9hdXRoX3Rva2VuLFxuICAgICAgb2F1dGhfdmVyaWZpZXI6IHF1ZXJ5Lm9hdXRoX3ZlcmlmaWVyXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuX2NhbGwoJ1BPU1QnLCB0aGlzLl91cmxzLmFjY2Vzc1Rva2VuLCBoZWFkZXJzKTtcbiAgICBjb25zdCB0b2tlbnMgPSBxdWVyeXN0cmluZy5wYXJzZShyZXNwb25zZS5jb250ZW50KTtcblxuICAgIGlmICghIHRva2Vucy5vYXV0aF90b2tlbiB8fCAhIHRva2Vucy5vYXV0aF90b2tlbl9zZWNyZXQpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFwibWlzc2luZyBvYXV0aCB0b2tlbiBvciBzZWNyZXRcIik7XG4gICAgICAvLyBXZSBwcm92aWRlIHJlc3BvbnNlIG9ubHkgaWYgbm8gdG9rZW4gaXMgYXZhaWxhYmxlLCB3ZSBkbyBub3Qgd2FudCB0byBsZWFrIGFueSB0b2tlbnNcbiAgICAgIGlmICghIHRva2Vucy5vYXV0aF90b2tlbiAmJiAhIHRva2Vucy5vYXV0aF90b2tlbl9zZWNyZXQpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlcnJvciwge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2Vucy5vYXV0aF90b2tlbjtcbiAgICB0aGlzLmFjY2Vzc1Rva2VuU2VjcmV0ID0gdG9rZW5zLm9hdXRoX3Rva2VuX3NlY3JldDtcbiAgfVxuXG4gIGNhbGwobWV0aG9kLCB1cmwsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5fYnVpbGRIZWFkZXIoe1xuICAgICAgb2F1dGhfdG9rZW46IHRoaXMuYWNjZXNzVG9rZW5cbiAgICB9KTtcblxuICAgIGlmKCEgcGFyYW1zKSB7XG4gICAgICBwYXJhbXMgPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY2FsbChtZXRob2QsIHVybCwgaGVhZGVycywgcGFyYW1zLCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXQodXJsLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnR0VUJywgdXJsLCBwYXJhbXMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHBvc3QodXJsLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnUE9TVCcsIHVybCwgcGFyYW1zLCBjYWxsYmFjayk7XG4gIH1cblxuICBfYnVpbGRIZWFkZXIoaGVhZGVycykge1xuICAgIHJldHVybiB7XG4gICAgICBvYXV0aF9jb25zdW1lcl9rZXk6IHRoaXMuX2NvbmZpZy5jb25zdW1lcktleSxcbiAgICAgIG9hdXRoX25vbmNlOiBSYW5kb20uc2VjcmV0KCkucmVwbGFjZSgvXFxXL2csICcnKSxcbiAgICAgIG9hdXRoX3NpZ25hdHVyZV9tZXRob2Q6ICdITUFDLVNIQTEnLFxuICAgICAgb2F1dGhfdGltZXN0YW1wOiAobmV3IERhdGUoKS52YWx1ZU9mKCkvMTAwMCkudG9GaXhlZCgpLnRvU3RyaW5nKCksXG4gICAgICBvYXV0aF92ZXJzaW9uOiAnMS4wJyxcbiAgICAgIC4uLmhlYWRlcnMsXG4gICAgfVxuICB9XG5cbiAgX2dldFNpZ25hdHVyZShtZXRob2QsIHVybCwgcmF3SGVhZGVycywgYWNjZXNzVG9rZW5TZWNyZXQsIHBhcmFtcykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB0aGlzLl9lbmNvZGVIZWFkZXIoeyAuLi5yYXdIZWFkZXJzLCAuLi5wYXJhbXMgfSk7XG5cbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMoaGVhZGVycykubWFwKGtleSA9PiBgJHtrZXl9PSR7aGVhZGVyc1trZXldfWApXG4gICAgICAuc29ydCgpLmpvaW4oJyYnKTtcblxuICAgIGNvbnN0IHNpZ25hdHVyZUJhc2UgPSBbXG4gICAgICBtZXRob2QsXG4gICAgICB0aGlzLl9lbmNvZGVTdHJpbmcodXJsKSxcbiAgICAgIHRoaXMuX2VuY29kZVN0cmluZyhwYXJhbWV0ZXJzKVxuICAgIF0uam9pbignJicpO1xuXG4gICAgY29uc3Qgc2VjcmV0ID0gT0F1dGgub3BlblNlY3JldCh0aGlzLl9jb25maWcuc2VjcmV0KTtcblxuICAgIGxldCBzaWduaW5nS2V5ID0gYCR7dGhpcy5fZW5jb2RlU3RyaW5nKHNlY3JldCl9JmA7XG4gICAgaWYgKGFjY2Vzc1Rva2VuU2VjcmV0KVxuICAgICAgc2lnbmluZ0tleSArPSB0aGlzLl9lbmNvZGVTdHJpbmcoYWNjZXNzVG9rZW5TZWNyZXQpO1xuXG4gICAgcmV0dXJuIGNyeXB0by5jcmVhdGVIbWFjKCdTSEExJywgc2lnbmluZ0tleSkudXBkYXRlKHNpZ25hdHVyZUJhc2UpLmRpZ2VzdCgnYmFzZTY0Jyk7XG4gIH07XG5cbiAgX2NhbGwobWV0aG9kLCB1cmwsIGhlYWRlcnMgPSB7fSwgcGFyYW1zID0ge30sIGNhbGxiYWNrKSB7XG4gICAgLy8gYWxsIFVSTHMgdG8gYmUgZnVuY3Rpb25zIHRvIHN1cHBvcnQgcGFyYW1ldGVycy9jdXN0b21pemF0aW9uXG4gICAgaWYodHlwZW9mIHVybCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB1cmwgPSB1cmwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCBhbGwgcXVlcnkgc3RyaW5nIHBhcmFtZXRlcnMgZnJvbSB0aGUgcHJvdmlkZWQgVVJMXG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsTW9kdWxlLnBhcnNlKHVybCwgdHJ1ZSk7XG4gICAgLy8gTWVyZ2UgdGhlbSBpbiBhIHdheSB0aGF0IHBhcmFtcyBnaXZlbiB0byB0aGUgbWV0aG9kIGNhbGwgaGF2ZSBwcmVjZWRlbmNlXG4gICAgcGFyYW1zID0geyAuLi5wYXJzZWRVcmwucXVlcnksIC4uLnBhcmFtcyB9O1xuXG4gICAgLy8gUmVjb25zdHJ1Y3QgdGhlIFVSTCBiYWNrIHdpdGhvdXQgYW55IHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzXG4gICAgLy8gKHRoZXkgYXJlIG5vdyBpbiBwYXJhbXMpXG4gICAgcGFyc2VkVXJsLnF1ZXJ5ID0ge307XG4gICAgcGFyc2VkVXJsLnNlYXJjaCA9ICcnO1xuICAgIHVybCA9IHVybE1vZHVsZS5mb3JtYXQocGFyc2VkVXJsKTtcblxuICAgIC8vIEdldCB0aGUgc2lnbmF0dXJlXG4gICAgaGVhZGVycy5vYXV0aF9zaWduYXR1cmUgPVxuICAgICAgdGhpcy5fZ2V0U2lnbmF0dXJlKG1ldGhvZCwgdXJsLCBoZWFkZXJzLCB0aGlzLmFjY2Vzc1Rva2VuU2VjcmV0LCBwYXJhbXMpO1xuXG4gICAgLy8gTWFrZSBhIGF1dGhvcml6YXRpb24gc3RyaW5nIGFjY29yZGluZyB0byBvYXV0aDEgc3BlY1xuICAgIGNvbnN0IGF1dGhTdHJpbmcgPSB0aGlzLl9nZXRBdXRoSGVhZGVyU3RyaW5nKGhlYWRlcnMpO1xuXG4gICAgLy8gTWFrZSBzaWduZWQgcmVxdWVzdFxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IEhUVFAuY2FsbChtZXRob2QsIHVybCwge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBhdXRoU3RyaW5nXG4gICAgICAgIH1cbiAgICAgIH0sIGNhbGxiYWNrICYmICgoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghIGVycm9yKSB7XG4gICAgICAgICAgcmVzcG9uc2Uubm9uY2UgPSBoZWFkZXJzLm9hdXRoX25vbmNlO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCByZXNwb25zZSk7XG4gICAgICB9KSk7XG4gICAgICAvLyBXZSBzdG9yZSBub25jZSBzbyB0aGF0IEpXVHMgY2FuIGJlIHZhbGlkYXRlZFxuICAgICAgaWYgKHJlc3BvbnNlKVxuICAgICAgICByZXNwb25zZS5ub25jZSA9IGhlYWRlcnMub2F1dGhfbm9uY2U7XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgRmFpbGVkIHRvIHNlbmQgT0F1dGgxIHJlcXVlc3QgdG8gJHt1cmx9LiAke2Vyci5tZXNzYWdlfWApLFxuICAgICAgICAgICAgICAgICAgICAge3Jlc3BvbnNlOiBlcnIucmVzcG9uc2V9KTtcbiAgICB9XG4gIH07XG5cbiAgX2VuY29kZUhlYWRlcihoZWFkZXIpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoaGVhZGVyKS5yZWR1Y2UoKG1lbW8sIGtleSkgPT4ge1xuICAgICAgbWVtb1t0aGlzLl9lbmNvZGVTdHJpbmcoa2V5KV0gPSB0aGlzLl9lbmNvZGVTdHJpbmcoaGVhZGVyW2tleV0pO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfSwge30pO1xuICB9O1xuXG4gIF9lbmNvZGVTdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpXS9nLCBlc2NhcGUpLnJlcGxhY2UoL1xcKi9nLCBcIiUyQVwiKTtcbiAgfTtcblxuICBfZ2V0QXV0aEhlYWRlclN0cmluZyhoZWFkZXJzKSB7XG4gICAgcmV0dXJuICdPQXV0aCAnICsgIE9iamVjdC5rZXlzKGhlYWRlcnMpLm1hcChrZXkgPT5cbiAgICAgIGAke3RoaXMuX2VuY29kZVN0cmluZyhrZXkpfT1cIiR7dGhpcy5fZW5jb2RlU3RyaW5nKGhlYWRlcnNba2V5XSl9XCJgXG4gICAgKS5zb3J0KCkuam9pbignLCAnKTtcbiAgfTtcblxufTtcbiIsImltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7IE9BdXRoMUJpbmRpbmcgfSBmcm9tICcuL29hdXRoMV9iaW5kaW5nJztcblxuT0F1dGguX3F1ZXJ5UGFyYW1zV2l0aEF1dGhUb2tlblVybCA9IChhdXRoVXJsLCBvYXV0aEJpbmRpbmcsIHBhcmFtcyA9IHt9LCB3aGl0ZWxpc3RlZFF1ZXJ5UGFyYW1zID0gW10pID0+IHtcbiAgY29uc3QgcmVkaXJlY3RVcmxPYmogPSB1cmwucGFyc2UoYXV0aFVybCwgdHJ1ZSk7XG5cbiAgT2JqZWN0LmFzc2lnbihcbiAgICByZWRpcmVjdFVybE9iai5xdWVyeSxcbiAgICB3aGl0ZWxpc3RlZFF1ZXJ5UGFyYW1zLnJlZHVjZSgocHJldiwgcGFyYW0pID0+IFxuICAgICAgcGFyYW1zLnF1ZXJ5W3BhcmFtXSA/IHsgLi4ucHJldiwgcGFyYW06IHBhcmFtcy5xdWVyeVtwYXJhbV0gfSA6IHByZXYsXG4gICAgICB7fVxuICAgICksXG4gICAge1xuICAgICAgb2F1dGhfdG9rZW46IG9hdXRoQmluZGluZy5yZXF1ZXN0VG9rZW4sXG4gICAgfVxuICApO1xuXG4gIC8vIENsZWFyIHRoZSBgc2VhcmNoYCBzbyBpdCBpcyByZWJ1aWx0IGJ5IE5vZGUncyBgdXJsYCBmcm9tIHRoZSBgcXVlcnlgIGFib3ZlLlxuICAvLyBVc2luZyBwcmV2aW91cyB2ZXJzaW9ucyBvZiB0aGUgTm9kZSBgdXJsYCBtb2R1bGUsIHRoaXMgd2FzIGp1c3Qgc2V0IHRvIFwiXCJcbiAgLy8gSG93ZXZlciwgTm9kZSA2IGRvY3Mgc2VlbSB0byBpbmRpY2F0ZSB0aGF0IHRoaXMgc2hvdWxkIGJlIGB1bmRlZmluZWRgLlxuICBkZWxldGUgcmVkaXJlY3RVcmxPYmouc2VhcmNoO1xuXG4gIC8vIFJlY29uc3RydWN0IHRoZSBVUkwgYmFjayB3aXRoIHByb3ZpZGVkIHF1ZXJ5IHBhcmFtZXRlcnMgbWVyZ2VkIHdpdGggb2F1dGhfdG9rZW5cbiAgcmV0dXJuIHVybC5mb3JtYXQocmVkaXJlY3RVcmxPYmopO1xufTtcblxuLy8gY29ubmVjdCBtaWRkbGV3YXJlXG5PQXV0aC5fcmVxdWVzdEhhbmRsZXJzWycxJ10gPSAoc2VydmljZSwgcXVlcnksIHJlcykgPT4ge1xuICBjb25zdCBjb25maWcgPSBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiBzZXJ2aWNlLnNlcnZpY2VOYW1lfSk7XG4gIGlmICghIGNvbmZpZykge1xuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcihzZXJ2aWNlLnNlcnZpY2VOYW1lKTtcbiAgfVxuXG4gIGNvbnN0IHsgdXJscyB9ID0gc2VydmljZTtcbiAgY29uc3Qgb2F1dGhCaW5kaW5nID0gbmV3IE9BdXRoMUJpbmRpbmcoY29uZmlnLCB1cmxzKTtcblxuICBsZXQgY3JlZGVudGlhbFNlY3JldDtcblxuICBpZiAocXVlcnkucmVxdWVzdFRva2VuQW5kUmVkaXJlY3QpIHtcbiAgICAvLyBzdGVwIDEgLSBnZXQgYW5kIHN0b3JlIGEgcmVxdWVzdCB0b2tlblxuICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gT0F1dGguX3JlZGlyZWN0VXJpKHNlcnZpY2Uuc2VydmljZU5hbWUsIGNvbmZpZywge1xuICAgICAgc3RhdGU6IHF1ZXJ5LnN0YXRlLFxuICAgICAgY29yZG92YTogKHF1ZXJ5LmNvcmRvdmEgPT09IFwidHJ1ZVwiKSxcbiAgICAgIGFuZHJvaWQ6IChxdWVyeS5hbmRyb2lkID09PSBcInRydWVcIilcbiAgICB9KTtcblxuICAgIC8vIEdldCBhIHJlcXVlc3QgdG9rZW4gdG8gc3RhcnQgYXV0aCBwcm9jZXNzXG4gICAgb2F1dGhCaW5kaW5nLnByZXBhcmVSZXF1ZXN0VG9rZW4oY2FsbGJhY2tVcmwpO1xuXG4gICAgLy8gS2VlcCB0cmFjayBvZiByZXF1ZXN0IHRva2VuIHNvIHdlIGNhbiB2ZXJpZnkgaXQgb24gdGhlIG5leHQgc3RlcFxuICAgIE9BdXRoLl9zdG9yZVJlcXVlc3RUb2tlbihcbiAgICAgIE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocXVlcnkpLFxuICAgICAgb2F1dGhCaW5kaW5nLnJlcXVlc3RUb2tlbixcbiAgICAgIG9hdXRoQmluZGluZy5yZXF1ZXN0VG9rZW5TZWNyZXQpO1xuXG4gICAgLy8gc3VwcG9ydCBmb3Igc2NvcGUvbmFtZSBwYXJhbWV0ZXJzXG4gICAgbGV0IHJlZGlyZWN0VXJsO1xuICAgIGNvbnN0IGF1dGhQYXJhbXMgPSB7IHF1ZXJ5IH07XG5cbiAgICBpZih0eXBlb2YgdXJscy5hdXRoZW50aWNhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmVkaXJlY3RVcmwgPSB1cmxzLmF1dGhlbnRpY2F0ZShvYXV0aEJpbmRpbmcsIGF1dGhQYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWRpcmVjdFVybCA9IE9BdXRoLl9xdWVyeVBhcmFtc1dpdGhBdXRoVG9rZW5VcmwoXG4gICAgICAgIHVybHMuYXV0aGVudGljYXRlLFxuICAgICAgICBvYXV0aEJpbmRpbmcsXG4gICAgICAgIGF1dGhQYXJhbXNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gcmVkaXJlY3QgdG8gcHJvdmlkZXIgbG9naW4sIHdoaWNoIHdpbGwgcmVkaXJlY3QgYmFjayB0byBcInN0ZXAgMlwiIGJlbG93XG5cbiAgICByZXMud3JpdGVIZWFkKDMwMiwgeydMb2NhdGlvbic6IHJlZGlyZWN0VXJsfSk7XG4gICAgcmVzLmVuZCgpO1xuICB9IGVsc2Uge1xuICAgIC8vIHN0ZXAgMiwgcmVkaXJlY3RlZCBmcm9tIHByb3ZpZGVyIGxvZ2luIC0gc3RvcmUgdGhlIHJlc3VsdFxuICAgIC8vIGFuZCBjbG9zZSB0aGUgd2luZG93IHRvIGFsbG93IHRoZSBsb2dpbiBoYW5kbGVyIHRvIHByb2NlZWRcblxuICAgIC8vIEdldCB0aGUgdXNlcidzIHJlcXVlc3QgdG9rZW4gc28gd2UgY2FuIHZlcmlmeSBpdCBhbmQgY2xlYXIgaXRcbiAgICBjb25zdCByZXF1ZXN0VG9rZW5JbmZvID0gT0F1dGguX3JldHJpZXZlUmVxdWVzdFRva2VuKFxuICAgICAgT0F1dGguX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeShxdWVyeSkpO1xuXG4gICAgaWYgKCEgcmVxdWVzdFRva2VuSW5mbykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIHJlcXVlc3QgdG9rZW5cIik7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHVzZXIgYXV0aG9yaXplZCBhY2Nlc3MgYW5kIHRoZSBvYXV0aF90b2tlbiBtYXRjaGVzXG4gICAgLy8gdGhlIHJlcXVlc3RUb2tlbiBmcm9tIHByZXZpb3VzIHN0ZXBcbiAgICBpZiAocXVlcnkub2F1dGhfdG9rZW4gJiYgcXVlcnkub2F1dGhfdG9rZW4gPT09IHJlcXVlc3RUb2tlbkluZm8ucmVxdWVzdFRva2VuKSB7XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIGxvZ2luIHJlc3VsdHMgYmVmb3JlIHJldHVybmluZy4gIFRoaXMgd2F5IHRoZVxuICAgICAgLy8gc3Vic2VxdWVudCBjYWxsIHRvIHRoZSBgbG9naW5gIG1ldGhvZCB3aWxsIGJlIGltbWVkaWF0ZS5cblxuICAgICAgLy8gR2V0IHRoZSBhY2Nlc3MgdG9rZW4gZm9yIHNpZ25pbmcgcmVxdWVzdHNcbiAgICAgIG9hdXRoQmluZGluZy5wcmVwYXJlQWNjZXNzVG9rZW4ocXVlcnksIHJlcXVlc3RUb2tlbkluZm8ucmVxdWVzdFRva2VuU2VjcmV0KTtcblxuICAgICAgLy8gUnVuIHNlcnZpY2Utc3BlY2lmaWMgaGFuZGxlci5cbiAgICAgIGNvbnN0IG9hdXRoUmVzdWx0ID0gc2VydmljZS5oYW5kbGVPYXV0aFJlcXVlc3QoXG4gICAgICAgIG9hdXRoQmluZGluZywgeyBxdWVyeTogcXVlcnkgfSk7XG5cbiAgICAgIGNvbnN0IGNyZWRlbnRpYWxUb2tlbiA9IE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocXVlcnkpO1xuICAgICAgY3JlZGVudGlhbFNlY3JldCA9IFJhbmRvbS5zZWNyZXQoKTtcblxuICAgICAgLy8gU3RvcmUgdGhlIGxvZ2luIHJlc3VsdCBzbyBpdCBjYW4gYmUgcmV0cmlldmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGJyb3dzZXIgdGFiIGJ5IHRoZSByZXN1bHQgaGFuZGxlclxuICAgICAgT0F1dGguX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCB7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBzZXJ2aWNlLnNlcnZpY2VOYW1lLFxuICAgICAgICBzZXJ2aWNlRGF0YTogb2F1dGhSZXN1bHQuc2VydmljZURhdGEsXG4gICAgICAgIG9wdGlvbnM6IG9hdXRoUmVzdWx0Lm9wdGlvbnNcbiAgICAgIH0sIGNyZWRlbnRpYWxTZWNyZXQpO1xuICAgIH1cblxuICAgIC8vIEVpdGhlciBjbG9zZSB0aGUgd2luZG93LCByZWRpcmVjdCwgb3IgcmVuZGVyIG5vdGhpbmdcbiAgICAvLyBpZiBhbGwgZWxzZSBmYWlsc1xuICAgIE9BdXRoLl9yZW5kZXJPYXV0aFJlc3VsdHMocmVzLCBxdWVyeSwgY3JlZGVudGlhbFNlY3JldCk7XG4gIH1cbn07XG4iLCIvL1xuLy8gX3BlbmRpbmdSZXF1ZXN0VG9rZW5zIGFyZSByZXF1ZXN0IHRva2VucyB0aGF0IGhhdmUgYmVlbiByZWNlaXZlZFxuLy8gYnV0IG5vdCB5ZXQgZnVsbHkgYXV0aG9yaXplZCAocHJvY2Vzc2VkKS5cbi8vXG4vLyBEdXJpbmcgdGhlIG9hdXRoMSBhdXRob3JpemF0aW9uIHByb2Nlc3MsIHRoZSBNZXRlb3IgQXBwIG9wZW5zXG4vLyBhIHBvcC11cCwgcmVxdWVzdHMgYSByZXF1ZXN0IHRva2VuIGZyb20gdGhlIG9hdXRoMSBzZXJ2aWNlLCBhbmRcbi8vIHJlZGlyZWN0cyB0aGUgYnJvd3NlciB0byB0aGUgb2F1dGgxIHNlcnZpY2UgZm9yIHRoZSB1c2VyXG4vLyB0byBncmFudCBhdXRob3JpemF0aW9uLiAgVGhlIHVzZXIgaXMgdGhlbiByZXR1cm5lZCB0byB0aGVcbi8vIE1ldGVvciBBcHBzJyBjYWxsYmFjayB1cmwgYW5kIHRoZSByZXF1ZXN0IHRva2VuIGlzIHZlcmlmaWVkLlxuLy9cbi8vIFdoZW4gTWV0ZW9yIEFwcHMgcnVuIG9uIG11bHRpcGxlIHNlcnZlcnMsIGl0J3MgcG9zc2libGUgdGhhdFxuLy8gMiBkaWZmZXJlbnQgc2VydmVycyBtYXkgYmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcmVxdWVzdCB0b2tlblxuLy8gYW5kIHRvIHZlcmlmeSBpdCBpbiB0aGUgY2FsbGJhY2sgb25jZSB0aGUgdXNlciBoYXMgYXV0aG9yaXplZC5cbi8vXG4vLyBGb3IgdGhpcyByZWFzb24sIHRoZSBfcGVuZGluZ1JlcXVlc3RUb2tlbnMgYXJlIHN0b3JlZCBpbiB0aGUgZGF0YWJhc2Vcbi8vIHNvIHRoZXkgY2FuIGJlIHNoYXJlZCBhY3Jvc3MgTWV0ZW9yIEFwcCBzZXJ2ZXJzLlxuLy9cbi8vIFhYWCBUaGlzIGNvZGUgaXMgZmFpcmx5IHNpbWlsYXIgdG8gb2F1dGgvcGVuZGluZ19jcmVkZW50aWFscy5qcyAtLVxuLy8gbWF5YmUgd2UgY2FuIGNvbWJpbmUgdGhlbSBzb21laG93LlxuXG4vLyBDb2xsZWN0aW9uIGNvbnRhaW5pbmcgcGVuZGluZyByZXF1ZXN0IHRva2Vuc1xuLy8gSGFzIGtleSwgcmVxdWVzdFRva2VuLCByZXF1ZXN0VG9rZW5TZWNyZXQsIGFuZCBjcmVhdGVkQXQgZmllbGRzLlxuT0F1dGguX3BlbmRpbmdSZXF1ZXN0VG9rZW5zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXG4gIFwibWV0ZW9yX29hdXRoX3BlbmRpbmdSZXF1ZXN0VG9rZW5zXCIsIHtcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlXG4gIH0pO1xuXG5PQXV0aC5fcGVuZGluZ1JlcXVlc3RUb2tlbnMuX2Vuc3VyZUluZGV4KCdrZXknLCB7IHVuaXF1ZTogdHJ1ZSB9KTtcbk9BdXRoLl9wZW5kaW5nUmVxdWVzdFRva2Vucy5fZW5zdXJlSW5kZXgoJ2NyZWF0ZWRBdCcpO1xuXG5cblxuLy8gUGVyaW9kaWNhbGx5IGNsZWFyIG9sZCBlbnRyaWVzIHRoYXQgbmV2ZXIgZ290IGNvbXBsZXRlZFxuY29uc3QgX2NsZWFuU3RhbGVSZXN1bHRzID0gKCkgPT4ge1xuICAvLyBSZW1vdmUgcmVxdWVzdCB0b2tlbnMgb2xkZXIgdGhhbiA1IG1pbnV0ZVxuICBjb25zdCB0aW1lQ3V0b2ZmID0gbmV3IERhdGUoKTtcbiAgdGltZUN1dG9mZi5zZXRNaW51dGVzKHRpbWVDdXRvZmYuZ2V0TWludXRlcygpIC0gNSk7XG4gIE9BdXRoLl9wZW5kaW5nUmVxdWVzdFRva2Vucy5yZW1vdmUoeyBjcmVhdGVkQXQ6IHsgJGx0OiB0aW1lQ3V0b2ZmIH0gfSk7XG59O1xuY29uc3QgX2NsZWFudXBIYW5kbGUgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoX2NsZWFuU3RhbGVSZXN1bHRzLCA2MCAqIDEwMDApO1xuXG5cbi8vIFN0b3JlcyB0aGUga2V5IGFuZCByZXF1ZXN0IHRva2VuIGluIHRoZSBfcGVuZGluZ1JlcXVlc3RUb2tlbnMgY29sbGVjdGlvbi5cbi8vIFdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGBrZXlgIGlzIG5vdCBhIHN0cmluZy5cbi8vXG4vLyBAcGFyYW0ga2V5IHtzdHJpbmd9XG4vLyBAcGFyYW0gcmVxdWVzdFRva2VuIHtzdHJpbmd9XG4vLyBAcGFyYW0gcmVxdWVzdFRva2VuU2VjcmV0IHtzdHJpbmd9XG4vL1xuT0F1dGguX3N0b3JlUmVxdWVzdFRva2VuID0gKGtleSwgcmVxdWVzdFRva2VuLCByZXF1ZXN0VG9rZW5TZWNyZXQpID0+IHtcbiAgY2hlY2soa2V5LCBTdHJpbmcpO1xuXG4gIC8vIFdlIGRvIGFuIHVwc2VydCBoZXJlIGluc3RlYWQgb2YgYW4gaW5zZXJ0IGluIGNhc2UgdGhlIHVzZXIgaGFwcGVuc1xuICAvLyB0byBzb21laG93IHNlbmQgdGhlIHNhbWUgYHN0YXRlYCBwYXJhbWV0ZXIgdHdpY2UgZHVyaW5nIGFuIE9BdXRoXG4gIC8vIGxvZ2luOyB3ZSBkb24ndCB3YW50IGEgZHVwbGljYXRlIGtleSBlcnJvci5cbiAgT0F1dGguX3BlbmRpbmdSZXF1ZXN0VG9rZW5zLnVwc2VydCh7XG4gICAga2V5LFxuICB9LCB7XG4gICAga2V5LFxuICAgIHJlcXVlc3RUb2tlbjogT0F1dGguc2VhbFNlY3JldChyZXF1ZXN0VG9rZW4pLFxuICAgIHJlcXVlc3RUb2tlblNlY3JldDogT0F1dGguc2VhbFNlY3JldChyZXF1ZXN0VG9rZW5TZWNyZXQpLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKVxuICB9KTtcbn07XG5cblxuLy8gUmV0cmlldmVzIGFuZCByZW1vdmVzIGEgcmVxdWVzdCB0b2tlbiBmcm9tIHRoZSBfcGVuZGluZ1JlcXVlc3RUb2tlbnMgY29sbGVjdGlvblxuLy8gUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyByZXF1ZXN0VG9rZW4gYW5kIHJlcXVlc3RUb2tlblNlY3JldCBwcm9wZXJ0aWVzXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy9cbk9BdXRoLl9yZXRyaWV2ZVJlcXVlc3RUb2tlbiA9IGtleSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICBjb25zdCBwZW5kaW5nUmVxdWVzdFRva2VuID0gT0F1dGguX3BlbmRpbmdSZXF1ZXN0VG9rZW5zLmZpbmRPbmUoeyBrZXk6IGtleSB9KTtcbiAgaWYgKHBlbmRpbmdSZXF1ZXN0VG9rZW4pIHtcbiAgICBPQXV0aC5fcGVuZGluZ1JlcXVlc3RUb2tlbnMucmVtb3ZlKHsgX2lkOiBwZW5kaW5nUmVxdWVzdFRva2VuLl9pZCB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWVzdFRva2VuOiBPQXV0aC5vcGVuU2VjcmV0KHBlbmRpbmdSZXF1ZXN0VG9rZW4ucmVxdWVzdFRva2VuKSxcbiAgICAgIHJlcXVlc3RUb2tlblNlY3JldDogT0F1dGgub3BlblNlY3JldChcbiAgICAgICAgcGVuZGluZ1JlcXVlc3RUb2tlbi5yZXF1ZXN0VG9rZW5TZWNyZXQpXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59O1xuIl19
