(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var __coffeescriptShare, OAuth2Server;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/rocketchat_oauth2-server/model.coffee.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var AccessTokens, AuthCodes, Clients, Model, RefreshTokens, debug;

AccessTokens = void 0;

RefreshTokens = void 0;

Clients = void 0;

AuthCodes = void 0;

debug = void 0;

this.Model = Model = (function() {
  function Model(config) {
    if (config == null) {
      config = {};
    }
    if (config.accessTokensCollectionName == null) {
      config.accessTokensCollectionName = 'oauth_access_tokens';
    }
    if (config.refreshTokensCollectionName == null) {
      config.refreshTokensCollectionName = 'oauth_refresh_tokens';
    }
    if (config.clientsCollectionName == null) {
      config.clientsCollectionName = 'oauth_clients';
    }
    if (config.authCodesCollectionName == null) {
      config.authCodesCollectionName = 'oauth_auth_codes';
    }
    this.debug = debug = config.debug;
    this.AccessTokens = AccessTokens = config.accessTokensCollection || new Meteor.Collection(config.accessTokensCollectionName);
    this.RefreshTokens = RefreshTokens = config.refreshTokensCollection || new Meteor.Collection(config.refreshTokensCollectionName);
    this.Clients = Clients = config.clientsCollection || new Meteor.Collection(config.clientsCollectionName);
    this.AuthCodes = AuthCodes = config.authCodesCollection || new Meteor.Collection(config.authCodesCollectionName);
  }

  Model.prototype.getAccessToken = Meteor.bindEnvironment(function(bearerToken, callback) {
    var e, token;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in getAccessToken (bearerToken:', bearerToken, ')');
    }
    try {
      token = AccessTokens.findOne({
        accessToken: bearerToken
      });
      return callback(null, token);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.getClient = Meteor.bindEnvironment(function(clientId, clientSecret, callback) {
    var client, e;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in getClient (clientId:', clientId, ', clientSecret:', clientSecret, ')');
    }
    try {
      if (clientSecret == null) {
        client = Clients.findOne({
          active: true,
          clientId: clientId
        });
      } else {
        client = Clients.findOne({
          active: true,
          clientId: clientId,
          clientSecret: clientSecret
        });
      }
      return callback(null, client);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.grantTypeAllowed = function(clientId, grantType, callback) {
    if (debug === true) {
      console.log('[OAuth2Server]', 'in grantTypeAllowed (clientId:', clientId, ', grantType:', grantType + ')');
    }
    return callback(false, grantType === 'authorization_code' || grantType === 'refresh_token');
  };

  Model.prototype.saveAccessToken = Meteor.bindEnvironment(function(token, clientId, expires, user, callback) {
    var e, tokenId;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in saveAccessToken (token:', token, ', clientId:', clientId, ', user:', user, ', expires:', expires, ')');
    }
    try {
      tokenId = AccessTokens.insert({
        accessToken: token,
        clientId: clientId,
        userId: user.id,
        expires: expires
      });
      return callback(null, tokenId);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.getAuthCode = Meteor.bindEnvironment(function(authCode, callback) {
    var code, e;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in getAuthCode (authCode: ' + authCode + ')');
    }
    try {
      code = AuthCodes.findOne({
        authCode: authCode
      });
      return callback(null, code);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.saveAuthCode = Meteor.bindEnvironment(function(code, clientId, expires, user, callback) {
    var codeId, e;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in saveAuthCode (code:', code, ', clientId:', clientId, ', expires:', expires, ', user:', user, ')');
    }
    try {
      codeId = AuthCodes.upsert({
        authCode: code
      }, {
        authCode: code,
        clientId: clientId,
        userId: user.id,
        expires: expires
      });
      return callback(null, codeId);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.saveRefreshToken = Meteor.bindEnvironment(function(token, clientId, expires, user, callback) {
    var e, tokenId;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in saveRefreshToken (token:', token, ', clientId:', clientId, ', user:', user, ', expires:', expires, ')');
    }
    try {
      return tokenId = RefreshTokens.insert({
        refreshToken: token,
        clientId: clientId,
        userId: user.id,
        expires: expires
      }, callback(null, tokenId));
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  Model.prototype.getRefreshToken = Meteor.bindEnvironment(function(refreshToken, callback) {
    var e, token;
    if (debug === true) {
      console.log('[OAuth2Server]', 'in getRefreshToken (refreshToken: ' + refreshToken + ')');
    }
    try {
      token = RefreshTokens.findOne({
        refreshToken: refreshToken
      });
      return callback(null, token);
    } catch (_error) {
      e = _error;
      return callback(e);
    }
  });

  return Model;

})();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/rocketchat_oauth2-server/oauth.coffee.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var express, oauthserver;              

oauthserver = Npm.require('oauth2-server');

express = Npm.require('express');

OAuth2Server = (function() {
  function OAuth2Server(config) {
    this.config = config != null ? config : {};
    this.app = express();
    this.routes = express();
    this.model = new Model(this.config);
    this.oauth = oauthserver({
      model: this.model,
      grants: ['authorization_code', 'refresh_token'],
      debug: this.config.debug
    });
    this.publishAuhorizedClients();
    this.initRoutes();
    return this;
  }

  OAuth2Server.prototype.publishAuhorizedClients = function() {
    return Meteor.publish('authorizedOAuth', function() {
      if (this.userId == null) {
        return this.ready();
      }
      return Meteor.users.find({
        _id: this.userId
      }, {
        fields: {
          'oauth.authorizedClients': 1
        }
      });
      return typeof user !== "undefined" && user !== null;
    });
  };

  OAuth2Server.prototype.initRoutes = function() {
    var debugMiddleware, self, transformRequestsNotUsingFormUrlencodedType;
    self = this;
    debugMiddleware = function(req, res, next) {
      if (self.config.debug === true) {
        console.log('[OAuth2Server]', req.method, req.url);
      }
      return next();
    };
    transformRequestsNotUsingFormUrlencodedType = function(req, res, next) {
      if (!req.is('application/x-www-form-urlencoded') && req.method === 'POST') {
        if (self.config.debug === true) {
          console.log('[OAuth2Server]', 'Transforming a request to form-urlencoded with the query going to the body.');
        }
        req.headers['content-type'] = 'application/x-www-form-urlencoded';
        req.body = Object.assign({}, req.body, req.query);
      }
      return next();
    };
    this.app.all('/oauth/token', debugMiddleware, transformRequestsNotUsingFormUrlencodedType, this.oauth.grant());
    this.app.get('/oauth/authorize', debugMiddleware, Meteor.bindEnvironment(function(req, res, next) {
      var client;
      client = self.model.Clients.findOne({
        active: true,
        clientId: req.query.client_id
      });
      if (client == null) {
        return res.redirect('/oauth/error/404');
      }
      if (![].concat(client.redirectUri).includes(req.query.redirect_uri)) {
        return res.redirect('/oauth/error/invalid_redirect_uri');
      }
      return next();
    }));
    this.app.post('/oauth/authorize', debugMiddleware, Meteor.bindEnvironment(function(req, res, next) {
      var user;
      if (req.body.token == null) {
        return res.sendStatus(401).send('No token');
      }
      user = Meteor.users.findOne({
        'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(req.body.token)
      });
      if (user == null) {
        return res.sendStatus(401).send('Invalid token');
      }
      req.user = {
        id: user._id
      };
      return next();
    }));
    this.app.post('/oauth/authorize', debugMiddleware, this.oauth.authCodeGrant(function(req, next) {
      if (req.body.allow === 'yes') {
        Meteor.users.update(req.user.id, {
          $addToSet: {
            'oauth.authorizedClients': this.clientId
          }
        });
      }
      return next(null, req.body.allow === 'yes', req.user);
    }));
    this.app.use(this.routes);
    return this.app.all('/oauth/*', this.oauth.errorHandler());
  };

  return OAuth2Server;

})();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("rocketchat:oauth2-server", {
  OAuth2Server: OAuth2Server
});

})();

//# sourceURL=meteor://💻app/packages/rocketchat_oauth2-server.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdF9vYXV0aDItc2VydmVyL21vZGVsLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdF9vYXV0aDItc2VydmVyL29hdXRoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQUEsZUFBZSxNQUFmOztBQUFBLGFBQ0EsR0FBZ0IsTUFEaEI7O0FBQUEsT0FFQSxHQUFVLE1BRlY7O0FBQUEsU0FHQSxHQUFZLE1BSFo7O0FBQUEsS0FJQSxHQUFRLE1BSlI7O0FBQUEsSUFNQyxNQUFELEdBQWU7QUFDRCxpQkFBQyxNQUFEOztNQUFDLFNBQU87S0FDcEI7O01BQUEsTUFBTSxDQUFDLDZCQUE4QjtLQUFyQzs7TUFDQSxNQUFNLENBQUMsOEJBQStCO0tBRHRDOztNQUVBLE1BQU0sQ0FBQyx3QkFBeUI7S0FGaEM7O01BR0EsTUFBTSxDQUFDLDBCQUEyQjtLQUhsQztBQUFBLElBS0EsSUFBQyxNQUFELEdBQVMsUUFBUSxNQUFNLENBQUMsS0FMeEI7QUFBQSxJQU9BLElBQUMsYUFBRCxHQUFnQixlQUFlLE1BQU0sQ0FBQyxzQkFBUCxJQUFxQyxVQUFNLENBQUMsVUFBUCxDQUFrQixNQUFNLENBQUMsMEJBQXpCLENBUHBFO0FBQUEsSUFRQSxJQUFDLGNBQUQsR0FBaUIsZ0JBQWdCLE1BQU0sQ0FBQyx1QkFBUCxJQUFzQyxVQUFNLENBQUMsVUFBUCxDQUFrQixNQUFNLENBQUMsMkJBQXpCLENBUnZFO0FBQUEsSUFTQSxJQUFDLFFBQUQsR0FBVyxVQUFVLE1BQU0sQ0FBQyxpQkFBUCxJQUFnQyxVQUFNLENBQUMsVUFBUCxDQUFrQixNQUFNLENBQUMscUJBQXpCLENBVHJEO0FBQUEsSUFVQSxJQUFDLFVBQUQsR0FBYSxZQUFZLE1BQU0sQ0FBQyxtQkFBUCxJQUFrQyxVQUFNLENBQUMsVUFBUCxDQUFrQixNQUFNLENBQUMsdUJB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QVAsRUFBckIsRUFyRFc7RUFBQSxDQWhDWjs7c0JBQUE7O0lBUkQiLCJmaWxlIjoiL3BhY2thZ2VzL3JvY2tldGNoYXRfb2F1dGgyLXNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIkFjY2Vzc1Rva2VucyA9IHVuZGVmaW5lZFxuUmVmcmVzaFRva2VucyA9IHVuZGVmaW5lZFxuQ2xpZW50cyA9IHVuZGVmaW5lZFxuQXV0aENvZGVzID0gdW5kZWZpbmVkXG5kZWJ1ZyA9IHVuZGVmaW5lZFxuXG5ATW9kZWwgPSBjbGFzcyBNb2RlbFxuXHRjb25zdHJ1Y3RvcjogKGNvbmZpZz17fSkgLT5cblx0XHRjb25maWcuYWNjZXNzVG9rZW5zQ29sbGVjdGlvbk5hbWUgPz0gJ29hdXRoX2FjY2Vzc190b2tlbnMnXG5cdFx0Y29uZmlnLnJlZnJlc2hUb2tlbnNDb2xsZWN0aW9uTmFtZSA/PSAnb2F1dGhfcmVmcmVzaF90b2tlbnMnXG5cdFx0Y29uZmlnLmNsaWVudHNDb2xsZWN0aW9uTmFtZSA/PSAnb2F1dGhfY2xpZW50cydcblx0XHRjb25maWcuYXV0aENvZGVzQ29sbGVjdGlvbk5hbWUgPz0gJ29hdXRoX2F1dGhfY29kZXMnXG5cblx0XHRAZGVidWcgPSBkZWJ1ZyA9IGNvbmZpZy5kZWJ1Z1xuXG5cdFx0QEFjY2Vzc1Rva2VucyA9IEFjY2Vzc1Rva2VucyA9IGNvbmZpZy5hY2Nlc3NUb2tlbnNDb2xsZWN0aW9uIG9yIG5ldyBNZXRlb3IuQ29sbGVjdGlvbiBjb25maWcuYWNjZXNzVG9rZW5zQ29sbGVjdGlvbk5hbWVcblx0XHRAUmVmcmVzaFRva2VucyA9IFJlZnJlc2hUb2tlbnMgPSBjb25maWcucmVmcmVzaFRva2Vuc0NvbGxlY3Rpb24gb3IgbmV3IE1ldGVvci5Db2xsZWN0aW9uIGNvbmZpZy5yZWZyZXNoVG9rZW5zQ29sbGVjdGlvbk5hbWVcblx0XHRAQ2xpZW50cyA9IENsaWVudHMgPSBjb25maWcuY2xpZW50c0NvbGxlY3Rpb24gb3IgbmV3IE1ldGVvci5Db2xsZWN0aW9uIGNvbmZpZy5jbGllbnRzQ29sbGVjdGlvbk5hbWVcblx0XHRAQXV0aENvZGVzID0gQXV0aENvZGVzID0gY29uZmlnLmF1dGhDb2Rlc0NvbGxlY3Rpb24gb3IgbmV3IE1ldGVvci5Db2xsZWN0aW9uIGNvbmZpZy5hdXRoQ29kZXNDb2xsZWN0aW9uTmFtZVxuXG5cblx0Z2V0QWNjZXNzVG9rZW46IE1ldGVvci5iaW5kRW52aXJvbm1lbnQgKGJlYXJlclRva2VuLCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gZ2V0QWNjZXNzVG9rZW4gKGJlYXJlclRva2VuOicsIGJlYXJlclRva2VuLCAnKSdcblxuXHRcdHRyeVxuXHRcdFx0dG9rZW4gPSBBY2Nlc3NUb2tlbnMuZmluZE9uZSBhY2Nlc3NUb2tlbjogYmVhcmVyVG9rZW5cblx0XHRcdGNhbGxiYWNrIG51bGwsIHRva2VuXG5cdFx0Y2F0Y2ggZVxuXHRcdFx0Y2FsbGJhY2sgZVxuXG5cblx0Z2V0Q2xpZW50OiBNZXRlb3IuYmluZEVudmlyb25tZW50IChjbGllbnRJZCwgY2xpZW50U2VjcmV0LCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gZ2V0Q2xpZW50IChjbGllbnRJZDonLCBjbGllbnRJZCwgJywgY2xpZW50U2VjcmV0OicsIGNsaWVudFNlY3JldCwgJyknXG5cblx0XHR0cnlcblx0XHRcdGlmIG5vdCBjbGllbnRTZWNyZXQ/XG5cdFx0XHRcdGNsaWVudCA9IENsaWVudHMuZmluZE9uZSB7IGFjdGl2ZTogdHJ1ZSwgY2xpZW50SWQ6IGNsaWVudElkIH1cblx0XHRcdGVsc2Vcblx0XHRcdFx0Y2xpZW50ID0gQ2xpZW50cy5maW5kT25lIHsgYWN0aXZlOiB0cnVlLCBjbGllbnRJZDogY2xpZW50SWQsIGNsaWVudFNlY3JldDogY2xpZW50U2VjcmV0IH1cblx0XHRcdGNhbGxiYWNrIG51bGwsIGNsaWVudFxuXHRcdGNhdGNoIGVcblx0XHRcdGNhbGxiYWNrIGVcblxuXG5cdGdyYW50VHlwZUFsbG93ZWQ6IChjbGllbnRJZCwgZ3JhbnRUeXBlLCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gZ3JhbnRUeXBlQWxsb3dlZCAoY2xpZW50SWQ6JywgY2xpZW50SWQsICcsIGdyYW50VHlwZTonLCBncmFudFR5cGUgKyAnKSdcblxuXHRcdHJldHVybiBjYWxsYmFjayhmYWxzZSwgZ3JhbnRUeXBlIGluIFsnYXV0aG9yaXphdGlvbl9jb2RlJywgJ3JlZnJlc2hfdG9rZW4nXSlcblxuXG5cdHNhdmVBY2Nlc3NUb2tlbjogTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCAodG9rZW4sIGNsaWVudElkLCBleHBpcmVzLCB1c2VyLCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gc2F2ZUFjY2Vzc1Rva2VuICh0b2tlbjonLCB0b2tlbiwgJywgY2xpZW50SWQ6JywgY2xpZW50SWQsICcsIHVzZXI6JywgdXNlciwgJywgZXhwaXJlczonLCBleHBpcmVzLCAnKSdcblxuXHRcdHRyeVxuXHRcdFx0dG9rZW5JZCA9IEFjY2Vzc1Rva2Vucy5pbnNlcnRcblx0XHRcdFx0YWNjZXNzVG9rZW46IHRva2VuXG5cdFx0XHRcdGNsaWVudElkOiBjbGllbnRJZFxuXHRcdFx0XHR1c2VySWQ6IHVzZXIuaWRcblx0XHRcdFx0ZXhwaXJlczogZXhwaXJlc1xuXG5cdFx0XHRjYWxsYmFjayBudWxsLCB0b2tlbklkXG5cdFx0Y2F0Y2ggZVxuXHRcdFx0Y2FsbGJhY2sgZVxuXG5cblx0Z2V0QXV0aENvZGU6IE1ldGVvci5iaW5kRW52aXJvbm1lbnQgKGF1dGhDb2RlLCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gZ2V0QXV0aENvZGUgKGF1dGhDb2RlOiAnICsgYXV0aENvZGUgKyAnKSdcblxuXHRcdHRyeVxuXHRcdFx0Y29kZSA9IEF1dGhDb2Rlcy5maW5kT25lIGF1dGhDb2RlOiBhdXRoQ29kZVxuXHRcdFx0Y2FsbGJhY2sgbnVsbCwgY29kZVxuXHRcdGNhdGNoIGVcblx0XHRcdGNhbGxiYWNrIGVcblxuXG5cdHNhdmVBdXRoQ29kZTogTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCAoY29kZSwgY2xpZW50SWQsIGV4cGlyZXMsIHVzZXIsIGNhbGxiYWNrKSAtPlxuXHRcdGlmIGRlYnVnIGlzIHRydWVcblx0XHRcdGNvbnNvbGUubG9nICdbT0F1dGgyU2VydmVyXScsICdpbiBzYXZlQXV0aENvZGUgKGNvZGU6JywgY29kZSwgJywgY2xpZW50SWQ6JywgY2xpZW50SWQsICcsIGV4cGlyZXM6JywgZXhwaXJlcywgJywgdXNlcjonLCB1c2VyLCAnKSdcblxuXHRcdHRyeVxuXHRcdFx0Y29kZUlkID0gQXV0aENvZGVzLnVwc2VydFxuXHRcdFx0XHRhdXRoQ29kZTogY29kZVxuXHRcdFx0LFxuXHRcdFx0XHRhdXRoQ29kZTogY29kZVxuXHRcdFx0XHRjbGllbnRJZDogY2xpZW50SWRcblx0XHRcdFx0dXNlcklkOiB1c2VyLmlkXG5cdFx0XHRcdGV4cGlyZXM6IGV4cGlyZXNcblxuXHRcdFx0Y2FsbGJhY2sgbnVsbCwgY29kZUlkXG5cdFx0Y2F0Y2ggZVxuXHRcdFx0Y2FsbGJhY2sgZVxuXG5cblx0c2F2ZVJlZnJlc2hUb2tlbjogTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCAodG9rZW4sIGNsaWVudElkLCBleHBpcmVzLCB1c2VyLCBjYWxsYmFjaykgLT5cblx0XHRpZiBkZWJ1ZyBpcyB0cnVlXG5cdFx0XHRjb25zb2xlLmxvZyAnW09BdXRoMlNlcnZlcl0nLCAnaW4gc2F2ZVJlZnJlc2hUb2tlbiAodG9rZW46JywgdG9rZW4sICcsIGNsaWVudElkOicsIGNsaWVudElkLCAnLCB1c2VyOicsIHVzZXIsICcsIGV4cGlyZXM6JywgZXhwaXJlcywgJyknXG5cblx0XHR0cnlcblx0XHRcdHRva2VuSWQgPSBSZWZyZXNoVG9rZW5zLmluc2VydFxuXHRcdFx0XHRyZWZyZXNoVG9rZW46IHRva2VuXG5cdFx0XHRcdGNsaWVudElkOiBjbGllbnRJZFxuXHRcdFx0XHR1c2VySWQ6IHVzZXIuaWRcblx0XHRcdFx0ZXhwaXJlczogZXhwaXJlc1xuXG5cdFx0XHRcdGNhbGxiYWNrIG51bGwsIHRva2VuSWRcblx0XHRjYXRjaCBlXG5cdFx0XHRjYWxsYmFjayBlXG5cblxuXHRnZXRSZWZyZXNoVG9rZW46IE1ldGVvci5iaW5kRW52aXJvbm1lbnQgKHJlZnJlc2hUb2tlbiwgY2FsbGJhY2spIC0+XG5cdFx0aWYgZGVidWcgaXMgdHJ1ZVxuXHRcdFx0Y29uc29sZS5sb2cgJ1tPQXV0aDJTZXJ2ZXJdJywgJ2luIGdldFJlZnJlc2hUb2tlbiAocmVmcmVzaFRva2VuOiAnICsgcmVmcmVzaFRva2VuICsgJyknXG5cblx0XHR0cnlcblx0XHRcdHRva2VuID0gUmVmcmVzaFRva2Vucy5maW5kT25lIHJlZnJlc2hUb2tlbjogcmVmcmVzaFRva2VuXG5cdFx0XHRjYWxsYmFjayBudWxsLCB0b2tlblxuXHRcdGNhdGNoIGVcblx0XHRcdGNhbGxiYWNrIGVcbiIsIm9hdXRoc2VydmVyID0gTnBtLnJlcXVpcmUoJ29hdXRoMi1zZXJ2ZXInKVxuZXhwcmVzcyA9IE5wbS5yZXF1aXJlKCdleHByZXNzJylcblxuIyBXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnVzZSBhcHBcbiMgSnNvblJvdXRlcy5NaWRkbGV3YXJlLnVzZSBhcHBcblxuXG5jbGFzcyBPQXV0aDJTZXJ2ZXJcblx0Y29uc3RydWN0b3I6IChAY29uZmlnPXt9KSAtPlxuXHRcdEBhcHAgPSBleHByZXNzKClcblxuXHRcdEByb3V0ZXMgPSBleHByZXNzKClcblxuXHRcdEBtb2RlbCA9IG5ldyBNb2RlbChAY29uZmlnKVxuXG5cdFx0QG9hdXRoID0gb2F1dGhzZXJ2ZXJcblx0XHRcdG1vZGVsOiBAbW9kZWxcblx0XHRcdGdyYW50czogWydhdXRob3JpemF0aW9uX2NvZGUnLCAncmVmcmVzaF90b2tlbiddXG5cdFx0XHRkZWJ1ZzogQGNvbmZpZy5kZWJ1Z1xuXG5cdFx0QHB1Ymxpc2hBdWhvcml6ZWRDbGllbnRzKClcblx0XHRAaW5pdFJvdXRlcygpXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0cHVibGlzaEF1aG9yaXplZENsaWVudHM6IC0+XG5cdFx0TWV0ZW9yLnB1Ymxpc2ggJ2F1dGhvcml6ZWRPQXV0aCcsIC0+XG5cdFx0XHRcdGlmIG5vdCBAdXNlcklkP1xuXHRcdFx0XHRcdHJldHVybiBAcmVhZHkoKVxuXG5cdFx0XHRcdHJldHVybiBNZXRlb3IudXNlcnMuZmluZFxuXHRcdFx0XHRcdF9pZDogQHVzZXJJZFxuXHRcdFx0XHQsXG5cdFx0XHRcdFx0ZmllbGRzOlxuXHRcdFx0XHRcdFx0J29hdXRoLmF1dGhvcml6ZWRDbGllbnRzJzogMVxuXG5cdFx0XHRcdHJldHVybiB1c2VyP1xuXG5cblx0aW5pdFJvdXRlczogLT5cblx0XHRzZWxmID0gQFxuXHRcdGRlYnVnTWlkZGxld2FyZSA9IChyZXEsIHJlcywgbmV4dCkgLT5cblx0XHRcdGlmIHNlbGYuY29uZmlnLmRlYnVnIGlzIHRydWVcblx0XHRcdFx0Y29uc29sZS5sb2cgJ1tPQXV0aDJTZXJ2ZXJdJywgcmVxLm1ldGhvZCwgcmVxLnVybFxuXHRcdFx0bmV4dCgpXG5cblx0XHQjIFRyYW5zZm9ybXMgcmVxdWVzdHMgd2hpY2ggYXJlIFBPU1QgYW5kIGFyZW4ndCBcIngtd3d3LWZvcm0tdXJsZW5jb2RlZFwiIGNvbnRlbnQgdHlwZVxuXHRcdCMgYW5kIHRoZXkgcGFzcyB0aGUgcmVxdWlyZWQgaW5mb3JtYXRpb24gYXMgcXVlcnkgc3RyaW5nc1xuXHRcdHRyYW5zZm9ybVJlcXVlc3RzTm90VXNpbmdGb3JtVXJsZW5jb2RlZFR5cGUgPSAocmVxLCByZXMsIG5leHQpIC0+XG5cdFx0XHRpZiBub3QgcmVxLmlzKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKSBhbmQgcmVxLm1ldGhvZCBpcyAnUE9TVCdcblx0XHRcdFx0aWYgc2VsZi5jb25maWcuZGVidWcgaXMgdHJ1ZVxuXHRcdFx0XHRcdGNvbnNvbGUubG9nICdbT0F1dGgyU2VydmVyXScsICdUcmFuc2Zvcm1pbmcgYSByZXF1ZXN0IHRvIGZvcm0tdXJsZW5jb2RlZCB3aXRoIHRoZSBxdWVyeSBnb2luZyB0byB0aGUgYm9keS4nXG5cdFx0XHRcdHJlcS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG5cdFx0XHRcdHJlcS5ib2R5ID0gT2JqZWN0LmFzc2lnbiB7fSwgcmVxLmJvZHksIHJlcS5xdWVyeVxuXHRcdFx0bmV4dCgpXG5cblx0XHRAYXBwLmFsbCAnL29hdXRoL3Rva2VuJywgZGVidWdNaWRkbGV3YXJlLCB0cmFuc2Zvcm1SZXF1ZXN0c05vdFVzaW5nRm9ybVVybGVuY29kZWRUeXBlLCBAb2F1dGguZ3JhbnQoKVxuXG5cdFx0QGFwcC5nZXQgJy9vYXV0aC9hdXRob3JpemUnLCBkZWJ1Z01pZGRsZXdhcmUsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQgKHJlcSwgcmVzLCBuZXh0KSAtPlxuXHRcdFx0Y2xpZW50ID0gc2VsZi5tb2RlbC5DbGllbnRzLmZpbmRPbmUoeyBhY3RpdmU6IHRydWUsIGNsaWVudElkOiByZXEucXVlcnkuY2xpZW50X2lkIH0pXG5cdFx0XHRpZiBub3QgY2xpZW50P1xuXHRcdFx0XHRyZXR1cm4gcmVzLnJlZGlyZWN0ICcvb2F1dGgvZXJyb3IvNDA0J1xuXG5cdFx0XHRpZiBub3QgW10uY29uY2F0KGNsaWVudC5yZWRpcmVjdFVyaSkuaW5jbHVkZXMocmVxLnF1ZXJ5LnJlZGlyZWN0X3VyaSlcblx0XHRcdFx0cmV0dXJuIHJlcy5yZWRpcmVjdCAnL29hdXRoL2Vycm9yL2ludmFsaWRfcmVkaXJlY3RfdXJpJ1xuXG5cdFx0XHRuZXh0KClcblxuXHRcdEBhcHAucG9zdCAnL29hdXRoL2F1dGhvcml6ZScsIGRlYnVnTWlkZGxld2FyZSwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCAocmVxLCByZXMsIG5leHQpIC0+XG5cdFx0XHRpZiBub3QgcmVxLmJvZHkudG9rZW4/XG5cdFx0XHRcdHJldHVybiByZXMuc2VuZFN0YXR1cyg0MDEpLnNlbmQoJ05vIHRva2VuJylcblxuXHRcdFx0dXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lXG5cdFx0XHRcdCdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuaGFzaGVkVG9rZW4nOiBBY2NvdW50cy5faGFzaExvZ2luVG9rZW4gcmVxLmJvZHkudG9rZW5cblxuXHRcdFx0aWYgbm90IHVzZXI/XG5cdFx0XHRcdHJldHVybiByZXMuc2VuZFN0YXR1cyg0MDEpLnNlbmQoJ0ludmFsaWQgdG9rZW4nKVxuXG5cdFx0XHRyZXEudXNlciA9XG5cdFx0XHRcdGlkOiB1c2VyLl9pZFxuXG5cdFx0XHRuZXh0KClcblxuXG5cdFx0QGFwcC5wb3N0ICcvb2F1dGgvYXV0aG9yaXplJywgZGVidWdNaWRkbGV3YXJlLCBAb2F1dGguYXV0aENvZGVHcmFudCAocmVxLCBuZXh0KSAtPlxuXHRcdFx0aWYgcmVxLmJvZHkuYWxsb3cgaXMgJ3llcydcblx0XHRcdFx0TWV0ZW9yLnVzZXJzLnVwZGF0ZSByZXEudXNlci5pZCwgeyRhZGRUb1NldDogeydvYXV0aC5hdXRob3JpemVkQ2xpZW50cyc6IEBjbGllbnRJZH19XG5cblx0XHRcdG5leHQobnVsbCwgcmVxLmJvZHkuYWxsb3cgaXMgJ3llcycsIHJlcS51c2VyKVxuXG5cdFx0QGFwcC51c2UgQHJvdXRlc1xuXG5cdFx0QGFwcC5hbGwgJy9vYXV0aC8qJywgQG9hdXRoLmVycm9ySGFuZGxlcigpXG4iXX0=
