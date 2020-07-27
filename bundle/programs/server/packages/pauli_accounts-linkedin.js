(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Linkedin = Package['pauli:linkedin-oauth'].Linkedin;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"pauli:accounts-linkedin":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/pauli_accounts-linkedin/notice.js                                                            //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Package.hasOwnProperty('pauli:linkedin-config-ui')) {
  console.warn("Note: You're using accounts-ui and pauli:accounts-linkedin,\n" + "but didn't install the configuration UI for the Linkedin\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add pauli:linkedin-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"linkedin.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/pauli_accounts-linkedin/linkedin.js                                                          //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
Accounts.oauth.registerService('linkedin');

if (Meteor.isClient) {
  const loginWithLinkedin = function (options, callback) {
    // support a callback without options
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Linkedin.requestCredential(options, credentialRequestCompleteCallback);
  };

  Accounts.registerClientLoginFunction('linkedin', loginWithLinkedin);

  Meteor.loginWithLinkedin = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Accounts.applyLoginFunction('linkedin', args);
  };
} else {
  Accounts.addAutopublishFields({
    forLoggedInUser: ['services.linkedin']
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/pauli:accounts-linkedin/notice.js");
require("/node_modules/meteor/pauli:accounts-linkedin/linkedin.js");

/* Exports */
Package._define("pauli:accounts-linkedin");

})();

//# sourceURL=meteor://💻app/packages/pauli_accounts-linkedin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcGF1bGk6YWNjb3VudHMtbGlua2VkaW4vbm90aWNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9wYXVsaTphY2NvdW50cy1saW5rZWRpbi9saW5rZWRpbi5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiaGFzT3duUHJvcGVydHkiLCJjb25zb2xlIiwid2FybiIsIkFjY291bnRzIiwib2F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJNZXRlb3IiLCJpc0NsaWVudCIsImxvZ2luV2l0aExpbmtlZGluIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUhhbmRsZXIiLCJMaW5rZWRpbiIsInJlcXVlc3RDcmVkZW50aWFsIiwicmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uIiwiYXJncyIsImFwcGx5TG9naW5GdW5jdGlvbiIsImFkZEF1dG9wdWJsaXNoRmllbGRzIiwiZm9yTG9nZ2VkSW5Vc2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsT0FBTyxDQUFDLGFBQUQsQ0FBUCxJQUNHLENBQUNBLE9BQU8sQ0FBQyx1QkFBRCxDQURYLElBRUcsQ0FBQ0EsT0FBTyxDQUFDQyxjQUFSLENBQXVCLDBCQUF2QixDQUZSLEVBRTREO0FBQzFEQyxTQUFPLENBQUNDLElBQVIsQ0FDRSxrRUFDQSw0REFEQSxHQUVBLG1DQUZBLEdBR0EsSUFIQSxHQUlBLHlDQUpBLEdBS0EsSUFORjtBQVFELEM7Ozs7Ozs7Ozs7O0FDWERDLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlQyxlQUFmLENBQStCLFVBQS9COztBQUVBLElBQUlDLE1BQU0sQ0FBQ0MsUUFBWCxFQUFxQjtBQUNuQixRQUFNQyxpQkFBaUIsR0FBRyxVQUFTQyxPQUFULEVBQWtCQyxRQUFsQixFQUE0QjtBQUNwRDtBQUNBLFFBQUksQ0FBQ0EsUUFBRCxJQUFhLE9BQU9ELE9BQVAsS0FBbUIsVUFBcEMsRUFBZ0Q7QUFDOUNDLGNBQVEsR0FBR0QsT0FBWDtBQUNBQSxhQUFPLEdBQUcsSUFBVjtBQUNEOztBQUNELFVBQU1FLGlDQUFpQyxHQUFHUixRQUFRLENBQUNDLEtBQVQsQ0FBZVEsZ0NBQWYsQ0FDeENGLFFBRHdDLENBQTFDO0FBR0FHLFlBQVEsQ0FBQ0MsaUJBQVQsQ0FDRUwsT0FERixFQUVFRSxpQ0FGRjtBQUlELEdBYkQ7O0FBY0FSLFVBQVEsQ0FBQ1ksMkJBQVQsQ0FDRSxVQURGLEVBRUVQLGlCQUZGOztBQUtBRixRQUFNLENBQUNFLGlCQUFQLEdBQTJCO0FBQUEsc0NBQUlRLElBQUo7QUFBSUEsVUFBSjtBQUFBOztBQUFBLFdBQ3pCYixRQUFRLENBQUNjLGtCQUFULENBQTRCLFVBQTVCLEVBQXdDRCxJQUF4QyxDQUR5QjtBQUFBLEdBQTNCO0FBRUQsQ0F0QkQsTUFzQk87QUFDTGIsVUFBUSxDQUFDZSxvQkFBVCxDQUE4QjtBQUM1QkMsbUJBQWUsRUFBRSxDQUFDLG1CQUFEO0FBRFcsR0FBOUI7QUFHRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9wYXVsaV9hY2NvdW50cy1saW5rZWRpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImlmIChQYWNrYWdlWydhY2NvdW50cy11aSddXG4gICAgJiYgIVBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddXG4gICAgJiYgIVBhY2thZ2UuaGFzT3duUHJvcGVydHkoJ3BhdWxpOmxpbmtlZGluLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgcGF1bGk6YWNjb3VudHMtbGlua2VkaW4sXFxuXCIgK1xuICAgIFwiYnV0IGRpZG4ndCBpbnN0YWxsIHRoZSBjb25maWd1cmF0aW9uIFVJIGZvciB0aGUgTGlua2VkaW5cXG5cIiArXG4gICAgXCJPQXV0aC4gWW91IGNhbiBpbnN0YWxsIGl0IHdpdGg6XFxuXCIgK1xuICAgIFwiXFxuXCIgK1xuICAgIFwiICAgIG1ldGVvciBhZGQgcGF1bGk6bGlua2VkaW4tY29uZmlnLXVpXCIgK1xuICAgIFwiXFxuXCJcbiAgKTtcbn1cbiIsIkFjY291bnRzLm9hdXRoLnJlZ2lzdGVyU2VydmljZSgnbGlua2VkaW4nKVxuXG5pZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gIGNvbnN0IGxvZ2luV2l0aExpbmtlZGluID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAvLyBzdXBwb3J0IGEgY2FsbGJhY2sgd2l0aG91dCBvcHRpb25zXG4gICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgICBvcHRpb25zID0gbnVsbFxuICAgIH1cbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2sgPSBBY2NvdW50cy5vYXV0aC5jcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlcihcbiAgICAgIGNhbGxiYWNrLFxuICAgIClcbiAgICBMaW5rZWRpbi5yZXF1ZXN0Q3JlZGVudGlhbChcbiAgICAgIG9wdGlvbnMsXG4gICAgICBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2ssXG4gICAgKVxuICB9XG4gIEFjY291bnRzLnJlZ2lzdGVyQ2xpZW50TG9naW5GdW5jdGlvbihcbiAgICAnbGlua2VkaW4nLFxuICAgIGxvZ2luV2l0aExpbmtlZGluLFxuICApXG5cbiAgTWV0ZW9yLmxvZ2luV2l0aExpbmtlZGluID0gKC4uLmFyZ3MpID0+XG4gICAgQWNjb3VudHMuYXBwbHlMb2dpbkZ1bmN0aW9uKCdsaW5rZWRpbicsIGFyZ3MpXG59IGVsc2Uge1xuICBBY2NvdW50cy5hZGRBdXRvcHVibGlzaEZpZWxkcyh7XG4gICAgZm9yTG9nZ2VkSW5Vc2VyOiBbJ3NlcnZpY2VzLmxpbmtlZGluJ10sXG4gIH0pXG59XG4iXX0=
