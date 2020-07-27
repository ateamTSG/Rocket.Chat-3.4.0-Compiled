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
var Facebook;

var require = meteorInstall({"node_modules":{"meteor":{"facebook-oauth":{"facebook_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/facebook-oauth/facebook_server.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 0);
Facebook = {};

Facebook.handleAuthFromAccessToken = (accessToken, expiresAt) => {
  // include basic fields from facebook
  // https://developers.facebook.com/docs/facebook-login/permissions/
  const whitelisted = ['id', 'email', 'name', 'first_name', 'last_name', 'middle_name', 'name_format', 'picture', 'short_name'];
  const identity = getIdentity(accessToken, whitelisted);
  const fields = {};
  whitelisted.forEach(field => fields[field] = identity[field]);

  const serviceData = _objectSpread({
    accessToken,
    expiresAt
  }, fields);

  return {
    serviceData,
    options: {
      profile: {
        name: identity.name
      }
    }
  };
};

OAuth.registerService('facebook', 2, null, query => {
  const response = getTokenResponse(query);
  const {
    accessToken
  } = response;
  const {
    expiresIn
  } = response;
  return Facebook.handleAuthFromAccessToken(accessToken, +new Date() + 1000 * expiresIn);
}); // checks whether a string parses as JSON

const isJSON = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}; // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds


const getTokenResponse = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'facebook'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let responseContent;

  try {
    // Request an access token
    responseContent = HTTP.get("https://graph.facebook.com/v5.0/oauth/access_token", {
      params: {
        client_id: config.appId,
        redirect_uri: OAuth._redirectUri('facebook', config),
        client_secret: OAuth.openSecret(config.secret),
        code: query.code
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Facebook. ".concat(err.message)), {
      response: err.response
    });
  }

  const fbAccessToken = responseContent.access_token;
  const fbExpires = responseContent.expires_in;

  if (!fbAccessToken) {
    throw new Error("Failed to complete OAuth handshake with facebook " + "-- can't find access token in HTTP response. ".concat(responseContent));
  }

  return {
    accessToken: fbAccessToken,
    expiresIn: fbExpires
  };
};

const getIdentity = (accessToken, fields) => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'facebook'
  });
  if (!config) throw new ServiceConfiguration.ConfigError(); // Generate app secret proof that is a sha256 hash of the app access token, with the app secret as the key
  // https://developers.facebook.com/docs/graph-api/securing-requests#appsecret_proof

  const hmac = crypto.createHmac('sha256', OAuth.openSecret(config.secret));
  hmac.update(accessToken);

  try {
    return HTTP.get("https://graph.facebook.com/v5.0/me", {
      params: {
        access_token: accessToken,
        appsecret_proof: hmac.digest('hex'),
        fields: fields.join(",")
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Facebook. ".concat(err.message)), {
      response: err.response
    });
  }
};

Facebook.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/facebook-oauth/facebook_server.js");

/* Exports */
Package._define("facebook-oauth", {
  Facebook: Facebook
});

})();

//# sourceURL=meteor://💻app/packages/facebook-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjZWJvb2stb2F1dGgvZmFjZWJvb2tfc2VydmVyLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJjcnlwdG8iLCJGYWNlYm9vayIsImhhbmRsZUF1dGhGcm9tQWNjZXNzVG9rZW4iLCJhY2Nlc3NUb2tlbiIsImV4cGlyZXNBdCIsIndoaXRlbGlzdGVkIiwiaWRlbnRpdHkiLCJnZXRJZGVudGl0eSIsImZpZWxkcyIsImZvckVhY2giLCJmaWVsZCIsInNlcnZpY2VEYXRhIiwib3B0aW9ucyIsInByb2ZpbGUiLCJuYW1lIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsInJlc3BvbnNlIiwiZ2V0VG9rZW5SZXNwb25zZSIsImV4cGlyZXNJbiIsIkRhdGUiLCJpc0pTT04iLCJzdHIiLCJKU09OIiwicGFyc2UiLCJlIiwiY29uZmlnIiwiU2VydmljZUNvbmZpZ3VyYXRpb24iLCJjb25maWd1cmF0aW9ucyIsImZpbmRPbmUiLCJzZXJ2aWNlIiwiQ29uZmlnRXJyb3IiLCJyZXNwb25zZUNvbnRlbnQiLCJIVFRQIiwiZ2V0IiwicGFyYW1zIiwiY2xpZW50X2lkIiwiYXBwSWQiLCJyZWRpcmVjdF91cmkiLCJfcmVkaXJlY3RVcmkiLCJjbGllbnRfc2VjcmV0Iiwib3BlblNlY3JldCIsInNlY3JldCIsImNvZGUiLCJkYXRhIiwiZXJyIiwiT2JqZWN0IiwiYXNzaWduIiwiRXJyb3IiLCJtZXNzYWdlIiwiZmJBY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsImZiRXhwaXJlcyIsImV4cGlyZXNfaW4iLCJobWFjIiwiY3JlYXRlSG1hYyIsInVwZGF0ZSIsImFwcHNlY3JldF9wcm9vZiIsImRpZ2VzdCIsImpvaW4iLCJyZXRyaWV2ZUNyZWRlbnRpYWwiLCJjcmVkZW50aWFsVG9rZW4iLCJjcmVkZW50aWFsU2VjcmV0Il0sIm1hcHBpbmdzIjoiOzs7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QUFZLEVBQUVqRCxXQURSO0FBRU51RCx1QkFBZSxFQUFFSCxJQUFJLENBQUNJLE1BQUwsQ0FBWSxLQUFaLENBRlg7QUFHTm5ELGNBQU0sRUFBRUEsTUFBTSxDQUFDb0QsSUFBUCxDQUFZLEdBQVo7QUFIRjtBQUQ0QyxLQUEvQyxFQU1KZixJQU5IO0FBT0QsR0FSRCxDQVFFLE9BQU9DLEdBQVAsRUFBWTtBQUNaLFVBQU1DLE1BQU0sQ0FBQ0MsTUFBUCxDQUNKLElBQUlDLEtBQUosbURBQXFESCxHQUFHLENBQUNJLE9BQXpELEVBREksRUFFSjtBQUFFaEMsY0FBUSxFQUFFNEIsR0FBRyxDQUFDNUI7QUFBaEIsS0FGSSxDQUFOO0FBSUQ7QUFDRixDQXhCRDs7QUEwQkFqQixRQUFRLENBQUM0RCxrQkFBVCxHQUE4QixDQUFDQyxlQUFELEVBQWtCQyxnQkFBbEIsS0FDNUJoRCxLQUFLLENBQUM4QyxrQkFBTixDQUF5QkMsZUFBekIsRUFBMENDLGdCQUExQyxDQURGLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2ZhY2Vib29rLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiRmFjZWJvb2sgPSB7fTtcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuRmFjZWJvb2suaGFuZGxlQXV0aEZyb21BY2Nlc3NUb2tlbiA9IChhY2Nlc3NUb2tlbiwgZXhwaXJlc0F0KSA9PiB7XG4gIC8vIGluY2x1ZGUgYmFzaWMgZmllbGRzIGZyb20gZmFjZWJvb2tcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmZhY2Vib29rLmNvbS9kb2NzL2ZhY2Vib29rLWxvZ2luL3Blcm1pc3Npb25zL1xuICBjb25zdCB3aGl0ZWxpc3RlZCA9IFsnaWQnLCAnZW1haWwnLCAnbmFtZScsICdmaXJzdF9uYW1lJywgJ2xhc3RfbmFtZScsXG4gICAgJ21pZGRsZV9uYW1lJywgJ25hbWVfZm9ybWF0JywgJ3BpY3R1cmUnLCAnc2hvcnRfbmFtZSddO1xuXG4gIGNvbnN0IGlkZW50aXR5ID0gZ2V0SWRlbnRpdHkoYWNjZXNzVG9rZW4sIHdoaXRlbGlzdGVkKTtcblxuICBjb25zdCBmaWVsZHMgPSB7fTtcbiAgd2hpdGVsaXN0ZWQuZm9yRWFjaChmaWVsZCA9PiBmaWVsZHNbZmllbGRdID0gaWRlbnRpdHlbZmllbGRdKTtcbiAgY29uc3Qgc2VydmljZURhdGEgPSB7XG4gICAgYWNjZXNzVG9rZW4sXG4gICAgZXhwaXJlc0F0LFxuICAgIC4uLmZpZWxkcyxcbiAgfTtcbiAgXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uczoge3Byb2ZpbGU6IHtuYW1lOiBpZGVudGl0eS5uYW1lfX1cbiAgfTtcbn07XG5cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSgnZmFjZWJvb2snLCAyLCBudWxsLCBxdWVyeSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gZ2V0VG9rZW5SZXNwb25zZShxdWVyeSk7XG4gIGNvbnN0IHsgYWNjZXNzVG9rZW4gfSA9IHJlc3BvbnNlO1xuICBjb25zdCB7IGV4cGlyZXNJbiB9ID0gcmVzcG9uc2U7XG5cbiAgcmV0dXJuIEZhY2Vib29rLmhhbmRsZUF1dGhGcm9tQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW4sICgrbmV3IERhdGUpICsgKDEwMDAgKiBleHBpcmVzSW4pKTtcbn0pO1xuXG4vLyBjaGVja3Mgd2hldGhlciBhIHN0cmluZyBwYXJzZXMgYXMgSlNPTlxuY29uc3QgaXNKU09OID0gc3RyID0+IHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8vIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4vLyAtIGFjY2Vzc1Rva2VuXG4vLyAtIGV4cGlyZXNJbjogbGlmZXRpbWUgb2YgdG9rZW4gaW4gc2Vjb25kc1xuY29uc3QgZ2V0VG9rZW5SZXNwb25zZSA9IHF1ZXJ5ID0+IHtcbiAgY29uc3QgY29uZmlnID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZSh7c2VydmljZTogJ2ZhY2Vib29rJ30pO1xuICBpZiAoIWNvbmZpZylcbiAgICB0aHJvdyBuZXcgU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IoKTtcblxuICBsZXQgcmVzcG9uc2VDb250ZW50O1xuICB0cnkge1xuICAgIC8vIFJlcXVlc3QgYW4gYWNjZXNzIHRva2VuXG4gICAgcmVzcG9uc2VDb250ZW50ID0gSFRUUC5nZXQoXG4gICAgICBcImh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL3Y1LjAvb2F1dGgvYWNjZXNzX3Rva2VuXCIsIHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgY2xpZW50X2lkOiBjb25maWcuYXBwSWQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoJ2ZhY2Vib29rJywgY29uZmlnKSxcbiAgICAgICAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgICAgICAgIGNvZGU6IHF1ZXJ5LmNvZGVcbiAgICAgICAgfVxuICAgICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEZhY2Vib29rLiAke2Vyci5tZXNzYWdlfWApLFxuICAgICAgeyByZXNwb25zZTogZXJyLnJlc3BvbnNlIH0sXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGZiQWNjZXNzVG9rZW4gPSByZXNwb25zZUNvbnRlbnQuYWNjZXNzX3Rva2VuO1xuICBjb25zdCBmYkV4cGlyZXMgPSByZXNwb25zZUNvbnRlbnQuZXhwaXJlc19pbjtcblxuICBpZiAoIWZiQWNjZXNzVG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggZmFjZWJvb2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICBgLS0gY2FuJ3QgZmluZCBhY2Nlc3MgdG9rZW4gaW4gSFRUUCByZXNwb25zZS4gJHtyZXNwb25zZUNvbnRlbnR9YCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhY2Nlc3NUb2tlbjogZmJBY2Nlc3NUb2tlbixcbiAgICBleHBpcmVzSW46IGZiRXhwaXJlc1xuICB9O1xufTtcblxuY29uc3QgZ2V0SWRlbnRpdHkgPSAoYWNjZXNzVG9rZW4sIGZpZWxkcykgPT4ge1xuICBjb25zdCBjb25maWcgPSBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiAnZmFjZWJvb2snfSk7XG4gIGlmICghY29uZmlnKVxuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIC8vIEdlbmVyYXRlIGFwcCBzZWNyZXQgcHJvb2YgdGhhdCBpcyBhIHNoYTI1NiBoYXNoIG9mIHRoZSBhcHAgYWNjZXNzIHRva2VuLCB3aXRoIHRoZSBhcHAgc2VjcmV0IGFzIHRoZSBrZXlcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmZhY2Vib29rLmNvbS9kb2NzL2dyYXBoLWFwaS9zZWN1cmluZy1yZXF1ZXN0cyNhcHBzZWNyZXRfcHJvb2ZcbiAgY29uc3QgaG1hYyA9IGNyeXB0by5jcmVhdGVIbWFjKCdzaGEyNTYnLCBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpKTtcbiAgaG1hYy51cGRhdGUoYWNjZXNzVG9rZW4pO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEhUVFAuZ2V0KFwiaHR0cHM6Ly9ncmFwaC5mYWNlYm9vay5jb20vdjUuMC9tZVwiLCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgYWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlbixcbiAgICAgICAgYXBwc2VjcmV0X3Byb29mOiBobWFjLmRpZ2VzdCgnaGV4JyksXG4gICAgICAgIGZpZWxkczogZmllbGRzLmpvaW4oXCIsXCIpXG4gICAgICB9XG4gICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGlkZW50aXR5IGZyb20gRmFjZWJvb2suICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfSxcbiAgICApO1xuICB9XG59O1xuXG5GYWNlYm9vay5yZXRyaWV2ZUNyZWRlbnRpYWwgPSAoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KSA9PlxuICBPQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KTtcblxuIl19
