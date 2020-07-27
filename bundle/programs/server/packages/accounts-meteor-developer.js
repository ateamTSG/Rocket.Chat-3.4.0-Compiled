(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var MeteorDeveloperAccounts = Package['meteor-developer-oauth'].MeteorDeveloperAccounts;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-meteor-developer":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-meteor-developer/notice.js                                                          //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'meteor-developer-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-meteor-developer,\n" + "but didn't install the configuration UI for the Meteor Developer\n" + "Accounts OAuth. You can install it with:\n" + "\n" + "    meteor add meteor-developer-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor-developer.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-meteor-developer/meteor-developer.js                                                //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
Accounts.oauth.registerService("meteor-developer");

if (Meteor.isClient) {
  const loginWithMeteorDeveloperAccount = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    MeteorDeveloperAccounts.requestCredential(options, credentialRequestCompleteCallback);
  };

  Accounts.registerClientLoginFunction('meteor-developer', loginWithMeteorDeveloperAccount);

  Meteor.loginWithMeteorDeveloperAccount = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Accounts.applyLoginFunction('meteor-developer', args);
  };
} else {
  Accounts.addAutopublishFields({
    // publish all fields including access token, which can legitimately be used
    // from the client (if transmitted over ssl or on localhost).
    forLoggedInUser: ['services.meteor-developer'],
    forOtherUsers: ['services.meteor-developer.username', 'services.meteor-developer.profile', 'services.meteor-developer.id']
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-meteor-developer/notice.js");
require("/node_modules/meteor/accounts-meteor-developer/meteor-developer.js");

/* Exports */
Package._define("accounts-meteor-developer");

})();

//# sourceURL=meteor://💻app/packages/accounts-meteor-developer.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtbWV0ZW9yLWRldmVsb3Blci9ub3RpY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FjY291bnRzLW1ldGVvci1kZXZlbG9wZXIvbWV0ZW9yLWRldmVsb3Blci5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJBY2NvdW50cyIsIm9hdXRoIiwicmVnaXN0ZXJTZXJ2aWNlIiwiTWV0ZW9yIiwiaXNDbGllbnQiLCJsb2dpbldpdGhNZXRlb3JEZXZlbG9wZXJBY2NvdW50Iiwib3B0aW9ucyIsImNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUhhbmRsZXIiLCJNZXRlb3JEZXZlbG9wZXJBY2NvdW50cyIsInJlcXVlc3RDcmVkZW50aWFsIiwicmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uIiwiYXJncyIsImFwcGx5TG9naW5GdW5jdGlvbiIsImFkZEF1dG9wdWJsaXNoRmllbGRzIiwiZm9yTG9nZ2VkSW5Vc2VyIiwiZm9yT3RoZXJVc2VycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxPQUFPLENBQUMsYUFBRCxDQUFQLElBQ0csQ0FBQ0EsT0FBTyxDQUFDLHVCQUFELENBRFgsSUFFRyxDQUFDQyxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ0osT0FBckMsRUFBOEMsNEJBQTlDLENBRlIsRUFFcUY7QUFDbkZLLFNBQU8sQ0FBQ0MsSUFBUixDQUNFLG9FQUNBLG9FQURBLEdBRUEsNENBRkEsR0FHQSxJQUhBLEdBSUEsMkNBSkEsR0FLQSxJQU5GO0FBUUQsQzs7Ozs7Ozs7Ozs7QUNYREMsUUFBUSxDQUFDQyxLQUFULENBQWVDLGVBQWYsQ0FBK0Isa0JBQS9COztBQUVBLElBQUlDLE1BQU0sQ0FBQ0MsUUFBWCxFQUFxQjtBQUNuQixRQUFNQywrQkFBK0IsR0FBRyxDQUFDQyxPQUFELEVBQVVDLFFBQVYsS0FBdUI7QUFDN0Q7QUFDQSxRQUFJLENBQUVBLFFBQUYsSUFBYyxPQUFPRCxPQUFQLEtBQW1CLFVBQXJDLEVBQWlEO0FBQy9DQyxjQUFRLEdBQUdELE9BQVg7QUFDQUEsYUFBTyxHQUFHLElBQVY7QUFDRDs7QUFFRCxVQUFNRSxpQ0FBaUMsR0FDakNSLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlUSxnQ0FBZixDQUFnREYsUUFBaEQsQ0FETjtBQUVBRywyQkFBdUIsQ0FBQ0MsaUJBQXhCLENBQTBDTCxPQUExQyxFQUFtREUsaUNBQW5EO0FBQ0QsR0FWRDs7QUFXQVIsVUFBUSxDQUFDWSwyQkFBVCxDQUFxQyxrQkFBckMsRUFBeURQLCtCQUF6RDs7QUFDQUYsUUFBTSxDQUFDRSwrQkFBUCxHQUF5QztBQUFBLHNDQUFJUSxJQUFKO0FBQUlBLFVBQUo7QUFBQTs7QUFBQSxXQUN2Q2IsUUFBUSxDQUFDYyxrQkFBVCxDQUE0QixrQkFBNUIsRUFBZ0RELElBQWhELENBRHVDO0FBQUEsR0FBekM7QUFFRCxDQWZELE1BZU87QUFDTGIsVUFBUSxDQUFDZSxvQkFBVCxDQUE4QjtBQUM1QjtBQUNBO0FBQ0FDLG1CQUFlLEVBQUUsQ0FBQywyQkFBRCxDQUhXO0FBSTVCQyxpQkFBYSxFQUFFLENBQ2Isb0NBRGEsRUFFYixtQ0FGYSxFQUdiLDhCQUhhO0FBSmEsR0FBOUI7QUFVRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9hY2NvdW50cy1tZXRlb3ItZGV2ZWxvcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaWYgKFBhY2thZ2VbJ2FjY291bnRzLXVpJ11cbiAgICAmJiAhUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ11cbiAgICAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFBhY2thZ2UsICdtZXRlb3ItZGV2ZWxvcGVyLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgYWNjb3VudHMtbWV0ZW9yLWRldmVsb3BlcixcXG5cIiArXG4gICAgXCJidXQgZGlkbid0IGluc3RhbGwgdGhlIGNvbmZpZ3VyYXRpb24gVUkgZm9yIHRoZSBNZXRlb3IgRGV2ZWxvcGVyXFxuXCIgK1xuICAgIFwiQWNjb3VudHMgT0F1dGguIFlvdSBjYW4gaW5zdGFsbCBpdCB3aXRoOlxcblwiICtcbiAgICBcIlxcblwiICtcbiAgICBcIiAgICBtZXRlb3IgYWRkIG1ldGVvci1kZXZlbG9wZXItY29uZmlnLXVpXCIgK1xuICAgIFwiXFxuXCJcbiAgKTtcbn1cbiIsIkFjY291bnRzLm9hdXRoLnJlZ2lzdGVyU2VydmljZShcIm1ldGVvci1kZXZlbG9wZXJcIik7XG5cbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgY29uc3QgbG9naW5XaXRoTWV0ZW9yRGV2ZWxvcGVyQWNjb3VudCA9IChvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICAgIC8vIHN1cHBvcnQgYSBjYWxsYmFjayB3aXRob3V0IG9wdGlvbnNcbiAgICBpZiAoISBjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2sgPVxuICAgICAgICAgIEFjY291bnRzLm9hdXRoLmNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVIYW5kbGVyKGNhbGxiYWNrKTtcbiAgICBNZXRlb3JEZXZlbG9wZXJBY2NvdW50cy5yZXF1ZXN0Q3JlZGVudGlhbChvcHRpb25zLCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2spO1xuICB9O1xuICBBY2NvdW50cy5yZWdpc3RlckNsaWVudExvZ2luRnVuY3Rpb24oJ21ldGVvci1kZXZlbG9wZXInLCBsb2dpbldpdGhNZXRlb3JEZXZlbG9wZXJBY2NvdW50KTtcbiAgTWV0ZW9yLmxvZ2luV2l0aE1ldGVvckRldmVsb3BlckFjY291bnQgPSAoLi4uYXJncykgPT5cbiAgICBBY2NvdW50cy5hcHBseUxvZ2luRnVuY3Rpb24oJ21ldGVvci1kZXZlbG9wZXInLCBhcmdzKTtcbn0gZWxzZSB7XG4gIEFjY291bnRzLmFkZEF1dG9wdWJsaXNoRmllbGRzKHtcbiAgICAvLyBwdWJsaXNoIGFsbCBmaWVsZHMgaW5jbHVkaW5nIGFjY2VzcyB0b2tlbiwgd2hpY2ggY2FuIGxlZ2l0aW1hdGVseSBiZSB1c2VkXG4gICAgLy8gZnJvbSB0aGUgY2xpZW50IChpZiB0cmFuc21pdHRlZCBvdmVyIHNzbCBvciBvbiBsb2NhbGhvc3QpLlxuICAgIGZvckxvZ2dlZEluVXNlcjogWydzZXJ2aWNlcy5tZXRlb3ItZGV2ZWxvcGVyJ10sXG4gICAgZm9yT3RoZXJVc2VyczogW1xuICAgICAgJ3NlcnZpY2VzLm1ldGVvci1kZXZlbG9wZXIudXNlcm5hbWUnLFxuICAgICAgJ3NlcnZpY2VzLm1ldGVvci1kZXZlbG9wZXIucHJvZmlsZScsXG4gICAgICAnc2VydmljZXMubWV0ZW9yLWRldmVsb3Blci5pZCdcbiAgICBdXG4gIH0pO1xufVxuIl19
