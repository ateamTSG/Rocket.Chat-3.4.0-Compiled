(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Facts;

var require = meteorInstall({"node_modules":{"meteor":{"facts-base":{"facts_base_server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/facts-base/facts_base_server.js                                                   //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
module.export({
  Facts: () => Facts,
  FACTS_COLLECTION: () => FACTS_COLLECTION,
  FACTS_PUBLICATION: () => FACTS_PUBLICATION
});
let Facts, FACTS_COLLECTION, FACTS_PUBLICATION;
module.link("./facts_base_common", {
  Facts(v) {
    Facts = v;
  },

  FACTS_COLLECTION(v) {
    FACTS_COLLECTION = v;
  },

  FACTS_PUBLICATION(v) {
    FACTS_PUBLICATION = v;
  }

}, 0);
const hasOwn = Object.prototype.hasOwnProperty; // This file is only used server-side, so no need to check Meteor.isServer.
// By default, we publish facts to no user if autopublish is off, and to all
// users if autopublish is on.

let userIdFilter = function (userId) {
  return !!Package.autopublish;
}; // XXX make this take effect at runtime too?


Facts.setUserIdFilter = function (filter) {
  userIdFilter = filter;
}; // XXX Use a minimongo collection instead and hook up an observeChanges
// directly to a publish.


const factsByPackage = {};
let activeSubscriptions = []; // Make factsByPackage data available to the server environment

Facts._factsByPackage = factsByPackage;

Facts.incrementServerFact = function (pkg, fact, increment) {
  if (!hasOwn.call(factsByPackage, pkg)) {
    factsByPackage[pkg] = {};
    factsByPackage[pkg][fact] = increment;
    activeSubscriptions.forEach(function (sub) {
      sub.added(FACTS_COLLECTION, pkg, factsByPackage[pkg]);
    });
    return;
  }

  const packageFacts = factsByPackage[pkg];

  if (!hasOwn.call(packageFacts, fact)) {
    factsByPackage[pkg][fact] = 0;
  }

  factsByPackage[pkg][fact] += increment;
  const changedField = {};
  changedField[fact] = factsByPackage[pkg][fact];
  activeSubscriptions.forEach(function (sub) {
    sub.changed(FACTS_COLLECTION, pkg, changedField);
  });
}; // Deferred, because we have an unordered dependency on livedata.
// XXX is this safe? could somebody try to connect before Meteor.publish is
// called?


Meteor.defer(function () {
  // XXX Also publish facts-by-package.
  Meteor.publish(FACTS_PUBLICATION, function () {
    const sub = this;

    if (!userIdFilter(this.userId)) {
      sub.ready();
      return;
    }

    activeSubscriptions.push(sub);
    Object.keys(factsByPackage).forEach(function (pkg) {
      sub.added(FACTS_COLLECTION, pkg, factsByPackage[pkg]);
    });
    sub.onStop(function () {
      activeSubscriptions = activeSubscriptions.filter(activeSub => activeSub !== sub);
    });
    sub.ready();
  }, {
    is_auto: true
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////

},"facts_base_common.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/facts-base/facts_base_common.js                                                   //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
module.export({
  Facts: () => Facts,
  FACTS_COLLECTION: () => FACTS_COLLECTION,
  FACTS_PUBLICATION: () => FACTS_PUBLICATION
});
const Facts = {};
const FACTS_COLLECTION = 'meteor_Facts_server';
const FACTS_PUBLICATION = 'meteor_facts';
////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/facts-base/facts_base_server.js");

/* Exports */
Package._define("facts-base", exports, {
  Facts: Facts
});

})();

//# sourceURL=meteor://💻app/packages/facts-base.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjdHMtYmFzZS9mYWN0c19iYXNlX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjdHMtYmFzZS9mYWN0c19iYXNlX2NvbW1vbi5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJGYWN0cyIsIkZBQ1RTX0NPTExFQ1RJT04iLCJGQUNUU19QVUJMSUNBVElPTiIsImxpbmsiLCJ2IiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJ1c2VySWRGaWx0ZXIiLCJ1c2VySWQiLCJQYWNrYWdlIiwiYXV0b3B1Ymxpc2giLCJzZXRVc2VySWRGaWx0ZXIiLCJmaWx0ZXIiLCJmYWN0c0J5UGFja2FnZSIsImFjdGl2ZVN1YnNjcmlwdGlvbnMiLCJfZmFjdHNCeVBhY2thZ2UiLCJpbmNyZW1lbnRTZXJ2ZXJGYWN0IiwicGtnIiwiZmFjdCIsImluY3JlbWVudCIsImNhbGwiLCJmb3JFYWNoIiwic3ViIiwiYWRkZWQiLCJwYWNrYWdlRmFjdHMiLCJjaGFuZ2VkRmllbGQiLCJjaGFuZ2VkIiwiTWV0ZW9yIiwiZGVmZXIiLCJwdWJsaXNoIiwicmVhZHkiLCJwdXNoIiwia2V5cyIsIm9uU3RvcCIsImFjdGl2ZVN1YiIsImlzX2F1dG8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxPQUFLLEVBQUMsTUFBSUEsS0FBWDtBQUFpQkMsa0JBQWdCLEVBQUMsTUFBSUEsZ0JBQXRDO0FBQXVEQyxtQkFBaUIsRUFBQyxNQUFJQTtBQUE3RSxDQUFkO0FBQStHLElBQUlGLEtBQUosRUFBVUMsZ0JBQVYsRUFBMkJDLGlCQUEzQjtBQUE2Q0osTUFBTSxDQUFDSyxJQUFQLENBQVkscUJBQVosRUFBa0M7QUFBQ0gsT0FBSyxDQUFDSSxDQUFELEVBQUc7QUFBQ0osU0FBSyxHQUFDSSxDQUFOO0FBQVEs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LENBQVcsWUFBWTtBQUNyQm5CLHlCQUFtQixHQUNqQkEsbUJBQW1CLENBQUNGLE1BQXBCLENBQTJCc0IsU0FBUyxJQUFJQSxTQUFTLEtBQUtaLEdBQXRELENBREY7QUFFRCxLQUhEO0FBSUFBLE9BQUcsQ0FBQ1EsS0FBSjtBQUNELEdBaEJELEVBZ0JHO0FBQUNLLFdBQU8sRUFBRTtBQUFWLEdBaEJIO0FBaUJELENBbkJELEU7Ozs7Ozs7Ozs7O0FDbERBdkMsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsT0FBSyxFQUFDLE1BQUlBLEtBQVg7QUFBaUJDLGtCQUFnQixFQUFDLE1BQUlBLGdCQUF0QztBQUF1REMsbUJBQWlCLEVBQUMsTUFBSUE7QUFBN0UsQ0FBZDtBQUFBLE1BQU1GLEtBQUssR0FBRyxFQUFkO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcscUJBQXpCO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsY0FBMUIsQyIsImZpbGUiOiIvcGFja2FnZXMvZmFjdHMtYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZhY3RzLCBGQUNUU19DT0xMRUNUSU9OLCBGQUNUU19QVUJMSUNBVElPTiB9IGZyb20gJy4vZmFjdHNfYmFzZV9jb21tb24nO1xuXG5jb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBUaGlzIGZpbGUgaXMgb25seSB1c2VkIHNlcnZlci1zaWRlLCBzbyBubyBuZWVkIHRvIGNoZWNrIE1ldGVvci5pc1NlcnZlci5cblxuLy8gQnkgZGVmYXVsdCwgd2UgcHVibGlzaCBmYWN0cyB0byBubyB1c2VyIGlmIGF1dG9wdWJsaXNoIGlzIG9mZiwgYW5kIHRvIGFsbFxuLy8gdXNlcnMgaWYgYXV0b3B1Ymxpc2ggaXMgb24uXG5sZXQgdXNlcklkRmlsdGVyID0gZnVuY3Rpb24gKHVzZXJJZCkge1xuICByZXR1cm4gISFQYWNrYWdlLmF1dG9wdWJsaXNoO1xufTtcblxuLy8gWFhYIG1ha2UgdGhpcyB0YWtlIGVmZmVjdCBhdCBydW50aW1lIHRvbz9cbkZhY3RzLnNldFVzZXJJZEZpbHRlciA9IGZ1bmN0aW9uIChmaWx0ZXIpIHtcbiAgdXNlcklkRmlsdGVyID0gZmlsdGVyO1xufTtcblxuLy8gWFhYIFVzZSBhIG1pbmltb25nbyBjb2xsZWN0aW9uIGluc3RlYWQgYW5kIGhvb2sgdXAgYW4gb2JzZXJ2ZUNoYW5nZXNcbi8vIGRpcmVjdGx5IHRvIGEgcHVibGlzaC5cbmNvbnN0IGZhY3RzQnlQYWNrYWdlID0ge307XG5sZXQgYWN0aXZlU3Vic2NyaXB0aW9ucyA9IFtdO1xuXG4vLyBNYWtlIGZhY3RzQnlQYWNrYWdlIGRhdGEgYXZhaWxhYmxlIHRvIHRoZSBzZXJ2ZXIgZW52aXJvbm1lbnRcbkZhY3RzLl9mYWN0c0J5UGFja2FnZSA9IGZhY3RzQnlQYWNrYWdlO1xuXG5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0ID0gZnVuY3Rpb24gKHBrZywgZmFjdCwgaW5jcmVtZW50KSB7XG4gIGlmICghaGFzT3duLmNhbGwoZmFjdHNCeVBhY2thZ2UsIHBrZykpIHtcbiAgICBmYWN0c0J5UGFja2FnZVtwa2ddID0ge307XG4gICAgZmFjdHNCeVBhY2thZ2VbcGtnXVtmYWN0XSA9IGluY3JlbWVudDtcbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKHN1Yikge1xuICAgICAgc3ViLmFkZGVkKEZBQ1RTX0NPTExFQ1RJT04sIHBrZywgZmFjdHNCeVBhY2thZ2VbcGtnXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcGFja2FnZUZhY3RzID0gZmFjdHNCeVBhY2thZ2VbcGtnXTtcbiAgaWYgKCFoYXNPd24uY2FsbChwYWNrYWdlRmFjdHMsIGZhY3QpKSB7XG4gICAgZmFjdHNCeVBhY2thZ2VbcGtnXVtmYWN0XSA9IDA7XG4gIH1cbiAgZmFjdHNCeVBhY2thZ2VbcGtnXVtmYWN0XSArPSBpbmNyZW1lbnQ7XG4gIGNvbnN0IGNoYW5nZWRGaWVsZCA9IHt9O1xuICBjaGFuZ2VkRmllbGRbZmFjdF0gPSBmYWN0c0J5UGFja2FnZVtwa2ddW2ZhY3RdO1xuICBhY3RpdmVTdWJzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKHN1Yikge1xuICAgIHN1Yi5jaGFuZ2VkKEZBQ1RTX0NPTExFQ1RJT04sIHBrZywgY2hhbmdlZEZpZWxkKTtcbiAgfSk7XG59O1xuXG4vLyBEZWZlcnJlZCwgYmVjYXVzZSB3ZSBoYXZlIGFuIHVub3JkZXJlZCBkZXBlbmRlbmN5IG9uIGxpdmVkYXRhLlxuLy8gWFhYIGlzIHRoaXMgc2FmZT8gY291bGQgc29tZWJvZHkgdHJ5IHRvIGNvbm5lY3QgYmVmb3JlIE1ldGVvci5wdWJsaXNoIGlzXG4vLyBjYWxsZWQ/XG5NZXRlb3IuZGVmZXIoZnVuY3Rpb24gKCkge1xuICAvLyBYWFggQWxzbyBwdWJsaXNoIGZhY3RzLWJ5LXBhY2thZ2UuXG4gIE1ldGVvci5wdWJsaXNoKEZBQ1RTX1BVQkxJQ0FUSU9OLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc3ViID0gdGhpcztcbiAgICBpZiAoIXVzZXJJZEZpbHRlcih0aGlzLnVzZXJJZCkpIHtcbiAgICAgIHN1Yi5yZWFkeSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMucHVzaChzdWIpO1xuICAgIE9iamVjdC5rZXlzKGZhY3RzQnlQYWNrYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChwa2cpIHtcbiAgICAgIHN1Yi5hZGRlZChGQUNUU19DT0xMRUNUSU9OLCBwa2csIGZhY3RzQnlQYWNrYWdlW3BrZ10pO1xuICAgIH0pO1xuICAgIHN1Yi5vblN0b3AoZnVuY3Rpb24gKCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucyA9XG4gICAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuZmlsdGVyKGFjdGl2ZVN1YiA9PiBhY3RpdmVTdWIgIT09IHN1Yik7XG4gICAgfSk7XG4gICAgc3ViLnJlYWR5KCk7XG4gIH0sIHtpc19hdXRvOiB0cnVlfSk7XG59KTtcblxuZXhwb3J0IHtcbiAgRmFjdHMsXG4gIEZBQ1RTX0NPTExFQ1RJT04sXG4gIEZBQ1RTX1BVQkxJQ0FUSU9OLFxufTtcbiIsImNvbnN0IEZhY3RzID0ge307XG5jb25zdCBGQUNUU19DT0xMRUNUSU9OID0gJ21ldGVvcl9GYWN0c19zZXJ2ZXInO1xuY29uc3QgRkFDVFNfUFVCTElDQVRJT04gPSAnbWV0ZW9yX2ZhY3RzJztcblxuZXhwb3J0IHtcbiAgRmFjdHMsXG4gIEZBQ1RTX0NPTExFQ1RJT04sXG4gIEZBQ1RTX1BVQkxJQ0FUSU9OLFxufTtcbiJdfQ==
