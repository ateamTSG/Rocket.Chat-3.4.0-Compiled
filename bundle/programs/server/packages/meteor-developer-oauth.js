(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ECMAScript = Package.ecmascript.ECMAScript;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MeteorDeveloperAccounts;

var require = meteorInstall({"node_modules":{"meteor":{"meteor-developer-oauth":{"meteor_developer_common.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/meteor-developer-oauth/meteor_developer_common.js                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
MeteorDeveloperAccounts = {};
MeteorDeveloperAccounts._server = "https://www.meteor.com"; // Options are:
//  - developerAccountsServer: defaults to "https://www.meteor.com"

MeteorDeveloperAccounts._config = options => {
  if (options.developerAccountsServer) {
    MeteorDeveloperAccounts._server = options.developerAccountsServer;
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor_developer_server.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/meteor-developer-oauth/meteor_developer_server.js                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
OAuth.registerService("meteor-developer", 2, null, query => {
  const response = getTokens(query);
  const {
    accessToken
  } = response;
  const identity = getIdentity(accessToken);
  const serviceData = {
    accessToken: OAuth.sealSecret(accessToken),
    expiresAt: +new Date() + 1000 * response.expiresIn
  };
  Object.assign(serviceData, identity); // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)

  if (response.refreshToken) serviceData.refreshToken = OAuth.sealSecret(response.refreshToken);
  return {
    serviceData,
    options: {
      profile: {
        name: serviceData.username
      }
    } // XXX use username for name until meteor accounts has a profile with a name

  };
}); // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request and we got a
//   refresh token from the server

const getTokens = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'meteor-developer'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let response;

  try {
    response = HTTP.post(MeteorDeveloperAccounts._server + "/oauth2/token", {
      params: {
        grant_type: "authorization_code",
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('meteor-developer', config)
      }
    });
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Meteor developer accounts. " + err.message), {
      response: err.response
    });
  }

  if (!response.data || response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Meteor developer accounts. " + (response.data ? response.data.error : "No response data"));
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }
};

const getIdentity = accessToken => {
  try {
    return HTTP.get("".concat(MeteorDeveloperAccounts._server, "/api/v1/identity"), {
      headers: {
        Authorization: "Bearer ".concat(accessToken)
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Meteor developer accounts. " + err.message), {
      response: err.response
    });
  }
};

MeteorDeveloperAccounts.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/meteor-developer-oauth/meteor_developer_common.js");
require("/node_modules/meteor/meteor-developer-oauth/meteor_developer_server.js");

/* Exports */
Package._define("meteor-developer-oauth", {
  MeteorDeveloperAccounts: MeteorDeveloperAccounts
});

})();

//# sourceURL=meteor://💻app/packages/meteor-developer-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9yLWRldmVsb3Blci1vYXV0aC9tZXRlb3JfZGV2ZWxvcGVyX2NvbW1vbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9yLWRldmVsb3Blci1vYXV0aC9tZXRlb3JfZGV2ZWxvcGVyX3NlcnZlci5qcyJdLCJuYW1lcyI6WyJNZXRlb3JEZXZlbG9wZXJBY2NvdW50cyIsIl9zZXJ2ZXIiLCJfY29uZmlnIiwib3B0aW9ucyIsImRldmVsb3BlckFjY291bnRzU2VydmVyIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsInJlc3BvbnNlIiwiZ2V0VG9rZW5zIiwiYWNjZXNzVG9rZW4iLCJpZGVudGl0eSIsImdldElkZW50aXR5Iiwic2VydmljZURhdGEiLCJzZWFsU2VjcmV0IiwiZXhwaXJlc0F0IiwiRGF0ZSIsImV4cGlyZXNJbiIsIk9iamVjdCIsImFzc2lnbiIsInJlZnJlc2hUb2tlbiIsInByb2ZpbGUiLCJuYW1lIiwidXNlcm5hbWUiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZSIsInNlcnZpY2UiLCJDb25maWdFcnJvciIsIkhUVFAiLCJwb3N0IiwicGFyYW1zIiwiZ3JhbnRfdHlwZSIsImNvZGUiLCJjbGllbnRfaWQiLCJjbGllbnRJZCIsImNsaWVudF9zZWNyZXQiLCJvcGVuU2VjcmV0Iiwic2VjcmV0IiwicmVkaXJlY3RfdXJpIiwiX3JlZGlyZWN0VXJpIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwiZGF0YSIsImVycm9yIiwiYWNjZXNzX3Rva2VuIiwicmVmcmVzaF90b2tlbiIsImV4cGlyZXNfaW4iLCJnZXQiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7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LEtBQTlCLEdBQ0Esa0JBRkgsQ0FESSxDQUFOO0FBS0QsR0FQRCxNQU9PO0FBQ0wsV0FBTztBQUNMcEMsaUJBQVcsRUFBRUYsUUFBUSxDQUFDcUMsSUFBVCxDQUFjRSxZQUR0QjtBQUVMM0Isa0JBQVksRUFBRVosUUFBUSxDQUFDcUMsSUFBVCxDQUFjRyxhQUZ2QjtBQUdML0IsZUFBUyxFQUFFVCxRQUFRLENBQUNxQyxJQUFULENBQWNJO0FBSHBCLEtBQVA7QUFLRDtBQUNGLENBNUNEOztBQThDQSxNQUFNckMsV0FBVyxHQUFHRixXQUFXLElBQUk7QUFDakMsTUFBSTtBQUNGLFdBQU9vQixJQUFJLENBQUNvQixHQUFMLFdBQ0ZsRCx1QkFBdUIsQ0FBQ0MsT0FEdEIsdUJBRUw7QUFDRWtELGFBQU8sRUFBRTtBQUFFQyxxQkFBYSxtQkFBWTFDLFdBQVo7QUFBZjtBQURYLEtBRkssRUFLTG1DLElBTEY7QUFNRCxHQVBELENBT0UsT0FBT0gsR0FBUCxFQUFZO0FBQ1osVUFBTXhCLE1BQU0sQ0FBQ0MsTUFBUCxDQUNKLElBQUl3QixLQUFKLENBQVUsOERBQ0FELEdBQUcsQ0FBQ0UsT0FEZCxDQURJLEVBR0o7QUFBQ3BDLGNBQVEsRUFBRWtDLEdBQUcsQ0FBQ2xDO0FBQWYsS0FISSxDQUFOO0FBS0Q7QUFDRixDQWZEOztBQWlCQVIsdUJBQXVCLENBQUNxRCxrQkFBeEIsR0FDRSxDQUFDQyxlQUFELEVBQWtCQyxnQkFBbEIsS0FDRWxELEtBQUssQ0FBQ2dELGtCQUFOLENBQXlCQyxlQUF6QixFQUEwQ0MsZ0JBQTFDLENBRkosQyIsImZpbGUiOiIvcGFja2FnZXMvbWV0ZW9yLWRldmVsb3Blci1vYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIk1ldGVvckRldmVsb3BlckFjY291bnRzID0ge307XG5cbk1ldGVvckRldmVsb3BlckFjY291bnRzLl9zZXJ2ZXIgPSBcImh0dHBzOi8vd3d3Lm1ldGVvci5jb21cIjtcblxuLy8gT3B0aW9ucyBhcmU6XG4vLyAgLSBkZXZlbG9wZXJBY2NvdW50c1NlcnZlcjogZGVmYXVsdHMgdG8gXCJodHRwczovL3d3dy5tZXRlb3IuY29tXCJcbk1ldGVvckRldmVsb3BlckFjY291bnRzLl9jb25maWcgPSBvcHRpb25zID0+IHtcbiAgaWYgKG9wdGlvbnMuZGV2ZWxvcGVyQWNjb3VudHNTZXJ2ZXIpIHtcbiAgICBNZXRlb3JEZXZlbG9wZXJBY2NvdW50cy5fc2VydmVyID0gb3B0aW9ucy5kZXZlbG9wZXJBY2NvdW50c1NlcnZlcjtcbiAgfVxufTtcbiIsIk9BdXRoLnJlZ2lzdGVyU2VydmljZShcIm1ldGVvci1kZXZlbG9wZXJcIiwgMiwgbnVsbCwgcXVlcnkgPT4ge1xuICBjb25zdCByZXNwb25zZSA9IGdldFRva2VucyhxdWVyeSk7XG4gIGNvbnN0IHsgYWNjZXNzVG9rZW4gfSA9IHJlc3BvbnNlO1xuICBjb25zdCBpZGVudGl0eSA9IGdldElkZW50aXR5KGFjY2Vzc1Rva2VuKTtcblxuICBjb25zdCBzZXJ2aWNlRGF0YSA9IHtcbiAgICBhY2Nlc3NUb2tlbjogT0F1dGguc2VhbFNlY3JldChhY2Nlc3NUb2tlbiksXG4gICAgZXhwaXJlc0F0OiAoK25ldyBEYXRlKSArICgxMDAwICogcmVzcG9uc2UuZXhwaXJlc0luKVxuICB9O1xuXG4gIE9iamVjdC5hc3NpZ24oc2VydmljZURhdGEsIGlkZW50aXR5KTtcblxuICAvLyBvbmx5IHNldCB0aGUgdG9rZW4gaW4gc2VydmljZURhdGEgaWYgaXQncyB0aGVyZS4gdGhpcyBlbnN1cmVzXG4gIC8vIHRoYXQgd2UgZG9uJ3QgbG9zZSBvbGQgb25lcyAoc2luY2Ugd2Ugb25seSBnZXQgdGhpcyBvbiB0aGUgZmlyc3RcbiAgLy8gbG9nIGluIGF0dGVtcHQpXG4gIGlmIChyZXNwb25zZS5yZWZyZXNoVG9rZW4pXG4gICAgc2VydmljZURhdGEucmVmcmVzaFRva2VuID0gT0F1dGguc2VhbFNlY3JldChyZXNwb25zZS5yZWZyZXNoVG9rZW4pO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uczoge3Byb2ZpbGU6IHtuYW1lOiBzZXJ2aWNlRGF0YS51c2VybmFtZX19XG4gICAgLy8gWFhYIHVzZSB1c2VybmFtZSBmb3IgbmFtZSB1bnRpbCBtZXRlb3IgYWNjb3VudHMgaGFzIGEgcHJvZmlsZSB3aXRoIGEgbmFtZVxuICB9O1xufSk7XG5cbi8vIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4vLyAtIGFjY2Vzc1Rva2VuXG4vLyAtIGV4cGlyZXNJbjogbGlmZXRpbWUgb2YgdG9rZW4gaW4gc2Vjb25kc1xuLy8gLSByZWZyZXNoVG9rZW4sIGlmIHRoaXMgaXMgdGhlIGZpcnN0IGF1dGhvcml6YXRpb24gcmVxdWVzdCBhbmQgd2UgZ290IGFcbi8vICAgcmVmcmVzaCB0b2tlbiBmcm9tIHRoZSBzZXJ2ZXJcbmNvbnN0IGdldFRva2VucyA9IHF1ZXJ5ID0+IHtcbiAgY29uc3QgY29uZmlnID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZSh7XG4gICAgc2VydmljZTogJ21ldGVvci1kZXZlbG9wZXInXG4gIH0pO1xuICBpZiAoIWNvbmZpZylcbiAgICB0aHJvdyBuZXcgU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IoKTtcblxuICBsZXQgcmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzcG9uc2UgPSBIVFRQLnBvc3QoXG4gICAgICBNZXRlb3JEZXZlbG9wZXJBY2NvdW50cy5fc2VydmVyICsgXCIvb2F1dGgyL3Rva2VuXCIsIHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgZ3JhbnRfdHlwZTogXCJhdXRob3JpemF0aW9uX2NvZGVcIixcbiAgICAgICAgICBjb2RlOiBxdWVyeS5jb2RlLFxuICAgICAgICAgIGNsaWVudF9pZDogY29uZmlnLmNsaWVudElkLFxuICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IE9BdXRoLm9wZW5TZWNyZXQoY29uZmlnLnNlY3JldCksXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoJ21ldGVvci1kZXZlbG9wZXInLCBjb25maWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBPYmplY3QuYXNzaWduKFxuICAgICAgbmV3IEVycm9yKFxuICAgICAgICBcIkZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBNZXRlb3IgZGV2ZWxvcGVyIGFjY291bnRzLiBcIlxuICAgICAgICAgICsgZXJyLm1lc3NhZ2VcbiAgICAgICksXG4gICAgICB7cmVzcG9uc2U6IGVyci5yZXNwb25zZX1cbiAgICApO1xuICB9XG5cbiAgaWYgKCEgcmVzcG9uc2UuZGF0YSB8fCByZXNwb25zZS5kYXRhLmVycm9yKSB7XG4gICAgLy8gaWYgdGhlIGh0dHAgcmVzcG9uc2Ugd2FzIGEganNvbiBvYmplY3Qgd2l0aCBhbiBlcnJvciBhdHRyaWJ1dGVcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBNZXRlb3IgZGV2ZWxvcGVyIGFjY291bnRzLiBcIiArXG4gICAgICAgIChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5lcnJvciA6XG4gICAgICAgICBcIk5vIHJlc3BvbnNlIGRhdGFcIilcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBhY2Nlc3NUb2tlbjogcmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW4sXG4gICAgICByZWZyZXNoVG9rZW46IHJlc3BvbnNlLmRhdGEucmVmcmVzaF90b2tlbixcbiAgICAgIGV4cGlyZXNJbjogcmVzcG9uc2UuZGF0YS5leHBpcmVzX2luXG4gICAgfTtcbiAgfVxufTtcblxuY29uc3QgZ2V0SWRlbnRpdHkgPSBhY2Nlc3NUb2tlbiA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEhUVFAuZ2V0KFxuICAgICAgYCR7TWV0ZW9yRGV2ZWxvcGVyQWNjb3VudHMuX3NlcnZlcn0vYXBpL3YxL2lkZW50aXR5YCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YH1cbiAgICAgIH1cbiAgICApLmRhdGE7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggaWRlbnRpdHkgZnJvbSBNZXRlb3IgZGV2ZWxvcGVyIGFjY291bnRzLiBcIiArXG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UpLFxuICAgICAge3Jlc3BvbnNlOiBlcnIucmVzcG9uc2V9XG4gICAgKTtcbiAgfVxufTtcblxuTWV0ZW9yRGV2ZWxvcGVyQWNjb3VudHMucmV0cmlldmVDcmVkZW50aWFsID0gXG4gIChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpID0+IFxuICAgIE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpO1xuIl19
