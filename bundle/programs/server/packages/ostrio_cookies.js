(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:cookies":{"cookies.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_cookies/cookies.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Cookies: () => Cookies
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let HTTP;
let WebApp;

if (Meteor.isServer) {
  WebApp = require('meteor/webapp').WebApp;
} else {
  HTTP = require('meteor/http').HTTP;
}

const NoOp = () => {};

const urlRE = /\/___cookie___\/set/;
const rootUrl = Meteor.isServer ? process.env.ROOT_URL : window.__meteor_runtime_config__.ROOT_URL || window.__meteor_runtime_config__.meteorEnv.ROOT_URL || false;
const mobileRootUrl = Meteor.isServer ? process.env.MOBILE_ROOT_URL : window.__meteor_runtime_config__.MOBILE_ROOT_URL || window.__meteor_runtime_config__.meteorEnv.MOBILE_ROOT_URL || false;
const helpers = {
  isUndefined(obj) {
    return obj === void 0;
  },

  isArray(obj) {
    return Array.isArray(obj);
  },

  clone(obj) {
    if (!this.isObject(obj)) return obj;
    return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
  }

};
const _helpers = ['Number', 'Object', 'Function'];

for (let i = 0; i < _helpers.length; i++) {
  helpers['is' + _helpers[i]] = function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + _helpers[i] + ']';
  };
}
/*
 * @url https://github.com/jshttp/cookie/blob/master/index.js
 * @name cookie
 * @author jshttp
 * @license
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
 * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


const decode = decodeURIComponent;
const encode = encodeURIComponent;
const pairSplitRegExp = /; */;
/*
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
/*
 * @function
 * @name tryDecode
 * @param {String} str
 * @param {Function} d
 * @summary Try decoding a string using a decoding function.
 * @private
 */

const tryDecode = (str, d) => {
  try {
    return d(str);
  } catch (e) {
    return str;
  }
};
/*
 * @function
 * @name parse
 * @param {String} str
 * @param {Object} [options]
 * @return {Object}
 * @summary
 * Parse a cookie header.
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 * @private
 */


const parse = (str, options) => {
  if (typeof str !== 'string') {
    throw new Meteor.Error(404, 'argument str must be a string');
  }

  const obj = {};
  const opt = options || {};
  let val;
  let key;
  let eqIndx;
  str.split(pairSplitRegExp).forEach(pair => {
    eqIndx = pair.indexOf('=');

    if (eqIndx < 0) {
      return;
    }

    key = pair.substr(0, eqIndx).trim();
    key = tryDecode(unescape(key), opt.decode || decode);
    val = pair.substr(++eqIndx, pair.length).trim();

    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    if (void 0 === obj[key]) {
      obj[key] = tryDecode(val, opt.decode || decode);
    }
  });
  return obj;
};
/*
 * @function
 * @name antiCircular
 * @param data {Object} - Circular or any other object which needs to be non-circular
 * @private
 */


const antiCircular = _obj => {
  const object = helpers.clone(_obj);
  const cache = new Map();
  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.get(value)) {
        return void 0;
      }

      cache.set(value, true);
    }

    return value;
  });
};
/*
 * @function
 * @name serialize
 * @param {String} name
 * @param {String} val
 * @param {Object} [options]
 * @return { cookieString: String, sanitizedValue: Mixed }
 * @summary
 * Serialize data into a cookie header.
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 * serialize('foo', 'bar', { httpOnly: true }) => "foo=bar; httpOnly"
 * @private
 */


const serialize = function (key, val) {
  let opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let name;

  if (!fieldContentRegExp.test(key)) {
    name = escape(key);
  } else {
    name = key;
  }

  let sanitizedValue = val;
  let value = val;

  if (!helpers.isUndefined(value)) {
    if (helpers.isObject(value) || helpers.isArray(value)) {
      const stringified = antiCircular(value);
      value = encode("JSON.parse(".concat(stringified, ")"));
      sanitizedValue = JSON.parse(stringified);
    } else {
      value = encode(value);

      if (value && !fieldContentRegExp.test(value)) {
        value = escape(value);
      }
    }
  } else {
    value = '';
  }

  const pairs = ["".concat(name, "=").concat(value)];

  if (helpers.isNumber(opt.maxAge)) {
    pairs.push("Max-Age=".concat(opt.maxAge));
  }

  if (opt.domain && typeof opt.domain === 'string') {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new Meteor.Error(404, 'option domain is invalid');
    }

    pairs.push("Domain=".concat(opt.domain));
  }

  if (opt.path && typeof opt.path === 'string') {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new Meteor.Error(404, 'option path is invalid');
    }

    pairs.push("Path=".concat(opt.path));
  } else {
    pairs.push('Path=/');
  }

  opt.expires = opt.expires || opt.expire || false;

  if (opt.expires === Infinity) {
    pairs.push('Expires=Fri, 31 Dec 9999 23:59:59 GMT');
  } else if (opt.expires instanceof Date) {
    pairs.push("Expires=".concat(opt.expires.toUTCString()));
  } else if (opt.expires === 0) {
    pairs.push('Expires=0');
  } else if (helpers.isNumber(opt.expires)) {
    pairs.push("Expires=".concat(new Date(opt.expires).toUTCString()));
  }

  if (opt.httpOnly) {
    pairs.push('HttpOnly');
  }

  if (opt.secure) {
    pairs.push('Secure');
  }

  if (opt.firstPartyOnly) {
    pairs.push('First-Party-Only');
  }

  if (opt.sameSite) {
    pairs.push(opt.sameSite === true ? 'SameSite' : "SameSite=".concat(opt.sameSite));
  }

  return {
    cookieString: pairs.join('; '),
    sanitizedValue
  };
};

const isStringifiedRegEx = /JSON\.parse\((.*)\)/;
const isTypedRegEx = /false|true|null|undefined/;

const deserialize = string => {
  if (typeof string !== 'string') {
    return string;
  }

  if (isStringifiedRegEx.test(string)) {
    let obj = string.match(isStringifiedRegEx)[1];

    if (obj) {
      try {
        return JSON.parse(decode(obj));
      } catch (e) {
        console.error('[ostrio:cookies] [.get()] [deserialize()] Exception:', e, string, obj);
        return string;
      }
    }

    return string;
  } else if (isTypedRegEx.test(string)) {
    return JSON.parse(string);
  }

  return string;
};
/*
 * @locus Anywhere
 * @class __cookies
 * @param opts {Object} - Options (configuration) object
 * @param opts._cookies {Object|String} - Current cookies as String or Object
 * @param opts.TTL {Number|Boolean} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
 * @param opts.response {http.ServerResponse|Object} - This object is created internally by a HTTP server
 * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
 * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
 * @summary Internal Class
 */


class __cookies {
  constructor(opts) {
    this.TTL = opts.TTL || false;
    this.response = opts.response || false;
    this.runOnServer = opts.runOnServer || false;
    this.allowQueryStringCookies = opts.allowQueryStringCookies || false;
    this.allowedCordovaOrigins = opts.allowedCordovaOrigins || false;

    if (this.allowedCordovaOrigins === true) {
      this.allowedCordovaOrigins = /^http:\/\/localhost:12[0-9]{3}$/;
    }

    this.originRE = new RegExp("^https?://(".concat(rootUrl ? rootUrl : '').concat(mobileRootUrl ? '|' + mobileRootUrl : '', ")$"));

    if (helpers.isObject(opts._cookies)) {
      this.cookies = opts._cookies;
    } else {
      this.cookies = parse(opts._cookies);
    }
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name get
   * @param {String} key  - The name of the cookie to read
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Read a cookie. If the cookie doesn't exist a null value will be returned.
   * @returns {String|void}
   */


  get(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return void 0;
    }

    if (cookieString.hasOwnProperty(key)) {
      return deserialize(cookieString[key]);
    }

    return void 0;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name set
   * @param {String}  key   - The name of the cookie to create/overwrite
   * @param {String}  value - The value of the cookie
   * @param {Object}  opts  - [Optional] Cookie options (see readme docs)
   * @summary Create/overwrite a cookie.
   * @returns {Boolean}
   */


  set(key, value) {
    let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (key && !helpers.isUndefined(value)) {
      if (helpers.isNumber(this.TTL) && opts.expires === undefined) {
        opts.expires = new Date(+new Date() + this.TTL);
      }

      const {
        cookieString,
        sanitizedValue
      } = serialize(key, value, opts);
      this.cookies[key] = sanitizedValue;

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else if (this.response) {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name remove
   * @param {String} key    - The name of the cookie to create/overwrite
   * @param {String} path   - [Optional] The path from where the cookie will be
   * readable. E.g., "/", "/mydir"; if not specified, defaults to the current
   * path of the current document location (string or null). The path must be
   * absolute (see RFC 2965). For more information on how to use relative paths
   * in this argument, see: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie#Using_relative_URLs_in_the_path_parameter
   * @param {String} domain - [Optional] The domain from where the cookie will
   * be readable. E.g., "example.com", ".example.com" (includes all subdomains)
   * or "subdomain.example.com"; if not specified, defaults to the host portion
   * of the current document location (string or null).
   * @summary Remove a cookie(s).
   * @returns {Boolean}
   */


  remove(key) {
    let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
    let domain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if (key && this.cookies.hasOwnProperty(key)) {
      const {
        cookieString
      } = serialize(key, '', {
        domain,
        path,
        expires: new Date(0)
      });
      delete this.cookies[key];

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else if (this.response) {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    } else if (!key && this.keys().length > 0 && this.keys()[0] !== '') {
      const keys = Object.keys(this.cookies);

      for (let i = 0; i < keys.length; i++) {
        this.remove(keys[i]);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name has
   * @param {String} key  - The name of the cookie to create/overwrite
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Check whether a cookie exists in the current position.
   * @returns {Boolean}
   */


  has(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return false;
    }

    return cookieString.hasOwnProperty(key);
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name keys
   * @summary Returns an array of all readable cookies from this location.
   * @returns {[String]}
   */


  keys() {
    if (this.cookies) {
      return Object.keys(this.cookies);
    }

    return [];
  }
  /*
   * @locus Client
   * @memberOf __cookies
   * @name send
   * @param cb {Function} - Callback
   * @summary Send all cookies over XHR to server.
   * @returns {void}
   */


  send() {
    let cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NoOp;

    if (Meteor.isServer) {
      cb(new Meteor.Error(400, 'Can\'t run `.send()` on server, it\'s Client only method!'));
    }

    if (this.runOnServer) {
      let path = "".concat(window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || window.__meteor_runtime_config__.meteorEnv.ROOT_URL_PATH_PREFIX || '', "/___cookie___/set");
      let query = '';

      if (Meteor.isCordova && this.allowQueryStringCookies) {
        const cookiesKeys = this.keys();
        const cookiesArray = [];

        for (let i = 0; i < cookiesKeys.length; i++) {
          const {
            sanitizedValue
          } = serialize(cookiesKeys[i], this.get(cookiesKeys[i]));
          const pair = "".concat(cookiesKeys[i], "=").concat(sanitizedValue);

          if (!cookiesArray.includes(pair)) {
            cookiesArray.push(pair);
          }
        }

        if (cookiesArray.length) {
          path = Meteor.absoluteUrl('___cookie___/set');
          query = "?___cookies___=".concat(encodeURIComponent(cookiesArray.join('; ')));
        }
      }

      HTTP.get("".concat(path).concat(query), {
        beforeSend(xhr) {
          xhr.withCredentials = true;
          return true;
        }

      }, cb);
    } else {
      cb(new Meteor.Error(400, 'Can\'t send cookies on server when `runOnServer` is false.'));
    }

    return void 0;
  }

}
/*
 * @function
 * @locus Server
 * @summary Middleware handler
 * @private
 */


const __middlewareHandler = (request, response, opts) => {
  let _cookies = {};

  if (opts.runOnServer) {
    if (request.headers && request.headers.cookie) {
      _cookies = parse(request.headers.cookie);
    }

    return new __cookies({
      _cookies,
      TTL: opts.TTL,
      runOnServer: opts.runOnServer,
      response,
      allowQueryStringCookies: opts.allowQueryStringCookies
    });
  }

  throw new Meteor.Error(400, 'Can\'t use middleware when `runOnServer` is false.');
};
/*
 * @locus Anywhere
 * @class Cookies
 * @param opts {Object}
 * @param opts.TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param opts.auto {Boolean} - [Server] Auto-bind in middleware as `req.Cookies`, by default `true`
 * @param opts.handler {Function} - [Server] Middleware handler
 * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
 * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
 * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
 * @summary Main Cookie class
 */


class Cookies extends __cookies {
  constructor() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    opts.TTL = helpers.isNumber(opts.TTL) ? opts.TTL : false;
    opts.runOnServer = opts.runOnServer !== false ? true : false;
    opts.allowQueryStringCookies = opts.allowQueryStringCookies !== true ? false : true;

    if (Meteor.isClient) {
      opts._cookies = document.cookie;
      super(opts);
    } else {
      opts._cookies = {};
      super(opts);
      opts.auto = opts.auto !== false ? true : false;
      this.opts = opts;
      this.handler = helpers.isFunction(opts.handler) ? opts.handler : false;
      this.onCookies = helpers.isFunction(opts.onCookies) ? opts.onCookies : false;

      if (opts.runOnServer && !Cookies.isLoadedOnServer) {
        Cookies.isLoadedOnServer = true;

        if (opts.auto) {
          WebApp.connectHandlers.use((req, res, next) => {
            if (urlRE.test(req._parsedUrl.path)) {
              const matchedCordovaOrigin = !!req.headers.origin && this.allowedCordovaOrigins && this.allowedCordovaOrigins.test(req.headers.origin);
              const matchedOrigin = matchedCordovaOrigin || !!req.headers.origin && this.originRE.test(req.headers.origin);

              if (matchedOrigin) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
              }

              const cookiesArray = [];
              let cookiesObject = {};

              if (matchedCordovaOrigin && opts.allowQueryStringCookies && req.query.___cookies___) {
                cookiesObject = parse(decodeURIComponent(req.query.___cookies___));
              } else if (req.headers.cookie) {
                cookiesObject = parse(req.headers.cookie);
              }

              const cookiesKeys = Object.keys(cookiesObject);

              if (cookiesKeys.length) {
                for (let i = 0; i < cookiesKeys.length; i++) {
                  const {
                    cookieString
                  } = serialize(cookiesKeys[i], cookiesObject[cookiesKeys[i]]);

                  if (!cookiesArray.includes(cookieString)) {
                    cookiesArray.push(cookieString);
                  }
                }

                if (cookiesArray.length) {
                  res.setHeader('Set-Cookie', cookiesArray);
                }
              }

              helpers.isFunction(this.onCookies) && this.onCookies(__middlewareHandler(req, res, opts));
              res.writeHead(200);
              res.end('');
            } else {
              req.Cookies = __middlewareHandler(req, res, opts);
              helpers.isFunction(this.handler) && this.handler(req.Cookies);
              next();
            }
          });
        }
      }
    }
  }
  /*
   * @locus Server
   * @memberOf Cookies
   * @name middleware
   * @summary Get Cookies instance into callback
   * @returns {void}
   */


  middleware() {
    if (!Meteor.isServer) {
      throw new Meteor.Error(500, '[ostrio:cookies] Can\'t use `.middleware()` on Client, it\'s Server only!');
    }

    return (req, res, next) => {
      helpers.isFunction(this.handler) && this.handler(__middlewareHandler(req, res, this.opts));
      next();
    };
  }

}

if (Meteor.isServer) {
  Cookies.isLoadedOnServer = false;
}
/* Export the Cookies class */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/ostrio:cookies/cookies.js");

/* Exports */
Package._define("ostrio:cookies", exports);

})();

//# sourceURL=meteor://💻app/packages/ostrio_cookies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmNvb2tpZXMvY29va2llcy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb29raWVzIiwiTWV0ZW9yIiwibGluayIsInYiLCJIVFRQIiwiV2ViQXBwIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiTm9PcCIsInVybFJFIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJST09UX1VSTCIsIndpbmRvdyIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJtZXRlb3JFbnYiLCJtb2JpbGVSb290VXJsIiwiTU9CSUxFX1JPT1RfVVJMIiwiaGVscGVycyIsImlzVW5kZWZpbmVkIiwib2JqIiwiaXNBcnJheSIsIkFycmF5IiwiY2xvbmUiLCJpc09iamVjdCIsInNsaWNlIiwiT2JqZWN0IiwiYXNzaWduIiwiX2hlbHBlcnMiLCJpIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZGVjb2RlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicGFpclNwbGl0UmVnRXhwIiwiZmllbGRDb250ZW50UmVnRXhwIiwidHJ5RGVjb2RlIiwic3RyIiwiZCIsImUiLCJwYXJzZSIsIm9wdGlvbnMiLCJFcnJvciIsIm9wdCIsInZhbCIsImtleSIsImVxSW5keCIsInNwbGl0IiwiZm9yRWFjaCIsInBhaXIiLCJpbmRleE9mIiwic3Vic3RyIiwidHJpbSIsInVuZXNjYXBlIiwiYW50aUNpcmN1bGFyIiwiX29iaiIsIm9iamVjdCIsImNhY2hlIiwiTWFwIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbHVlIiwiZ2V0Iiwic2V0Iiwic2VyaWFsaXplIiwibmFtZSIsInRlc3QiLCJlc2NhcGUiLCJzYW5pdGl6ZWRWYWx1ZSIsInN0cmluZ2lmaWVkIiwicGFpcnMiLCJpc051bWJlciIsIm1heEFnZSIsInB1c2giLCJkb21haW4iLCJwYXRoIiwiZXhwaXJlcyIsImV4cGlyZSIsIkluZmluaXR5IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJmaXJzdFBhcnR5T25seSIsInNhbWVTaXRlIiwiY29va2llU3RyaW5nIiwiam9pbiIsImlzU3RyaW5naWZpZWRSZWdFeCIsImlzVHlwZWRSZWdFeCIsImRlc2VyaWFsaXplIiwic3RyaW5nIiwibWF0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJfX2Nvb2tpZXMiLCJjb25zdHJ1Y3RvciIsIm9wdHMiLCJUVEwiLCJyZXNwb25zZSIsInJ1bk9uU2VydmVyIiwiYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMiLCJhbGxvd2VkQ29yZG92YU9yaWdpbnMiLCJvcmlnaW5SRSIsIlJlZ0V4cCIsIl9jb29raWVzIiwiY29va2llcyIsIl90bXAiLCJoYXNPd25Qcm9wZXJ0eSIsInVuZGVmaW5lZCIsImlzQ2xpZW50IiwiZG9jdW1lbnQiLCJjb29raWUiLCJzZXRIZWFkZXIiLCJyZW1vdmUiLCJrZXlzIiwiaGFzIiwic2VuZCIsImNiIiwiUk9PVF9VUkxfUEFUSF9QUkVGSVgiLCJxdWVyeSIsImlzQ29yZG92YSIsImNvb2tpZXNLZXlzIiwiY29va2llc0FycmF5IiwiaW5jbHVkZXMiLCJhYnNvbHV0ZVVybCIsImJlZm9yZVNlbmQiLCJ4aHIiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfX21pZGRsZXdhcmVIYW5kbGVyIiwicmVxdWVzdCIsImhlYWRlcnMiLCJhdXRvIiwiaGFuZGxlciIsImlzRnVuY3Rpb24iLCJvbkNvb2tpZXMiLCJpc0xvYWRlZE9uU2VydmVyIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJtYXRjaGVkQ29yZG92YU9yaWdpbiIsIm9yaWdpbiIsIm1hdGNoZWRPcmlnaW4iLCJjb29raWVzT2JqZWN0IiwiX19fY29va2llc19fXyIsIndyaXRlSGVhZCIsImVuZCIsIm1pZGRsZXdhcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7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Q0FBcEM7QUFDQWlKLGtCQUFJO0FBQ0w7QUFDRixXQTVDRDtBQTZDRDtBQUNGO0FBQ0Y7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQVMsWUFBVSxHQUFHO0FBQ1gsUUFBSSxDQUFDekosTUFBTSxDQUFDSyxRQUFaLEVBQXNCO0FBQ3BCLFlBQU0sSUFBSUwsTUFBTSxDQUFDOEMsS0FBWCxDQUFpQixHQUFqQixFQUFzQiwyRUFBdEIsQ0FBTjtBQUNEOztBQUVELFdBQU8sQ0FBQ2dHLEdBQUQsRUFBTUMsR0FBTixFQUFXQyxJQUFYLEtBQW9CO0FBQ3pCOUgsYUFBTyxDQUFDdUgsVUFBUixDQUFtQixLQUFLRCxPQUF4QixLQUFvQyxLQUFLQSxPQUFMLENBQWFKLG1CQUFtQixDQUFDVSxHQUFELEVBQU1DLEdBQU4sRUFBVyxLQUFLM0MsSUFBaEIsQ0FBaEMsQ0FBcEM7QUFDQTRDLFVBQUk7QUFDTCxLQUhEO0FBSUQ7O0FBdEY2Qjs7QUF5RmhDLElBQUloSixNQUFNLENBQUNLLFFBQVgsRUFBcUI7QUFDbkJOLFNBQU8sQ0FBQzRJLGdCQUFSLEdBQTJCLEtBQTNCO0FBQ0Q7QUFFRCw4QiIsImZpbGUiOiIvcGFja2FnZXMvb3N0cmlvX2Nvb2tpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxubGV0IEhUVFA7XG5sZXQgV2ViQXBwO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIFdlYkFwcCA9IHJlcXVpcmUoJ21ldGVvci93ZWJhcHAnKS5XZWJBcHA7XG59IGVsc2Uge1xuICBIVFRQID0gcmVxdWlyZSgnbWV0ZW9yL2h0dHAnKS5IVFRQO1xufVxuXG5jb25zdCBOb09wICA9ICgpID0+IHt9O1xuY29uc3QgdXJsUkUgPSAvXFwvX19fY29va2llX19fXFwvc2V0LztcbmNvbnN0IHJvb3RVcmwgPSBNZXRlb3IuaXNTZXJ2ZXIgPyBwcm9jZXNzLmVudi5ST09UX1VSTCA6ICh3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTCB8fCB3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5tZXRlb3JFbnYuUk9PVF9VUkwgfHwgZmFsc2UpO1xuY29uc3QgbW9iaWxlUm9vdFVybCA9IE1ldGVvci5pc1NlcnZlciA/IHByb2Nlc3MuZW52Lk1PQklMRV9ST09UX1VSTCA6ICh3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5NT0JJTEVfUk9PVF9VUkwgfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52Lk1PQklMRV9ST09UX1VSTCB8fCBmYWxzZSk7XG5cbmNvbnN0IGhlbHBlcnMgPSB7XG4gIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfSxcbiAgaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopO1xuICB9LFxuICBjbG9uZShvYmopIHtcbiAgICBpZiAoIXRoaXMuaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gdGhpcy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IE9iamVjdC5hc3NpZ24oe30sIG9iaik7XG4gIH1cbn07XG5jb25zdCBfaGVscGVycyA9IFsnTnVtYmVyJywgJ09iamVjdCcsICdGdW5jdGlvbiddO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBfaGVscGVycy5sZW5ndGg7IGkrKykge1xuICBoZWxwZXJzWydpcycgKyBfaGVscGVyc1tpXV0gPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgX2hlbHBlcnNbaV0gKyAnXSc7XG4gIH07XG59XG5cbi8qXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvY29va2llL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gKiBAbmFtZSBjb29raWVcbiAqIEBhdXRob3IganNodHRwXG4gKiBAbGljZW5zZVxuICogKFRoZSBNSVQgTGljZW5zZSlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxNCBSb21hbiBTaHR5bG1hbiA8c2h0eWxtYW5AZ21haWwuY29tPlxuICogQ29weXJpZ2h0IChjKSAyMDE1IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uIDxkb3VnQHNvbWV0aGluZ2RvdWcuY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4gKiAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuICogSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbiAqIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG4gKiBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuICogU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cbmNvbnN0IGRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbmNvbnN0IGVuY29kZSA9IGVuY29kZVVSSUNvbXBvbmVudDtcbmNvbnN0IHBhaXJTcGxpdFJlZ0V4cCA9IC87ICovO1xuXG4vKlxuICogUmVnRXhwIHRvIG1hdGNoIGZpZWxkLWNvbnRlbnQgaW4gUkZDIDcyMzAgc2VjIDMuMlxuICpcbiAqIGZpZWxkLWNvbnRlbnQgPSBmaWVsZC12Y2hhciBbIDEqKCBTUCAvIEhUQUIgKSBmaWVsZC12Y2hhciBdXG4gKiBmaWVsZC12Y2hhciAgID0gVkNIQVIgLyBvYnMtdGV4dFxuICogb2JzLXRleHQgICAgICA9ICV4ODAtRkZcbiAqL1xuY29uc3QgZmllbGRDb250ZW50UmVnRXhwID0gL15bXFx1MDAwOVxcdTAwMjAtXFx1MDA3ZVxcdTAwODAtXFx1MDBmZl0rJC87XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHRyeURlY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtGdW5jdGlvbn0gZFxuICogQHN1bW1hcnkgVHJ5IGRlY29kaW5nIGEgc3RyaW5nIHVzaW5nIGEgZGVjb2RpbmcgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCB0cnlEZWNvZGUgPSAoc3RyLCBkKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGQoc3RyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn07XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHBhcnNlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAc3VtbWFyeVxuICogUGFyc2UgYSBjb29raWUgaGVhZGVyLlxuICogUGFyc2UgdGhlIGdpdmVuIGNvb2tpZSBoZWFkZXIgc3RyaW5nIGludG8gYW4gb2JqZWN0XG4gKiBUaGUgb2JqZWN0IGhhcyB0aGUgdmFyaW91cyBjb29raWVzIGFzIGtleXMobmFtZXMpID0+IHZhbHVlc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgcGFyc2UgPSAoc3RyLCBvcHRpb25zKSA9PiB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnYXJndW1lbnQgc3RyIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBvYmogPSB7fTtcbiAgY29uc3Qgb3B0ID0gb3B0aW9ucyB8fCB7fTtcbiAgbGV0IHZhbDtcbiAgbGV0IGtleTtcbiAgbGV0IGVxSW5keDtcblxuICBzdHIuc3BsaXQocGFpclNwbGl0UmVnRXhwKS5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgZXFJbmR4ID0gcGFpci5pbmRleE9mKCc9Jyk7XG4gICAgaWYgKGVxSW5keCA8IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAga2V5ID0gcGFpci5zdWJzdHIoMCwgZXFJbmR4KS50cmltKCk7XG4gICAga2V5ID0gdHJ5RGVjb2RlKHVuZXNjYXBlKGtleSksIChvcHQuZGVjb2RlIHx8IGRlY29kZSkpO1xuICAgIHZhbCA9IHBhaXIuc3Vic3RyKCsrZXFJbmR4LCBwYWlyLmxlbmd0aCkudHJpbSgpO1xuICAgIGlmICh2YWxbMF0gPT09ICdcIicpIHtcbiAgICAgIHZhbCA9IHZhbC5zbGljZSgxLCAtMSk7XG4gICAgfVxuICAgIGlmICh2b2lkIDAgPT09IG9ialtrZXldKSB7XG4gICAgICBvYmpba2V5XSA9IHRyeURlY29kZSh2YWwsIChvcHQuZGVjb2RlIHx8IGRlY29kZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvYmo7XG59O1xuXG4vKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBhbnRpQ2lyY3VsYXJcbiAqIEBwYXJhbSBkYXRhIHtPYmplY3R9IC0gQ2lyY3VsYXIgb3IgYW55IG90aGVyIG9iamVjdCB3aGljaCBuZWVkcyB0byBiZSBub24tY2lyY3VsYXJcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGFudGlDaXJjdWxhciA9IChfb2JqKSA9PiB7XG4gIGNvbnN0IG9iamVjdCA9IGhlbHBlcnMuY2xvbmUoX29iaik7XG4gIGNvbnN0IGNhY2hlICA9IG5ldyBNYXAoKTtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iamVjdCwgKGtleSwgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgaWYgKGNhY2hlLmdldCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGNhY2hlLnNldCh2YWx1ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSk7XG59O1xuXG4vKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzZXJpYWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHsgY29va2llU3RyaW5nOiBTdHJpbmcsIHNhbml0aXplZFZhbHVlOiBNaXhlZCB9XG4gKiBAc3VtbWFyeVxuICogU2VyaWFsaXplIGRhdGEgaW50byBhIGNvb2tpZSBoZWFkZXIuXG4gKiBTZXJpYWxpemUgdGhlIGEgbmFtZSB2YWx1ZSBwYWlyIGludG8gYSBjb29raWUgc3RyaW5nIHN1aXRhYmxlIGZvclxuICogaHR0cCBoZWFkZXJzLiBBbiBvcHRpb25hbCBvcHRpb25zIG9iamVjdCBzcGVjaWZpZWQgY29va2llIHBhcmFtZXRlcnMuXG4gKiBzZXJpYWxpemUoJ2ZvbycsICdiYXInLCB7IGh0dHBPbmx5OiB0cnVlIH0pID0+IFwiZm9vPWJhcjsgaHR0cE9ubHlcIlxuICogQHByaXZhdGVcbiAqL1xuY29uc3Qgc2VyaWFsaXplID0gKGtleSwgdmFsLCBvcHQgPSB7fSkgPT4ge1xuICBsZXQgbmFtZTtcblxuICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KGtleSkpIHtcbiAgICBuYW1lID0gZXNjYXBlKGtleSk7XG4gIH0gZWxzZSB7XG4gICAgbmFtZSA9IGtleTtcbiAgfVxuXG4gIGxldCBzYW5pdGl6ZWRWYWx1ZSA9IHZhbDtcbiAgbGV0IHZhbHVlID0gdmFsO1xuICBpZiAoIWhlbHBlcnMuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNPYmplY3QodmFsdWUpIHx8IGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IHN0cmluZ2lmaWVkID0gYW50aUNpcmN1bGFyKHZhbHVlKTtcbiAgICAgIHZhbHVlID0gZW5jb2RlKGBKU09OLnBhcnNlKCR7c3RyaW5naWZpZWR9KWApO1xuICAgICAgc2FuaXRpemVkVmFsdWUgPSBKU09OLnBhcnNlKHN0cmluZ2lmaWVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBlbmNvZGUodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICYmICFmaWVsZENvbnRlbnRSZWdFeHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBlc2NhcGUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9ICcnO1xuICB9XG5cbiAgY29uc3QgcGFpcnMgPSBbYCR7bmFtZX09JHt2YWx1ZX1gXTtcblxuICBpZiAoaGVscGVycy5pc051bWJlcihvcHQubWF4QWdlKSkge1xuICAgIHBhaXJzLnB1c2goYE1heC1BZ2U9JHtvcHQubWF4QWdlfWApO1xuICB9XG5cbiAgaWYgKG9wdC5kb21haW4gJiYgdHlwZW9mIG9wdC5kb21haW4gPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChvcHQuZG9tYWluKSkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdvcHRpb24gZG9tYWluIGlzIGludmFsaWQnKTtcbiAgICB9XG4gICAgcGFpcnMucHVzaChgRG9tYWluPSR7b3B0LmRvbWFpbn1gKTtcbiAgfVxuXG4gIGlmIChvcHQucGF0aCAmJiB0eXBlb2Ygb3B0LnBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChvcHQucGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnb3B0aW9uIHBhdGggaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBwYWlycy5wdXNoKGBQYXRoPSR7b3B0LnBhdGh9YCk7XG4gIH0gZWxzZSB7XG4gICAgcGFpcnMucHVzaCgnUGF0aD0vJyk7XG4gIH1cblxuICBvcHQuZXhwaXJlcyA9IG9wdC5leHBpcmVzIHx8IG9wdC5leHBpcmUgfHwgZmFsc2U7XG4gIGlmIChvcHQuZXhwaXJlcyA9PT0gSW5maW5pdHkpIHtcbiAgICBwYWlycy5wdXNoKCdFeHBpcmVzPUZyaSwgMzEgRGVjIDk5OTkgMjM6NTk6NTkgR01UJyk7XG4gIH0gZWxzZSBpZiAob3B0LmV4cGlyZXMgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcGFpcnMucHVzaChgRXhwaXJlcz0ke29wdC5leHBpcmVzLnRvVVRDU3RyaW5nKCl9YCk7XG4gIH0gZWxzZSBpZiAob3B0LmV4cGlyZXMgPT09IDApIHtcbiAgICBwYWlycy5wdXNoKCdFeHBpcmVzPTAnKTtcbiAgfSBlbHNlIGlmIChoZWxwZXJzLmlzTnVtYmVyKG9wdC5leHBpcmVzKSkge1xuICAgIHBhaXJzLnB1c2goYEV4cGlyZXM9JHsobmV3IERhdGUob3B0LmV4cGlyZXMpKS50b1VUQ1N0cmluZygpfWApO1xuICB9XG5cbiAgaWYgKG9wdC5odHRwT25seSkge1xuICAgIHBhaXJzLnB1c2goJ0h0dHBPbmx5Jyk7XG4gIH1cblxuICBpZiAob3B0LnNlY3VyZSkge1xuICAgIHBhaXJzLnB1c2goJ1NlY3VyZScpO1xuICB9XG5cbiAgaWYgKG9wdC5maXJzdFBhcnR5T25seSkge1xuICAgIHBhaXJzLnB1c2goJ0ZpcnN0LVBhcnR5LU9ubHknKTtcbiAgfVxuXG4gIGlmIChvcHQuc2FtZVNpdGUpIHtcbiAgICBwYWlycy5wdXNoKG9wdC5zYW1lU2l0ZSA9PT0gdHJ1ZSA/ICdTYW1lU2l0ZScgOiBgU2FtZVNpdGU9JHtvcHQuc2FtZVNpdGV9YCk7XG4gIH1cblxuICByZXR1cm4geyBjb29raWVTdHJpbmc6IHBhaXJzLmpvaW4oJzsgJyksIHNhbml0aXplZFZhbHVlIH07XG59O1xuXG5jb25zdCBpc1N0cmluZ2lmaWVkUmVnRXggPSAvSlNPTlxcLnBhcnNlXFwoKC4qKVxcKS87XG5jb25zdCBpc1R5cGVkUmVnRXggPSAvZmFsc2V8dHJ1ZXxudWxsfHVuZGVmaW5lZC87XG5jb25zdCBkZXNlcmlhbGl6ZSA9IChzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG4gIGlmIChpc1N0cmluZ2lmaWVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgbGV0IG9iaiA9IHN0cmluZy5tYXRjaChpc1N0cmluZ2lmaWVkUmVnRXgpWzFdO1xuICAgIGlmIChvYmopIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShvYmopKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW29zdHJpbzpjb29raWVzXSBbLmdldCgpXSBbZGVzZXJpYWxpemUoKV0gRXhjZXB0aW9uOicsIGUsIHN0cmluZywgb2JqKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfSBlbHNlIGlmIChpc1R5cGVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKTtcbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufTtcblxuLypcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIF9fY29va2llc1xuICogQHBhcmFtIG9wdHMge09iamVjdH0gLSBPcHRpb25zIChjb25maWd1cmF0aW9uKSBvYmplY3RcbiAqIEBwYXJhbSBvcHRzLl9jb29raWVzIHtPYmplY3R8U3RyaW5nfSAtIEN1cnJlbnQgY29va2llcyBhcyBTdHJpbmcgb3IgT2JqZWN0XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcnxCb29sZWFufSAtIERlZmF1bHQgY29va2llcyBleHBpcmF0aW9uIHRpbWUgKG1heC1hZ2UpIGluIG1pbGxpc2Vjb25kcywgYnkgZGVmYXVsdCAtIHNlc3Npb24gKGZhbHNlKVxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gb3B0cy5yZXNwb25zZSB7aHR0cC5TZXJ2ZXJSZXNwb25zZXxPYmplY3R9IC0gVGhpcyBvYmplY3QgaXMgY3JlYXRlZCBpbnRlcm5hbGx5IGJ5IGEgSFRUUCBzZXJ2ZXJcbiAqIEBwYXJhbSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHtCb29sZWFufSAtIEFsbG93IHBhc3NpbmcgQ29va2llcyBpbiBhIHF1ZXJ5IHN0cmluZyAoaW4gVVJMKS4gUHJpbWFyeSBzaG91bGQgYmUgdXNlZCBvbmx5IGluIENvcmRvdmEgZW52aXJvbm1lbnRcbiAqIEBwYXJhbSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB7UmVnZXh8Qm9vbGVhbn0gLSBbU2VydmVyXSBBbGxvdyBzZXR0aW5nIENvb2tpZXMgZnJvbSB0aGF0IHNwZWNpZmljIG9yaWdpbiB3aGljaCBpbiBNZXRlb3IvQ29yZG92YSBpcyBsb2NhbGhvc3Q6MTJYWFggKF5odHRwOi8vbG9jYWxob3N0OjEyWzAtOV17M30kKVxuICogQHN1bW1hcnkgSW50ZXJuYWwgQ2xhc3NcbiAqL1xuY2xhc3MgX19jb29raWVzIHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHRoaXMuVFRMID0gb3B0cy5UVEwgfHwgZmFsc2U7XG4gICAgdGhpcy5yZXNwb25zZSA9IG9wdHMucmVzcG9uc2UgfHwgZmFsc2U7XG4gICAgdGhpcy5ydW5PblNlcnZlciA9IG9wdHMucnVuT25TZXJ2ZXIgfHwgZmFsc2U7XG4gICAgdGhpcy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyA9IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgfHwgZmFsc2U7XG4gICAgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB8fCBmYWxzZTtcblxuICAgIGlmICh0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSAvXmh0dHA6XFwvXFwvbG9jYWxob3N0OjEyWzAtOV17M30kLztcbiAgICB9XG5cbiAgICB0aGlzLm9yaWdpblJFID0gbmV3IFJlZ0V4cChgXmh0dHBzPzpcXC9cXC8oJHtyb290VXJsID8gcm9vdFVybCA6ICcnfSR7bW9iaWxlUm9vdFVybCA/ICgnfCcgKyBtb2JpbGVSb290VXJsKSA6ICcnfSkkYCk7XG5cbiAgICBpZiAoaGVscGVycy5pc09iamVjdChvcHRzLl9jb29raWVzKSkge1xuICAgICAgdGhpcy5jb29raWVzID0gb3B0cy5fY29va2llcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb29raWVzID0gcGFyc2Uob3B0cy5fY29va2llcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUgZ2V0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byByZWFkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBfdG1wIC0gVW5wYXJzZWQgc3RyaW5nIGluc3RlYWQgb2YgdXNlcidzIGNvb2tpZXNcbiAgICogQHN1bW1hcnkgUmVhZCBhIGNvb2tpZS4gSWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0IGEgbnVsbCB2YWx1ZSB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfHZvaWR9XG4gICAqL1xuICBnZXQoa2V5LCBfdG1wKSB7XG4gICAgY29uc3QgY29va2llU3RyaW5nID0gX3RtcCA/IHBhcnNlKF90bXApIDogdGhpcy5jb29raWVzO1xuICAgIGlmICgha2V5IHx8ICFjb29raWVTdHJpbmcpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgaWYgKGNvb2tpZVN0cmluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemUoY29va2llU3RyaW5nW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9ICBrZXkgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gIHZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSBjb29raWVcbiAgICogQHBhcmFtIHtPYmplY3R9ICBvcHRzICAtIFtPcHRpb25hbF0gQ29va2llIG9wdGlvbnMgKHNlZSByZWFkbWUgZG9jcylcbiAgICogQHN1bW1hcnkgQ3JlYXRlL292ZXJ3cml0ZSBhIGNvb2tpZS5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBzZXQoa2V5LCB2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKGtleSAmJiAhaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzTnVtYmVyKHRoaXMuVFRMKSAmJiBvcHRzLmV4cGlyZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRzLmV4cGlyZXMgPSBuZXcgRGF0ZSgrbmV3IERhdGUoKSArIHRoaXMuVFRMKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGtleSwgdmFsdWUsIG9wdHMpO1xuICAgICAgdGhpcy5jb29raWVzW2tleV0gPSBzYW5pdGl6ZWRWYWx1ZTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2Uuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llU3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSByZW1vdmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAgIC0gW09wdGlvbmFsXSBUaGUgcGF0aCBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbCBiZVxuICAgKiByZWFkYWJsZS4gRS5nLiwgXCIvXCIsIFwiL215ZGlyXCI7IGlmIG5vdCBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50XG4gICAqIHBhdGggb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgbG9jYXRpb24gKHN0cmluZyBvciBudWxsKS4gVGhlIHBhdGggbXVzdCBiZVxuICAgKiBhYnNvbHV0ZSAoc2VlIFJGQyAyOTY1KS4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIHVzZSByZWxhdGl2ZSBwYXRoc1xuICAgKiBpbiB0aGlzIGFyZ3VtZW50LCBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9kb2N1bWVudC5jb29raWUjVXNpbmdfcmVsYXRpdmVfVVJMc19pbl90aGVfcGF0aF9wYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiAtIFtPcHRpb25hbF0gVGhlIGRvbWFpbiBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbFxuICAgKiBiZSByZWFkYWJsZS4gRS5nLiwgXCJleGFtcGxlLmNvbVwiLCBcIi5leGFtcGxlLmNvbVwiIChpbmNsdWRlcyBhbGwgc3ViZG9tYWlucylcbiAgICogb3IgXCJzdWJkb21haW4uZXhhbXBsZS5jb21cIjsgaWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhlIGhvc3QgcG9ydGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBkb2N1bWVudCBsb2NhdGlvbiAoc3RyaW5nIG9yIG51bGwpLlxuICAgKiBAc3VtbWFyeSBSZW1vdmUgYSBjb29raWUocykuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgcmVtb3ZlKGtleSwgcGF0aCA9ICcvJywgZG9tYWluID0gJycpIHtcbiAgICBpZiAoa2V5ICYmIHRoaXMuY29va2llcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCB7IGNvb2tpZVN0cmluZyB9ID0gc2VyaWFsaXplKGtleSwgJycsIHtcbiAgICAgICAgZG9tYWluLFxuICAgICAgICBwYXRoLFxuICAgICAgICBleHBpcmVzOiBuZXcgRGF0ZSgwKVxuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZSB0aGlzLmNvb2tpZXNba2V5XTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2Uuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llU3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIWtleSAmJiB0aGlzLmtleXMoKS5sZW5ndGggPiAwICYmIHRoaXMua2V5cygpWzBdICE9PSAnJykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY29va2llcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoa2V5c1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUgaGFzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byBjcmVhdGUvb3ZlcndyaXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBfdG1wIC0gVW5wYXJzZWQgc3RyaW5nIGluc3RlYWQgb2YgdXNlcidzIGNvb2tpZXNcbiAgICogQHN1bW1hcnkgQ2hlY2sgd2hldGhlciBhIGNvb2tpZSBleGlzdHMgaW4gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgaGFzKGtleSwgX3RtcCkge1xuICAgIGNvbnN0IGNvb2tpZVN0cmluZyA9IF90bXAgPyBwYXJzZShfdG1wKSA6IHRoaXMuY29va2llcztcbiAgICBpZiAoIWtleSB8fCAhY29va2llU3RyaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb2tpZVN0cmluZy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUga2V5c1xuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCByZWFkYWJsZSBjb29raWVzIGZyb20gdGhpcyBsb2NhdGlvbi5cbiAgICogQHJldHVybnMge1tTdHJpbmddfVxuICAgKi9cbiAga2V5cygpIHtcbiAgICBpZiAodGhpcy5jb29raWVzKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb29raWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIHNlbmRcbiAgICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gLSBDYWxsYmFja1xuICAgKiBAc3VtbWFyeSBTZW5kIGFsbCBjb29raWVzIG92ZXIgWEhSIHRvIHNlcnZlci5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBzZW5kKGNiID0gTm9PcCkge1xuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIGNiKG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCBydW4gYC5zZW5kKClgIG9uIHNlcnZlciwgaXRcXCdzIENsaWVudCBvbmx5IG1ldGhvZCEnKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucnVuT25TZXJ2ZXIpIHtcbiAgICAgIGxldCBwYXRoID0gYCR7d2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52LlJPT1RfVVJMX1BBVEhfUFJFRklYIHx8ICcnfS9fX19jb29raWVfX18vc2V0YDtcbiAgICAgIGxldCBxdWVyeSA9ICcnO1xuXG4gICAgICBpZiAoTWV0ZW9yLmlzQ29yZG92YSAmJiB0aGlzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzKSB7XG4gICAgICAgIGNvbnN0IGNvb2tpZXNLZXlzID0gdGhpcy5rZXlzKCk7XG4gICAgICAgIGNvbnN0IGNvb2tpZXNBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb2tpZXNLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgeyBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGNvb2tpZXNLZXlzW2ldLCB0aGlzLmdldChjb29raWVzS2V5c1tpXSkpO1xuICAgICAgICAgIGNvbnN0IHBhaXIgPSBgJHtjb29raWVzS2V5c1tpXX09JHtzYW5pdGl6ZWRWYWx1ZX1gO1xuICAgICAgICAgIGlmICghY29va2llc0FycmF5LmluY2x1ZGVzKHBhaXIpKSB7XG4gICAgICAgICAgICBjb29raWVzQXJyYXkucHVzaChwYWlyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29va2llc0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIHBhdGggPSBNZXRlb3IuYWJzb2x1dGVVcmwoJ19fX2Nvb2tpZV9fXy9zZXQnKTtcbiAgICAgICAgICBxdWVyeSA9IGA/X19fY29va2llc19fXz0ke2VuY29kZVVSSUNvbXBvbmVudChjb29raWVzQXJyYXkuam9pbignOyAnKSl9YDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBIVFRQLmdldChgJHtwYXRofSR7cXVlcnl9YCwge1xuICAgICAgICBiZWZvcmVTZW5kKHhocikge1xuICAgICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCBzZW5kIGNvb2tpZXMgb24gc2VydmVyIHdoZW4gYHJ1bk9uU2VydmVyYCBpcyBmYWxzZS4nKSk7XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbn1cblxuLypcbiAqIEBmdW5jdGlvblxuICogQGxvY3VzIFNlcnZlclxuICogQHN1bW1hcnkgTWlkZGxld2FyZSBoYW5kbGVyXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfX21pZGRsZXdhcmVIYW5kbGVyID0gKHJlcXVlc3QsIHJlc3BvbnNlLCBvcHRzKSA9PiB7XG4gIGxldCBfY29va2llcyA9IHt9O1xuICBpZiAob3B0cy5ydW5PblNlcnZlcikge1xuICAgIGlmIChyZXF1ZXN0LmhlYWRlcnMgJiYgcmVxdWVzdC5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgX2Nvb2tpZXMgPSBwYXJzZShyZXF1ZXN0LmhlYWRlcnMuY29va2llKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IF9fY29va2llcyh7XG4gICAgICBfY29va2llcyxcbiAgICAgIFRUTDogb3B0cy5UVEwsXG4gICAgICBydW5PblNlcnZlcjogb3B0cy5ydW5PblNlcnZlcixcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXM6IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXNcbiAgICB9KTtcbiAgfVxuXG4gIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCB1c2UgbWlkZGxld2FyZSB3aGVuIGBydW5PblNlcnZlcmAgaXMgZmFsc2UuJyk7XG59O1xuXG4vKlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgQ29va2llc1xuICogQHBhcmFtIG9wdHMge09iamVjdH1cbiAqIEBwYXJhbSBvcHRzLlRUTCB7TnVtYmVyfSAtIERlZmF1bHQgY29va2llcyBleHBpcmF0aW9uIHRpbWUgKG1heC1hZ2UpIGluIG1pbGxpc2Vjb25kcywgYnkgZGVmYXVsdCAtIHNlc3Npb24gKGZhbHNlKVxuICogQHBhcmFtIG9wdHMuYXV0byB7Qm9vbGVhbn0gLSBbU2VydmVyXSBBdXRvLWJpbmQgaW4gbWlkZGxld2FyZSBhcyBgcmVxLkNvb2tpZXNgLCBieSBkZWZhdWx0IGB0cnVlYFxuICogQHBhcmFtIG9wdHMuaGFuZGxlciB7RnVuY3Rpb259IC0gW1NlcnZlcl0gTWlkZGxld2FyZSBoYW5kbGVyXG4gKiBAcGFyYW0gb3B0cy5ydW5PblNlcnZlciB7Qm9vbGVhbn0gLSBFeHBvc2UgQ29va2llcyBjbGFzcyB0byBTZXJ2ZXJcbiAqIEBwYXJhbSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHtCb29sZWFufSAtIEFsbG93IHBhc3NpbmcgQ29va2llcyBpbiBhIHF1ZXJ5IHN0cmluZyAoaW4gVVJMKS4gUHJpbWFyeSBzaG91bGQgYmUgdXNlZCBvbmx5IGluIENvcmRvdmEgZW52aXJvbm1lbnRcbiAqIEBwYXJhbSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB7UmVnZXh8Qm9vbGVhbn0gLSBbU2VydmVyXSBBbGxvdyBzZXR0aW5nIENvb2tpZXMgZnJvbSB0aGF0IHNwZWNpZmljIG9yaWdpbiB3aGljaCBpbiBNZXRlb3IvQ29yZG92YSBpcyBsb2NhbGhvc3Q6MTJYWFggKF5odHRwOi8vbG9jYWxob3N0OjEyWzAtOV17M30kKVxuICogQHN1bW1hcnkgTWFpbiBDb29raWUgY2xhc3NcbiAqL1xuY2xhc3MgQ29va2llcyBleHRlbmRzIF9fY29va2llcyB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIG9wdHMuVFRMID0gaGVscGVycy5pc051bWJlcihvcHRzLlRUTCkgPyBvcHRzLlRUTCA6IGZhbHNlO1xuICAgIG9wdHMucnVuT25TZXJ2ZXIgPSAob3B0cy5ydW5PblNlcnZlciAhPT0gZmFsc2UpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgPSAob3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyAhPT0gdHJ1ZSkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICBvcHRzLl9jb29raWVzID0gZG9jdW1lbnQuY29va2llO1xuICAgICAgc3VwZXIob3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMuX2Nvb2tpZXMgPSB7fTtcbiAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgb3B0cy5hdXRvID0gKG9wdHMuYXV0byAhPT0gZmFsc2UpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICAgIHRoaXMuaGFuZGxlciA9IGhlbHBlcnMuaXNGdW5jdGlvbihvcHRzLmhhbmRsZXIpID8gb3B0cy5oYW5kbGVyIDogZmFsc2U7XG4gICAgICB0aGlzLm9uQ29va2llcyA9IGhlbHBlcnMuaXNGdW5jdGlvbihvcHRzLm9uQ29va2llcykgPyBvcHRzLm9uQ29va2llcyA6IGZhbHNlO1xuXG4gICAgICBpZiAob3B0cy5ydW5PblNlcnZlciAmJiAhQ29va2llcy5pc0xvYWRlZE9uU2VydmVyKSB7XG4gICAgICAgIENvb2tpZXMuaXNMb2FkZWRPblNlcnZlciA9IHRydWU7XG4gICAgICAgIGlmIChvcHRzLmF1dG8pIHtcbiAgICAgICAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgIGlmICh1cmxSRS50ZXN0KHJlcS5fcGFyc2VkVXJsLnBhdGgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRDb3Jkb3ZhT3JpZ2luID0gISFyZXEuaGVhZGVycy5vcmlnaW5cbiAgICAgICAgICAgICAgICAmJiB0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2luc1xuICAgICAgICAgICAgICAgICYmIHRoaXMuYWxsb3dlZENvcmRvdmFPcmlnaW5zLnRlc3QocmVxLmhlYWRlcnMub3JpZ2luKTtcbiAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlZE9yaWdpbiA9IG1hdGNoZWRDb3Jkb3ZhT3JpZ2luXG4gICAgICAgICAgICAgICAgfHwgKCEhcmVxLmhlYWRlcnMub3JpZ2luICYmIHRoaXMub3JpZ2luUkUudGVzdChyZXEuaGVhZGVycy5vcmlnaW4pKTtcblxuICAgICAgICAgICAgICBpZiAobWF0Y2hlZE9yaWdpbikge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCByZXEuaGVhZGVycy5vcmlnaW4pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgY29va2llc0FycmF5ID0gW107XG4gICAgICAgICAgICAgIGxldCBjb29raWVzT2JqZWN0ID0ge307XG4gICAgICAgICAgICAgIGlmIChtYXRjaGVkQ29yZG92YU9yaWdpbiAmJiBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzICYmIHJlcS5xdWVyeS5fX19jb29raWVzX19fKSB7XG4gICAgICAgICAgICAgICAgY29va2llc09iamVjdCA9IHBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChyZXEucXVlcnkuX19fY29va2llc19fXykpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlcS5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgICAgICAgICAgIGNvb2tpZXNPYmplY3QgPSBwYXJzZShyZXEuaGVhZGVycy5jb29raWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgY29va2llc0tleXMgPSBPYmplY3Qua2V5cyhjb29raWVzT2JqZWN0KTtcbiAgICAgICAgICAgICAgaWYgKGNvb2tpZXNLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nIH0gPSBzZXJpYWxpemUoY29va2llc0tleXNbaV0sIGNvb2tpZXNPYmplY3RbY29va2llc0tleXNbaV1dKTtcbiAgICAgICAgICAgICAgICAgIGlmICghY29va2llc0FycmF5LmluY2x1ZGVzKGNvb2tpZVN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29va2llc0FycmF5LnB1c2goY29va2llU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29va2llc0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignU2V0LUNvb2tpZScsIGNvb2tpZXNBcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25Db29raWVzKSAmJiB0aGlzLm9uQ29va2llcyhfX21pZGRsZXdhcmVIYW5kbGVyKHJlcSwgcmVzLCBvcHRzKSk7XG5cbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDApO1xuICAgICAgICAgICAgICByZXMuZW5kKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcS5Db29raWVzID0gX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgb3B0cyk7XG4gICAgICAgICAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihyZXEuQ29va2llcyk7XG4gICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIENvb2tpZXNcbiAgICogQG5hbWUgbWlkZGxld2FyZVxuICAgKiBAc3VtbWFyeSBHZXQgQ29va2llcyBpbnN0YW5jZSBpbnRvIGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgbWlkZGxld2FyZSgpIHtcbiAgICBpZiAoIU1ldGVvci5pc1NlcnZlcikge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsICdbb3N0cmlvOmNvb2tpZXNdIENhblxcJ3QgdXNlIGAubWlkZGxld2FyZSgpYCBvbiBDbGllbnQsIGl0XFwncyBTZXJ2ZXIgb25seSEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5oYW5kbGVyKSAmJiB0aGlzLmhhbmRsZXIoX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgdGhpcy5vcHRzKSk7XG4gICAgICBuZXh0KCk7XG4gICAgfTtcbiAgfVxufVxuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIENvb2tpZXMuaXNMb2FkZWRPblNlcnZlciA9IGZhbHNlO1xufVxuXG4vKiBFeHBvcnQgdGhlIENvb2tpZXMgY2xhc3MgKi9cbmV4cG9ydCB7IENvb2tpZXMgfTtcbiJdfQ==
