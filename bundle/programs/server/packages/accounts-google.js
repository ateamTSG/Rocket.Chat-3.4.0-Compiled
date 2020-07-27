(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Google = Package['google-oauth'].Google;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-google":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-google/notice.js                                                                    //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'google-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-google,\n" + "but didn't install the configuration UI for the Google\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add google-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"google.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-google/google.js                                                                    //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
Accounts.oauth.registerService('google');

if (Meteor.isClient) {
  const loginWithGoogle = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    if (Meteor.isCordova && Google.signIn) {
      // After 20 April 2017, Google OAuth login will no longer work from
      // a WebView, so Cordova apps must use Google Sign-In instead.
      // https://github.com/meteor/meteor/issues/8253
      Google.signIn(options, callback);
      return;
    } // Use Google's domain-specific login page if we want to restrict creation to
    // a particular email domain. (Don't use it if restrictCreationByEmailDomain
    // is a function.) Note that all this does is change Google's UI ---
    // accounts-base/accounts_server.js still checks server-side that the server
    // has the proper email address after the OAuth conversation.


    if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {
      options = _objectSpread({}, options);
      options.loginUrlParameters = _objectSpread({}, options.loginUrlParameters);
      options.loginUrlParameters.hd = Accounts._options.restrictCreationByEmailDomain;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Google.requestCredential(options, credentialRequestCompleteCallback);
  };

  Accounts.registerClientLoginFunction('google', loginWithGoogle);

  Meteor.loginWithGoogle = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Accounts.applyLoginFunction('google', args);
  };
} else {
  Accounts.addAutopublishFields({
    forLoggedInUser: // publish access token since it can be used from the client (if
    // transmitted over ssl or on
    // localhost). https://developers.google.com/accounts/docs/OAuth2UserAgent
    // refresh token probably shouldn't be sent down.
    Google.whitelistedFields.concat(['accessToken', 'expiresAt']).map(subfield => "services.google.".concat(subfield) // don't publish refresh token
    ),
    forOtherUsers: // even with autopublish, no legitimate web app should be
    // publishing all users' emails
    Google.whitelistedFields.filter(field => field !== 'email' && field !== 'verified_email').map(subfield => "services.google.".concat(subfield))
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-google/notice.js");
require("/node_modules/meteor/accounts-google/google.js");

/* Exports */
Package._define("accounts-google");

})();

//# sourceURL=meteor://💻app/packages/accounts-google.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ29vZ2xlL25vdGljZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ29vZ2xlL2dvb2dsZS5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiQWNjb3VudHMiLCJvYXV0aCIsInJlZ2lzdGVyU2VydmljZSIsIk1ldGVvciIsImlzQ2xpZW50IiwibG9naW5XaXRoR29vZ2xlIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiaXNDb3Jkb3ZhIiwiR29vZ2xlIiwic2lnbkluIiwiX29wdGlvbnMiLCJyZXN0cmljdENyZWF0aW9uQnlFbWFpbERvbWFpbiIsImxvZ2luVXJsUGFyYW1ldGVycyIsImhkIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUhhbmRsZXIiLCJyZXF1ZXN0Q3JlZGVudGlhbCIsInJlZ2lzdGVyQ2xpZW50TG9naW5GdW5jdGlvbiIsImFyZ3MiLCJhcHBseUxvZ2luRnVuY3Rpb24iLCJhZGRBdXRvcHVibGlzaEZpZWxkcyIsImZvckxvZ2dlZEluVXNlciIsIndoaXRlbGlzdGVkRmllbGRzIiwiY29uY2F0IiwibWFwIiwic3ViZmllbGQiLCJmb3JPdGhlclVzZXJzIiwiZmlsdGVyIiwiZmllbGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsT0FBTyxDQUFDLGFBQUQsQ0FBUCxJQUNHLENBQUNBLE9BQU8sQ0FBQyx1QkFBRCxDQURYLElBRUcsQ0FBQ0MsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxjQUFqQixDQUFnQ0MsSUFBaEMsQ0FBcUNKLE9BQXJDLEVBQThDLGtCQUE5QyxDQUZSLEVBRTJFO0FBQ3pFSyxTQUFPLENBQUNDLElBQVIsQ0FDRSwwREFDQSwwREFEQSxHQUVBLG1DQUZBLEdBR0EsSUFIQSxHQUlBLGlDQUpBLEdBS0EsSUFORjtBQVFELEM7Ozs7Ozs7Ozs7O0FDWEQsSUFBSUMsYUFBSjs7QUFBa0JDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLHNDQUFaLEVBQW1EO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNKLGlCQUFhLEdBQUNJLENBQWQ7QUFBZ0I7O0FBQTVCLENBQW5ELEVBQWlGLENBQWpGO0FBQWxCQyxRQUFRLENBQUNDLEtBQVQsQ0FBZUMsZUFBZixDQUErQixRQUEvQjs7QUFFQSxJQUFJQyxNQUFNLENBQUNDLFFBQVgsRUFBcUI7QUFDbkIsUUFBTUMsZUFBZSxHQUFHLENBQUNDLE9BQUQsRUFBVUMsUUFBVixLQUF1QjtBQUM3QztBQUNBLFFBQUksQ0FBRUEsUUFBRixJQUFjLE9BQU9ELE9BQVAsS0FBbUIsVUFBckMsRUFBaUQ7QUFDL0NDLGNBQVEsR0FBR0QsT0FBWDtBQUNBQSxhQUFPLEdBQUcsSUFBVjtBQUNEOztBQUVELFFBQUlILE1BQU0sQ0FBQ0ssU0FBUCxJQUNBQyxNQUFNLENBQUNDLE1BRFgsRUFDbUI7QUFDakI7QUFDQTtBQUNBO0FBQ0FELFlBQU0sQ0FBQ0MsTUFBUCxDQUFjSixPQUFkLEVBQXVCQyxRQUF2QjtBQUNBO0FBQ0QsS0FkNEMsQ0FnQjdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFFBQUksT0FBT1AsUUFBUSxDQUFDVyxRQUFULENBQWtCQyw2QkFBekIsS0FBMkQsUUFBL0QsRUFBeUU7QUFDdkVOLGFBQU8scUJBQVFBLE9BQVIsQ0FBUDtBQUNBQSxhQUFPLENBQUNPLGtCQUFSLHFCQUFrQ1AsT0FBTyxDQUFDTyxrQkFBMUM7QUFDQVAsYUFBTyxDQUFDTyxrQkFBUixDQUEyQkMsRUFBM0IsR0FBZ0NkLFFBQVEsQ0FBQ1csUUFBVCxDQUFrQkMsNkJBQWxEO0FBQ0Q7O0FBQ0QsVUFBTUcsaUNBQWlDLEdBQUdmLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlZSxnQ0FBZixDQUFnRFQsUUFBaEQsQ0FBMUM7QUFDQUUsVUFBTSxDQUFDUSxpQkFBUCxDQUF5QlgsT0FBekIsRUFBa0NTLGlDQUFsQztBQUNELEdBNUJEOztBQTZCQWYsVUFBUSxDQUFDa0IsMkJBQVQsQ0FBcUMsUUFBckMsRUFBK0NiLGVBQS9DOztBQUNBRixRQUFNLENBQUNFLGVBQVAsR0FDRTtBQUFBLHNDQUFJYyxJQUFKO0FBQUlBLFVBQUo7QUFBQTs7QUFBQSxXQUFhbkIsUUFBUSxDQUFDb0Isa0JBQVQsQ0FBNEIsUUFBNUIsRUFBc0NELElBQXRDLENBQWI7QUFBQSxHQURGO0FBRUQsQ0FqQ0QsTUFpQ087QUFDTG5CLFVBQVEsQ0FBQ3FCLG9CQUFULENBQThCO0FBQzVCQyxtQkFBZSxFQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0FiLFVBQU0sQ0FBQ2MsaUJBQVAsQ0FBeUJDLE1BQXpCLENBQWdDLENBQUMsYUFBRCxFQUFnQixXQUFoQixDQUFoQyxFQUE4REMsR0FBOUQsQ0FDRUMsUUFBUSw4QkFBdUJBLFFBQXZCLENBRFYsQ0FDNEM7QUFENUMsS0FOMEI7QUFVNUJDLGlCQUFhLEVBQ1g7QUFDQTtBQUNBbEIsVUFBTSxDQUFDYyxpQkFBUCxDQUF5QkssTUFBekIsQ0FDRUMsS0FBSyxJQUFJQSxLQUFLLEtBQUssT0FBVixJQUFxQkEsS0FBSyxLQUFLLGdCQUQxQyxFQUVFSixHQUZGLENBR0VDLFFBQVEsOEJBQXVCQSxRQUF2QixDQUhWO0FBYjBCLEdBQTlCO0FBbUJELEMiLCJmaWxlIjoiL3BhY2thZ2VzL2FjY291bnRzLWdvb2dsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImlmIChQYWNrYWdlWydhY2NvdW50cy11aSddXG4gICAgJiYgIVBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddXG4gICAgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChQYWNrYWdlLCAnZ29vZ2xlLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgYWNjb3VudHMtZ29vZ2xlLFxcblwiICtcbiAgICBcImJ1dCBkaWRuJ3QgaW5zdGFsbCB0aGUgY29uZmlndXJhdGlvbiBVSSBmb3IgdGhlIEdvb2dsZVxcblwiICtcbiAgICBcIk9BdXRoLiBZb3UgY2FuIGluc3RhbGwgaXQgd2l0aDpcXG5cIiArXG4gICAgXCJcXG5cIiArXG4gICAgXCIgICAgbWV0ZW9yIGFkZCBnb29nbGUtY29uZmlnLXVpXCIgK1xuICAgIFwiXFxuXCJcbiAgKTtcbn1cbiIsIkFjY291bnRzLm9hdXRoLnJlZ2lzdGVyU2VydmljZSgnZ29vZ2xlJyk7XG5cbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgY29uc3QgbG9naW5XaXRoR29vZ2xlID0gKG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gICAgLy8gc3VwcG9ydCBhIGNhbGxiYWNrIHdpdGhvdXQgb3B0aW9uc1xuICAgIGlmICghIGNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChNZXRlb3IuaXNDb3Jkb3ZhICYmXG4gICAgICAgIEdvb2dsZS5zaWduSW4pIHtcbiAgICAgIC8vIEFmdGVyIDIwIEFwcmlsIDIwMTcsIEdvb2dsZSBPQXV0aCBsb2dpbiB3aWxsIG5vIGxvbmdlciB3b3JrIGZyb21cbiAgICAgIC8vIGEgV2ViVmlldywgc28gQ29yZG92YSBhcHBzIG11c3QgdXNlIEdvb2dsZSBTaWduLUluIGluc3RlYWQuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvODI1M1xuICAgICAgR29vZ2xlLnNpZ25JbihvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXNlIEdvb2dsZSdzIGRvbWFpbi1zcGVjaWZpYyBsb2dpbiBwYWdlIGlmIHdlIHdhbnQgdG8gcmVzdHJpY3QgY3JlYXRpb24gdG9cbiAgICAvLyBhIHBhcnRpY3VsYXIgZW1haWwgZG9tYWluLiAoRG9uJ3QgdXNlIGl0IGlmIHJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluXG4gICAgLy8gaXMgYSBmdW5jdGlvbi4pIE5vdGUgdGhhdCBhbGwgdGhpcyBkb2VzIGlzIGNoYW5nZSBHb29nbGUncyBVSSAtLS1cbiAgICAvLyBhY2NvdW50cy1iYXNlL2FjY291bnRzX3NlcnZlci5qcyBzdGlsbCBjaGVja3Mgc2VydmVyLXNpZGUgdGhhdCB0aGUgc2VydmVyXG4gICAgLy8gaGFzIHRoZSBwcm9wZXIgZW1haWwgYWRkcmVzcyBhZnRlciB0aGUgT0F1dGggY29udmVyc2F0aW9uLlxuICAgIGlmICh0eXBlb2YgQWNjb3VudHMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICBvcHRpb25zID0geyAuLi5vcHRpb25zIH07XG4gICAgICBvcHRpb25zLmxvZ2luVXJsUGFyYW1ldGVycyA9IHsgLi4ub3B0aW9ucy5sb2dpblVybFBhcmFtZXRlcnMgfTtcbiAgICAgIG9wdGlvbnMubG9naW5VcmxQYXJhbWV0ZXJzLmhkID0gQWNjb3VudHMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW47XG4gICAgfVxuICAgIGNvbnN0IGNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayA9IEFjY291bnRzLm9hdXRoLmNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVIYW5kbGVyKGNhbGxiYWNrKTtcbiAgICBHb29nbGUucmVxdWVzdENyZWRlbnRpYWwob3B0aW9ucywgY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrKTtcbiAgfTtcbiAgQWNjb3VudHMucmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uKCdnb29nbGUnLCBsb2dpbldpdGhHb29nbGUpO1xuICBNZXRlb3IubG9naW5XaXRoR29vZ2xlID0gXG4gICAgKC4uLmFyZ3MpID0+IEFjY291bnRzLmFwcGx5TG9naW5GdW5jdGlvbignZ29vZ2xlJywgYXJncyk7XG59IGVsc2Uge1xuICBBY2NvdW50cy5hZGRBdXRvcHVibGlzaEZpZWxkcyh7XG4gICAgZm9yTG9nZ2VkSW5Vc2VyOlxuICAgICAgLy8gcHVibGlzaCBhY2Nlc3MgdG9rZW4gc2luY2UgaXQgY2FuIGJlIHVzZWQgZnJvbSB0aGUgY2xpZW50IChpZlxuICAgICAgLy8gdHJhbnNtaXR0ZWQgb3ZlciBzc2wgb3Igb25cbiAgICAgIC8vIGxvY2FsaG9zdCkuIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2FjY291bnRzL2RvY3MvT0F1dGgyVXNlckFnZW50XG4gICAgICAvLyByZWZyZXNoIHRva2VuIHByb2JhYmx5IHNob3VsZG4ndCBiZSBzZW50IGRvd24uXG4gICAgICBHb29nbGUud2hpdGVsaXN0ZWRGaWVsZHMuY29uY2F0KFsnYWNjZXNzVG9rZW4nLCAnZXhwaXJlc0F0J10pLm1hcChcbiAgICAgICAgc3ViZmllbGQgPT4gYHNlcnZpY2VzLmdvb2dsZS4ke3N1YmZpZWxkfWAgLy8gZG9uJ3QgcHVibGlzaCByZWZyZXNoIHRva2VuXG4gICAgICApLCBcblxuICAgIGZvck90aGVyVXNlcnM6IFxuICAgICAgLy8gZXZlbiB3aXRoIGF1dG9wdWJsaXNoLCBubyBsZWdpdGltYXRlIHdlYiBhcHAgc2hvdWxkIGJlXG4gICAgICAvLyBwdWJsaXNoaW5nIGFsbCB1c2VycycgZW1haWxzXG4gICAgICBHb29nbGUud2hpdGVsaXN0ZWRGaWVsZHMuZmlsdGVyKFxuICAgICAgICBmaWVsZCA9PiBmaWVsZCAhPT0gJ2VtYWlsJyAmJiBmaWVsZCAhPT0gJ3ZlcmlmaWVkX2VtYWlsJ1xuICAgICAgKS5tYXAoXG4gICAgICAgIHN1YmZpZWxkID0+IGBzZXJ2aWNlcy5nb29nbGUuJHtzdWJmaWVsZH1gXG4gICAgICApLFxuICB9KTtcbn1cbiJdfQ==
