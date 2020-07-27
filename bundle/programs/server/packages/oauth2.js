(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Random = Package.random.Random;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"oauth2":{"oauth2_server.js":function module(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/oauth2/oauth2_server.js                                  //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
// connect middleware
OAuth._requestHandlers['2'] = (service, query, res) => {
  let credentialSecret; // check if user authorized access

  if (!query.error) {
    // Prepare the login results before returning.
    // Run service-specific handler.
    const oauthResult = service.handleOauthRequest(query);
    credentialSecret = Random.secret();

    const credentialToken = OAuth._credentialTokenFromQuery(query); // Store the login result so it can be retrieved in another
    // browser tab by the result handler


    OAuth._storePendingCredential(credentialToken, {
      serviceName: service.serviceName,
      serviceData: oauthResult.serviceData,
      options: oauthResult.options
    }, credentialSecret);
  } // Either close the window, redirect, or render nothing
  // if all else fails


  OAuth._renderOauthResults(res, query, credentialSecret);
};
///////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/oauth2/oauth2_server.js");

/* Exports */
Package._define("oauth2");

})();

//# sourceURL=meteor://💻app/packages/oauth2.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgyL29hdXRoMl9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiT0F1dGgiLCJfcmVxdWVzdEhhbmRsZXJzIiwic2VydmljZSIsInF1ZXJ5IiwicmVzIiwiY3JlZGVudGlhbFNlY3JldCIsImVycm9yIiwib2F1dGhSZXN1bHQiLCJoYW5kbGVPYXV0aFJlcXVlc3QiLCJSYW5kb20iLCJzZWNyZXQiLCJjcmVkZW50aWFsVG9rZW4iLCJfY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5IiwiX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwiLCJzZXJ2aWNlTmFtZSIsInNlcnZpY2VEYXRhIiwib3B0aW9ucyIsIl9yZW5kZXJPYXV0aFJlc3VsdHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBQSxLQUFLLENBQUNDLGdCQUFOLENBQXVCLEdBQXZCLElBQThCLENBQUNDLE9BQUQsRUFBVUMsS0FBVixFQUFpQkMsR0FBakIsS0FBeUI7QUFDckQsTUFBSUMsZ0JBQUosQ0FEcUQsQ0FHckQ7O0FBQ0EsTUFBSSxDQUFDRixLQUFLLENBQUNHLEtBQVgsRUFBa0I7QUFDaEI7QUFFQTtBQUNBLFVBQU1DLFdBQVcsR0FBR0wsT0FBTyxDQUFDTSxrQkFBUixDQUEyQkwsS0FBM0IsQ0FBcEI7QUFDQUUsb0JBQWdCLEdBQUdJLE1BQU0sQ0FBQ0MsTUFBUCxFQUFuQjs7QUFFQSxVQUFNQyxlQUFlLEdBQUdYLEtBQUssQ0FBQ1kseUJBQU4sQ0FBZ0NULEtBQWhDLENBQXhCLENBUGdCLENBU2hCO0FBQ0E7OztBQUNBSCxTQUFLLENBQUNhLHVCQUFOLENBQThCRixlQUE5QixFQUErQztBQUM3Q0csaUJBQVcsRUFBRVosT0FBTyxDQUFDWSxXQUR3QjtBQUU3Q0MsaUJBQVcsRUFBRVIsV0FBVyxDQUFDUSxXQUZvQjtBQUc3Q0MsYUFBTyxFQUFFVCxXQUFXLENBQUNTO0FBSHdCLEtBQS9DLEVBSUdYLGdCQUpIO0FBS0QsR0FwQm9ELENBc0JyRDtBQUNBOzs7QUFDQUwsT0FBSyxDQUFDaUIsbUJBQU4sQ0FBMEJiLEdBQTFCLEVBQStCRCxLQUEvQixFQUFzQ0UsZ0JBQXRDO0FBQ0QsQ0F6QkQsQyIsImZpbGUiOiIvcGFja2FnZXMvb2F1dGgyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY29ubmVjdCBtaWRkbGV3YXJlXG5PQXV0aC5fcmVxdWVzdEhhbmRsZXJzWycyJ10gPSAoc2VydmljZSwgcXVlcnksIHJlcykgPT4ge1xuICBsZXQgY3JlZGVudGlhbFNlY3JldDtcblxuICAvLyBjaGVjayBpZiB1c2VyIGF1dGhvcml6ZWQgYWNjZXNzXG4gIGlmICghcXVlcnkuZXJyb3IpIHtcbiAgICAvLyBQcmVwYXJlIHRoZSBsb2dpbiByZXN1bHRzIGJlZm9yZSByZXR1cm5pbmcuXG5cbiAgICAvLyBSdW4gc2VydmljZS1zcGVjaWZpYyBoYW5kbGVyLlxuICAgIGNvbnN0IG9hdXRoUmVzdWx0ID0gc2VydmljZS5oYW5kbGVPYXV0aFJlcXVlc3QocXVlcnkpO1xuICAgIGNyZWRlbnRpYWxTZWNyZXQgPSBSYW5kb20uc2VjcmV0KCk7XG5cbiAgICBjb25zdCBjcmVkZW50aWFsVG9rZW4gPSBPQXV0aC5fY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5KHF1ZXJ5KTtcblxuICAgIC8vIFN0b3JlIHRoZSBsb2dpbiByZXN1bHQgc28gaXQgY2FuIGJlIHJldHJpZXZlZCBpbiBhbm90aGVyXG4gICAgLy8gYnJvd3NlciB0YWIgYnkgdGhlIHJlc3VsdCBoYW5kbGVyXG4gICAgT0F1dGguX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCB7XG4gICAgICBzZXJ2aWNlTmFtZTogc2VydmljZS5zZXJ2aWNlTmFtZSxcbiAgICAgIHNlcnZpY2VEYXRhOiBvYXV0aFJlc3VsdC5zZXJ2aWNlRGF0YSxcbiAgICAgIG9wdGlvbnM6IG9hdXRoUmVzdWx0Lm9wdGlvbnNcbiAgICB9LCBjcmVkZW50aWFsU2VjcmV0KTtcbiAgfVxuXG4gIC8vIEVpdGhlciBjbG9zZSB0aGUgd2luZG93LCByZWRpcmVjdCwgb3IgcmVuZGVyIG5vdGhpbmdcbiAgLy8gaWYgYWxsIGVsc2UgZmFpbHNcbiAgT0F1dGguX3JlbmRlck9hdXRoUmVzdWx0cyhyZXMsIHF1ZXJ5LCBjcmVkZW50aWFsU2VjcmV0KTtcbn07XG4iXX0=
