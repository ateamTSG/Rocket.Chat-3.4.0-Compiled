(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Github = Package['github-oauth'].Github;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-github":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-github/notice.js                                                                    //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'github-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-github,\n" + "but didn't install the configuration UI for the GitHub\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add github-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"github.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-github/github.js                                                                    //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
Accounts.oauth.registerService('github');

if (Meteor.isClient) {
  const loginWithGithub = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Github.requestCredential(options, credentialRequestCompleteCallback);
  };

  Accounts.registerClientLoginFunction('github', loginWithGithub);

  Meteor.loginWithGithub = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Accounts.applyLoginFunction('github', args);
  };
} else {
  Accounts.addAutopublishFields({
    // not sure whether the github api can be used from the browser,
    // thus not sure if we should be sending access tokens; but we do it
    // for all other oauth2 providers, and it may come in handy.
    forLoggedInUser: ['services.github'],
    forOtherUsers: ['services.github.username']
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-github/notice.js");
require("/node_modules/meteor/accounts-github/github.js");

/* Exports */
Package._define("accounts-github");

})();

//# sourceURL=meteor://💻app/packages/accounts-github.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ2l0aHViL25vdGljZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ2l0aHViL2dpdGh1Yi5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJBY2NvdW50cyIsIm9hdXRoIiwicmVnaXN0ZXJTZXJ2aWNlIiwiTWV0ZW9yIiwiaXNDbGllbnQiLCJsb2dpbldpdGhHaXRodWIiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2siLCJjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlciIsIkdpdGh1YiIsInJlcXVlc3RDcmVkZW50aWFsIiwicmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uIiwiYXJncyIsImFwcGx5TG9naW5GdW5jdGlvbiIsImFkZEF1dG9wdWJsaXNoRmllbGRzIiwiZm9yTG9nZ2VkSW5Vc2VyIiwiZm9yT3RoZXJVc2VycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxPQUFPLENBQUMsYUFBRCxDQUFQLElBQ0csQ0FBQ0EsT0FBTyxDQUFDLHVCQUFELENBRFgsSUFFRyxDQUFDQyxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ0osT0FBckMsRUFBOEMsa0JBQTlDLENBRlIsRUFFMkU7QUFDekVLLFNBQU8sQ0FBQ0MsSUFBUixDQUNFLDBEQUNBLDBEQURBLEdBRUEsbUNBRkEsR0FHQSxJQUhBLEdBSUEsaUNBSkEsR0FLQSxJQU5GO0FBUUQsQzs7Ozs7Ozs7Ozs7QUNYREMsUUFBUSxDQUFDQyxLQUFULENBQWVDLGVBQWYsQ0FBK0IsUUFBL0I7O0FBRUEsSUFBSUMsTUFBTSxDQUFDQyxRQUFYLEVBQXFCO0FBQ25CLFFBQU1DLGVBQWUsR0FBRyxDQUFDQyxPQUFELEVBQVVDLFFBQVYsS0FBdUI7QUFDN0M7QUFDQSxRQUFJLENBQUVBLFFBQUYsSUFBYyxPQUFPRCxPQUFQLEtBQW1CLFVBQXJDLEVBQWlEO0FBQy9DQyxjQUFRLEdBQUdELE9BQVg7QUFDQUEsYUFBTyxHQUFHLElBQVY7QUFDRDs7QUFFRCxVQUFNRSxpQ0FBaUMsR0FBR1IsUUFBUSxDQUFDQyxLQUFULENBQWVRLGdDQUFmLENBQWdERixRQUFoRCxDQUExQztBQUNBRyxVQUFNLENBQUNDLGlCQUFQLENBQXlCTCxPQUF6QixFQUFrQ0UsaUNBQWxDO0FBQ0QsR0FURDs7QUFVQVIsVUFBUSxDQUFDWSwyQkFBVCxDQUFxQyxRQUFyQyxFQUErQ1AsZUFBL0M7O0FBQ0FGLFFBQU0sQ0FBQ0UsZUFBUCxHQUNFO0FBQUEsc0NBQUlRLElBQUo7QUFBSUEsVUFBSjtBQUFBOztBQUFBLFdBQWFiLFFBQVEsQ0FBQ2Msa0JBQVQsQ0FBNEIsUUFBNUIsRUFBc0NELElBQXRDLENBQWI7QUFBQSxHQURGO0FBRUQsQ0FkRCxNQWNPO0FBQ0xiLFVBQVEsQ0FBQ2Usb0JBQVQsQ0FBOEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0FDLG1CQUFlLEVBQUUsQ0FBQyxpQkFBRCxDQUpXO0FBSzVCQyxpQkFBYSxFQUFFLENBQUMsMEJBQUQ7QUFMYSxHQUE5QjtBQU9ELEMiLCJmaWxlIjoiL3BhY2thZ2VzL2FjY291bnRzLWdpdGh1Yi5qcyIsInNvdXJjZXNDb250ZW50IjpbImlmIChQYWNrYWdlWydhY2NvdW50cy11aSddXG4gICAgJiYgIVBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddXG4gICAgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChQYWNrYWdlLCAnZ2l0aHViLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgYWNjb3VudHMtZ2l0aHViLFxcblwiICtcbiAgICBcImJ1dCBkaWRuJ3QgaW5zdGFsbCB0aGUgY29uZmlndXJhdGlvbiBVSSBmb3IgdGhlIEdpdEh1YlxcblwiICtcbiAgICBcIk9BdXRoLiBZb3UgY2FuIGluc3RhbGwgaXQgd2l0aDpcXG5cIiArXG4gICAgXCJcXG5cIiArXG4gICAgXCIgICAgbWV0ZW9yIGFkZCBnaXRodWItY29uZmlnLXVpXCIgK1xuICAgIFwiXFxuXCJcbiAgKTtcbn1cbiIsIkFjY291bnRzLm9hdXRoLnJlZ2lzdGVyU2VydmljZSgnZ2l0aHViJyk7XG5cbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgY29uc3QgbG9naW5XaXRoR2l0aHViID0gKG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gICAgLy8gc3VwcG9ydCBhIGNhbGxiYWNrIHdpdGhvdXQgb3B0aW9uc1xuICAgIGlmICghIGNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayA9IEFjY291bnRzLm9hdXRoLmNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVIYW5kbGVyKGNhbGxiYWNrKTtcbiAgICBHaXRodWIucmVxdWVzdENyZWRlbnRpYWwob3B0aW9ucywgY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrKTtcbiAgfTtcbiAgQWNjb3VudHMucmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uKCdnaXRodWInLCBsb2dpbldpdGhHaXRodWIpO1xuICBNZXRlb3IubG9naW5XaXRoR2l0aHViID0gXG4gICAgKC4uLmFyZ3MpID0+IEFjY291bnRzLmFwcGx5TG9naW5GdW5jdGlvbignZ2l0aHViJywgYXJncyk7XG59IGVsc2Uge1xuICBBY2NvdW50cy5hZGRBdXRvcHVibGlzaEZpZWxkcyh7XG4gICAgLy8gbm90IHN1cmUgd2hldGhlciB0aGUgZ2l0aHViIGFwaSBjYW4gYmUgdXNlZCBmcm9tIHRoZSBicm93c2VyLFxuICAgIC8vIHRodXMgbm90IHN1cmUgaWYgd2Ugc2hvdWxkIGJlIHNlbmRpbmcgYWNjZXNzIHRva2VuczsgYnV0IHdlIGRvIGl0XG4gICAgLy8gZm9yIGFsbCBvdGhlciBvYXV0aDIgcHJvdmlkZXJzLCBhbmQgaXQgbWF5IGNvbWUgaW4gaGFuZHkuXG4gICAgZm9yTG9nZ2VkSW5Vc2VyOiBbJ3NlcnZpY2VzLmdpdGh1YiddLFxuICAgIGZvck90aGVyVXNlcnM6IFsnc2VydmljZXMuZ2l0aHViLnVzZXJuYW1lJ11cbiAgfSk7XG59XG4iXX0=
