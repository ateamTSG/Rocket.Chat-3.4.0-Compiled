(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var Accounts = Package['accounts-base'].Accounts;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-oauth":{"oauth_common.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/accounts-oauth/oauth_common.js                                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Accounts.oauth = {};
const services = {};
const hasOwn = Object.prototype.hasOwnProperty; // Helper for registering OAuth based accounts packages.
// On the server, adds an index to the user collection.

Accounts.oauth.registerService = name => {
  if (hasOwn.call(services, name)) throw new Error("Duplicate service: ".concat(name));
  services[name] = true;

  if (Meteor.server) {
    // Accounts.updateOrCreateUserFromExternalService does a lookup by this id,
    // so this should be a unique index. You might want to add indexes for other
    // fields returned by your service (eg services.github.login) but you can do
    // that in your app.
    Meteor.users._ensureIndex("services.".concat(name, ".id"), {
      unique: true,
      sparse: true
    });
  }
}; // Removes a previously registered service.
// This will disable logging in with this service, and serviceNames() will not
// contain it.
// It's worth noting that already logged in users will remain logged in unless
// you manually expire their sessions.


Accounts.oauth.unregisterService = name => {
  if (!hasOwn.call(services, name)) throw new Error("Service not found: ".concat(name));
  delete services[name];
};

Accounts.oauth.serviceNames = () => Object.keys(services);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth_server.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/accounts-oauth/oauth_server.js                                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
// Listen to calls to `login` with an oauth option set. This is where
// users actually get logged in to meteor via oauth.
Accounts.registerLoginHandler(options => {
  if (!options.oauth) return undefined; // don't handle

  check(options.oauth, {
    credentialToken: String,
    // When an error occurs while retrieving the access token, we store
    // the error in the pending credentials table, with a secret of
    // null. The client can call the login method with a secret of null
    // to retrieve the error.
    credentialSecret: Match.OneOf(null, String)
  });
  const result = OAuth.retrieveCredential(options.oauth.credentialToken, options.oauth.credentialSecret);

  if (!result) {
    // OAuth credentialToken is not recognized, which could be either
    // because the popup was closed by the user before completion, or
    // some sort of error where the oauth provider didn't talk to our
    // server correctly and closed the popup somehow.
    //
    // We assume it was user canceled and report it as such, using a
    // numeric code that the client recognizes (XXX this will get
    // replaced by a symbolic error code at some point
    // https://trello.com/c/kMkw800Z/53-official-ddp-specification). This
    // will mask failures where things are misconfigured such that the
    // server doesn't see the request but does close the window. This
    // seems unlikely.
    //
    // XXX we want `type` to be the service name such as "facebook"
    return {
      type: "oauth",
      error: new Meteor.Error(Accounts.LoginCancelledError.numericError, "No matching login attempt found")
    };
  }

  if (result instanceof Error) // We tried to login, but there was a fatal error. Report it back
    // to the user.
    throw result;else {
    if (!Accounts.oauth.serviceNames().includes(result.serviceName)) {
      // serviceName was not found in the registered services list.
      // This could happen because the service never registered itself or
      // unregisterService was called on it.
      return {
        type: "oauth",
        error: new Meteor.Error(Accounts.LoginCancelledError.numericError, "No registered oauth service found for: ".concat(result.serviceName))
      };
    }

    return Accounts.updateOrCreateUserFromExternalService(result.serviceName, result.serviceData, result.options);
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-oauth/oauth_common.js");
require("/node_modules/meteor/accounts-oauth/oauth_server.js");

/* Exports */
Package._define("accounts-oauth");

})();

//# sourceURL=meteor://💻app/packages/accounts-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtb2F1dGgvb2F1dGhfY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1vYXV0aC9vYXV0aF9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiQWNjb3VudHMiLCJvYXV0aCIsInNlcnZpY2VzIiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJyZWdpc3RlclNlcnZpY2UiLCJuYW1lIiwiY2FsbCIsIkVycm9yIiwiTWV0ZW9yIiwic2VydmVyIiwidXNlcnMiLCJfZW5zdXJlSW5kZXgiLCJ1bmlxdWUiLCJzcGFyc2UiLCJ1bnJlZ2lzdGVyU2VydmljZSIsInNlcnZpY2VOYW1lcyIsImtleXMiLCJyZWdpc3RlckxvZ2luSGFuZGxlciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJjaGVjayIsImNyZWRlbnRpYWxUb2tlbiIsIlN0cmluZyIsImNyZWRlbnRpYWxTZWNyZXQiLCJNYXRjaCIsIk9uZU9mIiwicmVzdWx0IiwiT0F1dGgiLCJyZXRyaWV2ZUNyZWRlbnRpYWwiLCJ0eXBlIiwiZXJyb3IiLCJMb2dpbkNhbmNlbGxlZEVycm9yIiwibnVtZXJpY0Vycm9yIiwiaW5jbHVkZXMiLCJzZXJ2aWNlTmFtZSIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJzZXJ2aWNlRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsUUFBUSxDQUFDQyxLQUFULEdBQWlCLEVBQWpCO0FBRUEsTUFBTUMsUUFBUSxHQUFHLEVBQWpCO0FBQ0EsTUFBTUMsTUFBTSxHQUFHQyxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWhDLEMsQ0FFQTtBQUNBOztBQUNBTixRQUFRLENBQUNDLEtBQVQsQ0FBZU0sZUFBZixHQUFpQ0MsSUFBSSxJQUFJO0FBQ3ZDLE1BQUlMLE1BQU0sQ0FBQ00sSUFBUCxDQUFZUCxRQUFaLEVBQXNCTSxJQUF0QixDQUFKLEVBQ0UsTUFBTSxJQUFJRSxLQUFKLDhCQUFnQ0YsSUFBaEMsRUFBTjtBQUNGTixVQUFRLENBQUNNLElBQUQsQ0FBUixHQUFpQixJQUFqQjs7QUFFQSxNQUFJRyxNQUFNLENBQUNDLE1BQVgsRUFBbUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQUQsVUFBTSxDQUFDRSxLQUFQLENBQWFDLFlBQWIsb0JBQXNDTixJQUF0QyxVQUFpRDtBQUFDTyxZQUFNLEVBQUUsSUFBVDtBQUFlQyxZQUFNLEVBQUU7QUFBdkIsS0FBakQ7QUFDRDtBQUNGLENBWkQsQyxDQWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBaEIsUUFBUSxDQUFDQyxLQUFULENBQWVnQixpQkFBZixHQUFtQ1QsSUFBSSxJQUFJO0FBQ3pDLE1BQUksQ0FBQ0wsTUFBTSxDQUFDTSxJQUFQLENBQVlQLFFBQVosRUFBc0JNLElBQXRCLENBQUwsRUFDRSxNQUFNLElBQUlFLEtBQUosOEJBQWdDRixJQUFoQyxFQUFOO0FBQ0YsU0FBT04sUUFBUSxDQUFDTSxJQUFELENBQWY7QUFDRCxDQUpEOztBQU1BUixRQUFRLENBQUNDLEtBQVQsQ0FBZWlCLFlBQWYsR0FBOEIsTUFBTWQsTUFBTSxDQUFDZSxJQUFQLENBQVlqQixRQUFaLENBQXBDLEM7Ozs7Ozs7Ozs7O0FDaENBO0FBQ0E7QUFDQUYsUUFBUSxDQUFDb0Isb0JBQVQsQ0FBOEJDLE9BQU8sSUFBSTtBQUN2QyxNQUFJLENBQUNBLE9BQU8sQ0FBQ3BCLEtBQWIsRUFDRSxPQUFPcUIsU0FBUCxDQUZxQyxDQUVuQjs7QUFFcEJDLE9BQUssQ0FBQ0YsT0FBTyxDQUFDcEIsS0FBVCxFQUFnQjtBQUNuQnVCLG1CQUFlLEVBQUVDLE1BREU7QUFFbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsb0JBQWdCLEVBQUVDLEtBQUssQ0FBQ0MsS0FBTixDQUFZLElBQVosRUFBa0JILE1BQWxCO0FBTkMsR0FBaEIsQ0FBTDtBQVNBLFFBQU1JLE1BQU0sR0FBR0MsS0FBSyxDQUFDQyxrQkFBTixDQUF5QlYsT0FBTyxDQUFDcEIsS0FBUixDQUFjdUIsZUFBdkMsRUFDdUJILE9BQU8sQ0FBQ3BCLEtBQVIsQ0FBY3lCLGdCQURyQyxDQUFmOztBQUdBLE1BQUksQ0FBQ0csTUFBTCxFQUFhO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQU87QUFBRUcsVUFBSSxFQUFFLE9BQVI7QUFDRUMsV0FBSyxFQUFFLElBQUl0QixNQUFNLENBQUNELEtBQVgsQ0FDTFYsUUFBUSxDQUFDa0MsbUJBQVQsQ0FBNkJDLFlBRHhCLEVBRUwsaUNBRks7QUFEVCxLQUFQO0FBSUQ7O0FBRUQsTUFBSU4sTUFBTSxZQUFZbkIsS0FBdEIsRUFDRTtBQUNBO0FBQ0EsVUFBTW1CLE1BQU4sQ0FIRixLQUlLO0FBQ0gsUUFBSSxDQUFFN0IsUUFBUSxDQUFDQyxLQUFULENBQWVpQixZQUFmLEdBQThCa0IsUUFBOUIsQ0FBdUNQLE1BQU0sQ0FBQ1EsV0FBOUMsQ0FBTixFQUFrRTtBQUNoRTtBQUNBO0FBQ0E7QUFDQSxhQUFPO0FBQUVMLFlBQUksRUFBRSxPQUFSO0FBQ0VDLGFBQUssRUFBRSxJQUFJdEIsTUFBTSxDQUFDRCxLQUFYLENBQ0xWLFFBQVEsQ0FBQ2tDLG1CQUFULENBQTZCQyxZQUR4QixtREFFcUNOLE1BQU0sQ0FBQ1EsV0FGNUM7QUFEVCxPQUFQO0FBS0Q7O0FBQ0QsV0FBT3JDLFFBQVEsQ0FBQ3NDLHFDQUFULENBQStDVCxNQUFNLENBQUNRLFdBQXRELEVBQW1FUixNQUFNLENBQUNVLFdBQTFFLEVBQXVGVixNQUFNLENBQUNSLE9BQTlGLENBQVA7QUFDRDtBQUNGLENBdERELEUiLCJmaWxlIjoiL3BhY2thZ2VzL2FjY291bnRzLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiQWNjb3VudHMub2F1dGggPSB7fTtcblxuY29uc3Qgc2VydmljZXMgPSB7fTtcbmNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIEhlbHBlciBmb3IgcmVnaXN0ZXJpbmcgT0F1dGggYmFzZWQgYWNjb3VudHMgcGFja2FnZXMuXG4vLyBPbiB0aGUgc2VydmVyLCBhZGRzIGFuIGluZGV4IHRvIHRoZSB1c2VyIGNvbGxlY3Rpb24uXG5BY2NvdW50cy5vYXV0aC5yZWdpc3RlclNlcnZpY2UgPSBuYW1lID0+IHtcbiAgaWYgKGhhc093bi5jYWxsKHNlcnZpY2VzLCBuYW1lKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzZXJ2aWNlOiAke25hbWV9YCk7XG4gIHNlcnZpY2VzW25hbWVdID0gdHJ1ZTtcblxuICBpZiAoTWV0ZW9yLnNlcnZlcikge1xuICAgIC8vIEFjY291bnRzLnVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UgZG9lcyBhIGxvb2t1cCBieSB0aGlzIGlkLFxuICAgIC8vIHNvIHRoaXMgc2hvdWxkIGJlIGEgdW5pcXVlIGluZGV4LiBZb3UgbWlnaHQgd2FudCB0byBhZGQgaW5kZXhlcyBmb3Igb3RoZXJcbiAgICAvLyBmaWVsZHMgcmV0dXJuZWQgYnkgeW91ciBzZXJ2aWNlIChlZyBzZXJ2aWNlcy5naXRodWIubG9naW4pIGJ1dCB5b3UgY2FuIGRvXG4gICAgLy8gdGhhdCBpbiB5b3VyIGFwcC5cbiAgICBNZXRlb3IudXNlcnMuX2Vuc3VyZUluZGV4KGBzZXJ2aWNlcy4ke25hbWV9LmlkYCwge3VuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlfSk7XG4gIH1cbn07XG5cbi8vIFJlbW92ZXMgYSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgc2VydmljZS5cbi8vIFRoaXMgd2lsbCBkaXNhYmxlIGxvZ2dpbmcgaW4gd2l0aCB0aGlzIHNlcnZpY2UsIGFuZCBzZXJ2aWNlTmFtZXMoKSB3aWxsIG5vdFxuLy8gY29udGFpbiBpdC5cbi8vIEl0J3Mgd29ydGggbm90aW5nIHRoYXQgYWxyZWFkeSBsb2dnZWQgaW4gdXNlcnMgd2lsbCByZW1haW4gbG9nZ2VkIGluIHVubGVzc1xuLy8geW91IG1hbnVhbGx5IGV4cGlyZSB0aGVpciBzZXNzaW9ucy5cbkFjY291bnRzLm9hdXRoLnVucmVnaXN0ZXJTZXJ2aWNlID0gbmFtZSA9PiB7XG4gIGlmICghaGFzT3duLmNhbGwoc2VydmljZXMsIG5hbWUpKVxuICAgIHRocm93IG5ldyBFcnJvcihgU2VydmljZSBub3QgZm91bmQ6ICR7bmFtZX1gKTtcbiAgZGVsZXRlIHNlcnZpY2VzW25hbWVdO1xufTtcblxuQWNjb3VudHMub2F1dGguc2VydmljZU5hbWVzID0gKCkgPT4gT2JqZWN0LmtleXMoc2VydmljZXMpO1xuIiwiLy8gTGlzdGVuIHRvIGNhbGxzIHRvIGBsb2dpbmAgd2l0aCBhbiBvYXV0aCBvcHRpb24gc2V0LiBUaGlzIGlzIHdoZXJlXG4vLyB1c2VycyBhY3R1YWxseSBnZXQgbG9nZ2VkIGluIHRvIG1ldGVvciB2aWEgb2F1dGguXG5BY2NvdW50cy5yZWdpc3RlckxvZ2luSGFuZGxlcihvcHRpb25zID0+IHtcbiAgaWYgKCFvcHRpb25zLm9hdXRoKVxuICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIGRvbid0IGhhbmRsZVxuXG4gIGNoZWNrKG9wdGlvbnMub2F1dGgsIHtcbiAgICBjcmVkZW50aWFsVG9rZW46IFN0cmluZyxcbiAgICAvLyBXaGVuIGFuIGVycm9yIG9jY3VycyB3aGlsZSByZXRyaWV2aW5nIHRoZSBhY2Nlc3MgdG9rZW4sIHdlIHN0b3JlXG4gICAgLy8gdGhlIGVycm9yIGluIHRoZSBwZW5kaW5nIGNyZWRlbnRpYWxzIHRhYmxlLCB3aXRoIGEgc2VjcmV0IG9mXG4gICAgLy8gbnVsbC4gVGhlIGNsaWVudCBjYW4gY2FsbCB0aGUgbG9naW4gbWV0aG9kIHdpdGggYSBzZWNyZXQgb2YgbnVsbFxuICAgIC8vIHRvIHJldHJpZXZlIHRoZSBlcnJvci5cbiAgICBjcmVkZW50aWFsU2VjcmV0OiBNYXRjaC5PbmVPZihudWxsLCBTdHJpbmcpXG4gIH0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChvcHRpb25zLm9hdXRoLmNyZWRlbnRpYWxUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9hdXRoLmNyZWRlbnRpYWxTZWNyZXQpO1xuXG4gIGlmICghcmVzdWx0KSB7XG4gICAgLy8gT0F1dGggY3JlZGVudGlhbFRva2VuIGlzIG5vdCByZWNvZ25pemVkLCB3aGljaCBjb3VsZCBiZSBlaXRoZXJcbiAgICAvLyBiZWNhdXNlIHRoZSBwb3B1cCB3YXMgY2xvc2VkIGJ5IHRoZSB1c2VyIGJlZm9yZSBjb21wbGV0aW9uLCBvclxuICAgIC8vIHNvbWUgc29ydCBvZiBlcnJvciB3aGVyZSB0aGUgb2F1dGggcHJvdmlkZXIgZGlkbid0IHRhbGsgdG8gb3VyXG4gICAgLy8gc2VydmVyIGNvcnJlY3RseSBhbmQgY2xvc2VkIHRoZSBwb3B1cCBzb21laG93LlxuICAgIC8vXG4gICAgLy8gV2UgYXNzdW1lIGl0IHdhcyB1c2VyIGNhbmNlbGVkIGFuZCByZXBvcnQgaXQgYXMgc3VjaCwgdXNpbmcgYVxuICAgIC8vIG51bWVyaWMgY29kZSB0aGF0IHRoZSBjbGllbnQgcmVjb2duaXplcyAoWFhYIHRoaXMgd2lsbCBnZXRcbiAgICAvLyByZXBsYWNlZCBieSBhIHN5bWJvbGljIGVycm9yIGNvZGUgYXQgc29tZSBwb2ludFxuICAgIC8vIGh0dHBzOi8vdHJlbGxvLmNvbS9jL2tNa3c4MDBaLzUzLW9mZmljaWFsLWRkcC1zcGVjaWZpY2F0aW9uKS4gVGhpc1xuICAgIC8vIHdpbGwgbWFzayBmYWlsdXJlcyB3aGVyZSB0aGluZ3MgYXJlIG1pc2NvbmZpZ3VyZWQgc3VjaCB0aGF0IHRoZVxuICAgIC8vIHNlcnZlciBkb2Vzbid0IHNlZSB0aGUgcmVxdWVzdCBidXQgZG9lcyBjbG9zZSB0aGUgd2luZG93LiBUaGlzXG4gICAgLy8gc2VlbXMgdW5saWtlbHkuXG4gICAgLy9cbiAgICAvLyBYWFggd2Ugd2FudCBgdHlwZWAgdG8gYmUgdGhlIHNlcnZpY2UgbmFtZSBzdWNoIGFzIFwiZmFjZWJvb2tcIlxuICAgIHJldHVybiB7IHR5cGU6IFwib2F1dGhcIixcbiAgICAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcihcbiAgICAgICAgICAgICAgIEFjY291bnRzLkxvZ2luQ2FuY2VsbGVkRXJyb3IubnVtZXJpY0Vycm9yLFxuICAgICAgICAgICAgICAgXCJObyBtYXRjaGluZyBsb2dpbiBhdHRlbXB0IGZvdW5kXCIpIH07XG4gIH1cblxuICBpZiAocmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpXG4gICAgLy8gV2UgdHJpZWQgdG8gbG9naW4sIGJ1dCB0aGVyZSB3YXMgYSBmYXRhbCBlcnJvci4gUmVwb3J0IGl0IGJhY2tcbiAgICAvLyB0byB0aGUgdXNlci5cbiAgICB0aHJvdyByZXN1bHQ7XG4gIGVsc2Uge1xuICAgIGlmICghIEFjY291bnRzLm9hdXRoLnNlcnZpY2VOYW1lcygpLmluY2x1ZGVzKHJlc3VsdC5zZXJ2aWNlTmFtZSkpIHtcbiAgICAgIC8vIHNlcnZpY2VOYW1lIHdhcyBub3QgZm91bmQgaW4gdGhlIHJlZ2lzdGVyZWQgc2VydmljZXMgbGlzdC5cbiAgICAgIC8vIFRoaXMgY291bGQgaGFwcGVuIGJlY2F1c2UgdGhlIHNlcnZpY2UgbmV2ZXIgcmVnaXN0ZXJlZCBpdHNlbGYgb3JcbiAgICAgIC8vIHVucmVnaXN0ZXJTZXJ2aWNlIHdhcyBjYWxsZWQgb24gaXQuXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm9hdXRoXCIsXG4gICAgICAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcihcbiAgICAgICAgICAgICAgICAgQWNjb3VudHMuTG9naW5DYW5jZWxsZWRFcnJvci5udW1lcmljRXJyb3IsXG4gICAgICAgICAgICAgICAgIGBObyByZWdpc3RlcmVkIG9hdXRoIHNlcnZpY2UgZm91bmQgZm9yOiAke3Jlc3VsdC5zZXJ2aWNlTmFtZX1gKSB9O1xuXG4gICAgfVxuICAgIHJldHVybiBBY2NvdW50cy51cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKHJlc3VsdC5zZXJ2aWNlTmFtZSwgcmVzdWx0LnNlcnZpY2VEYXRhLCByZXN1bHQub3B0aW9ucyk7XG4gIH1cbn0pO1xuIl19
