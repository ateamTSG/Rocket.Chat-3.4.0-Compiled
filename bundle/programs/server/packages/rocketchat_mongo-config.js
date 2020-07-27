(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:mongo-config":{"server":{"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/rocketchat_mongo-config/server/index.js                                                  //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let tls;
module.link("tls", {
  default(v) {
    tls = v;
  }

}, 0);
let PassThrough;
module.link("stream", {
  PassThrough(v) {
    PassThrough = v;
  }

}, 1);
let EmailTest;
module.link("meteor/email", {
  EmailTest(v) {
    EmailTest = v;
  }

}, 2);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 3);
// FIX For TLS error see more here https://github.com/RocketChat/Rocket.Chat/issues/9316
// TODO: Remove after NodeJS fix it, more information
// https://github.com/nodejs/node/issues/16196
// https://github.com/nodejs/node/pull/16853
// This is fixed in Node 10, but this supports LTS versions
tls.DEFAULT_ECDH_CURVE = 'auto';

const mongoConnectionOptions = _objectSpread({}, !process.env.MONGO_URL.includes('retryWrites') && {
  retryWrites: false
});

const mongoOptionStr = process.env.MONGO_OPTIONS;

if (typeof mongoOptionStr !== 'undefined') {
  const mongoOptions = JSON.parse(mongoOptionStr);
  Object.assign(mongoConnectionOptions, mongoOptions);
}

if (Object.keys(mongoConnectionOptions).length > 0) {
  Mongo.setConnectionOptions(mongoConnectionOptions);
}

process.env.HTTP_FORWARDED_COUNT = process.env.HTTP_FORWARDED_COUNT || '1'; // Send emails to a "fake" stream instead of print them in console

if (process.env.NODE_ENV !== 'development' || process.env.TEST_MODE) {
  const stream = new PassThrough();
  EmailTest.overrideOutputStream(stream);
  stream.on('data', () => {});
  stream.on('end', () => {});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/rocketchat:mongo-config/server/index.js");

/* Exports */
Package._define("rocketchat:mongo-config", exports);

})();

//# sourceURL=meteor://💻app/packages/rocketchat_mongo-config.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDptb25nby1jb25maWcvc2VydmVyL2luZGV4LmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJ0bHMiLCJQYXNzVGhyb3VnaCIsIkVtYWlsVGVzdCIsIk1vbmdvIiwiREVGQVVMVF9FQ0RIX0NVUlZFIiwibW9uZ29Db25uZWN0aW9uT3B0aW9ucyIsInByb2Nlc3MiLCJlbnYiLCJNT05HT19VUkwiLCJpbmNsdWRlcyIsInJldHJ5V3JpdGVzIiwibW9uZ29PcHRpb25TdHIiLCJNT05HT19PUFRJT05TIiwibW9uZ29PcHRpb25zIiwiSlNPTiIsInBhcnNlIiwiT2JqZWN0IiwiYXNzaWduIiwia2V5cyIsImxlbmd0aCIsInNldENvbm5lY3Rpb25PcHRpb25zIiwiSFRUUF9GT1JXQVJERURfQ09VTlQiLCJOT0RFX0VOViIsIlRFU1RfTU9ERSIsInN0cmVhbSIsIm92ZXJyaWRlT3V0cHV0U3RyZWFtIiwib24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxhQUFKOztBQUFrQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksc0NBQVosRUFBbUQ7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osaUJBQWEsR0FBQ0ksQ0FBZDtBQUFnQjs7QUFBNUIsQ0FBbkQsRUFBaUYsQ0FBakY7QUFBbEIsSUFBSUMsR0FBSjtBQUFRSixNQUFNLENBQUNDLElBQVAsQ0FBWSxLQUFaLEVBQWtCO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNDLE9BQUcsR0FBQ0QsQ0FBSjtBQUFNOztBQUFsQixDQUFsQixFQUFzQyxDQUF0QztBQUF5QyxJQUFJRSxXQUFKO0FBQWdCTCxNQUFNLENBQUNDLElBQVAsQ0FBWSxRQUFaLEVBQXFCO0FBQUNJLGFBQVcsQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLGVBQVcsR0FBQ0YsQ0FBWjtBQUFjOztBQUE5QixDQUFyQixFQUFxRCxDQUFyRDtBQUF3RCxJQUFJRyxTQUFKO0FBQWNOLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ0ssV0FBUyxDQUFDSCxDQUFELEVBQUc7QUFBQ0csYUFBUyxHQUFDSCxDQUFWO0FBQVk7O0FBQTFCLENBQTNCLEVBQXVELENBQXZEO0FBQTBELElBQUlJLEtBQUo7QUFBVVAsTUFBTSxDQUFDQyxJQUFQLENBQVksY0FBWixFQUEyQjtBQUFDTSxPQUFLLENBQUNKLENBQUQsRUFBRztBQUFDSSxTQUFLLEdBQUNKLENBQU47QUFBUTs7QUFBbEIsQ0FBM0IsRUFBK0MsQ0FBL0M7QUFNM007QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQyxHQUFHLENBQUNJLGtCQUFKLEdBQXlCLE1BQXpCOztBQUVBLE1BQU1DLHNCQUFzQixxQkFFeEIsQ0FBQ0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFNBQVosQ0FBc0JDLFFBQXRCLENBQStCLGFBQS9CLENBQUQsSUFBa0Q7QUFBRUMsYUFBVyxFQUFFO0FBQWYsQ0FGMUIsQ0FBNUI7O0FBS0EsTUFBTUMsY0FBYyxHQUFHTCxPQUFPLENBQUNDLEdBQVIsQ0FBWUssYUFBbkM7O0FBQ0EsSUFBSSxPQUFPRCxjQUFQLEtBQTBCLFdBQTlCLEVBQTJDO0FBQzFDLFFBQU1FLFlBQVksR0FBR0MsSUFBSSxDQUFDQyxLQUFMLENBQVdKLGNBQVgsQ0FBckI7QUFFQUssUUFBTSxDQUFDQyxNQUFQLENBQWNaLHNCQUFkLEVBQXNDUSxZQUF0QztBQUNBOztBQUVELElBQUlHLE1BQU0sQ0FBQ0UsSUFBUCxDQUFZYixzQkFBWixFQUFvQ2MsTUFBcEMsR0FBNkMsQ0FBakQsRUFBb0Q7QUFDbkRoQixPQUFLLENBQUNpQixvQkFBTixDQUEyQmYsc0JBQTNCO0FBQ0E7O0FBRURDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZYyxvQkFBWixHQUFtQ2YsT0FBTyxDQUFDQyxHQUFSLENBQVljLG9CQUFaLElBQW9DLEdBQXZFLEMsQ0FFQTs7QUFDQSxJQUFJZixPQUFPLENBQUNDLEdBQVIsQ0FBWWUsUUFBWixLQUF5QixhQUF6QixJQUEwQ2hCLE9BQU8sQ0FBQ0MsR0FBUixDQUFZZ0IsU0FBMUQsRUFBcUU7QUFDcEUsUUFBTUMsTUFBTSxHQUFHLElBQUl2QixXQUFKLEVBQWY7QUFDQUMsV0FBUyxDQUFDdUIsb0JBQVYsQ0FBK0JELE1BQS9CO0FBQ0FBLFFBQU0sQ0FBQ0UsRUFBUCxDQUFVLE1BQVYsRUFBa0IsTUFBTSxDQUFFLENBQTFCO0FBQ0FGLFFBQU0sQ0FBQ0UsRUFBUCxDQUFVLEtBQVYsRUFBaUIsTUFBTSxDQUFFLENBQXpCO0FBQ0EsQyIsImZpbGUiOiIvcGFja2FnZXMvcm9ja2V0Y2hhdF9tb25nby1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGxzIGZyb20gJ3Rscyc7XG5pbXBvcnQgeyBQYXNzVGhyb3VnaCB9IGZyb20gJ3N0cmVhbSc7XG5cbmltcG9ydCB7IEVtYWlsVGVzdCB9IGZyb20gJ21ldGVvci9lbWFpbCc7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5cbi8vIEZJWCBGb3IgVExTIGVycm9yIHNlZSBtb3JlIGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL1JvY2tldENoYXQvUm9ja2V0LkNoYXQvaXNzdWVzLzkzMTZcbi8vIFRPRE86IFJlbW92ZSBhZnRlciBOb2RlSlMgZml4IGl0LCBtb3JlIGluZm9ybWF0aW9uXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzE2MTk2XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvcHVsbC8xNjg1M1xuLy8gVGhpcyBpcyBmaXhlZCBpbiBOb2RlIDEwLCBidXQgdGhpcyBzdXBwb3J0cyBMVFMgdmVyc2lvbnNcbnRscy5ERUZBVUxUX0VDREhfQ1VSVkUgPSAnYXV0byc7XG5cbmNvbnN0IG1vbmdvQ29ubmVjdGlvbk9wdGlvbnMgPSB7XG5cdC8vIGFkZCByZXRyeVdyaXRlcz1mYWxzZSBpZiBub3QgcHJlc2VudCBpbiBNT05HT19VUkxcblx0Li4uIXByb2Nlc3MuZW52Lk1PTkdPX1VSTC5pbmNsdWRlcygncmV0cnlXcml0ZXMnKSAmJiB7IHJldHJ5V3JpdGVzOiBmYWxzZSB9LFxufTtcblxuY29uc3QgbW9uZ29PcHRpb25TdHIgPSBwcm9jZXNzLmVudi5NT05HT19PUFRJT05TO1xuaWYgKHR5cGVvZiBtb25nb09wdGlvblN0ciAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Y29uc3QgbW9uZ29PcHRpb25zID0gSlNPTi5wYXJzZShtb25nb09wdGlvblN0cik7XG5cblx0T2JqZWN0LmFzc2lnbihtb25nb0Nvbm5lY3Rpb25PcHRpb25zLCBtb25nb09wdGlvbnMpO1xufVxuXG5pZiAoT2JqZWN0LmtleXMobW9uZ29Db25uZWN0aW9uT3B0aW9ucykubGVuZ3RoID4gMCkge1xuXHRNb25nby5zZXRDb25uZWN0aW9uT3B0aW9ucyhtb25nb0Nvbm5lY3Rpb25PcHRpb25zKTtcbn1cblxucHJvY2Vzcy5lbnYuSFRUUF9GT1JXQVJERURfQ09VTlQgPSBwcm9jZXNzLmVudi5IVFRQX0ZPUldBUkRFRF9DT1VOVCB8fCAnMSc7XG5cbi8vIFNlbmQgZW1haWxzIHRvIGEgXCJmYWtlXCIgc3RyZWFtIGluc3RlYWQgb2YgcHJpbnQgdGhlbSBpbiBjb25zb2xlXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdkZXZlbG9wbWVudCcgfHwgcHJvY2Vzcy5lbnYuVEVTVF9NT0RFKSB7XG5cdGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuXHRFbWFpbFRlc3Qub3ZlcnJpZGVPdXRwdXRTdHJlYW0oc3RyZWFtKTtcblx0c3RyZWFtLm9uKCdkYXRhJywgKCkgPT4ge30pO1xuXHRzdHJlYW0ub24oJ2VuZCcsICgpID0+IHt9KTtcbn1cbiJdfQ==
