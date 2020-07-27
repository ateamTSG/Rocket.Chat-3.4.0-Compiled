(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"mizzao:timesync":{"server":{"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/mizzao_timesync/server/index.js                                     //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
module.link("./timesync-server");
//////////////////////////////////////////////////////////////////////////////////

},"timesync-server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/mizzao_timesync/server/timesync-server.js                           //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
let WebApp;
module.link("meteor/webapp", {
  WebApp(v) {
    WebApp = v;
  }

}, 0);
// Use rawConnectHandlers so we get a response as quickly as possible
// https://github.com/meteor/meteor/blob/devel/packages/webapp/webapp_server.js
var syncUrl = "/_timesync";

if (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX) {
  syncUrl = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + syncUrl;
}

WebApp.rawConnectHandlers.use(syncUrl, function (req, res, next) {
  // Never ever cache this, otherwise weird times are shown on reload
  // http://stackoverflow.com/q/18811286/586086
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", 0); // Avoid MIME type warnings in browsers

  res.setHeader("Content-Type", "text/plain");
  res.end(Date.now().toString());
});
//////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/mizzao:timesync/server/index.js");

/* Exports */
Package._define("mizzao:timesync", exports);

})();

//# sourceURL=meteor://💻app/packages/mizzao_timesync.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWl6emFvOnRpbWVzeW5jL3NlcnZlci9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWl6emFvOnRpbWVzeW5jL3NlcnZlci90aW1lc3luYy1zZXJ2ZXIuanMiXSwibmFtZXMiOlsibW9kdWxlIiwibGluayIsIldlYkFwcCIsInYiLCJzeW5jVXJsIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsIlJPT1RfVVJMX1BBVEhfUFJFRklYIiwicmF3Q29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsInNldEhlYWRlciIsImVuZCIsIkRhdGUiLCJub3ciLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLG1CQUFaLEU7Ozs7Ozs7Ozs7O0FDQUEsSUFBSUMsTUFBSjtBQUFXRixNQUFNLENBQUNDLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUNDLFFBQU0sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNELFVBQU0sR0FBQ0MsQ0FBUDtBQUFTOztBQUFwQixDQUE1QixFQUFrRCxDQUFsRDtBQUNYO0FBQ0E7QUFFQSxJQUFJQyxPQUFPLEdBQUcsWUFBZDs7QUFDQSxJQUFJQyx5QkFBeUIsQ0FBQ0Msb0JBQTlCLEVBQW9EO0FBQ25ERixTQUFPLEdBQUdDLHlCQUF5QixDQUFDQyxvQkFBMUIsR0FBaURGLE9BQTNEO0FBQ0E7O0FBRURGLE1BQU0sQ0FBQ0ssa0JBQVAsQ0FBMEJDLEdBQTFCLENBQThCSixPQUE5QixFQUNFLFVBQVNLLEdBQVQsRUFBY0MsR0FBZCxFQUFtQkMsSUFBbkIsRUFBeUI7QUFDdkI7QUFDQTtBQUNBRCxLQUFHLENBQUNFLFNBQUosQ0FBYyxlQUFkLEVBQStCLHFDQUEvQjtBQUNBRixLQUFHLENBQUNFLFNBQUosQ0FBYyxRQUFkLEVBQXdCLFVBQXhCO0FBQ0FGLEtBQUcsQ0FBQ0UsU0FBSixDQUFjLFNBQWQsRUFBeUIsQ0FBekIsRUFMdUIsQ0FPdkI7O0FBQ0FGLEtBQUcsQ0FBQ0UsU0FBSixDQUFjLGNBQWQsRUFBOEIsWUFBOUI7QUFFQUYsS0FBRyxDQUFDRyxHQUFKLENBQVFDLElBQUksQ0FBQ0MsR0FBTCxHQUFXQyxRQUFYLEVBQVI7QUFDRCxDQVpILEUiLCJmaWxlIjoiL3BhY2thZ2VzL21penphb190aW1lc3luYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi90aW1lc3luYy1zZXJ2ZXInOyIsImltcG9ydCB7IFdlYkFwcCB9IGZyb20gJ21ldGVvci93ZWJhcHAnO1xuLy8gVXNlIHJhd0Nvbm5lY3RIYW5kbGVycyBzbyB3ZSBnZXQgYSByZXNwb25zZSBhcyBxdWlja2x5IGFzIHBvc3NpYmxlXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9ibG9iL2RldmVsL3BhY2thZ2VzL3dlYmFwcC93ZWJhcHBfc2VydmVyLmpzXG5cbnZhciBzeW5jVXJsID0gXCIvX3RpbWVzeW5jXCI7XG5pZiAoX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWCkge1xuXHRzeW5jVXJsID0gX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWCArIHN5bmNVcmw7XG59XG5cbldlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMudXNlKHN5bmNVcmwsXG4gIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgLy8gTmV2ZXIgZXZlciBjYWNoZSB0aGlzLCBvdGhlcndpc2Ugd2VpcmQgdGltZXMgYXJlIHNob3duIG9uIHJlbG9hZFxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xLzE4ODExMjg2LzU4NjA4NlxuICAgIHJlcy5zZXRIZWFkZXIoXCJDYWNoZS1Db250cm9sXCIsIFwibm8tY2FjaGUsIG5vLXN0b3JlLCBtdXN0LXJldmFsaWRhdGVcIik7XG4gICAgcmVzLnNldEhlYWRlcihcIlByYWdtYVwiLCBcIm5vLWNhY2hlXCIpO1xuICAgIHJlcy5zZXRIZWFkZXIoXCJFeHBpcmVzXCIsIDApO1xuXG4gICAgLy8gQXZvaWQgTUlNRSB0eXBlIHdhcm5pbmdzIGluIGJyb3dzZXJzXG4gICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIik7XG5cbiAgICByZXMuZW5kKERhdGUubm93KCkudG9TdHJpbmcoKSk7XG4gIH1cbik7XG4iXX0=
