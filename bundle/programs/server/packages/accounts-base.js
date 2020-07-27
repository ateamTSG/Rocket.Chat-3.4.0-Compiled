(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Hook = Package['callback-hook'].Hook;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Accounts, options, stampedLoginToken, handler, name, query, oldestValidDate, user;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-base":{"server_main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/accounts-base/server_main.js                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!function (module1) {
  module1.export({
    AccountsServer: () => AccountsServer
  });
  let AccountsServer;
  module1.link("./accounts_server.js", {
    AccountsServer(v) {
      AccountsServer = v;
    }

  }, 0);

  /**
   * @namespace Accounts
   * @summary The namespace for all server-side accounts-related methods.
   */
  Accounts = new AccountsServer(Meteor.server); // Users table. Don't use the normal autopublish, since we want to hide
  // some fields. Code to autopublish this is in accounts_server.js.
  // XXX Allow users to configure this collection name.

  /**
   * @summary A [Mongo.Collection](#collections) containing user documents.
   * @locus Anywhere
   * @type {Mongo.Collection}
   * @importFromPackage meteor
  */

  Meteor.users = Accounts.users;
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accounts_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/accounts-base/accounts_common.js                                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  AccountsCommon: () => AccountsCommon,
  EXPIRE_TOKENS_INTERVAL_MS: () => EXPIRE_TOKENS_INTERVAL_MS,
  CONNECTION_CLOSE_DELAY_MS: () => CONNECTION_CLOSE_DELAY_MS
});

class AccountsCommon {
  constructor(options) {
    // Currently this is read directly by packages like accounts-password
    // and accounts-ui-unstyled.
    this._options = {}; // Note that setting this.connection = null causes this.users to be a
    // LocalCollection, which is not what we want.

    this.connection = undefined;

    this._initConnection(options || {}); // There is an allow call in accounts_server.js that restricts writes to
    // this collection.


    this.users = new Mongo.Collection("users", {
      _preventAutopublish: true,
      connection: this.connection
    }); // Callback exceptions are printed with Meteor._debug and ignored.

    this._onLoginHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLogin callback"
    });
    this._onLoginFailureHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLoginFailure callback"
    });
    this._onLogoutHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLogout callback"
    }); // Expose for testing.

    this.DEFAULT_LOGIN_EXPIRATION_DAYS = DEFAULT_LOGIN_EXPIRATION_DAYS;
    this.LOGIN_UNEXPIRING_TOKEN_DAYS = LOGIN_UNEXPIRING_TOKEN_DAYS; // Thrown when the user cancels the login process (eg, closes an oauth
    // popup, declines retina scan, etc)

    const lceName = 'Accounts.LoginCancelledError';
    this.LoginCancelledError = Meteor.makeErrorType(lceName, function (description) {
      this.message = description;
    });
    this.LoginCancelledError.prototype.name = lceName; // This is used to transmit specific subclass errors over the wire. We
    // should come up with a more generic way to do this (eg, with some sort of
    // symbolic error code rather than a number).

    this.LoginCancelledError.numericError = 0x8acdc2f; // loginServiceConfiguration and ConfigError are maintained for backwards compatibility

    Meteor.startup(() => {
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      this.loginServiceConfiguration = ServiceConfiguration.configurations;
      this.ConfigError = ServiceConfiguration.ConfigError;
    });
  }
  /**
   * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
   * @locus Anywhere
   */


  userId() {
    throw new Error("userId method not implemented");
  } // merge the defaultFieldSelector with an existing options object


  _addDefaultFieldSelector() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // this will be the most common case for most people, so make it quick
    if (!this._options.defaultFieldSelector) return options; // if no field selector then just use defaultFieldSelector

    if (!options.fields) return _objectSpread({}, options, {
      fields: this._options.defaultFieldSelector
    }); // if empty field selector then the full user object is explicitly requested, so obey

    const keys = Object.keys(options.fields);
    if (!keys.length) return options; // if the requested fields are +ve then ignore defaultFieldSelector
    // assume they are all either +ve or -ve because Mongo doesn't like mixed

    if (!!options.fields[keys[0]]) return options; // The requested fields are -ve.
    // If the defaultFieldSelector is +ve then use requested fields, otherwise merge them

    const keys2 = Object.keys(this._options.defaultFieldSelector);
    return this._options.defaultFieldSelector[keys2[0]] ? options : _objectSpread({}, options, {
      fields: _objectSpread({}, options.fields, {}, this._options.defaultFieldSelector)
    });
  }
  /**
   * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
   * @locus Anywhere
   * @param {Object} [options]
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   */


  user(options) {
    const userId = this.userId();
    return userId ? this.users.findOne(userId, this._addDefaultFieldSelector(options)) : null;
  } // Set up config for the accounts system. Call this on both the client
  // and the server.
  //
  // Note that this method gets overridden on AccountsServer.prototype, but
  // the overriding method calls the overridden method.
  //
  // XXX we should add some enforcement that this is called on both the
  // client and the server. Otherwise, a user can
  // 'forbidClientAccountCreation' only on the client and while it looks
  // like their app is secure, the server will still accept createUser
  // calls. https://github.com/meteor/meteor/issues/828
  //
  // @param options {Object} an object with fields:
  // - sendVerificationEmail {Boolean}
  //     Send email address verification emails to new users created from
  //     client signups.
  // - forbidClientAccountCreation {Boolean}
  //     Do not allow clients to create accounts directly.
  // - restrictCreationByEmailDomain {Function or String}
  //     Require created users to have an email matching the function or
  //     having the string as domain.
  // - loginExpirationInDays {Number}
  //     Number of days since login until a user is logged out (login token
  //     expires).
  // - passwordResetTokenExpirationInDays {Number}
  //     Number of days since password reset token creation until the
  //     token cannt be used any longer (password reset token expires).
  // - ambiguousErrorMessages {Boolean}
  //     Return ambiguous error messages from login failures to prevent
  //     user enumeration.
  // - bcryptRounds {Number}
  //     Allows override of number of bcrypt rounds (aka work factor) used
  //     to store passwords.

  /**
   * @summary Set global accounts options.
   * @locus Anywhere
   * @param {Object} options
   * @param {Boolean} options.sendVerificationEmail New users with an email address will receive an address verification email.
   * @param {Boolean} options.forbidClientAccountCreation Calls to [`createUser`](#accounts_createuser) from the client will be rejected. In addition, if you are using [accounts-ui](#accountsui), the "Create account" link will not be available.
   * @param {String | Function} options.restrictCreationByEmailDomain If set to a string, only allows new users if the domain part of their email address matches the string. If set to a function, only allows new users if the function returns true.  The function is passed the full email address of the proposed new user.  Works with password-based sign-in and external services that expose email addresses (Google, Facebook, GitHub). All existing users still can log in after enabling this option. Example: `Accounts.config({ restrictCreationByEmailDomain: 'school.edu' })`.
   * @param {Number} options.loginExpirationInDays The number of days from when a user logs in until their token expires and they are logged out. Defaults to 90. Set to `null` to disable login expiration.
   * @param {String} options.oauthSecretKey When using the `oauth-encryption` package, the 16 byte key using to encrypt sensitive account credentials in the database, encoded in base64.  This option may only be specifed on the server.  See packages/oauth-encryption/README.md for details.
   * @param {Number} options.passwordResetTokenExpirationInDays The number of days from when a link to reset password is sent until token expires and user can't reset password with the link anymore. Defaults to 3.
   * @param {Number} options.passwordEnrollTokenExpirationInDays The number of days from when a link to set inital password is sent until token expires and user can't set password with the link anymore. Defaults to 30.
   * @param {Boolean} options.ambiguousErrorMessages Return ambiguous error messages from login failures to prevent user enumeration. Defaults to false.
   * @param {MongoFieldSpecifier} options.defaultFieldSelector To exclude by default large custom fields from `Meteor.user()` and `Meteor.findUserBy...()` functions when called without a field selector, and all `onLogin`, `onLoginFailure` and `onLogout` callbacks.  Example: `Accounts.config({ defaultFieldSelector: { myBigArray: 0 }})`.
   */


  config(options) {
    // We don't want users to accidentally only call Accounts.config on the
    // client, where some of the options will have partial effects (eg removing
    // the "create account" button from accounts-ui if forbidClientAccountCreation
    // is set, or redirecting Google login to a specific-domain page) without
    // having their full effects.
    if (Meteor.isServer) {
      __meteor_runtime_config__.accountsConfigCalled = true;
    } else if (!__meteor_runtime_config__.accountsConfigCalled) {
      // XXX would be nice to "crash" the client and replace the UI with an error
      // message, but there's no trivial way to do this.
      Meteor._debug("Accounts.config was called on the client but not on the " + "server; some configuration options may not take effect.");
    } // We need to validate the oauthSecretKey option at the time
    // Accounts.config is called. We also deliberately don't store the
    // oauthSecretKey in Accounts._options.


    if (Object.prototype.hasOwnProperty.call(options, 'oauthSecretKey')) {
      if (Meteor.isClient) {
        throw new Error("The oauthSecretKey option may only be specified on the server");
      }

      if (!Package["oauth-encryption"]) {
        throw new Error("The oauth-encryption package must be loaded to set oauthSecretKey");
      }

      Package["oauth-encryption"].OAuthEncryption.loadKey(options.oauthSecretKey);
      options = _objectSpread({}, options);
      delete options.oauthSecretKey;
    } // validate option keys


    const VALID_KEYS = ["sendVerificationEmail", "forbidClientAccountCreation", "passwordEnrollTokenExpirationInDays", "restrictCreationByEmailDomain", "loginExpirationInDays", "passwordResetTokenExpirationInDays", "ambiguousErrorMessages", "bcryptRounds", "defaultFieldSelector"];
    Object.keys(options).forEach(key => {
      if (!VALID_KEYS.includes(key)) {
        throw new Error("Accounts.config: Invalid key: ".concat(key));
      }
    }); // set values in Accounts._options

    VALID_KEYS.forEach(key => {
      if (key in options) {
        if (key in this._options) {
          throw new Error("Can't set `".concat(key, "` more than once"));
        }

        this._options[key] = options[key];
      }
    });
  }
  /**
   * @summary Register a callback to be called after a login attempt succeeds.
   * @locus Anywhere
   * @param {Function} func The callback to be called when login is successful.
   *                        The callback receives a single object that
   *                        holds login details. This object contains the login
   *                        result type (password, resume, etc.) on both the
   *                        client and server. `onLogin` callbacks registered
   *                        on the server also receive extra data, such
   *                        as user details, connection information, etc.
   */


  onLogin(func) {
    let ret = this._onLoginHook.register(func); // call the just registered callback if already logged in


    this._startupCallback(ret.callback);

    return ret;
  }
  /**
   * @summary Register a callback to be called after a login attempt fails.
   * @locus Anywhere
   * @param {Function} func The callback to be called after the login has failed.
   */


  onLoginFailure(func) {
    return this._onLoginFailureHook.register(func);
  }
  /**
   * @summary Register a callback to be called after a logout attempt succeeds.
   * @locus Anywhere
   * @param {Function} func The callback to be called when logout is successful.
   */


  onLogout(func) {
    return this._onLogoutHook.register(func);
  }

  _initConnection(options) {
    if (!Meteor.isClient) {
      return;
    } // The connection used by the Accounts system. This is the connection
    // that will get logged in by Meteor.login(), and this is the
    // connection whose login state will be reflected by Meteor.userId().
    //
    // It would be much preferable for this to be in accounts_client.js,
    // but it has to be here because it's needed to create the
    // Meteor.users collection.


    if (options.connection) {
      this.connection = options.connection;
    } else if (options.ddpUrl) {
      this.connection = DDP.connect(options.ddpUrl);
    } else if (typeof __meteor_runtime_config__ !== "undefined" && __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL) {
      // Temporary, internal hook to allow the server to point the client
      // to a different authentication server. This is for a very
      // particular use case that comes up when implementing a oauth
      // server. Unsupported and may go away at any point in time.
      //
      // We will eventually provide a general way to use account-base
      // against any DDP connection, not just one special one.
      this.connection = DDP.connect(__meteor_runtime_config__.ACCOUNTS_CONNECTION_URL);
    } else {
      this.connection = Meteor.connection;
    }
  }

  _getTokenLifetimeMs() {
    // When loginExpirationInDays is set to null, we'll use a really high
    // number of days (LOGIN_UNEXPIRABLE_TOKEN_DAYS) to simulate an
    // unexpiring token.
    const loginExpirationInDays = this._options.loginExpirationInDays === null ? LOGIN_UNEXPIRING_TOKEN_DAYS : this._options.loginExpirationInDays;
    return (loginExpirationInDays || DEFAULT_LOGIN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;
  }

  _getPasswordResetTokenLifetimeMs() {
    return (this._options.passwordResetTokenExpirationInDays || DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;
  }

  _getPasswordEnrollTokenLifetimeMs() {
    return (this._options.passwordEnrollTokenExpirationInDays || DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;
  }

  _tokenExpiration(when) {
    // We pass when through the Date constructor for backwards compatibility;
    // `when` used to be a number.
    return new Date(new Date(when).getTime() + this._getTokenLifetimeMs());
  }

  _tokenExpiresSoon(when) {
    let minLifetimeMs = .1 * this._getTokenLifetimeMs();

    const minLifetimeCapMs = MIN_TOKEN_LIFETIME_CAP_SECS * 1000;

    if (minLifetimeMs > minLifetimeCapMs) {
      minLifetimeMs = minLifetimeCapMs;
    }

    return new Date() > new Date(when) - minLifetimeMs;
  } // No-op on the server, overridden on the client.


  _startupCallback(callback) {}

}

// Note that Accounts is defined separately in accounts_client.js and
// accounts_server.js.

/**
 * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
 * @locus Anywhere but publish functions
 * @importFromPackage meteor
 */
Meteor.userId = () => Accounts.userId();
/**
 * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
 * @locus Anywhere but publish functions
 * @importFromPackage meteor
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 */


Meteor.user = options => Accounts.user(options); // how long (in days) until a login token expires


const DEFAULT_LOGIN_EXPIRATION_DAYS = 90; // how long (in days) until reset password token expires

const DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS = 3; // how long (in days) until enrol password token expires

const DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS = 30; // Clients don't try to auto-login with a token that is going to expire within
// .1 * DEFAULT_LOGIN_EXPIRATION_DAYS, capped at MIN_TOKEN_LIFETIME_CAP_SECS.
// Tries to avoid abrupt disconnects from expiring tokens.

const MIN_TOKEN_LIFETIME_CAP_SECS = 3600; // one hour
// how often (in milliseconds) we check for expired tokens

const EXPIRE_TOKENS_INTERVAL_MS = 600 * 1000;
const CONNECTION_CLOSE_DELAY_MS = 10 * 1000;
// A large number of expiration days (approximately 100 years worth) that is
// used when creating unexpiring tokens.
const LOGIN_UNEXPIRING_TOKEN_DAYS = 365 * 100;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accounts_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/accounts-base/accounts_server.js                                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let _objectWithoutProperties;

module.link("@babel/runtime/helpers/objectWithoutProperties", {
  default(v) {
    _objectWithoutProperties = v;
  }

}, 0);

let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 1);
module.export({
  AccountsServer: () => AccountsServer
});
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 0);
let AccountsCommon, EXPIRE_TOKENS_INTERVAL_MS, CONNECTION_CLOSE_DELAY_MS;
module.link("./accounts_common.js", {
  AccountsCommon(v) {
    AccountsCommon = v;
  },

  EXPIRE_TOKENS_INTERVAL_MS(v) {
    EXPIRE_TOKENS_INTERVAL_MS = v;
  },

  CONNECTION_CLOSE_DELAY_MS(v) {
    CONNECTION_CLOSE_DELAY_MS = v;
  }

}, 1);
const hasOwn = Object.prototype.hasOwnProperty;
/**
 * @summary Constructor for the `Accounts` namespace on the server.
 * @locus Server
 * @class AccountsServer
 * @extends AccountsCommon
 * @instancename accountsServer
 * @param {Object} server A server object such as `Meteor.server`.
 */

class AccountsServer extends AccountsCommon {
  // Note that this constructor is less likely to be instantiated multiple
  // times than the `AccountsClient` constructor, because a single server
  // can provide only one set of methods.
  constructor(server) {
    super();
    this._server = server || Meteor.server; // Set up the server's methods, as if by calling Meteor.methods.

    this._initServerMethods();

    this._initAccountDataHooks(); // If autopublish is on, publish these user fields. Login service
    // packages (eg accounts-google) add to these by calling
    // addAutopublishFields.  Notably, this isn't implemented with multiple
    // publishes since DDP only merges only across top-level fields, not
    // subfields (such as 'services.facebook.accessToken')


    this._autopublishFields = {
      loggedInUser: ['profile', 'username', 'emails'],
      otherUsers: ['profile', 'username']
    };

    this._initServerPublications(); // connectionId -> {connection, loginToken}


    this._accountData = {}; // connection id -> observe handle for the login token that this connection is
    // currently associated with, or a number. The number indicates that we are in
    // the process of setting up the observe (using a number instead of a single
    // sentinel allows multiple attempts to set up the observe to identify which
    // one was theirs).

    this._userObservesForConnections = {};
    this._nextUserObserveNumber = 1; // for the number described above.
    // list of all registered handlers.

    this._loginHandlers = [];
    setupUsersCollection(this.users);
    setupDefaultLoginHandlers(this);
    setExpireTokensInterval(this);
    this._validateLoginHook = new Hook({
      bindEnvironment: false
    });
    this._validateNewUserHooks = [defaultValidateNewUserHook.bind(this)];

    this._deleteSavedTokensForAllUsersOnStartup();

    this._skipCaseInsensitiveChecksForTest = {}; // XXX These should probably not actually be public?

    this.urls = {
      resetPassword: token => Meteor.absoluteUrl("#/reset-password/".concat(token)),
      verifyEmail: token => Meteor.absoluteUrl("#/verify-email/".concat(token)),
      enrollAccount: token => Meteor.absoluteUrl("#/enroll-account/".concat(token))
    };
    this.addDefaultRateLimit();
  } ///
  /// CURRENT USER
  ///
  // @override of "abstract" non-implementation in accounts_common.js


  userId() {
    // This function only works if called inside a method or a pubication.
    // Using any of the infomation from Meteor.user() in a method or
    // publish function will always use the value from when the function first
    // runs. This is likely not what the user expects. The way to make this work
    // in a method or publish function is to do Meteor.find(this.userId).observe
    // and recompute when the user record changes.
    const currentInvocation = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

    if (!currentInvocation) throw new Error("Meteor.userId can only be invoked in method calls or publications.");
    return currentInvocation.userId;
  } ///
  /// LOGIN HOOKS
  ///

  /**
   * @summary Validate login attempts.
   * @locus Server
   * @param {Function} func Called whenever a login is attempted (either successful or unsuccessful).  A login can be aborted by returning a falsy value or throwing an exception.
   */


  validateLoginAttempt(func) {
    // Exceptions inside the hook callback are passed up to us.
    return this._validateLoginHook.register(func);
  }
  /**
   * @summary Set restrictions on new user creation.
   * @locus Server
   * @param {Function} func Called whenever a new user is created. Takes the new user object, and returns true to allow the creation or false to abort.
   */


  validateNewUser(func) {
    this._validateNewUserHooks.push(func);
  } ///
  /// CREATE USER HOOKS
  ///

  /**
   * @summary Customize new user creation.
   * @locus Server
   * @param {Function} func Called whenever a new user is created. Return the new user object, or throw an `Error` to abort the creation.
   */


  onCreateUser(func) {
    if (this._onCreateUserHook) {
      throw new Error("Can only call onCreateUser once");
    }

    this._onCreateUserHook = func;
  }
  /**
   * @summary Customize oauth user profile updates
   * @locus Server
   * @param {Function} func Called whenever a user is logged in via oauth. Return the profile object to be merged, or throw an `Error` to abort the creation.
   */


  onExternalLogin(func) {
    if (this._onExternalLoginHook) {
      throw new Error("Can only call onExternalLogin once");
    }

    this._onExternalLoginHook = func;
  }

  _validateLogin(connection, attempt) {
    this._validateLoginHook.each(callback => {
      let ret;

      try {
        ret = callback(cloneAttemptWithConnection(connection, attempt));
      } catch (e) {
        attempt.allowed = false; // XXX this means the last thrown error overrides previous error
        // messages. Maybe this is surprising to users and we should make
        // overriding errors more explicit. (see
        // https://github.com/meteor/meteor/issues/1960)

        attempt.error = e;
        return true;
      }

      if (!ret) {
        attempt.allowed = false; // don't override a specific error provided by a previous
        // validator or the initial attempt (eg "incorrect password").

        if (!attempt.error) attempt.error = new Meteor.Error(403, "Login forbidden");
      }

      return true;
    });
  }

  _successfulLogin(connection, attempt) {
    this._onLoginHook.each(callback => {
      callback(cloneAttemptWithConnection(connection, attempt));
      return true;
    });
  }

  _failedLogin(connection, attempt) {
    this._onLoginFailureHook.each(callback => {
      callback(cloneAttemptWithConnection(connection, attempt));
      return true;
    });
  }

  _successfulLogout(connection, userId) {
    // don't fetch the user object unless there are some callbacks registered
    let user;

    this._onLogoutHook.each(callback => {
      if (!user && userId) user = this.users.findOne(userId, {
        fields: this._options.defaultFieldSelector
      });
      callback({
        user,
        connection
      });
      return true;
    });
  }

  ///
  /// LOGIN METHODS
  ///
  // Login methods return to the client an object containing these
  // fields when the user was logged in successfully:
  //
  //   id: userId
  //   token: *
  //   tokenExpires: *
  //
  // tokenExpires is optional and intends to provide a hint to the
  // client as to when the token will expire. If not provided, the
  // client will call Accounts._tokenExpiration, passing it the date
  // that it received the token.
  //
  // The login method will throw an error back to the client if the user
  // failed to log in.
  //
  //
  // Login handlers and service specific login methods such as
  // `createUser` internally return a `result` object containing these
  // fields:
  //
  //   type:
  //     optional string; the service name, overrides the handler
  //     default if present.
  //
  //   error:
  //     exception; if the user is not allowed to login, the reason why.
  //
  //   userId:
  //     string; the user id of the user attempting to login (if
  //     known), required for an allowed login.
  //
  //   options:
  //     optional object merged into the result returned by the login
  //     method; used by HAMK from SRP.
  //
  //   stampedLoginToken:
  //     optional object with `token` and `when` indicating the login
  //     token is already present in the database, returned by the
  //     "resume" login handler.
  //
  // For convenience, login methods can also throw an exception, which
  // is converted into an {error} result.  However, if the id of the
  // user attempting the login is known, a {userId, error} result should
  // be returned instead since the user id is not captured when an
  // exception is thrown.
  //
  // This internal `result` object is automatically converted into the
  // public {id, token, tokenExpires} object returned to the client.
  // Try a login method, converting thrown exceptions into an {error}
  // result.  The `type` argument is a default, inserted into the result
  // object if not explicitly returned.
  //
  // Log in a user on a connection.
  //
  // We use the method invocation to set the user id on the connection,
  // not the connection object directly. setUserId is tied to methods to
  // enforce clear ordering of method application (using wait methods on
  // the client, and a no setUserId after unblock restriction on the
  // server)
  //
  // The `stampedLoginToken` parameter is optional.  When present, it
  // indicates that the login token has already been inserted into the
  // database and doesn't need to be inserted again.  (It's used by the
  // "resume" login handler).
  _loginUser(methodInvocation, userId, stampedLoginToken) {
    if (!stampedLoginToken) {
      stampedLoginToken = this._generateStampedLoginToken();

      this._insertLoginToken(userId, stampedLoginToken);
    } // This order (and the avoidance of yields) is important to make
    // sure that when publish functions are rerun, they see a
    // consistent view of the world: the userId is set and matches
    // the login token on the connection (not that there is
    // currently a public API for reading the login token on a
    // connection).


    Meteor._noYieldsAllowed(() => this._setLoginToken(userId, methodInvocation.connection, this._hashLoginToken(stampedLoginToken.token)));

    methodInvocation.setUserId(userId);
    return {
      id: userId,
      token: stampedLoginToken.token,
      tokenExpires: this._tokenExpiration(stampedLoginToken.when)
    };
  }

  // After a login method has completed, call the login hooks.  Note
  // that `attemptLogin` is called for *all* login attempts, even ones
  // which aren't successful (such as an invalid password, etc).
  //
  // If the login is allowed and isn't aborted by a validate login hook
  // callback, log in the user.
  //
  _attemptLogin(methodInvocation, methodName, methodArgs, result) {
    if (!result) throw new Error("result is required"); // XXX A programming error in a login handler can lead to this occuring, and
    // then we don't call onLogin or onLoginFailure callbacks. Should
    // tryLoginMethod catch this case and turn it into an error?

    if (!result.userId && !result.error) throw new Error("A login method must specify a userId or an error");
    let user;
    if (result.userId) user = this.users.findOne(result.userId, {
      fields: this._options.defaultFieldSelector
    });
    const attempt = {
      type: result.type || "unknown",
      allowed: !!(result.userId && !result.error),
      methodName: methodName,
      methodArguments: Array.from(methodArgs)
    };

    if (result.error) {
      attempt.error = result.error;
    }

    if (user) {
      attempt.user = user;
    } // _validateLogin may mutate `attempt` by adding an error and changing allowed
    // to false, but that's the only change it can make (and the user's callbacks
    // only get a clone of `attempt`).


    this._validateLogin(methodInvocation.connection, attempt);

    if (attempt.allowed) {
      const ret = _objectSpread({}, this._loginUser(methodInvocation, result.userId, result.stampedLoginToken), {}, result.options);

      ret.type = attempt.type;

      this._successfulLogin(methodInvocation.connection, attempt);

      return ret;
    } else {
      this._failedLogin(methodInvocation.connection, attempt);

      throw attempt.error;
    }
  }

  // All service specific login methods should go through this function.
  // Ensure that thrown exceptions are caught and that login hook
  // callbacks are still called.
  //
  _loginMethod(methodInvocation, methodName, methodArgs, type, fn) {
    return this._attemptLogin(methodInvocation, methodName, methodArgs, tryLoginMethod(type, fn));
  }

  // Report a login attempt failed outside the context of a normal login
  // method. This is for use in the case where there is a multi-step login
  // procedure (eg SRP based password login). If a method early in the
  // chain fails, it should call this function to report a failure. There
  // is no corresponding method for a successful login; methods that can
  // succeed at logging a user in should always be actual login methods
  // (using either Accounts._loginMethod or Accounts.registerLoginHandler).
  _reportLoginFailure(methodInvocation, methodName, methodArgs, result) {
    const attempt = {
      type: result.type || "unknown",
      allowed: false,
      error: result.error,
      methodName: methodName,
      methodArguments: Array.from(methodArgs)
    };

    if (result.userId) {
      attempt.user = this.users.findOne(result.userId, {
        fields: this._options.defaultFieldSelector
      });
    }

    this._validateLogin(methodInvocation.connection, attempt);

    this._failedLogin(methodInvocation.connection, attempt); // _validateLogin may mutate attempt to set a new error message. Return
    // the modified version.


    return attempt;
  }

  ///
  /// LOGIN HANDLERS
  ///
  // The main entry point for auth packages to hook in to login.
  //
  // A login handler is a login method which can return `undefined` to
  // indicate that the login request is not handled by this handler.
  //
  // @param name {String} Optional.  The service name, used by default
  // if a specific service name isn't returned in the result.
  //
  // @param handler {Function} A function that receives an options object
  // (as passed as an argument to the `login` method) and returns one of:
  // - `undefined`, meaning don't handle;
  // - a login method result object
  registerLoginHandler(name, handler) {
    if (!handler) {
      handler = name;
      name = null;
    }

    this._loginHandlers.push({
      name: name,
      handler: handler
    });
  }

  // Checks a user's credentials against all the registered login
  // handlers, and returns a login token if the credentials are valid. It
  // is like the login method, except that it doesn't set the logged-in
  // user on the connection. Throws a Meteor.Error if logging in fails,
  // including the case where none of the login handlers handled the login
  // request. Otherwise, returns {id: userId, token: *, tokenExpires: *}.
  //
  // For example, if you want to login with a plaintext password, `options` could be
  //   { user: { username: <username> }, password: <password> }, or
  //   { user: { email: <email> }, password: <password> }.
  // Try all of the registered login handlers until one of them doesn't
  // return `undefined`, meaning it handled this call to `login`. Return
  // that return value.
  _runLoginHandlers(methodInvocation, options) {
    for (let handler of this._loginHandlers) {
      const result = tryLoginMethod(handler.name, () => handler.handler.call(methodInvocation, options));

      if (result) {
        return result;
      }

      if (result !== undefined) {
        throw new Meteor.Error(400, "A login handler should return a result or undefined");
      }
    }

    return {
      type: null,
      error: new Meteor.Error(400, "Unrecognized options for login request")
    };
  }

  // Deletes the given loginToken from the database.
  //
  // For new-style hashed token, this will cause all connections
  // associated with the token to be closed.
  //
  // Any connections associated with old-style unhashed tokens will be
  // in the process of becoming associated with hashed tokens and then
  // they'll get closed.
  destroyToken(userId, loginToken) {
    this.users.update(userId, {
      $pull: {
        "services.resume.loginTokens": {
          $or: [{
            hashedToken: loginToken
          }, {
            token: loginToken
          }]
        }
      }
    });
  }

  _initServerMethods() {
    // The methods created in this function need to be created here so that
    // this variable is available in their scope.
    const accounts = this; // This object will be populated with methods and then passed to
    // accounts._server.methods further below.

    const methods = {}; // @returns {Object|null}
    //   If successful, returns {token: reconnectToken, id: userId}
    //   If unsuccessful (for example, if the user closed the oauth login popup),
    //     throws an error describing the reason

    methods.login = function (options) {
      // Login handlers should really also check whatever field they look at in
      // options, but we don't enforce it.
      check(options, Object);

      const result = accounts._runLoginHandlers(this, options);

      return accounts._attemptLogin(this, "login", arguments, result);
    };

    methods.logout = function () {
      const token = accounts._getLoginToken(this.connection.id);

      accounts._setLoginToken(this.userId, this.connection, null);

      if (token && this.userId) {
        accounts.destroyToken(this.userId, token);
      }

      accounts._successfulLogout(this.connection, this.userId);

      this.setUserId(null);
    }; // Delete all the current user's tokens and close all open connections logged
    // in as this user. Returns a fresh new login token that this client can
    // use. Tests set Accounts._noConnectionCloseDelayForTest to delete tokens
    // immediately instead of using a delay.
    //
    // XXX COMPAT WITH 0.7.2
    // This single `logoutOtherClients` method has been replaced with two
    // methods, one that you call to get a new token, and another that you
    // call to remove all tokens except your own. The new design allows
    // clients to know when other clients have actually been logged
    // out. (The `logoutOtherClients` method guarantees the caller that
    // the other clients will be logged out at some point, but makes no
    // guarantees about when.) This method is left in for backwards
    // compatibility, especially since application code might be calling
    // this method directly.
    //
    // @returns {Object} Object with token and tokenExpires keys.


    methods.logoutOtherClients = function () {
      const user = accounts.users.findOne(this.userId, {
        fields: {
          "services.resume.loginTokens": true
        }
      });

      if (user) {
        // Save the current tokens in the database to be deleted in
        // CONNECTION_CLOSE_DELAY_MS ms. This gives other connections in the
        // caller's browser time to find the fresh token in localStorage. We save
        // the tokens in the database in case we crash before actually deleting
        // them.
        const tokens = user.services.resume.loginTokens;

        const newToken = accounts._generateStampedLoginToken();

        accounts.users.update(this.userId, {
          $set: {
            "services.resume.loginTokensToDelete": tokens,
            "services.resume.haveLoginTokensToDelete": true
          },
          $push: {
            "services.resume.loginTokens": accounts._hashStampedToken(newToken)
          }
        });
        Meteor.setTimeout(() => {
          // The observe on Meteor.users will take care of closing the connections
          // associated with `tokens`.
          accounts._deleteSavedTokensForUser(this.userId, tokens);
        }, accounts._noConnectionCloseDelayForTest ? 0 : CONNECTION_CLOSE_DELAY_MS); // We do not set the login token on this connection, but instead the
        // observe closes the connection and the client will reconnect with the
        // new token.

        return {
          token: newToken.token,
          tokenExpires: accounts._tokenExpiration(newToken.when)
        };
      } else {
        throw new Meteor.Error("You are not logged in.");
      }
    }; // Generates a new login token with the same expiration as the
    // connection's current token and saves it to the database. Associates
    // the connection with this new token and returns it. Throws an error
    // if called on a connection that isn't logged in.
    //
    // @returns Object
    //   If successful, returns { token: <new token>, id: <user id>,
    //   tokenExpires: <expiration date> }.


    methods.getNewToken = function () {
      const user = accounts.users.findOne(this.userId, {
        fields: {
          "services.resume.loginTokens": 1
        }
      });

      if (!this.userId || !user) {
        throw new Meteor.Error("You are not logged in.");
      } // Be careful not to generate a new token that has a later
      // expiration than the curren token. Otherwise, a bad guy with a
      // stolen token could use this method to stop his stolen token from
      // ever expiring.


      const currentHashedToken = accounts._getLoginToken(this.connection.id);

      const currentStampedToken = user.services.resume.loginTokens.find(stampedToken => stampedToken.hashedToken === currentHashedToken);

      if (!currentStampedToken) {
        // safety belt: this should never happen
        throw new Meteor.Error("Invalid login token");
      }

      const newStampedToken = accounts._generateStampedLoginToken();

      newStampedToken.when = currentStampedToken.when;

      accounts._insertLoginToken(this.userId, newStampedToken);

      return accounts._loginUser(this, this.userId, newStampedToken);
    }; // Removes all tokens except the token associated with the current
    // connection. Throws an error if the connection is not logged
    // in. Returns nothing on success.


    methods.removeOtherTokens = function () {
      if (!this.userId) {
        throw new Meteor.Error("You are not logged in.");
      }

      const currentToken = accounts._getLoginToken(this.connection.id);

      accounts.users.update(this.userId, {
        $pull: {
          "services.resume.loginTokens": {
            hashedToken: {
              $ne: currentToken
            }
          }
        }
      });
    }; // Allow a one-time configuration for a login service. Modifications
    // to this collection are also allowed in insecure mode.


    methods.configureLoginService = options => {
      check(options, Match.ObjectIncluding({
        service: String
      })); // Don't let random users configure a service we haven't added yet (so
      // that when we do later add it, it's set up with their configuration
      // instead of ours).
      // XXX if service configuration is oauth-specific then this code should
      //     be in accounts-oauth; if it's not then the registry should be
      //     in this package

      if (!(accounts.oauth && accounts.oauth.serviceNames().includes(options.service))) {
        throw new Meteor.Error(403, "Service unknown");
      }

      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      if (ServiceConfiguration.configurations.findOne({
        service: options.service
      })) throw new Meteor.Error(403, "Service ".concat(options.service, " already configured"));
      if (hasOwn.call(options, 'secret') && usingOAuthEncryption()) options.secret = OAuthEncryption.seal(options.secret);
      ServiceConfiguration.configurations.insert(options);
    };

    accounts._server.methods(methods);
  }

  _initAccountDataHooks() {
    this._server.onConnection(connection => {
      this._accountData[connection.id] = {
        connection: connection
      };
      connection.onClose(() => {
        this._removeTokenFromConnection(connection.id);

        delete this._accountData[connection.id];
      });
    });
  }

  _initServerPublications() {
    // Bring into lexical scope for publish callbacks that need `this`
    const {
      users,
      _autopublishFields
    } = this; // Publish all login service configuration fields other than secret.

    this._server.publish("meteor.loginServiceConfiguration", () => {
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      return ServiceConfiguration.configurations.find({}, {
        fields: {
          secret: 0
        }
      });
    }, {
      is_auto: true
    }); // not techincally autopublish, but stops the warning.
    // Publish the current user's record to the client.


    this._server.publish(null, function () {
      if (this.userId) {
        return users.find({
          _id: this.userId
        }, {
          fields: {
            profile: 1,
            username: 1,
            emails: 1
          }
        });
      } else {
        return null;
      }
    },
    /*suppress autopublish warning*/
    {
      is_auto: true
    }); // Use Meteor.startup to give other packages a chance to call
    // addAutopublishFields.


    Package.autopublish && Meteor.startup(() => {
      // ['profile', 'username'] -> {profile: 1, username: 1}
      const toFieldSelector = fields => fields.reduce((prev, field) => _objectSpread({}, prev, {
        [field]: 1
      }), {});

      this._server.publish(null, function () {
        if (this.userId) {
          return users.find({
            _id: this.userId
          }, {
            fields: toFieldSelector(_autopublishFields.loggedInUser)
          });
        } else {
          return null;
        }
      },
      /*suppress autopublish warning*/
      {
        is_auto: true
      }); // XXX this publish is neither dedup-able nor is it optimized by our special
      // treatment of queries on a specific _id. Therefore this will have O(n^2)
      // run-time performance every time a user document is changed (eg someone
      // logging in). If this is a problem, we can instead write a manual publish
      // function which filters out fields based on 'this.userId'.


      this._server.publish(null, function () {
        const selector = this.userId ? {
          _id: {
            $ne: this.userId
          }
        } : {};
        return users.find(selector, {
          fields: toFieldSelector(_autopublishFields.otherUsers)
        });
      },
      /*suppress autopublish warning*/
      {
        is_auto: true
      });
    });
  }

  // Add to the list of fields or subfields to be automatically
  // published if autopublish is on. Must be called from top-level
  // code (ie, before Meteor.startup hooks run).
  //
  // @param opts {Object} with:
  //   - forLoggedInUser {Array} Array of fields published to the logged-in user
  //   - forOtherUsers {Array} Array of fields published to users that aren't logged in
  addAutopublishFields(opts) {
    this._autopublishFields.loggedInUser.push.apply(this._autopublishFields.loggedInUser, opts.forLoggedInUser);

    this._autopublishFields.otherUsers.push.apply(this._autopublishFields.otherUsers, opts.forOtherUsers);
  }

  ///
  /// ACCOUNT DATA
  ///
  // HACK: This is used by 'meteor-accounts' to get the loginToken for a
  // connection. Maybe there should be a public way to do that.
  _getAccountData(connectionId, field) {
    const data = this._accountData[connectionId];
    return data && data[field];
  }

  _setAccountData(connectionId, field, value) {
    const data = this._accountData[connectionId]; // safety belt. shouldn't happen. accountData is set in onConnection,
    // we don't have a connectionId until it is set.

    if (!data) return;
    if (value === undefined) delete data[field];else data[field] = value;
  }

  ///
  /// RECONNECT TOKENS
  ///
  /// support reconnecting using a meteor login token
  _hashLoginToken(loginToken) {
    const hash = crypto.createHash('sha256');
    hash.update(loginToken);
    return hash.digest('base64');
  }

  // {token, when} => {hashedToken, when}
  _hashStampedToken(stampedToken) {
    const {
      token
    } = stampedToken,
          hashedStampedToken = _objectWithoutProperties(stampedToken, ["token"]);

    return _objectSpread({}, hashedStampedToken, {
      hashedToken: this._hashLoginToken(token)
    });
  }

  // Using $addToSet avoids getting an index error if another client
  // logging in simultaneously has already inserted the new hashed
  // token.
  _insertHashedLoginToken(userId, hashedToken, query) {
    query = query ? _objectSpread({}, query) : {};
    query._id = userId;
    this.users.update(query, {
      $addToSet: {
        "services.resume.loginTokens": hashedToken
      }
    });
  }

  // Exported for tests.
  _insertLoginToken(userId, stampedToken, query) {
    this._insertHashedLoginToken(userId, this._hashStampedToken(stampedToken), query);
  }

  _clearAllLoginTokens(userId) {
    this.users.update(userId, {
      $set: {
        'services.resume.loginTokens': []
      }
    });
  }

  // test hook
  _getUserObserve(connectionId) {
    return this._userObservesForConnections[connectionId];
  }

  // Clean up this connection's association with the token: that is, stop
  // the observe that we started when we associated the connection with
  // this token.
  _removeTokenFromConnection(connectionId) {
    if (hasOwn.call(this._userObservesForConnections, connectionId)) {
      const observe = this._userObservesForConnections[connectionId];

      if (typeof observe === 'number') {
        // We're in the process of setting up an observe for this connection. We
        // can't clean up that observe yet, but if we delete the placeholder for
        // this connection, then the observe will get cleaned up as soon as it has
        // been set up.
        delete this._userObservesForConnections[connectionId];
      } else {
        delete this._userObservesForConnections[connectionId];
        observe.stop();
      }
    }
  }

  _getLoginToken(connectionId) {
    return this._getAccountData(connectionId, 'loginToken');
  }

  // newToken is a hashed token.
  _setLoginToken(userId, connection, newToken) {
    this._removeTokenFromConnection(connection.id);

    this._setAccountData(connection.id, 'loginToken', newToken);

    if (newToken) {
      // Set up an observe for this token. If the token goes away, we need
      // to close the connection.  We defer the observe because there's
      // no need for it to be on the critical path for login; we just need
      // to ensure that the connection will get closed at some point if
      // the token gets deleted.
      //
      // Initially, we set the observe for this connection to a number; this
      // signifies to other code (which might run while we yield) that we are in
      // the process of setting up an observe for this connection. Once the
      // observe is ready to go, we replace the number with the real observe
      // handle (unless the placeholder has been deleted or replaced by a
      // different placehold number, signifying that the connection was closed
      // already -- in this case we just clean up the observe that we started).
      const myObserveNumber = ++this._nextUserObserveNumber;
      this._userObservesForConnections[connection.id] = myObserveNumber;
      Meteor.defer(() => {
        // If something else happened on this connection in the meantime (it got
        // closed, or another call to _setLoginToken happened), just do
        // nothing. We don't need to start an observe for an old connection or old
        // token.
        if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
          return;
        }

        let foundMatchingUser; // Because we upgrade unhashed login tokens to hashed tokens at
        // login time, sessions will only be logged in with a hashed
        // token. Thus we only need to observe hashed tokens here.

        const observe = this.users.find({
          _id: userId,
          'services.resume.loginTokens.hashedToken': newToken
        }, {
          fields: {
            _id: 1
          }
        }).observeChanges({
          added: () => {
            foundMatchingUser = true;
          },
          removed: connection.close // The onClose callback for the connection takes care of
          // cleaning up the observe handle and any other state we have
          // lying around.

        }, {
          nonMutatingCallbacks: true
        }); // If the user ran another login or logout command we were waiting for the
        // defer or added to fire (ie, another call to _setLoginToken occurred),
        // then we let the later one win (start an observe, etc) and just stop our
        // observe now.
        //
        // Similarly, if the connection was already closed, then the onClose
        // callback would have called _removeTokenFromConnection and there won't
        // be an entry in _userObservesForConnections. We can stop the observe.

        if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
          observe.stop();
          return;
        }

        this._userObservesForConnections[connection.id] = observe;

        if (!foundMatchingUser) {
          // We've set up an observe on the user associated with `newToken`,
          // so if the new token is removed from the database, we'll close
          // the connection. But the token might have already been deleted
          // before we set up the observe, which wouldn't have closed the
          // connection because the observe wasn't running yet.
          connection.close();
        }
      });
    }
  }

  // (Also used by Meteor Accounts server and tests).
  //
  _generateStampedLoginToken() {
    return {
      token: Random.secret(),
      when: new Date()
    };
  }

  ///
  /// TOKEN EXPIRATION
  ///
  // Deletes expired password reset tokens from the database.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.
  _expirePasswordResetTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getPasswordResetTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const tokenFilter = {
      $or: [{
        "services.password.reset.reason": "reset"
      }, {
        "services.password.reset.reason": {
          $exists: false
        }
      }]
    };
    expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
  } // Deletes expired password enroll tokens from the database.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.


  _expirePasswordEnrollTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getPasswordEnrollTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const tokenFilter = {
      "services.password.reset.reason": "enroll"
    };
    expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
  } // Deletes expired tokens from the database and closes all open connections
  // associated with these tokens.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.


  _expireTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const userFilter = userId ? {
      _id: userId
    } : {}; // Backwards compatible with older versions of meteor that stored login token
    // timestamps as numbers.

    this.users.update(_objectSpread({}, userFilter, {
      $or: [{
        "services.resume.loginTokens.when": {
          $lt: oldestValidDate
        }
      }, {
        "services.resume.loginTokens.when": {
          $lt: +oldestValidDate
        }
      }]
    }), {
      $pull: {
        "services.resume.loginTokens": {
          $or: [{
            when: {
              $lt: oldestValidDate
            }
          }, {
            when: {
              $lt: +oldestValidDate
            }
          }]
        }
      }
    }, {
      multi: true
    }); // The observe on Meteor.users will take care of closing connections for
    // expired tokens.
  }

  // @override from accounts_common.js
  config(options) {
    // Call the overridden implementation of the method.
    const superResult = AccountsCommon.prototype.config.apply(this, arguments); // If the user set loginExpirationInDays to null, then we need to clear the
    // timer that periodically expires tokens.

    if (hasOwn.call(this._options, 'loginExpirationInDays') && this._options.loginExpirationInDays === null && this.expireTokenInterval) {
      Meteor.clearInterval(this.expireTokenInterval);
      this.expireTokenInterval = null;
    }

    return superResult;
  }

  // Called by accounts-password
  insertUserDoc(options, user) {
    // - clone user document, to protect from modification
    // - add createdAt timestamp
    // - prepare an _id, so that you can modify other collections (eg
    // create a first task for every new user)
    //
    // XXX If the onCreateUser or validateNewUser hooks fail, we might
    // end up having modified some other collection
    // inappropriately. The solution is probably to have onCreateUser
    // accept two callbacks - one that gets called before inserting
    // the user document (in which you can modify its contents), and
    // one that gets called after (in which you should change other
    // collections)
    user = _objectSpread({
      createdAt: new Date(),
      _id: Random.id()
    }, user);

    if (user.services) {
      Object.keys(user.services).forEach(service => pinEncryptedFieldsToUser(user.services[service], user._id));
    }

    let fullUser;

    if (this._onCreateUserHook) {
      fullUser = this._onCreateUserHook(options, user); // This is *not* part of the API. We need this because we can't isolate
      // the global server environment between tests, meaning we can't test
      // both having a create user hook set and not having one set.

      if (fullUser === 'TEST DEFAULT HOOK') fullUser = defaultCreateUserHook(options, user);
    } else {
      fullUser = defaultCreateUserHook(options, user);
    }

    this._validateNewUserHooks.forEach(hook => {
      if (!hook(fullUser)) throw new Meteor.Error(403, "User validation failed");
    });

    let userId;

    try {
      userId = this.users.insert(fullUser);
    } catch (e) {
      // XXX string parsing sucks, maybe
      // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day
      if (!e.errmsg) throw e;
      if (e.errmsg.includes('emails.address')) throw new Meteor.Error(403, "Email already exists.");
      if (e.errmsg.includes('username')) throw new Meteor.Error(403, "Username already exists.");
      throw e;
    }

    return userId;
  }

  // Helper function: returns false if email does not match company domain from
  // the configuration.
  _testEmailDomain(email) {
    const domain = this._options.restrictCreationByEmailDomain;
    return !domain || typeof domain === 'function' && domain(email) || typeof domain === 'string' && new RegExp("@".concat(Meteor._escapeRegExp(domain), "$"), 'i').test(email);
  }

  ///
  /// CLEAN UP FOR `logoutOtherClients`
  ///
  _deleteSavedTokensForUser(userId, tokensToDelete) {
    if (tokensToDelete) {
      this.users.update(userId, {
        $unset: {
          "services.resume.haveLoginTokensToDelete": 1,
          "services.resume.loginTokensToDelete": 1
        },
        $pullAll: {
          "services.resume.loginTokens": tokensToDelete
        }
      });
    }
  }

  _deleteSavedTokensForAllUsersOnStartup() {
    // If we find users who have saved tokens to delete on startup, delete
    // them now. It's possible that the server could have crashed and come
    // back up before new tokens are found in localStorage, but this
    // shouldn't happen very often. We shouldn't put a delay here because
    // that would give a lot of power to an attacker with a stolen login
    // token and the ability to crash the server.
    Meteor.startup(() => {
      this.users.find({
        "services.resume.haveLoginTokensToDelete": true
      }, {
        fields: {
          "services.resume.loginTokensToDelete": 1
        }
      }).forEach(user => {
        this._deleteSavedTokensForUser(user._id, user.services.resume.loginTokensToDelete);
      });
    });
  }

  ///
  /// MANAGING USER OBJECTS
  ///
  // Updates or creates a user after we authenticate with a 3rd party.
  //
  // @param serviceName {String} Service name (eg, twitter).
  // @param serviceData {Object} Data to store in the user's record
  //        under services[serviceName]. Must include an "id" field
  //        which is a unique identifier for the user in the service.
  // @param options {Object, optional} Other options to pass to insertUserDoc
  //        (eg, profile)
  // @returns {Object} Object with token and id keys, like the result
  //        of the "login" method.
  //
  updateOrCreateUserFromExternalService(serviceName, serviceData, options) {
    options = _objectSpread({}, options);

    if (serviceName === "password" || serviceName === "resume") {
      throw new Error("Can't use updateOrCreateUserFromExternalService with internal service " + serviceName);
    }

    if (!hasOwn.call(serviceData, 'id')) {
      throw new Error("Service data for service ".concat(serviceName, " must include id"));
    } // Look for a user with the appropriate service user id.


    const selector = {};
    const serviceIdKey = "services.".concat(serviceName, ".id"); // XXX Temporary special case for Twitter. (Issue #629)
    //   The serviceData.id will be a string representation of an integer.
    //   We want it to match either a stored string or int representation.
    //   This is to cater to earlier versions of Meteor storing twitter
    //   user IDs in number form, and recent versions storing them as strings.
    //   This can be removed once migration technology is in place, and twitter
    //   users stored with integer IDs have been migrated to string IDs.

    if (serviceName === "twitter" && !isNaN(serviceData.id)) {
      selector["$or"] = [{}, {}];
      selector["$or"][0][serviceIdKey] = serviceData.id;
      selector["$or"][1][serviceIdKey] = parseInt(serviceData.id, 10);
    } else {
      selector[serviceIdKey] = serviceData.id;
    }

    let user = this.users.findOne(selector, {
      fields: this._options.defaultFieldSelector
    }); // When creating a new user we pass through all options. When updating an
    // existing user, by default we only process/pass through the serviceData
    // (eg, so that we keep an unexpired access token and don't cache old email
    // addresses in serviceData.email). The onExternalLogin hook can be used when
    // creating or updating a user, to modify or pass through more options as
    // needed.

    let opts = user ? {} : options;

    if (this._onExternalLoginHook) {
      opts = this._onExternalLoginHook(options, user);
    }

    if (user) {
      pinEncryptedFieldsToUser(serviceData, user._id);
      let setAttrs = {};
      Object.keys(serviceData).forEach(key => setAttrs["services.".concat(serviceName, ".").concat(key)] = serviceData[key]); // XXX Maybe we should re-use the selector above and notice if the update
      //     touches nothing?

      setAttrs = _objectSpread({}, setAttrs, {}, opts);
      this.users.update(user._id, {
        $set: setAttrs
      });
      return {
        type: serviceName,
        userId: user._id
      };
    } else {
      // Create a new user with the service data.
      user = {
        services: {}
      };
      user.services[serviceName] = serviceData;
      return {
        type: serviceName,
        userId: this.insertUserDoc(opts, user)
      };
    }
  }

  // Removes default rate limiting rule
  removeDefaultRateLimit() {
    const resp = DDPRateLimiter.removeRule(this.defaultRateLimiterRuleId);
    this.defaultRateLimiterRuleId = null;
    return resp;
  }

  // Add a default rule of limiting logins, creating new users and password reset
  // to 5 times every 10 seconds per connection.
  addDefaultRateLimit() {
    if (!this.defaultRateLimiterRuleId) {
      this.defaultRateLimiterRuleId = DDPRateLimiter.addRule({
        userId: null,
        clientAddress: null,
        type: 'method',
        name: name => ['login', 'createUser', 'resetPassword', 'forgotPassword'].includes(name),
        connectionId: connectionId => true
      }, 5, 10000);
    }
  }

}

// Give each login hook callback a fresh cloned copy of the attempt
// object, but don't clone the connection.
//
const cloneAttemptWithConnection = (connection, attempt) => {
  const clonedAttempt = EJSON.clone(attempt);
  clonedAttempt.connection = connection;
  return clonedAttempt;
};

const tryLoginMethod = (type, fn) => {
  let result;

  try {
    result = fn();
  } catch (e) {
    result = {
      error: e
    };
  }

  if (result && !result.type && type) result.type = type;
  return result;
};

const setupDefaultLoginHandlers = accounts => {
  accounts.registerLoginHandler("resume", function (options) {
    return defaultResumeLoginHandler.call(this, accounts, options);
  });
}; // Login handler for resume tokens.


const defaultResumeLoginHandler = (accounts, options) => {
  if (!options.resume) return undefined;
  check(options.resume, String);

  const hashedToken = accounts._hashLoginToken(options.resume); // First look for just the new-style hashed login token, to avoid
  // sending the unhashed token to the database in a query if we don't
  // need to.


  let user = accounts.users.findOne({
    "services.resume.loginTokens.hashedToken": hashedToken
  }, {
    fields: {
      "services.resume.loginTokens.$": 1
    }
  });

  if (!user) {
    // If we didn't find the hashed login token, try also looking for
    // the old-style unhashed token.  But we need to look for either
    // the old-style token OR the new-style token, because another
    // client connection logging in simultaneously might have already
    // converted the token.
    user = accounts.users.findOne({
      $or: [{
        "services.resume.loginTokens.hashedToken": hashedToken
      }, {
        "services.resume.loginTokens.token": options.resume
      }]
    }, // Note: Cannot use ...loginTokens.$ positional operator with $or query.
    {
      fields: {
        "services.resume.loginTokens": 1
      }
    });
  }

  if (!user) return {
    error: new Meteor.Error(403, "You've been logged out by the server. Please log in again.")
  }; // Find the token, which will either be an object with fields
  // {hashedToken, when} for a hashed token or {token, when} for an
  // unhashed token.

  let oldUnhashedStyleToken;
  let token = user.services.resume.loginTokens.find(token => token.hashedToken === hashedToken);

  if (token) {
    oldUnhashedStyleToken = false;
  } else {
    token = user.services.resume.loginTokens.find(token => token.token === options.resume);
    oldUnhashedStyleToken = true;
  }

  const tokenExpires = accounts._tokenExpiration(token.when);

  if (new Date() >= tokenExpires) return {
    userId: user._id,
    error: new Meteor.Error(403, "Your session has expired. Please log in again.")
  }; // Update to a hashed token when an unhashed token is encountered.

  if (oldUnhashedStyleToken) {
    // Only add the new hashed token if the old unhashed token still
    // exists (this avoids resurrecting the token if it was deleted
    // after we read it).  Using $addToSet avoids getting an index
    // error if another client logging in simultaneously has already
    // inserted the new hashed token.
    accounts.users.update({
      _id: user._id,
      "services.resume.loginTokens.token": options.resume
    }, {
      $addToSet: {
        "services.resume.loginTokens": {
          "hashedToken": hashedToken,
          "when": token.when
        }
      }
    }); // Remove the old token *after* adding the new, since otherwise
    // another client trying to login between our removing the old and
    // adding the new wouldn't find a token to login with.

    accounts.users.update(user._id, {
      $pull: {
        "services.resume.loginTokens": {
          "token": options.resume
        }
      }
    });
  }

  return {
    userId: user._id,
    stampedLoginToken: {
      token: options.resume,
      when: token.when
    }
  };
};

const expirePasswordToken = (accounts, oldestValidDate, tokenFilter, userId) => {
  const userFilter = userId ? {
    _id: userId
  } : {};
  const resetRangeOr = {
    $or: [{
      "services.password.reset.when": {
        $lt: oldestValidDate
      }
    }, {
      "services.password.reset.when": {
        $lt: +oldestValidDate
      }
    }]
  };
  const expireFilter = {
    $and: [tokenFilter, resetRangeOr]
  };
  accounts.users.update(_objectSpread({}, userFilter, {}, expireFilter), {
    $unset: {
      "services.password.reset": ""
    }
  }, {
    multi: true
  });
};

const setExpireTokensInterval = accounts => {
  accounts.expireTokenInterval = Meteor.setInterval(() => {
    accounts._expireTokens();

    accounts._expirePasswordResetTokens();

    accounts._expirePasswordEnrollTokens();
  }, EXPIRE_TOKENS_INTERVAL_MS);
}; ///
/// OAuth Encryption Support
///


const OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;

const usingOAuthEncryption = () => {
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();
}; // OAuth service data is temporarily stored in the pending credentials
// collection during the oauth authentication process.  Sensitive data
// such as access tokens are encrypted without the user id because
// we don't know the user id yet.  We re-encrypt these fields with the
// user id included when storing the service data permanently in
// the users collection.
//


const pinEncryptedFieldsToUser = (serviceData, userId) => {
  Object.keys(serviceData).forEach(key => {
    let value = serviceData[key];
    if (OAuthEncryption && OAuthEncryption.isSealed(value)) value = OAuthEncryption.seal(OAuthEncryption.open(value), userId);
    serviceData[key] = value;
  });
}; // Encrypt unencrypted login service secrets when oauth-encryption is
// added.
//
// XXX For the oauthSecretKey to be available here at startup, the
// developer must call Accounts.config({oauthSecretKey: ...}) at load
// time, instead of in a Meteor.startup block, because the startup
// block in the app code will run after this accounts-base startup
// block.  Perhaps we need a post-startup callback?


Meteor.startup(() => {
  if (!usingOAuthEncryption()) {
    return;
  }

  const {
    ServiceConfiguration
  } = Package['service-configuration'];
  ServiceConfiguration.configurations.find({
    $and: [{
      secret: {
        $exists: true
      }
    }, {
      "secret.algorithm": {
        $exists: false
      }
    }]
  }).forEach(config => {
    ServiceConfiguration.configurations.update(config._id, {
      $set: {
        secret: OAuthEncryption.seal(config.secret)
      }
    });
  });
}); // XXX see comment on Accounts.createUser in passwords_server about adding a
// second "server options" argument.

const defaultCreateUserHook = (options, user) => {
  if (options.profile) user.profile = options.profile;
  return user;
}; // Validate new user's email or Google/Facebook/GitHub account's email


function defaultValidateNewUserHook(user) {
  const domain = this._options.restrictCreationByEmailDomain;

  if (!domain) {
    return true;
  }

  let emailIsGood = false;

  if (user.emails && user.emails.length > 0) {
    emailIsGood = user.emails.reduce((prev, email) => prev || this._testEmailDomain(email.address), false);
  } else if (user.services && Object.values(user.services).length > 0) {
    // Find any email of any service and check it
    emailIsGood = Object.values(user.services).reduce((prev, service) => service.email && this._testEmailDomain(service.email), false);
  }

  if (emailIsGood) {
    return true;
  }

  if (typeof domain === 'string') {
    throw new Meteor.Error(403, "@".concat(domain, " email required"));
  } else {
    throw new Meteor.Error(403, "Email doesn't match the criteria.");
  }
}

const setupUsersCollection = users => {
  ///
  /// RESTRICTING WRITES TO USER OBJECTS
  ///
  users.allow({
    // clients can modify the profile field of their own document, and
    // nothing else.
    update: (userId, user, fields, modifier) => {
      // make sure it is our record
      if (user._id !== userId) {
        return false;
      } // user can only modify the 'profile' field. sets to multiple
      // sub-keys (eg profile.foo and profile.bar) are merged into entry
      // in the fields list.


      if (fields.length !== 1 || fields[0] !== 'profile') {
        return false;
      }

      return true;
    },
    fetch: ['_id'] // we only look at _id.

  }); /// DEFAULT INDEXES ON USERS

  users._ensureIndex('username', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('emails.address', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('services.resume.loginTokens.hashedToken', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('services.resume.loginTokens.token', {
    unique: true,
    sparse: true
  }); // For taking care of logoutOtherClients calls that crashed before the
  // tokens were deleted.


  users._ensureIndex('services.resume.haveLoginTokensToDelete', {
    sparse: true
  }); // For expiring login tokens


  users._ensureIndex("services.resume.loginTokens.when", {
    sparse: true
  }); // For expiring password tokens


  users._ensureIndex('services.password.reset.when', {
    sparse: true
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/accounts-base/server_main.js");

/* Exports */
Package._define("accounts-base", exports, {
  Accounts: Accounts
});

})();

//# sourceURL=meteor://💻app/packages/accounts-base.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9zZXJ2ZXJfbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9hY2NvdW50c19jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FjY291bnRzLWJhc2UvYWNjb3VudHNfc2VydmVyLmpzIl0sIm5hbWVzIjpbIm1vZHVsZTEiLCJleHBvcnQiLCJBY2NvdW50c1NlcnZlciIsImxpbmsiLCJ2IiwiQWNjb3VudHMiLCJNZXRlb3IiLCJzZXJ2ZXIiLCJ1c2VycyIsIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJkZWZhdWx0IiwiQWNjb3VudHNDb21tb24iLCJFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TIiwiQ09OTkVDVElPTl9DTE9TRV9ERUxBWV9NUyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIl9vcHRpb25zIiwiY29ubmVjdGlvbiIsInVuZGVmaW5lZCIsIl9pbml0Q29ubmVjdGlvbiIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9wcmV2ZW50QXV0b3B1Ymxpc2giLCJfb25Mb2dpbkhvb2siLCJIb29rIiwiYmluZEVudmlyb25tZW50IiwiZGVidWdQcmludEV4Y2VwdGlvbnMiLCJfb25Mb2dpbkZhaWx1cmVIb29rIiwiX29uTG9nb3V0SG9vayIsIkRFRkFVTFRfTE9HSU5fRVhQSVJBVElPTl9EQVlTIiwiTE9HSU5fVU5FWFBJUklOR19UT0tFTl9EQVlTIiwibGNlTmFtZSIsIkxvZ2luQ2FuY2VsbGVkRXJyb3IiLCJtYWtlRXJyb3JUeXBlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwicHJvdG90eXBlIiwibmFtZSIsIm51bWVyaWNFcnJvciIsInN0YXJ0dXAiLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsIlBhY2thZ2UiLCJsb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJDb25maWdFcnJvciIsInVzZXJJZCIsIkVycm9yIiwiX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yIiwiZGVmYXVsdEZpZWxkU2VsZWN0b3IiLCJmaWVsZHMiLCJrZXlzIiwiT2JqZWN0IiwibGVuZ3RoIiwia2V5czIiLCJ1c2VyIiwiZmluZE9uZSIsImNvbmZpZyIsImlzU2VydmVyIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsImFjY291bnRzQ29uZmlnQ2FsbGVkIiwiX2RlYnVnIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiaXNDbGllbnQiLCJPQXV0aEVuY3J5cHRpb24iLCJsb2FkS2V5Iiwib2F1dGhTZWNyZXRLZXkiLCJWQUxJRF9LRVlTIiwiZm9yRWFjaCIsImtleSIsImluY2x1ZGVzIiwib25Mb2dpbiIsImZ1bmMiLCJyZXQiLCJyZWdpc3RlciIsIl9zdGFydHVwQ2FsbGJhY2siLCJjYWxsYmFjayIsIm9uTG9naW5GYWlsdXJlIiwib25Mb2dvdXQiLCJkZHBVcmwiLCJERFAiLCJjb25uZWN0IiwiQUNDT1VOVFNfQ09OTkVDVElPTl9VUkwiLCJfZ2V0VG9rZW5MaWZldGltZU1zIiwibG9naW5FeHBpcmF0aW9uSW5EYXlzIiwiX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMiLCJwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzIiwiREVGQVVMVF9QQVNTV09SRF9SRVNFVF9UT0tFTl9FWFBJUkFUSU9OX0RBWVMiLCJfZ2V0UGFzc3dvcmRFbnJvbGxUb2tlbkxpZmV0aW1lTXMiLCJwYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5cyIsIkRFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUyIsIl90b2tlbkV4cGlyYXRpb24iLCJ3aGVuIiwiRGF0ZSIsImdldFRpbWUiLCJfdG9rZW5FeHBpcmVzU29vbiIsIm1pbkxpZmV0aW1lTXMiLCJtaW5MaWZldGltZUNhcE1zIiwiTUlOX1RPS0VOX0xJRkVUSU1FX0NBUF9TRUNTIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiY3J5cHRvIiwiaGFzT3duIiwiX3NlcnZlciIsIl9pbml0U2VydmVyTWV0aG9kcyIsIl9pbml0QWNjb3VudERhdGFIb29rcyIsIl9hdXRvcHVibGlzaEZpZWxkcyIsImxvZ2dlZEluVXNlciIsIm90aGVyVXNlcnMiLCJfaW5pdFNlcnZlclB1YmxpY2F0aW9ucyIsIl9hY2NvdW50RGF0YSIsIl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9ucyIsIl9uZXh0VXNlck9ic2VydmVOdW1iZXIiLCJfbG9naW5IYW5kbGVycyIsInNldHVwVXNlcnNDb2xsZWN0aW9uIiwic2V0dXBEZWZhdWx0TG9naW5IYW5kbGVycyIsInNldEV4cGlyZVRva2Vuc0ludGVydmFsIiwiX3ZhbGlkYXRlTG9naW5Ib29rIiwiX3ZhbGlkYXRlTmV3VXNlckhvb2tzIiwiZGVmYXVsdFZhbGlkYXRlTmV3VXNlckhvb2siLCJiaW5kIiwiX2RlbGV0ZVNhdmVkVG9rZW5zRm9yQWxsVXNlcnNPblN0YXJ0dXAiLCJfc2tpcENhc2VJbnNlbnNpdGl2ZUNoZWNrc0ZvclRlc3QiLCJ1cmxzIiwicmVzZXRQYXNzd29yZCIsInRva2VuIiwiYWJzb2x1dGVVcmwiLCJ2ZXJpZnlFbWFpbCIsImVucm9sbEFjY291bnQiLCJhZGREZWZhdWx0UmF0ZUxpbWl0IiwiY3VycmVudEludm9jYXRpb24iLCJfQ3VycmVudE1ldGhvZEludm9jYXRpb24iLCJnZXQiLCJfQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsInZhbGlkYXRlTG9naW5BdHRlbXB0IiwidmFsaWRhdGVOZXdVc2VyIiwicHVzaCIsIm9uQ3JlYXRlVXNlciIsIl9vbkNyZWF0ZVVzZXJIb29rIiwib25FeHRlcm5hbExvZ2luIiwiX29uRXh0ZXJuYWxMb2dpbkhvb2siLCJfdmFsaWRhdGVMb2dpbiIsImF0dGVtcHQiLCJlYWNoIiwiY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24iLCJlIiwiYWxsb3dlZCIsImVycm9yIiwiX3N1Y2Nlc3NmdWxMb2dpbiIsIl9mYWlsZWRMb2dpbiIsIl9zdWNjZXNzZnVsTG9nb3V0IiwiX2xvZ2luVXNlciIsIm1ldGhvZEludm9jYXRpb24iLCJzdGFtcGVkTG9naW5Ub2tlbiIsIl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuIiwiX2luc2VydExvZ2luVG9rZW4iLCJfbm9ZaWVsZHNBbGxvd2VkIiwiX3NldExvZ2luVG9rZW4iLCJfaGFzaExvZ2luVG9rZW4iLCJzZXRVc2VySWQiLCJpZCIsInRva2VuRXhwaXJlcyIsIl9hdHRlbXB0TG9naW4iLCJtZXRob2ROYW1lIiwibWV0aG9kQXJncyIsInJlc3VsdCIsInR5cGUiLCJtZXRob2RBcmd1bWVudHMiLCJBcnJheSIsImZyb20iLCJfbG9naW5NZXRob2QiLCJmbiIsInRyeUxvZ2luTWV0aG9kIiwiX3JlcG9ydExvZ2luRmFpbHVyZSIsInJlZ2lzdGVyTG9naW5IYW5kbGVyIiwiaGFuZGxlciIsIl9ydW5Mb2dpbkhhbmRsZXJzIiwiZGVzdHJveVRva2VuIiwibG9naW5Ub2tlbiIsInVwZGF0ZSIsIiRwdWxsIiwiJG9yIiwiaGFzaGVkVG9rZW4iLCJhY2NvdW50cyIsIm1ldGhvZHMiLCJsb2dpbiIsImNoZWNrIiwiYXJndW1lbnRzIiwibG9nb3V0IiwiX2dldExvZ2luVG9rZW4iLCJsb2dvdXRPdGhlckNsaWVudHMiLCJ0b2tlbnMiLCJzZXJ2aWNlcyIsInJlc3VtZSIsImxvZ2luVG9rZW5zIiwibmV3VG9rZW4iLCIkc2V0IiwiJHB1c2giLCJfaGFzaFN0YW1wZWRUb2tlbiIsInNldFRpbWVvdXQiLCJfZGVsZXRlU2F2ZWRUb2tlbnNGb3JVc2VyIiwiX25vQ29ubmVjdGlvbkNsb3NlRGVsYXlGb3JUZXN0IiwiZ2V0TmV3VG9rZW4iLCJjdXJyZW50SGFzaGVkVG9rZW4iLCJjdXJyZW50U3RhbXBlZFRva2VuIiwiZmluZCIsInN0YW1wZWRUb2tlbiIsIm5ld1N0YW1wZWRUb2tlbiIsInJlbW92ZU90aGVyVG9rZW5zIiwiY3VycmVudFRva2VuIiwiJG5lIiwiY29uZmlndXJlTG9naW5TZXJ2aWNlIiwiTWF0Y2giLCJPYmplY3RJbmNsdWRpbmciLCJzZXJ2aWNlIiwiU3RyaW5nIiwib2F1dGgiLCJzZXJ2aWNlTmFtZXMiLCJ1c2luZ09BdXRoRW5jcnlwdGlvbiIsInNlY3JldCIsInNlYWwiLCJpbnNlcnQiLCJvbkNvbm5lY3Rpb24iLCJvbkNsb3NlIiwiX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24iLCJwdWJsaXNoIiwiaXNfYXV0byIsIl9pZCIsInByb2ZpbGUiLCJ1c2VybmFtZSIsImVtYWlscyIsImF1dG9wdWJsaXNoIiwidG9GaWVsZFNlbGVjdG9yIiwicmVkdWNlIiwicHJldiIsImZpZWxkIiwic2VsZWN0b3IiLCJhZGRBdXRvcHVibGlzaEZpZWxkcyIsIm9wdHMiLCJhcHBseSIsImZvckxvZ2dlZEluVXNlciIsImZvck90aGVyVXNlcnMiLCJfZ2V0QWNjb3VudERhdGEiLCJjb25uZWN0aW9uSWQiLCJkYXRhIiwiX3NldEFjY291bnREYXRhIiwidmFsdWUiLCJoYXNoIiwiY3JlYXRlSGFzaCIsImRpZ2VzdCIsImhhc2hlZFN0YW1wZWRUb2tlbiIsIl9pbnNlcnRIYXNoZWRMb2dpblRva2VuIiwicXVlcnkiLCIkYWRkVG9TZXQiLCJfY2xlYXJBbGxMb2dpblRva2VucyIsIl9nZXRVc2VyT2JzZXJ2ZSIsIm9ic2VydmUiLCJzdG9wIiwibXlPYnNlcnZlTnVtYmVyIiwiZGVmZXIiLCJmb3VuZE1hdGNoaW5nVXNlciIsIm9ic2VydmVDaGFuZ2VzIiwiYWRkZWQiLCJyZW1vdmVkIiwiY2xvc2UiLCJub25NdXRhdGluZ0NhbGxiYWNrcyIsIlJhbmRvbSIsIl9leHBpcmVQYXNzd29yZFJlc2V0VG9rZW5zIiwib2xkZXN0VmFsaWREYXRlIiwidG9rZW5MaWZldGltZU1zIiwidG9rZW5GaWx0ZXIiLCIkZXhpc3RzIiwiZXhwaXJlUGFzc3dvcmRUb2tlbiIsIl9leHBpcmVQYXNzd29yZEVucm9sbFRva2VucyIsIl9leHBpcmVUb2tlbnMiLCJ1c2VyRmlsdGVyIiwiJGx0IiwibXVsdGkiLCJzdXBlclJlc3VsdCIsImV4cGlyZVRva2VuSW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwiaW5zZXJ0VXNlckRvYyIsImNyZWF0ZWRBdCIsInBpbkVuY3J5cHRlZEZpZWxkc1RvVXNlciIsImZ1bGxVc2VyIiwiZGVmYXVsdENyZWF0ZVVzZXJIb29rIiwiaG9vayIsImVycm1zZyIsIl90ZXN0RW1haWxEb21haW4iLCJlbWFpbCIsImRvbWFpbiIsInJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIiwiUmVnRXhwIiwiX2VzY2FwZVJlZ0V4cCIsInRlc3QiLCJ0b2tlbnNUb0RlbGV0ZSIsIiR1bnNldCIsIiRwdWxsQWxsIiwibG9naW5Ub2tlbnNUb0RlbGV0ZSIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJzZXJ2aWNlTmFtZSIsInNlcnZpY2VEYXRhIiwic2VydmljZUlkS2V5IiwiaXNOYU4iLCJwYXJzZUludCIsInNldEF0dHJzIiwicmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCIsInJlc3AiLCJERFBSYXRlTGltaXRlciIsInJlbW92ZVJ1bGUiLCJkZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQiLCJhZGRSdWxlIiwiY2xpZW50QWRkcmVzcyIsImNsb25lZEF0dGVtcHQiLCJFSlNPTiIsImNsb25lIiwiZGVmYXVsdFJlc3VtZUxvZ2luSGFuZGxlciIsIm9sZFVuaGFzaGVkU3R5bGVUb2tlbiIsInJlc2V0UmFuZ2VPciIsImV4cGlyZUZpbHRlciIsIiRhbmQiLCJzZXRJbnRlcnZhbCIsImtleUlzTG9hZGVkIiwiaXNTZWFsZWQiLCJvcGVuIiwiZW1haWxJc0dvb2QiLCJhZGRyZXNzIiwidmFsdWVzIiwiYWxsb3ciLCJtb2RpZmllciIsImZldGNoIiwiX2Vuc3VyZUluZGV4IiwidW5pcXVlIiwic3BhcnNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxTQUFPLENBQUNDLE1BQVIsQ0FBZTtBQUFDQyxrQkFBYyxFQUFDLE1BQUlBO0FBQXBCLEdBQWY7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QUUsSUFBVjtBQUFnQkMsVUFBTSxFQUFFO0FBQXhCLEdBREYsRUE5Qm9DLENBZ0NwQztBQUNBOzs7QUFDQXJVLE9BQUssQ0FBQ21VLFlBQU4sQ0FBbUIseUNBQW5CLEVBQ0U7QUFBRUUsVUFBTSxFQUFFO0FBQVYsR0FERixFQWxDb0MsQ0FvQ3BDOzs7QUFDQXJVLE9BQUssQ0FBQ21VLFlBQU4sQ0FBbUIsa0NBQW5CLEVBQXVEO0FBQUVFLFVBQU0sRUFBRTtBQUFWLEdBQXZELEVBckNvQyxDQXNDcEM7OztBQUNBclUsT0FBSyxDQUFDbVUsWUFBTixDQUFtQiw4QkFBbkIsRUFBbUQ7QUFBRUUsVUFBTSxFQUFFO0FBQVYsR0FBbkQ7QUFDRCxDQXhDRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9hY2NvdW50cy1iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWNjb3VudHNTZXJ2ZXIgfSBmcm9tIFwiLi9hY2NvdW50c19zZXJ2ZXIuanNcIjtcblxuLyoqXG4gKiBAbmFtZXNwYWNlIEFjY291bnRzXG4gKiBAc3VtbWFyeSBUaGUgbmFtZXNwYWNlIGZvciBhbGwgc2VydmVyLXNpZGUgYWNjb3VudHMtcmVsYXRlZCBtZXRob2RzLlxuICovXG5BY2NvdW50cyA9IG5ldyBBY2NvdW50c1NlcnZlcihNZXRlb3Iuc2VydmVyKTtcblxuLy8gVXNlcnMgdGFibGUuIERvbid0IHVzZSB0aGUgbm9ybWFsIGF1dG9wdWJsaXNoLCBzaW5jZSB3ZSB3YW50IHRvIGhpZGVcbi8vIHNvbWUgZmllbGRzLiBDb2RlIHRvIGF1dG9wdWJsaXNoIHRoaXMgaXMgaW4gYWNjb3VudHNfc2VydmVyLmpzLlxuLy8gWFhYIEFsbG93IHVzZXJzIHRvIGNvbmZpZ3VyZSB0aGlzIGNvbGxlY3Rpb24gbmFtZS5cblxuLyoqXG4gKiBAc3VtbWFyeSBBIFtNb25nby5Db2xsZWN0aW9uXSgjY29sbGVjdGlvbnMpIGNvbnRhaW5pbmcgdXNlciBkb2N1bWVudHMuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEB0eXBlIHtNb25nby5Db2xsZWN0aW9ufVxuICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuKi9cbk1ldGVvci51c2VycyA9IEFjY291bnRzLnVzZXJzO1xuXG5leHBvcnQge1xuICAvLyBTaW5jZSB0aGlzIGZpbGUgaXMgdGhlIG1haW4gbW9kdWxlIGZvciB0aGUgc2VydmVyIHZlcnNpb24gb2YgdGhlXG4gIC8vIGFjY291bnRzLWJhc2UgcGFja2FnZSwgcHJvcGVydGllcyBvZiBub24tZW50cnktcG9pbnQgbW9kdWxlcyBuZWVkIHRvXG4gIC8vIGJlIHJlLWV4cG9ydGVkIGluIG9yZGVyIHRvIGJlIGFjY2Vzc2libGUgdG8gbW9kdWxlcyB0aGF0IGltcG9ydCB0aGVcbiAgLy8gYWNjb3VudHMtYmFzZSBwYWNrYWdlLlxuICBBY2NvdW50c1NlcnZlclxufTtcbiIsIi8qKlxuICogQHN1bW1hcnkgU3VwZXItY29uc3RydWN0b3IgZm9yIEFjY291bnRzQ2xpZW50IGFuZCBBY2NvdW50c1NlcnZlci5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIEFjY291bnRzQ29tbW9uXG4gKiBAaW5zdGFuY2VuYW1lIGFjY291bnRzQ2xpZW50T3JTZXJ2ZXJcbiAqIEBwYXJhbSBvcHRpb25zIHtPYmplY3R9IGFuIG9iamVjdCB3aXRoIGZpZWxkczpcbiAqIC0gY29ubmVjdGlvbiB7T2JqZWN0fSBPcHRpb25hbCBERFAgY29ubmVjdGlvbiB0byByZXVzZS5cbiAqIC0gZGRwVXJsIHtTdHJpbmd9IE9wdGlvbmFsIFVSTCBmb3IgY3JlYXRpbmcgYSBuZXcgRERQIGNvbm5lY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBBY2NvdW50c0NvbW1vbiB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAvLyBDdXJyZW50bHkgdGhpcyBpcyByZWFkIGRpcmVjdGx5IGJ5IHBhY2thZ2VzIGxpa2UgYWNjb3VudHMtcGFzc3dvcmRcbiAgICAvLyBhbmQgYWNjb3VudHMtdWktdW5zdHlsZWQuXG4gICAgdGhpcy5fb3B0aW9ucyA9IHt9O1xuXG4gICAgLy8gTm90ZSB0aGF0IHNldHRpbmcgdGhpcy5jb25uZWN0aW9uID0gbnVsbCBjYXVzZXMgdGhpcy51c2VycyB0byBiZSBhXG4gICAgLy8gTG9jYWxDb2xsZWN0aW9uLCB3aGljaCBpcyBub3Qgd2hhdCB3ZSB3YW50LlxuICAgIHRoaXMuY29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9pbml0Q29ubmVjdGlvbihvcHRpb25zIHx8IHt9KTtcblxuICAgIC8vIFRoZXJlIGlzIGFuIGFsbG93IGNhbGwgaW4gYWNjb3VudHNfc2VydmVyLmpzIHRoYXQgcmVzdHJpY3RzIHdyaXRlcyB0b1xuICAgIC8vIHRoaXMgY29sbGVjdGlvbi5cbiAgICB0aGlzLnVzZXJzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJ1c2Vyc1wiLCB7XG4gICAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlLFxuICAgICAgY29ubmVjdGlvbjogdGhpcy5jb25uZWN0aW9uXG4gICAgfSk7XG5cbiAgICAvLyBDYWxsYmFjayBleGNlcHRpb25zIGFyZSBwcmludGVkIHdpdGggTWV0ZW9yLl9kZWJ1ZyBhbmQgaWdub3JlZC5cbiAgICB0aGlzLl9vbkxvZ2luSG9vayA9IG5ldyBIb29rKHtcbiAgICAgIGJpbmRFbnZpcm9ubWVudDogZmFsc2UsXG4gICAgICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogXCJvbkxvZ2luIGNhbGxiYWNrXCJcbiAgICB9KTtcblxuICAgIHRoaXMuX29uTG9naW5GYWlsdXJlSG9vayA9IG5ldyBIb29rKHtcbiAgICAgIGJpbmRFbnZpcm9ubWVudDogZmFsc2UsXG4gICAgICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogXCJvbkxvZ2luRmFpbHVyZSBjYWxsYmFja1wiXG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbkxvZ291dEhvb2sgPSBuZXcgSG9vayh7XG4gICAgICBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlLFxuICAgICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25Mb2dvdXQgY2FsbGJhY2tcIlxuICAgIH0pO1xuXG4gICAgLy8gRXhwb3NlIGZvciB0ZXN0aW5nLlxuICAgIHRoaXMuREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMgPSBERUZBVUxUX0xPR0lOX0VYUElSQVRJT05fREFZUztcbiAgICB0aGlzLkxPR0lOX1VORVhQSVJJTkdfVE9LRU5fREFZUyA9IExPR0lOX1VORVhQSVJJTkdfVE9LRU5fREFZUztcblxuICAgIC8vIFRocm93biB3aGVuIHRoZSB1c2VyIGNhbmNlbHMgdGhlIGxvZ2luIHByb2Nlc3MgKGVnLCBjbG9zZXMgYW4gb2F1dGhcbiAgICAvLyBwb3B1cCwgZGVjbGluZXMgcmV0aW5hIHNjYW4sIGV0YylcbiAgICBjb25zdCBsY2VOYW1lID0gJ0FjY291bnRzLkxvZ2luQ2FuY2VsbGVkRXJyb3InO1xuICAgIHRoaXMuTG9naW5DYW5jZWxsZWRFcnJvciA9IE1ldGVvci5tYWtlRXJyb3JUeXBlKFxuICAgICAgbGNlTmFtZSxcbiAgICAgIGZ1bmN0aW9uIChkZXNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBkZXNjcmlwdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuTG9naW5DYW5jZWxsZWRFcnJvci5wcm90b3R5cGUubmFtZSA9IGxjZU5hbWU7XG5cbiAgICAvLyBUaGlzIGlzIHVzZWQgdG8gdHJhbnNtaXQgc3BlY2lmaWMgc3ViY2xhc3MgZXJyb3JzIG92ZXIgdGhlIHdpcmUuIFdlXG4gICAgLy8gc2hvdWxkIGNvbWUgdXAgd2l0aCBhIG1vcmUgZ2VuZXJpYyB3YXkgdG8gZG8gdGhpcyAoZWcsIHdpdGggc29tZSBzb3J0IG9mXG4gICAgLy8gc3ltYm9saWMgZXJyb3IgY29kZSByYXRoZXIgdGhhbiBhIG51bWJlcikuXG4gICAgdGhpcy5Mb2dpbkNhbmNlbGxlZEVycm9yLm51bWVyaWNFcnJvciA9IDB4OGFjZGMyZjtcblxuICAgIC8vIGxvZ2luU2VydmljZUNvbmZpZ3VyYXRpb24gYW5kIENvbmZpZ0Vycm9yIGFyZSBtYWludGFpbmVkIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICAgIGNvbnN0IHsgU2VydmljZUNvbmZpZ3VyYXRpb24gfSA9IFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddO1xuICAgICAgdGhpcy5sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnM7XG4gICAgICB0aGlzLkNvbmZpZ0Vycm9yID0gU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3I7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IHVzZXIgaWQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi4gQSByZWFjdGl2ZSBkYXRhIHNvdXJjZS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqL1xuICB1c2VySWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidXNlcklkIG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICAvLyBtZXJnZSB0aGUgZGVmYXVsdEZpZWxkU2VsZWN0b3Igd2l0aCBhbiBleGlzdGluZyBvcHRpb25zIG9iamVjdFxuICBfYWRkRGVmYXVsdEZpZWxkU2VsZWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgLy8gdGhpcyB3aWxsIGJlIHRoZSBtb3N0IGNvbW1vbiBjYXNlIGZvciBtb3N0IHBlb3BsZSwgc28gbWFrZSBpdCBxdWlja1xuICAgIGlmICghdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3RvcikgcmV0dXJuIG9wdGlvbnM7XG5cbiAgICAvLyBpZiBubyBmaWVsZCBzZWxlY3RvciB0aGVuIGp1c3QgdXNlIGRlZmF1bHRGaWVsZFNlbGVjdG9yXG4gICAgaWYgKCFvcHRpb25zLmZpZWxkcykgcmV0dXJuIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3IsXG4gICAgfTtcblxuICAgIC8vIGlmIGVtcHR5IGZpZWxkIHNlbGVjdG9yIHRoZW4gdGhlIGZ1bGwgdXNlciBvYmplY3QgaXMgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIG9iZXlcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucy5maWVsZHMpO1xuICAgIGlmICgha2V5cy5sZW5ndGgpIHJldHVybiBvcHRpb25zO1xuXG4gICAgLy8gaWYgdGhlIHJlcXVlc3RlZCBmaWVsZHMgYXJlICt2ZSB0aGVuIGlnbm9yZSBkZWZhdWx0RmllbGRTZWxlY3RvclxuICAgIC8vIGFzc3VtZSB0aGV5IGFyZSBhbGwgZWl0aGVyICt2ZSBvciAtdmUgYmVjYXVzZSBNb25nbyBkb2Vzbid0IGxpa2UgbWl4ZWRcbiAgICBpZiAoISFvcHRpb25zLmZpZWxkc1trZXlzWzBdXSkgcmV0dXJuIG9wdGlvbnM7XG5cbiAgICAvLyBUaGUgcmVxdWVzdGVkIGZpZWxkcyBhcmUgLXZlLlxuICAgIC8vIElmIHRoZSBkZWZhdWx0RmllbGRTZWxlY3RvciBpcyArdmUgdGhlbiB1c2UgcmVxdWVzdGVkIGZpZWxkcywgb3RoZXJ3aXNlIG1lcmdlIHRoZW1cbiAgICBjb25zdCBrZXlzMiA9IE9iamVjdC5rZXlzKHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3IpO1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yW2tleXMyWzBdXSA/IG9wdGlvbnMgOiB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgZmllbGRzOiB7XG4gICAgICAgIC4uLm9wdGlvbnMuZmllbGRzLFxuICAgICAgICAuLi50aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yLFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgdXNlciByZWNvcmQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi4gQSByZWFjdGl2ZSBkYXRhIHNvdXJjZS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAgICovXG4gIHVzZXIob3B0aW9ucykge1xuICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMudXNlcklkKCk7XG4gICAgcmV0dXJuIHVzZXJJZCA/IHRoaXMudXNlcnMuZmluZE9uZSh1c2VySWQsIHRoaXMuX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKG9wdGlvbnMpKSA6IG51bGw7XG4gIH1cblxuICAvLyBTZXQgdXAgY29uZmlnIGZvciB0aGUgYWNjb3VudHMgc3lzdGVtLiBDYWxsIHRoaXMgb24gYm90aCB0aGUgY2xpZW50XG4gIC8vIGFuZCB0aGUgc2VydmVyLlxuICAvL1xuICAvLyBOb3RlIHRoYXQgdGhpcyBtZXRob2QgZ2V0cyBvdmVycmlkZGVuIG9uIEFjY291bnRzU2VydmVyLnByb3RvdHlwZSwgYnV0XG4gIC8vIHRoZSBvdmVycmlkaW5nIG1ldGhvZCBjYWxscyB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuXG4gIC8vXG4gIC8vIFhYWCB3ZSBzaG91bGQgYWRkIHNvbWUgZW5mb3JjZW1lbnQgdGhhdCB0aGlzIGlzIGNhbGxlZCBvbiBib3RoIHRoZVxuICAvLyBjbGllbnQgYW5kIHRoZSBzZXJ2ZXIuIE90aGVyd2lzZSwgYSB1c2VyIGNhblxuICAvLyAnZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uJyBvbmx5IG9uIHRoZSBjbGllbnQgYW5kIHdoaWxlIGl0IGxvb2tzXG4gIC8vIGxpa2UgdGhlaXIgYXBwIGlzIHNlY3VyZSwgdGhlIHNlcnZlciB3aWxsIHN0aWxsIGFjY2VwdCBjcmVhdGVVc2VyXG4gIC8vIGNhbGxzLiBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvODI4XG4gIC8vXG4gIC8vIEBwYXJhbSBvcHRpb25zIHtPYmplY3R9IGFuIG9iamVjdCB3aXRoIGZpZWxkczpcbiAgLy8gLSBzZW5kVmVyaWZpY2F0aW9uRW1haWwge0Jvb2xlYW59XG4gIC8vICAgICBTZW5kIGVtYWlsIGFkZHJlc3MgdmVyaWZpY2F0aW9uIGVtYWlscyB0byBuZXcgdXNlcnMgY3JlYXRlZCBmcm9tXG4gIC8vICAgICBjbGllbnQgc2lnbnVwcy5cbiAgLy8gLSBmb3JiaWRDbGllbnRBY2NvdW50Q3JlYXRpb24ge0Jvb2xlYW59XG4gIC8vICAgICBEbyBub3QgYWxsb3cgY2xpZW50cyB0byBjcmVhdGUgYWNjb3VudHMgZGlyZWN0bHkuXG4gIC8vIC0gcmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW4ge0Z1bmN0aW9uIG9yIFN0cmluZ31cbiAgLy8gICAgIFJlcXVpcmUgY3JlYXRlZCB1c2VycyB0byBoYXZlIGFuIGVtYWlsIG1hdGNoaW5nIHRoZSBmdW5jdGlvbiBvclxuICAvLyAgICAgaGF2aW5nIHRoZSBzdHJpbmcgYXMgZG9tYWluLlxuICAvLyAtIGxvZ2luRXhwaXJhdGlvbkluRGF5cyB7TnVtYmVyfVxuICAvLyAgICAgTnVtYmVyIG9mIGRheXMgc2luY2UgbG9naW4gdW50aWwgYSB1c2VyIGlzIGxvZ2dlZCBvdXQgKGxvZ2luIHRva2VuXG4gIC8vICAgICBleHBpcmVzKS5cbiAgLy8gLSBwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzIHtOdW1iZXJ9XG4gIC8vICAgICBOdW1iZXIgb2YgZGF5cyBzaW5jZSBwYXNzd29yZCByZXNldCB0b2tlbiBjcmVhdGlvbiB1bnRpbCB0aGVcbiAgLy8gICAgIHRva2VuIGNhbm50IGJlIHVzZWQgYW55IGxvbmdlciAocGFzc3dvcmQgcmVzZXQgdG9rZW4gZXhwaXJlcykuXG4gIC8vIC0gYW1iaWd1b3VzRXJyb3JNZXNzYWdlcyB7Qm9vbGVhbn1cbiAgLy8gICAgIFJldHVybiBhbWJpZ3VvdXMgZXJyb3IgbWVzc2FnZXMgZnJvbSBsb2dpbiBmYWlsdXJlcyB0byBwcmV2ZW50XG4gIC8vICAgICB1c2VyIGVudW1lcmF0aW9uLlxuICAvLyAtIGJjcnlwdFJvdW5kcyB7TnVtYmVyfVxuICAvLyAgICAgQWxsb3dzIG92ZXJyaWRlIG9mIG51bWJlciBvZiBiY3J5cHQgcm91bmRzIChha2Egd29yayBmYWN0b3IpIHVzZWRcbiAgLy8gICAgIHRvIHN0b3JlIHBhc3N3b3Jkcy5cblxuICAvKipcbiAgICogQHN1bW1hcnkgU2V0IGdsb2JhbCBhY2NvdW50cyBvcHRpb25zLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnNlbmRWZXJpZmljYXRpb25FbWFpbCBOZXcgdXNlcnMgd2l0aCBhbiBlbWFpbCBhZGRyZXNzIHdpbGwgcmVjZWl2ZSBhbiBhZGRyZXNzIHZlcmlmaWNhdGlvbiBlbWFpbC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbiBDYWxscyB0byBbYGNyZWF0ZVVzZXJgXSgjYWNjb3VudHNfY3JlYXRldXNlcikgZnJvbSB0aGUgY2xpZW50IHdpbGwgYmUgcmVqZWN0ZWQuIEluIGFkZGl0aW9uLCBpZiB5b3UgYXJlIHVzaW5nIFthY2NvdW50cy11aV0oI2FjY291bnRzdWkpLCB0aGUgXCJDcmVhdGUgYWNjb3VudFwiIGxpbmsgd2lsbCBub3QgYmUgYXZhaWxhYmxlLlxuICAgKiBAcGFyYW0ge1N0cmluZyB8IEZ1bmN0aW9ufSBvcHRpb25zLnJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIElmIHNldCB0byBhIHN0cmluZywgb25seSBhbGxvd3MgbmV3IHVzZXJzIGlmIHRoZSBkb21haW4gcGFydCBvZiB0aGVpciBlbWFpbCBhZGRyZXNzIG1hdGNoZXMgdGhlIHN0cmluZy4gSWYgc2V0IHRvIGEgZnVuY3Rpb24sIG9ubHkgYWxsb3dzIG5ldyB1c2VycyBpZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlLiAgVGhlIGZ1bmN0aW9uIGlzIHBhc3NlZCB0aGUgZnVsbCBlbWFpbCBhZGRyZXNzIG9mIHRoZSBwcm9wb3NlZCBuZXcgdXNlci4gIFdvcmtzIHdpdGggcGFzc3dvcmQtYmFzZWQgc2lnbi1pbiBhbmQgZXh0ZXJuYWwgc2VydmljZXMgdGhhdCBleHBvc2UgZW1haWwgYWRkcmVzc2VzIChHb29nbGUsIEZhY2Vib29rLCBHaXRIdWIpLiBBbGwgZXhpc3RpbmcgdXNlcnMgc3RpbGwgY2FuIGxvZyBpbiBhZnRlciBlbmFibGluZyB0aGlzIG9wdGlvbi4gRXhhbXBsZTogYEFjY291bnRzLmNvbmZpZyh7IHJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluOiAnc2Nob29sLmVkdScgfSlgLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXMgVGhlIG51bWJlciBvZiBkYXlzIGZyb20gd2hlbiBhIHVzZXIgbG9ncyBpbiB1bnRpbCB0aGVpciB0b2tlbiBleHBpcmVzIGFuZCB0aGV5IGFyZSBsb2dnZWQgb3V0LiBEZWZhdWx0cyB0byA5MC4gU2V0IHRvIGBudWxsYCB0byBkaXNhYmxlIGxvZ2luIGV4cGlyYXRpb24uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLm9hdXRoU2VjcmV0S2V5IFdoZW4gdXNpbmcgdGhlIGBvYXV0aC1lbmNyeXB0aW9uYCBwYWNrYWdlLCB0aGUgMTYgYnl0ZSBrZXkgdXNpbmcgdG8gZW5jcnlwdCBzZW5zaXRpdmUgYWNjb3VudCBjcmVkZW50aWFscyBpbiB0aGUgZGF0YWJhc2UsIGVuY29kZWQgaW4gYmFzZTY0LiAgVGhpcyBvcHRpb24gbWF5IG9ubHkgYmUgc3BlY2lmZWQgb24gdGhlIHNlcnZlci4gIFNlZSBwYWNrYWdlcy9vYXV0aC1lbmNyeXB0aW9uL1JFQURNRS5tZCBmb3IgZGV0YWlscy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMucGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cyBUaGUgbnVtYmVyIG9mIGRheXMgZnJvbSB3aGVuIGEgbGluayB0byByZXNldCBwYXNzd29yZCBpcyBzZW50IHVudGlsIHRva2VuIGV4cGlyZXMgYW5kIHVzZXIgY2FuJ3QgcmVzZXQgcGFzc3dvcmQgd2l0aCB0aGUgbGluayBhbnltb3JlLiBEZWZhdWx0cyB0byAzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5cyBUaGUgbnVtYmVyIG9mIGRheXMgZnJvbSB3aGVuIGEgbGluayB0byBzZXQgaW5pdGFsIHBhc3N3b3JkIGlzIHNlbnQgdW50aWwgdG9rZW4gZXhwaXJlcyBhbmQgdXNlciBjYW4ndCBzZXQgcGFzc3dvcmQgd2l0aCB0aGUgbGluayBhbnltb3JlLiBEZWZhdWx0cyB0byAzMC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmFtYmlndW91c0Vycm9yTWVzc2FnZXMgUmV0dXJuIGFtYmlndW91cyBlcnJvciBtZXNzYWdlcyBmcm9tIGxvZ2luIGZhaWx1cmVzIHRvIHByZXZlbnQgdXNlciBlbnVtZXJhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3RvciBUbyBleGNsdWRlIGJ5IGRlZmF1bHQgbGFyZ2UgY3VzdG9tIGZpZWxkcyBmcm9tIGBNZXRlb3IudXNlcigpYCBhbmQgYE1ldGVvci5maW5kVXNlckJ5Li4uKClgIGZ1bmN0aW9ucyB3aGVuIGNhbGxlZCB3aXRob3V0IGEgZmllbGQgc2VsZWN0b3IsIGFuZCBhbGwgYG9uTG9naW5gLCBgb25Mb2dpbkZhaWx1cmVgIGFuZCBgb25Mb2dvdXRgIGNhbGxiYWNrcy4gIEV4YW1wbGU6IGBBY2NvdW50cy5jb25maWcoeyBkZWZhdWx0RmllbGRTZWxlY3RvcjogeyBteUJpZ0FycmF5OiAwIH19KWAuXG4gICAqL1xuICBjb25maWcob3B0aW9ucykge1xuICAgIC8vIFdlIGRvbid0IHdhbnQgdXNlcnMgdG8gYWNjaWRlbnRhbGx5IG9ubHkgY2FsbCBBY2NvdW50cy5jb25maWcgb24gdGhlXG4gICAgLy8gY2xpZW50LCB3aGVyZSBzb21lIG9mIHRoZSBvcHRpb25zIHdpbGwgaGF2ZSBwYXJ0aWFsIGVmZmVjdHMgKGVnIHJlbW92aW5nXG4gICAgLy8gdGhlIFwiY3JlYXRlIGFjY291bnRcIiBidXR0b24gZnJvbSBhY2NvdW50cy11aSBpZiBmb3JiaWRDbGllbnRBY2NvdW50Q3JlYXRpb25cbiAgICAvLyBpcyBzZXQsIG9yIHJlZGlyZWN0aW5nIEdvb2dsZSBsb2dpbiB0byBhIHNwZWNpZmljLWRvbWFpbiBwYWdlKSB3aXRob3V0XG4gICAgLy8gaGF2aW5nIHRoZWlyIGZ1bGwgZWZmZWN0cy5cbiAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmFjY291bnRzQ29uZmlnQ2FsbGVkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmFjY291bnRzQ29uZmlnQ2FsbGVkKSB7XG4gICAgICAvLyBYWFggd291bGQgYmUgbmljZSB0byBcImNyYXNoXCIgdGhlIGNsaWVudCBhbmQgcmVwbGFjZSB0aGUgVUkgd2l0aCBhbiBlcnJvclxuICAgICAgLy8gbWVzc2FnZSwgYnV0IHRoZXJlJ3Mgbm8gdHJpdmlhbCB3YXkgdG8gZG8gdGhpcy5cbiAgICAgIE1ldGVvci5fZGVidWcoXCJBY2NvdW50cy5jb25maWcgd2FzIGNhbGxlZCBvbiB0aGUgY2xpZW50IGJ1dCBub3Qgb24gdGhlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJzZXJ2ZXI7IHNvbWUgY29uZmlndXJhdGlvbiBvcHRpb25zIG1heSBub3QgdGFrZSBlZmZlY3QuXCIpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gdmFsaWRhdGUgdGhlIG9hdXRoU2VjcmV0S2V5IG9wdGlvbiBhdCB0aGUgdGltZVxuICAgIC8vIEFjY291bnRzLmNvbmZpZyBpcyBjYWxsZWQuIFdlIGFsc28gZGVsaWJlcmF0ZWx5IGRvbid0IHN0b3JlIHRoZVxuICAgIC8vIG9hdXRoU2VjcmV0S2V5IGluIEFjY291bnRzLl9vcHRpb25zLlxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ29hdXRoU2VjcmV0S2V5JykpIHtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9hdXRoU2VjcmV0S2V5IG9wdGlvbiBtYXkgb25seSBiZSBzcGVjaWZpZWQgb24gdGhlIHNlcnZlclwiKTtcbiAgICAgIH1cbiAgICAgIGlmICghIFBhY2thZ2VbXCJvYXV0aC1lbmNyeXB0aW9uXCJdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvYXV0aC1lbmNyeXB0aW9uIHBhY2thZ2UgbXVzdCBiZSBsb2FkZWQgdG8gc2V0IG9hdXRoU2VjcmV0S2V5XCIpO1xuICAgICAgfVxuICAgICAgUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0uT0F1dGhFbmNyeXB0aW9uLmxvYWRLZXkob3B0aW9ucy5vYXV0aFNlY3JldEtleSk7XG4gICAgICBvcHRpb25zID0geyAuLi5vcHRpb25zIH07XG4gICAgICBkZWxldGUgb3B0aW9ucy5vYXV0aFNlY3JldEtleTtcbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSBvcHRpb24ga2V5c1xuICAgIGNvbnN0IFZBTElEX0tFWVMgPSBbXCJzZW5kVmVyaWZpY2F0aW9uRW1haWxcIiwgXCJmb3JiaWRDbGllbnRBY2NvdW50Q3JlYXRpb25cIiwgXCJwYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5c1wiLFxuICAgICAgICAgICAgICAgICAgICAgIFwicmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW5cIiwgXCJsb2dpbkV4cGlyYXRpb25JbkRheXNcIiwgXCJwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJhbWJpZ3VvdXNFcnJvck1lc3NhZ2VzXCIsIFwiYmNyeXB0Um91bmRzXCIsIFwiZGVmYXVsdEZpZWxkU2VsZWN0b3JcIl07XG5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoIVZBTElEX0tFWVMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFjY291bnRzLmNvbmZpZzogSW52YWxpZCBrZXk6ICR7a2V5fWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gc2V0IHZhbHVlcyBpbiBBY2NvdW50cy5fb3B0aW9uc1xuICAgIFZBTElEX0tFWVMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChrZXkgaW4gdGhpcy5fb3B0aW9ucykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3Qgc2V0IFxcYCR7a2V5fVxcYCBtb3JlIHRoYW4gb25jZWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ2luIGF0dGVtcHQgc3VjY2VlZHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBsb2dpbiBpcyBzdWNjZXNzZnVsLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayByZWNlaXZlcyBhIHNpbmdsZSBvYmplY3QgdGhhdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGRzIGxvZ2luIGRldGFpbHMuIFRoaXMgb2JqZWN0IGNvbnRhaW5zIHRoZSBsb2dpblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCB0eXBlIChwYXNzd29yZCwgcmVzdW1lLCBldGMuKSBvbiBib3RoIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudCBhbmQgc2VydmVyLiBgb25Mb2dpbmAgY2FsbGJhY2tzIHJlZ2lzdGVyZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBvbiB0aGUgc2VydmVyIGFsc28gcmVjZWl2ZSBleHRyYSBkYXRhLCBzdWNoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgYXMgdXNlciBkZXRhaWxzLCBjb25uZWN0aW9uIGluZm9ybWF0aW9uLCBldGMuXG4gICAqL1xuICBvbkxvZ2luKGZ1bmMpIHtcbiAgICBsZXQgcmV0ID0gdGhpcy5fb25Mb2dpbkhvb2sucmVnaXN0ZXIoZnVuYyk7XG4gICAgLy8gY2FsbCB0aGUganVzdCByZWdpc3RlcmVkIGNhbGxiYWNrIGlmIGFscmVhZHkgbG9nZ2VkIGluXG4gICAgdGhpcy5fc3RhcnR1cENhbGxiYWNrKHJldC5jYWxsYmFjayk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ2luIGF0dGVtcHQgZmFpbHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhlIGxvZ2luIGhhcyBmYWlsZWQuXG4gICAqL1xuICBvbkxvZ2luRmFpbHVyZShmdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uTG9naW5GYWlsdXJlSG9vay5yZWdpc3RlcihmdW5jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ291dCBhdHRlbXB0IHN1Y2NlZWRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gbG9nb3V0IGlzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICBvbkxvZ291dChmdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uTG9nb3V0SG9vay5yZWdpc3RlcihmdW5jKTtcbiAgfVxuXG4gIF9pbml0Q29ubmVjdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCEgTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGNvbm5lY3Rpb24gdXNlZCBieSB0aGUgQWNjb3VudHMgc3lzdGVtLiBUaGlzIGlzIHRoZSBjb25uZWN0aW9uXG4gICAgLy8gdGhhdCB3aWxsIGdldCBsb2dnZWQgaW4gYnkgTWV0ZW9yLmxvZ2luKCksIGFuZCB0aGlzIGlzIHRoZVxuICAgIC8vIGNvbm5lY3Rpb24gd2hvc2UgbG9naW4gc3RhdGUgd2lsbCBiZSByZWZsZWN0ZWQgYnkgTWV0ZW9yLnVzZXJJZCgpLlxuICAgIC8vXG4gICAgLy8gSXQgd291bGQgYmUgbXVjaCBwcmVmZXJhYmxlIGZvciB0aGlzIHRvIGJlIGluIGFjY291bnRzX2NsaWVudC5qcyxcbiAgICAvLyBidXQgaXQgaGFzIHRvIGJlIGhlcmUgYmVjYXVzZSBpdCdzIG5lZWRlZCB0byBjcmVhdGUgdGhlXG4gICAgLy8gTWV0ZW9yLnVzZXJzIGNvbGxlY3Rpb24uXG4gICAgaWYgKG9wdGlvbnMuY29ubmVjdGlvbikge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gb3B0aW9ucy5jb25uZWN0aW9uO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kZHBVcmwpIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IEREUC5jb25uZWN0KG9wdGlvbnMuZGRwVXJsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICAgICBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLkFDQ09VTlRTX0NPTk5FQ1RJT05fVVJMKSB7XG4gICAgICAvLyBUZW1wb3JhcnksIGludGVybmFsIGhvb2sgdG8gYWxsb3cgdGhlIHNlcnZlciB0byBwb2ludCB0aGUgY2xpZW50XG4gICAgICAvLyB0byBhIGRpZmZlcmVudCBhdXRoZW50aWNhdGlvbiBzZXJ2ZXIuIFRoaXMgaXMgZm9yIGEgdmVyeVxuICAgICAgLy8gcGFydGljdWxhciB1c2UgY2FzZSB0aGF0IGNvbWVzIHVwIHdoZW4gaW1wbGVtZW50aW5nIGEgb2F1dGhcbiAgICAgIC8vIHNlcnZlci4gVW5zdXBwb3J0ZWQgYW5kIG1heSBnbyBhd2F5IGF0IGFueSBwb2ludCBpbiB0aW1lLlxuICAgICAgLy9cbiAgICAgIC8vIFdlIHdpbGwgZXZlbnR1YWxseSBwcm92aWRlIGEgZ2VuZXJhbCB3YXkgdG8gdXNlIGFjY291bnQtYmFzZVxuICAgICAgLy8gYWdhaW5zdCBhbnkgRERQIGNvbm5lY3Rpb24sIG5vdCBqdXN0IG9uZSBzcGVjaWFsIG9uZS5cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9XG4gICAgICAgIEREUC5jb25uZWN0KF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uQUNDT1VOVFNfQ09OTkVDVElPTl9VUkwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSBNZXRlb3IuY29ubmVjdGlvbjtcbiAgICB9XG4gIH1cblxuICBfZ2V0VG9rZW5MaWZldGltZU1zKCkge1xuICAgIC8vIFdoZW4gbG9naW5FeHBpcmF0aW9uSW5EYXlzIGlzIHNldCB0byBudWxsLCB3ZSdsbCB1c2UgYSByZWFsbHkgaGlnaFxuICAgIC8vIG51bWJlciBvZiBkYXlzIChMT0dJTl9VTkVYUElSQUJMRV9UT0tFTl9EQVlTKSB0byBzaW11bGF0ZSBhblxuICAgIC8vIHVuZXhwaXJpbmcgdG9rZW4uXG4gICAgY29uc3QgbG9naW5FeHBpcmF0aW9uSW5EYXlzID1cbiAgICAgICh0aGlzLl9vcHRpb25zLmxvZ2luRXhwaXJhdGlvbkluRGF5cyA9PT0gbnVsbClcbiAgICAgICAgPyBMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVNcbiAgICAgICAgOiB0aGlzLl9vcHRpb25zLmxvZ2luRXhwaXJhdGlvbkluRGF5cztcbiAgICByZXR1cm4gKGxvZ2luRXhwaXJhdGlvbkluRGF5c1xuICAgICAgICB8fCBERUZBVUxUX0xPR0lOX0VYUElSQVRJT05fREFZUykgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xuICB9XG5cbiAgX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9vcHRpb25zLnBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyYXRpb25JbkRheXMgfHxcbiAgICAgICAgICAgIERFRkFVTFRfUEFTU1dPUkRfUkVTRVRfVE9LRU5fRVhQSVJBVElPTl9EQVlTKSAqIDI0ICogNjAgKiA2MCAqIDEwMDA7XG4gIH1cblxuICBfZ2V0UGFzc3dvcmRFbnJvbGxUb2tlbkxpZmV0aW1lTXMoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9vcHRpb25zLnBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzIHx8XG4gICAgICAgIERFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUykgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xuICB9XG5cbiAgX3Rva2VuRXhwaXJhdGlvbih3aGVuKSB7XG4gICAgLy8gV2UgcGFzcyB3aGVuIHRocm91Z2ggdGhlIERhdGUgY29uc3RydWN0b3IgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5O1xuICAgIC8vIGB3aGVuYCB1c2VkIHRvIGJlIGEgbnVtYmVyLlxuICAgIHJldHVybiBuZXcgRGF0ZSgobmV3IERhdGUod2hlbikpLmdldFRpbWUoKSArIHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpKTtcbiAgfVxuXG4gIF90b2tlbkV4cGlyZXNTb29uKHdoZW4pIHtcbiAgICBsZXQgbWluTGlmZXRpbWVNcyA9IC4xICogdGhpcy5fZ2V0VG9rZW5MaWZldGltZU1zKCk7XG4gICAgY29uc3QgbWluTGlmZXRpbWVDYXBNcyA9IE1JTl9UT0tFTl9MSUZFVElNRV9DQVBfU0VDUyAqIDEwMDA7XG4gICAgaWYgKG1pbkxpZmV0aW1lTXMgPiBtaW5MaWZldGltZUNhcE1zKSB7XG4gICAgICBtaW5MaWZldGltZU1zID0gbWluTGlmZXRpbWVDYXBNcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkgPiAobmV3IERhdGUod2hlbikgLSBtaW5MaWZldGltZU1zKTtcbiAgfVxuXG4gIC8vIE5vLW9wIG9uIHRoZSBzZXJ2ZXIsIG92ZXJyaWRkZW4gb24gdGhlIGNsaWVudC5cbiAgX3N0YXJ0dXBDYWxsYmFjayhjYWxsYmFjaykge31cbn1cblxuLy8gTm90ZSB0aGF0IEFjY291bnRzIGlzIGRlZmluZWQgc2VwYXJhdGVseSBpbiBhY2NvdW50c19jbGllbnQuanMgYW5kXG4vLyBhY2NvdW50c19zZXJ2ZXIuanMuXG5cbi8qKlxuICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IHVzZXIgaWQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi4gQSByZWFjdGl2ZSBkYXRhIHNvdXJjZS5cbiAqIEBsb2N1cyBBbnl3aGVyZSBidXQgcHVibGlzaCBmdW5jdGlvbnNcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAqL1xuTWV0ZW9yLnVzZXJJZCA9ICgpID0+IEFjY291bnRzLnVzZXJJZCgpO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEdldCB0aGUgY3VycmVudCB1c2VyIHJlY29yZCwgb3IgYG51bGxgIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLiBBIHJlYWN0aXZlIGRhdGEgc291cmNlLlxuICogQGxvY3VzIEFueXdoZXJlIGJ1dCBwdWJsaXNoIGZ1bmN0aW9uc1xuICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAqL1xuTWV0ZW9yLnVzZXIgPSAob3B0aW9ucykgPT4gQWNjb3VudHMudXNlcihvcHRpb25zKTtcblxuLy8gaG93IGxvbmcgKGluIGRheXMpIHVudGlsIGEgbG9naW4gdG9rZW4gZXhwaXJlc1xuY29uc3QgREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMgPSA5MDtcbi8vIGhvdyBsb25nIChpbiBkYXlzKSB1bnRpbCByZXNldCBwYXNzd29yZCB0b2tlbiBleHBpcmVzXG5jb25zdCBERUZBVUxUX1BBU1NXT1JEX1JFU0VUX1RPS0VOX0VYUElSQVRJT05fREFZUyA9IDM7XG4vLyBob3cgbG9uZyAoaW4gZGF5cykgdW50aWwgZW5yb2wgcGFzc3dvcmQgdG9rZW4gZXhwaXJlc1xuY29uc3QgREVGQVVMVF9QQVNTV09SRF9FTlJPTExfVE9LRU5fRVhQSVJBVElPTl9EQVlTID0gMzA7XG4vLyBDbGllbnRzIGRvbid0IHRyeSB0byBhdXRvLWxvZ2luIHdpdGggYSB0b2tlbiB0aGF0IGlzIGdvaW5nIHRvIGV4cGlyZSB3aXRoaW5cbi8vIC4xICogREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMsIGNhcHBlZCBhdCBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MuXG4vLyBUcmllcyB0byBhdm9pZCBhYnJ1cHQgZGlzY29ubmVjdHMgZnJvbSBleHBpcmluZyB0b2tlbnMuXG5jb25zdCBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MgPSAzNjAwOyAvLyBvbmUgaG91clxuLy8gaG93IG9mdGVuIChpbiBtaWxsaXNlY29uZHMpIHdlIGNoZWNrIGZvciBleHBpcmVkIHRva2Vuc1xuZXhwb3J0IGNvbnN0IEVYUElSRV9UT0tFTlNfSU5URVJWQUxfTVMgPSA2MDAgKiAxMDAwOyAvLyAxMCBtaW51dGVzXG4vLyBob3cgbG9uZyB3ZSB3YWl0IGJlZm9yZSBsb2dnaW5nIG91dCBjbGllbnRzIHdoZW4gTWV0ZW9yLmxvZ291dE90aGVyQ2xpZW50cyBpc1xuLy8gY2FsbGVkXG5leHBvcnQgY29uc3QgQ09OTkVDVElPTl9DTE9TRV9ERUxBWV9NUyA9IDEwICogMTAwMDtcbi8vIEEgbGFyZ2UgbnVtYmVyIG9mIGV4cGlyYXRpb24gZGF5cyAoYXBwcm94aW1hdGVseSAxMDAgeWVhcnMgd29ydGgpIHRoYXQgaXNcbi8vIHVzZWQgd2hlbiBjcmVhdGluZyB1bmV4cGlyaW5nIHRva2Vucy5cbmNvbnN0IExPR0lOX1VORVhQSVJJTkdfVE9LRU5fREFZUyA9IDM2NSAqIDEwMDtcbiIsImltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7XG4gIEFjY291bnRzQ29tbW9uLFxuICBFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TLFxuICBDT05ORUNUSU9OX0NMT1NFX0RFTEFZX01TXG59IGZyb20gJy4vYWNjb3VudHNfY29tbW9uLmpzJztcblxuY29uc3QgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAc3VtbWFyeSBDb25zdHJ1Y3RvciBmb3IgdGhlIGBBY2NvdW50c2AgbmFtZXNwYWNlIG9uIHRoZSBzZXJ2ZXIuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAY2xhc3MgQWNjb3VudHNTZXJ2ZXJcbiAqIEBleHRlbmRzIEFjY291bnRzQ29tbW9uXG4gKiBAaW5zdGFuY2VuYW1lIGFjY291bnRzU2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gc2VydmVyIEEgc2VydmVyIG9iamVjdCBzdWNoIGFzIGBNZXRlb3Iuc2VydmVyYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjY291bnRzU2VydmVyIGV4dGVuZHMgQWNjb3VudHNDb21tb24ge1xuICAvLyBOb3RlIHRoYXQgdGhpcyBjb25zdHJ1Y3RvciBpcyBsZXNzIGxpa2VseSB0byBiZSBpbnN0YW50aWF0ZWQgbXVsdGlwbGVcbiAgLy8gdGltZXMgdGhhbiB0aGUgYEFjY291bnRzQ2xpZW50YCBjb25zdHJ1Y3RvciwgYmVjYXVzZSBhIHNpbmdsZSBzZXJ2ZXJcbiAgLy8gY2FuIHByb3ZpZGUgb25seSBvbmUgc2V0IG9mIG1ldGhvZHMuXG4gIGNvbnN0cnVjdG9yKHNlcnZlcikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXIgfHwgTWV0ZW9yLnNlcnZlcjtcbiAgICAvLyBTZXQgdXAgdGhlIHNlcnZlcidzIG1ldGhvZHMsIGFzIGlmIGJ5IGNhbGxpbmcgTWV0ZW9yLm1ldGhvZHMuXG4gICAgdGhpcy5faW5pdFNlcnZlck1ldGhvZHMoKTtcblxuICAgIHRoaXMuX2luaXRBY2NvdW50RGF0YUhvb2tzKCk7XG5cbiAgICAvLyBJZiBhdXRvcHVibGlzaCBpcyBvbiwgcHVibGlzaCB0aGVzZSB1c2VyIGZpZWxkcy4gTG9naW4gc2VydmljZVxuICAgIC8vIHBhY2thZ2VzIChlZyBhY2NvdW50cy1nb29nbGUpIGFkZCB0byB0aGVzZSBieSBjYWxsaW5nXG4gICAgLy8gYWRkQXV0b3B1Ymxpc2hGaWVsZHMuICBOb3RhYmx5LCB0aGlzIGlzbid0IGltcGxlbWVudGVkIHdpdGggbXVsdGlwbGVcbiAgICAvLyBwdWJsaXNoZXMgc2luY2UgRERQIG9ubHkgbWVyZ2VzIG9ubHkgYWNyb3NzIHRvcC1sZXZlbCBmaWVsZHMsIG5vdFxuICAgIC8vIHN1YmZpZWxkcyAoc3VjaCBhcyAnc2VydmljZXMuZmFjZWJvb2suYWNjZXNzVG9rZW4nKVxuICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzID0ge1xuICAgICAgbG9nZ2VkSW5Vc2VyOiBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnLCAnZW1haWxzJ10sXG4gICAgICBvdGhlclVzZXJzOiBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnXVxuICAgIH07XG4gICAgdGhpcy5faW5pdFNlcnZlclB1YmxpY2F0aW9ucygpO1xuXG4gICAgLy8gY29ubmVjdGlvbklkIC0+IHtjb25uZWN0aW9uLCBsb2dpblRva2VufVxuICAgIHRoaXMuX2FjY291bnREYXRhID0ge307XG5cbiAgICAvLyBjb25uZWN0aW9uIGlkIC0+IG9ic2VydmUgaGFuZGxlIGZvciB0aGUgbG9naW4gdG9rZW4gdGhhdCB0aGlzIGNvbm5lY3Rpb24gaXNcbiAgICAvLyBjdXJyZW50bHkgYXNzb2NpYXRlZCB3aXRoLCBvciBhIG51bWJlci4gVGhlIG51bWJlciBpbmRpY2F0ZXMgdGhhdCB3ZSBhcmUgaW5cbiAgICAvLyB0aGUgcHJvY2VzcyBvZiBzZXR0aW5nIHVwIHRoZSBvYnNlcnZlICh1c2luZyBhIG51bWJlciBpbnN0ZWFkIG9mIGEgc2luZ2xlXG4gICAgLy8gc2VudGluZWwgYWxsb3dzIG11bHRpcGxlIGF0dGVtcHRzIHRvIHNldCB1cCB0aGUgb2JzZXJ2ZSB0byBpZGVudGlmeSB3aGljaFxuICAgIC8vIG9uZSB3YXMgdGhlaXJzKS5cbiAgICB0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9ucyA9IHt9O1xuICAgIHRoaXMuX25leHRVc2VyT2JzZXJ2ZU51bWJlciA9IDE7ICAvLyBmb3IgdGhlIG51bWJlciBkZXNjcmliZWQgYWJvdmUuXG5cbiAgICAvLyBsaXN0IG9mIGFsbCByZWdpc3RlcmVkIGhhbmRsZXJzLlxuICAgIHRoaXMuX2xvZ2luSGFuZGxlcnMgPSBbXTtcblxuICAgIHNldHVwVXNlcnNDb2xsZWN0aW9uKHRoaXMudXNlcnMpO1xuICAgIHNldHVwRGVmYXVsdExvZ2luSGFuZGxlcnModGhpcyk7XG4gICAgc2V0RXhwaXJlVG9rZW5zSW50ZXJ2YWwodGhpcyk7XG5cbiAgICB0aGlzLl92YWxpZGF0ZUxvZ2luSG9vayA9IG5ldyBIb29rKHsgYmluZEVudmlyb25tZW50OiBmYWxzZSB9KTtcbiAgICB0aGlzLl92YWxpZGF0ZU5ld1VzZXJIb29rcyA9IFtcbiAgICAgIGRlZmF1bHRWYWxpZGF0ZU5ld1VzZXJIb29rLmJpbmQodGhpcylcbiAgICBdO1xuXG4gICAgdGhpcy5fZGVsZXRlU2F2ZWRUb2tlbnNGb3JBbGxVc2Vyc09uU3RhcnR1cCgpO1xuXG4gICAgdGhpcy5fc2tpcENhc2VJbnNlbnNpdGl2ZUNoZWNrc0ZvclRlc3QgPSB7fTtcblxuICAgIC8vIFhYWCBUaGVzZSBzaG91bGQgcHJvYmFibHkgbm90IGFjdHVhbGx5IGJlIHB1YmxpYz9cbiAgICB0aGlzLnVybHMgPSB7XG4gICAgICByZXNldFBhc3N3b3JkOiB0b2tlbiA9PiBNZXRlb3IuYWJzb2x1dGVVcmwoYCMvcmVzZXQtcGFzc3dvcmQvJHt0b2tlbn1gKSxcbiAgICAgIHZlcmlmeUVtYWlsOiB0b2tlbiA9PiBNZXRlb3IuYWJzb2x1dGVVcmwoYCMvdmVyaWZ5LWVtYWlsLyR7dG9rZW59YCksXG4gICAgICBlbnJvbGxBY2NvdW50OiB0b2tlbiA9PiBNZXRlb3IuYWJzb2x1dGVVcmwoYCMvZW5yb2xsLWFjY291bnQvJHt0b2tlbn1gKSxcbiAgICB9XG5cbiAgICB0aGlzLmFkZERlZmF1bHRSYXRlTGltaXQoKVxuICB9XG5cbiAgLy8vXG4gIC8vLyBDVVJSRU5UIFVTRVJcbiAgLy8vXG5cbiAgLy8gQG92ZXJyaWRlIG9mIFwiYWJzdHJhY3RcIiBub24taW1wbGVtZW50YXRpb24gaW4gYWNjb3VudHNfY29tbW9uLmpzXG4gIHVzZXJJZCgpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIG9ubHkgd29ya3MgaWYgY2FsbGVkIGluc2lkZSBhIG1ldGhvZCBvciBhIHB1YmljYXRpb24uXG4gICAgLy8gVXNpbmcgYW55IG9mIHRoZSBpbmZvbWF0aW9uIGZyb20gTWV0ZW9yLnVzZXIoKSBpbiBhIG1ldGhvZCBvclxuICAgIC8vIHB1Ymxpc2ggZnVuY3Rpb24gd2lsbCBhbHdheXMgdXNlIHRoZSB2YWx1ZSBmcm9tIHdoZW4gdGhlIGZ1bmN0aW9uIGZpcnN0XG4gICAgLy8gcnVucy4gVGhpcyBpcyBsaWtlbHkgbm90IHdoYXQgdGhlIHVzZXIgZXhwZWN0cy4gVGhlIHdheSB0byBtYWtlIHRoaXMgd29ya1xuICAgIC8vIGluIGEgbWV0aG9kIG9yIHB1Ymxpc2ggZnVuY3Rpb24gaXMgdG8gZG8gTWV0ZW9yLmZpbmQodGhpcy51c2VySWQpLm9ic2VydmVcbiAgICAvLyBhbmQgcmVjb21wdXRlIHdoZW4gdGhlIHVzZXIgcmVjb3JkIGNoYW5nZXMuXG4gICAgY29uc3QgY3VycmVudEludm9jYXRpb24gPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpIHx8IEREUC5fQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5nZXQoKTtcbiAgICBpZiAoIWN1cnJlbnRJbnZvY2F0aW9uKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0ZW9yLnVzZXJJZCBjYW4gb25seSBiZSBpbnZva2VkIGluIG1ldGhvZCBjYWxscyBvciBwdWJsaWNhdGlvbnMuXCIpO1xuICAgIHJldHVybiBjdXJyZW50SW52b2NhdGlvbi51c2VySWQ7XG4gIH1cblxuICAvLy9cbiAgLy8vIExPR0lOIEhPT0tTXG4gIC8vL1xuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBWYWxpZGF0ZSBsb2dpbiBhdHRlbXB0cy5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIGxvZ2luIGlzIGF0dGVtcHRlZCAoZWl0aGVyIHN1Y2Nlc3NmdWwgb3IgdW5zdWNjZXNzZnVsKS4gIEEgbG9naW4gY2FuIGJlIGFib3J0ZWQgYnkgcmV0dXJuaW5nIGEgZmFsc3kgdmFsdWUgb3IgdGhyb3dpbmcgYW4gZXhjZXB0aW9uLlxuICAgKi9cbiAgdmFsaWRhdGVMb2dpbkF0dGVtcHQoZnVuYykge1xuICAgIC8vIEV4Y2VwdGlvbnMgaW5zaWRlIHRoZSBob29rIGNhbGxiYWNrIGFyZSBwYXNzZWQgdXAgdG8gdXMuXG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlTG9naW5Ib29rLnJlZ2lzdGVyKGZ1bmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFNldCByZXN0cmljdGlvbnMgb24gbmV3IHVzZXIgY3JlYXRpb24uXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgYSBuZXcgdXNlciBpcyBjcmVhdGVkLiBUYWtlcyB0aGUgbmV3IHVzZXIgb2JqZWN0LCBhbmQgcmV0dXJucyB0cnVlIHRvIGFsbG93IHRoZSBjcmVhdGlvbiBvciBmYWxzZSB0byBhYm9ydC5cbiAgICovXG4gIHZhbGlkYXRlTmV3VXNlcihmdW5jKSB7XG4gICAgdGhpcy5fdmFsaWRhdGVOZXdVc2VySG9va3MucHVzaChmdW5jKTtcbiAgfVxuXG4gIC8vL1xuICAvLy8gQ1JFQVRFIFVTRVIgSE9PS1NcbiAgLy8vXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEN1c3RvbWl6ZSBuZXcgdXNlciBjcmVhdGlvbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIG5ldyB1c2VyIGlzIGNyZWF0ZWQuIFJldHVybiB0aGUgbmV3IHVzZXIgb2JqZWN0LCBvciB0aHJvdyBhbiBgRXJyb3JgIHRvIGFib3J0IHRoZSBjcmVhdGlvbi5cbiAgICovXG4gIG9uQ3JlYXRlVXNlcihmdW5jKSB7XG4gICAgaWYgKHRoaXMuX29uQ3JlYXRlVXNlckhvb2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGNhbGwgb25DcmVhdGVVc2VyIG9uY2VcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fb25DcmVhdGVVc2VySG9vayA9IGZ1bmM7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ3VzdG9taXplIG9hdXRoIHVzZXIgcHJvZmlsZSB1cGRhdGVzXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgYSB1c2VyIGlzIGxvZ2dlZCBpbiB2aWEgb2F1dGguIFJldHVybiB0aGUgcHJvZmlsZSBvYmplY3QgdG8gYmUgbWVyZ2VkLCBvciB0aHJvdyBhbiBgRXJyb3JgIHRvIGFib3J0IHRoZSBjcmVhdGlvbi5cbiAgICovXG4gIG9uRXh0ZXJuYWxMb2dpbihmdW5jKSB7XG4gICAgaWYgKHRoaXMuX29uRXh0ZXJuYWxMb2dpbkhvb2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGNhbGwgb25FeHRlcm5hbExvZ2luIG9uY2VcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fb25FeHRlcm5hbExvZ2luSG9vayA9IGZ1bmM7XG4gIH1cblxuICBfdmFsaWRhdGVMb2dpbihjb25uZWN0aW9uLCBhdHRlbXB0KSB7XG4gICAgdGhpcy5fdmFsaWRhdGVMb2dpbkhvb2suZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICBsZXQgcmV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgYXR0ZW1wdC5hbGxvd2VkID0gZmFsc2U7XG4gICAgICAgIC8vIFhYWCB0aGlzIG1lYW5zIHRoZSBsYXN0IHRocm93biBlcnJvciBvdmVycmlkZXMgcHJldmlvdXMgZXJyb3JcbiAgICAgICAgLy8gbWVzc2FnZXMuIE1heWJlIHRoaXMgaXMgc3VycHJpc2luZyB0byB1c2VycyBhbmQgd2Ugc2hvdWxkIG1ha2VcbiAgICAgICAgLy8gb3ZlcnJpZGluZyBlcnJvcnMgbW9yZSBleHBsaWNpdC4gKHNlZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvMTk2MClcbiAgICAgICAgYXR0ZW1wdC5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCEgcmV0KSB7XG4gICAgICAgIGF0dGVtcHQuYWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICAvLyBkb24ndCBvdmVycmlkZSBhIHNwZWNpZmljIGVycm9yIHByb3ZpZGVkIGJ5IGEgcHJldmlvdXNcbiAgICAgICAgLy8gdmFsaWRhdG9yIG9yIHRoZSBpbml0aWFsIGF0dGVtcHQgKGVnIFwiaW5jb3JyZWN0IHBhc3N3b3JkXCIpLlxuICAgICAgICBpZiAoIWF0dGVtcHQuZXJyb3IpXG4gICAgICAgICAgYXR0ZW1wdC5lcnJvciA9IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkxvZ2luIGZvcmJpZGRlblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIF9zdWNjZXNzZnVsTG9naW4oY29ubmVjdGlvbiwgYXR0ZW1wdCkge1xuICAgIHRoaXMuX29uTG9naW5Ib29rLmVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgX2ZhaWxlZExvZ2luKGNvbm5lY3Rpb24sIGF0dGVtcHQpIHtcbiAgICB0aGlzLl9vbkxvZ2luRmFpbHVyZUhvb2suZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICBjYWxsYmFjayhjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbihjb25uZWN0aW9uLCBhdHRlbXB0KSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfTtcblxuICBfc3VjY2Vzc2Z1bExvZ291dChjb25uZWN0aW9uLCB1c2VySWQpIHtcbiAgICAvLyBkb24ndCBmZXRjaCB0aGUgdXNlciBvYmplY3QgdW5sZXNzIHRoZXJlIGFyZSBzb21lIGNhbGxiYWNrcyByZWdpc3RlcmVkXG4gICAgbGV0IHVzZXI7XG4gICAgdGhpcy5fb25Mb2dvdXRIb29rLmVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgaWYgKCF1c2VyICYmIHVzZXJJZCkgdXNlciA9IHRoaXMudXNlcnMuZmluZE9uZSh1c2VySWQsIHtmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3J9KTtcbiAgICAgIGNhbGxiYWNrKHsgdXNlciwgY29ubmVjdGlvbiB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gTE9HSU4gTUVUSE9EU1xuICAvLy9cblxuICAvLyBMb2dpbiBtZXRob2RzIHJldHVybiB0byB0aGUgY2xpZW50IGFuIG9iamVjdCBjb250YWluaW5nIHRoZXNlXG4gIC8vIGZpZWxkcyB3aGVuIHRoZSB1c2VyIHdhcyBsb2dnZWQgaW4gc3VjY2Vzc2Z1bGx5OlxuICAvL1xuICAvLyAgIGlkOiB1c2VySWRcbiAgLy8gICB0b2tlbjogKlxuICAvLyAgIHRva2VuRXhwaXJlczogKlxuICAvL1xuICAvLyB0b2tlbkV4cGlyZXMgaXMgb3B0aW9uYWwgYW5kIGludGVuZHMgdG8gcHJvdmlkZSBhIGhpbnQgdG8gdGhlXG4gIC8vIGNsaWVudCBhcyB0byB3aGVuIHRoZSB0b2tlbiB3aWxsIGV4cGlyZS4gSWYgbm90IHByb3ZpZGVkLCB0aGVcbiAgLy8gY2xpZW50IHdpbGwgY2FsbCBBY2NvdW50cy5fdG9rZW5FeHBpcmF0aW9uLCBwYXNzaW5nIGl0IHRoZSBkYXRlXG4gIC8vIHRoYXQgaXQgcmVjZWl2ZWQgdGhlIHRva2VuLlxuICAvL1xuICAvLyBUaGUgbG9naW4gbWV0aG9kIHdpbGwgdGhyb3cgYW4gZXJyb3IgYmFjayB0byB0aGUgY2xpZW50IGlmIHRoZSB1c2VyXG4gIC8vIGZhaWxlZCB0byBsb2cgaW4uXG4gIC8vXG4gIC8vXG4gIC8vIExvZ2luIGhhbmRsZXJzIGFuZCBzZXJ2aWNlIHNwZWNpZmljIGxvZ2luIG1ldGhvZHMgc3VjaCBhc1xuICAvLyBgY3JlYXRlVXNlcmAgaW50ZXJuYWxseSByZXR1cm4gYSBgcmVzdWx0YCBvYmplY3QgY29udGFpbmluZyB0aGVzZVxuICAvLyBmaWVsZHM6XG4gIC8vXG4gIC8vICAgdHlwZTpcbiAgLy8gICAgIG9wdGlvbmFsIHN0cmluZzsgdGhlIHNlcnZpY2UgbmFtZSwgb3ZlcnJpZGVzIHRoZSBoYW5kbGVyXG4gIC8vICAgICBkZWZhdWx0IGlmIHByZXNlbnQuXG4gIC8vXG4gIC8vICAgZXJyb3I6XG4gIC8vICAgICBleGNlcHRpb247IGlmIHRoZSB1c2VyIGlzIG5vdCBhbGxvd2VkIHRvIGxvZ2luLCB0aGUgcmVhc29uIHdoeS5cbiAgLy9cbiAgLy8gICB1c2VySWQ6XG4gIC8vICAgICBzdHJpbmc7IHRoZSB1c2VyIGlkIG9mIHRoZSB1c2VyIGF0dGVtcHRpbmcgdG8gbG9naW4gKGlmXG4gIC8vICAgICBrbm93biksIHJlcXVpcmVkIGZvciBhbiBhbGxvd2VkIGxvZ2luLlxuICAvL1xuICAvLyAgIG9wdGlvbnM6XG4gIC8vICAgICBvcHRpb25hbCBvYmplY3QgbWVyZ2VkIGludG8gdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgbG9naW5cbiAgLy8gICAgIG1ldGhvZDsgdXNlZCBieSBIQU1LIGZyb20gU1JQLlxuICAvL1xuICAvLyAgIHN0YW1wZWRMb2dpblRva2VuOlxuICAvLyAgICAgb3B0aW9uYWwgb2JqZWN0IHdpdGggYHRva2VuYCBhbmQgYHdoZW5gIGluZGljYXRpbmcgdGhlIGxvZ2luXG4gIC8vICAgICB0b2tlbiBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRhdGFiYXNlLCByZXR1cm5lZCBieSB0aGVcbiAgLy8gICAgIFwicmVzdW1lXCIgbG9naW4gaGFuZGxlci5cbiAgLy9cbiAgLy8gRm9yIGNvbnZlbmllbmNlLCBsb2dpbiBtZXRob2RzIGNhbiBhbHNvIHRocm93IGFuIGV4Y2VwdGlvbiwgd2hpY2hcbiAgLy8gaXMgY29udmVydGVkIGludG8gYW4ge2Vycm9yfSByZXN1bHQuICBIb3dldmVyLCBpZiB0aGUgaWQgb2YgdGhlXG4gIC8vIHVzZXIgYXR0ZW1wdGluZyB0aGUgbG9naW4gaXMga25vd24sIGEge3VzZXJJZCwgZXJyb3J9IHJlc3VsdCBzaG91bGRcbiAgLy8gYmUgcmV0dXJuZWQgaW5zdGVhZCBzaW5jZSB0aGUgdXNlciBpZCBpcyBub3QgY2FwdHVyZWQgd2hlbiBhblxuICAvLyBleGNlcHRpb24gaXMgdGhyb3duLlxuICAvL1xuICAvLyBUaGlzIGludGVybmFsIGByZXN1bHRgIG9iamVjdCBpcyBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZCBpbnRvIHRoZVxuICAvLyBwdWJsaWMge2lkLCB0b2tlbiwgdG9rZW5FeHBpcmVzfSBvYmplY3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cblxuICAvLyBUcnkgYSBsb2dpbiBtZXRob2QsIGNvbnZlcnRpbmcgdGhyb3duIGV4Y2VwdGlvbnMgaW50byBhbiB7ZXJyb3J9XG4gIC8vIHJlc3VsdC4gIFRoZSBgdHlwZWAgYXJndW1lbnQgaXMgYSBkZWZhdWx0LCBpbnNlcnRlZCBpbnRvIHRoZSByZXN1bHRcbiAgLy8gb2JqZWN0IGlmIG5vdCBleHBsaWNpdGx5IHJldHVybmVkLlxuICAvL1xuICAvLyBMb2cgaW4gYSB1c2VyIG9uIGEgY29ubmVjdGlvbi5cbiAgLy9cbiAgLy8gV2UgdXNlIHRoZSBtZXRob2QgaW52b2NhdGlvbiB0byBzZXQgdGhlIHVzZXIgaWQgb24gdGhlIGNvbm5lY3Rpb24sXG4gIC8vIG5vdCB0aGUgY29ubmVjdGlvbiBvYmplY3QgZGlyZWN0bHkuIHNldFVzZXJJZCBpcyB0aWVkIHRvIG1ldGhvZHMgdG9cbiAgLy8gZW5mb3JjZSBjbGVhciBvcmRlcmluZyBvZiBtZXRob2QgYXBwbGljYXRpb24gKHVzaW5nIHdhaXQgbWV0aG9kcyBvblxuICAvLyB0aGUgY2xpZW50LCBhbmQgYSBubyBzZXRVc2VySWQgYWZ0ZXIgdW5ibG9jayByZXN0cmljdGlvbiBvbiB0aGVcbiAgLy8gc2VydmVyKVxuICAvL1xuICAvLyBUaGUgYHN0YW1wZWRMb2dpblRva2VuYCBwYXJhbWV0ZXIgaXMgb3B0aW9uYWwuICBXaGVuIHByZXNlbnQsIGl0XG4gIC8vIGluZGljYXRlcyB0aGF0IHRoZSBsb2dpbiB0b2tlbiBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkIGludG8gdGhlXG4gIC8vIGRhdGFiYXNlIGFuZCBkb2Vzbid0IG5lZWQgdG8gYmUgaW5zZXJ0ZWQgYWdhaW4uICAoSXQncyB1c2VkIGJ5IHRoZVxuICAvLyBcInJlc3VtZVwiIGxvZ2luIGhhbmRsZXIpLlxuICBfbG9naW5Vc2VyKG1ldGhvZEludm9jYXRpb24sIHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pIHtcbiAgICBpZiAoISBzdGFtcGVkTG9naW5Ub2tlbikge1xuICAgICAgc3RhbXBlZExvZ2luVG9rZW4gPSB0aGlzLl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuKCk7XG4gICAgICB0aGlzLl9pbnNlcnRMb2dpblRva2VuKHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgb3JkZXIgKGFuZCB0aGUgYXZvaWRhbmNlIG9mIHlpZWxkcykgaXMgaW1wb3J0YW50IHRvIG1ha2VcbiAgICAvLyBzdXJlIHRoYXQgd2hlbiBwdWJsaXNoIGZ1bmN0aW9ucyBhcmUgcmVydW4sIHRoZXkgc2VlIGFcbiAgICAvLyBjb25zaXN0ZW50IHZpZXcgb2YgdGhlIHdvcmxkOiB0aGUgdXNlcklkIGlzIHNldCBhbmQgbWF0Y2hlc1xuICAgIC8vIHRoZSBsb2dpbiB0b2tlbiBvbiB0aGUgY29ubmVjdGlvbiAobm90IHRoYXQgdGhlcmUgaXNcbiAgICAvLyBjdXJyZW50bHkgYSBwdWJsaWMgQVBJIGZvciByZWFkaW5nIHRoZSBsb2dpbiB0b2tlbiBvbiBhXG4gICAgLy8gY29ubmVjdGlvbikuXG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoKCkgPT5cbiAgICAgIHRoaXMuX3NldExvZ2luVG9rZW4oXG4gICAgICAgIHVzZXJJZCxcbiAgICAgICAgbWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLFxuICAgICAgICB0aGlzLl9oYXNoTG9naW5Ub2tlbihzdGFtcGVkTG9naW5Ub2tlbi50b2tlbilcbiAgICAgIClcbiAgICApO1xuXG4gICAgbWV0aG9kSW52b2NhdGlvbi5zZXRVc2VySWQodXNlcklkKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogdXNlcklkLFxuICAgICAgdG9rZW46IHN0YW1wZWRMb2dpblRva2VuLnRva2VuLFxuICAgICAgdG9rZW5FeHBpcmVzOiB0aGlzLl90b2tlbkV4cGlyYXRpb24oc3RhbXBlZExvZ2luVG9rZW4ud2hlbilcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFmdGVyIGEgbG9naW4gbWV0aG9kIGhhcyBjb21wbGV0ZWQsIGNhbGwgdGhlIGxvZ2luIGhvb2tzLiAgTm90ZVxuICAvLyB0aGF0IGBhdHRlbXB0TG9naW5gIGlzIGNhbGxlZCBmb3IgKmFsbCogbG9naW4gYXR0ZW1wdHMsIGV2ZW4gb25lc1xuICAvLyB3aGljaCBhcmVuJ3Qgc3VjY2Vzc2Z1bCAoc3VjaCBhcyBhbiBpbnZhbGlkIHBhc3N3b3JkLCBldGMpLlxuICAvL1xuICAvLyBJZiB0aGUgbG9naW4gaXMgYWxsb3dlZCBhbmQgaXNuJ3QgYWJvcnRlZCBieSBhIHZhbGlkYXRlIGxvZ2luIGhvb2tcbiAgLy8gY2FsbGJhY2ssIGxvZyBpbiB0aGUgdXNlci5cbiAgLy9cbiAgX2F0dGVtcHRMb2dpbihcbiAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgIG1ldGhvZE5hbWUsXG4gICAgbWV0aG9kQXJncyxcbiAgICByZXN1bHRcbiAgKSB7XG4gICAgaWYgKCFyZXN1bHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXN1bHQgaXMgcmVxdWlyZWRcIik7XG5cbiAgICAvLyBYWFggQSBwcm9ncmFtbWluZyBlcnJvciBpbiBhIGxvZ2luIGhhbmRsZXIgY2FuIGxlYWQgdG8gdGhpcyBvY2N1cmluZywgYW5kXG4gICAgLy8gdGhlbiB3ZSBkb24ndCBjYWxsIG9uTG9naW4gb3Igb25Mb2dpbkZhaWx1cmUgY2FsbGJhY2tzLiBTaG91bGRcbiAgICAvLyB0cnlMb2dpbk1ldGhvZCBjYXRjaCB0aGlzIGNhc2UgYW5kIHR1cm4gaXQgaW50byBhbiBlcnJvcj9cbiAgICBpZiAoIXJlc3VsdC51c2VySWQgJiYgIXJlc3VsdC5lcnJvcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbG9naW4gbWV0aG9kIG11c3Qgc3BlY2lmeSBhIHVzZXJJZCBvciBhbiBlcnJvclwiKTtcblxuICAgIGxldCB1c2VyO1xuICAgIGlmIChyZXN1bHQudXNlcklkKVxuICAgICAgdXNlciA9IHRoaXMudXNlcnMuZmluZE9uZShyZXN1bHQudXNlcklkLCB7ZmllbGRzOiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yfSk7XG5cbiAgICBjb25zdCBhdHRlbXB0ID0ge1xuICAgICAgdHlwZTogcmVzdWx0LnR5cGUgfHwgXCJ1bmtub3duXCIsXG4gICAgICBhbGxvd2VkOiAhISAocmVzdWx0LnVzZXJJZCAmJiAhcmVzdWx0LmVycm9yKSxcbiAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICBtZXRob2RBcmd1bWVudHM6IEFycmF5LmZyb20obWV0aG9kQXJncylcbiAgICB9O1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgIGF0dGVtcHQuZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgfVxuICAgIGlmICh1c2VyKSB7XG4gICAgICBhdHRlbXB0LnVzZXIgPSB1c2VyO1xuICAgIH1cblxuICAgIC8vIF92YWxpZGF0ZUxvZ2luIG1heSBtdXRhdGUgYGF0dGVtcHRgIGJ5IGFkZGluZyBhbiBlcnJvciBhbmQgY2hhbmdpbmcgYWxsb3dlZFxuICAgIC8vIHRvIGZhbHNlLCBidXQgdGhhdCdzIHRoZSBvbmx5IGNoYW5nZSBpdCBjYW4gbWFrZSAoYW5kIHRoZSB1c2VyJ3MgY2FsbGJhY2tzXG4gICAgLy8gb25seSBnZXQgYSBjbG9uZSBvZiBgYXR0ZW1wdGApLlxuICAgIHRoaXMuX3ZhbGlkYXRlTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcblxuICAgIGlmIChhdHRlbXB0LmFsbG93ZWQpIHtcbiAgICAgIGNvbnN0IHJldCA9IHtcbiAgICAgICAgLi4udGhpcy5fbG9naW5Vc2VyKFxuICAgICAgICAgIG1ldGhvZEludm9jYXRpb24sXG4gICAgICAgICAgcmVzdWx0LnVzZXJJZCxcbiAgICAgICAgICByZXN1bHQuc3RhbXBlZExvZ2luVG9rZW5cbiAgICAgICAgKSxcbiAgICAgICAgLi4ucmVzdWx0Lm9wdGlvbnNcbiAgICAgIH07XG4gICAgICByZXQudHlwZSA9IGF0dGVtcHQudHlwZTtcbiAgICAgIHRoaXMuX3N1Y2Nlc3NmdWxMb2dpbihtZXRob2RJbnZvY2F0aW9uLmNvbm5lY3Rpb24sIGF0dGVtcHQpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9mYWlsZWRMb2dpbihtZXRob2RJbnZvY2F0aW9uLmNvbm5lY3Rpb24sIGF0dGVtcHQpO1xuICAgICAgdGhyb3cgYXR0ZW1wdC5lcnJvcjtcbiAgICB9XG4gIH07XG5cbiAgLy8gQWxsIHNlcnZpY2Ugc3BlY2lmaWMgbG9naW4gbWV0aG9kcyBzaG91bGQgZ28gdGhyb3VnaCB0aGlzIGZ1bmN0aW9uLlxuICAvLyBFbnN1cmUgdGhhdCB0aHJvd24gZXhjZXB0aW9ucyBhcmUgY2F1Z2h0IGFuZCB0aGF0IGxvZ2luIGhvb2tcbiAgLy8gY2FsbGJhY2tzIGFyZSBzdGlsbCBjYWxsZWQuXG4gIC8vXG4gIF9sb2dpbk1ldGhvZChcbiAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgIG1ldGhvZE5hbWUsXG4gICAgbWV0aG9kQXJncyxcbiAgICB0eXBlLFxuICAgIGZuXG4gICkge1xuICAgIHJldHVybiB0aGlzLl9hdHRlbXB0TG9naW4oXG4gICAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgICAgbWV0aG9kTmFtZSxcbiAgICAgIG1ldGhvZEFyZ3MsXG4gICAgICB0cnlMb2dpbk1ldGhvZCh0eXBlLCBmbilcbiAgICApO1xuICB9O1xuXG5cbiAgLy8gUmVwb3J0IGEgbG9naW4gYXR0ZW1wdCBmYWlsZWQgb3V0c2lkZSB0aGUgY29udGV4dCBvZiBhIG5vcm1hbCBsb2dpblxuICAvLyBtZXRob2QuIFRoaXMgaXMgZm9yIHVzZSBpbiB0aGUgY2FzZSB3aGVyZSB0aGVyZSBpcyBhIG11bHRpLXN0ZXAgbG9naW5cbiAgLy8gcHJvY2VkdXJlIChlZyBTUlAgYmFzZWQgcGFzc3dvcmQgbG9naW4pLiBJZiBhIG1ldGhvZCBlYXJseSBpbiB0aGVcbiAgLy8gY2hhaW4gZmFpbHMsIGl0IHNob3VsZCBjYWxsIHRoaXMgZnVuY3Rpb24gdG8gcmVwb3J0IGEgZmFpbHVyZS4gVGhlcmVcbiAgLy8gaXMgbm8gY29ycmVzcG9uZGluZyBtZXRob2QgZm9yIGEgc3VjY2Vzc2Z1bCBsb2dpbjsgbWV0aG9kcyB0aGF0IGNhblxuICAvLyBzdWNjZWVkIGF0IGxvZ2dpbmcgYSB1c2VyIGluIHNob3VsZCBhbHdheXMgYmUgYWN0dWFsIGxvZ2luIG1ldGhvZHNcbiAgLy8gKHVzaW5nIGVpdGhlciBBY2NvdW50cy5fbG9naW5NZXRob2Qgb3IgQWNjb3VudHMucmVnaXN0ZXJMb2dpbkhhbmRsZXIpLlxuICBfcmVwb3J0TG9naW5GYWlsdXJlKFxuICAgIG1ldGhvZEludm9jYXRpb24sXG4gICAgbWV0aG9kTmFtZSxcbiAgICBtZXRob2RBcmdzLFxuICAgIHJlc3VsdFxuICApIHtcbiAgICBjb25zdCBhdHRlbXB0ID0ge1xuICAgICAgdHlwZTogcmVzdWx0LnR5cGUgfHwgXCJ1bmtub3duXCIsXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcbiAgICAgIGVycm9yOiByZXN1bHQuZXJyb3IsXG4gICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgbWV0aG9kQXJndW1lbnRzOiBBcnJheS5mcm9tKG1ldGhvZEFyZ3MpXG4gICAgfTtcblxuICAgIGlmIChyZXN1bHQudXNlcklkKSB7XG4gICAgICBhdHRlbXB0LnVzZXIgPSB0aGlzLnVzZXJzLmZpbmRPbmUocmVzdWx0LnVzZXJJZCwge2ZpZWxkczogdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3Rvcn0pO1xuICAgIH1cblxuICAgIHRoaXMuX3ZhbGlkYXRlTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcbiAgICB0aGlzLl9mYWlsZWRMb2dpbihtZXRob2RJbnZvY2F0aW9uLmNvbm5lY3Rpb24sIGF0dGVtcHQpO1xuXG4gICAgLy8gX3ZhbGlkYXRlTG9naW4gbWF5IG11dGF0ZSBhdHRlbXB0IHRvIHNldCBhIG5ldyBlcnJvciBtZXNzYWdlLiBSZXR1cm5cbiAgICAvLyB0aGUgbW9kaWZpZWQgdmVyc2lvbi5cbiAgICByZXR1cm4gYXR0ZW1wdDtcbiAgfTtcblxuICAvLy9cbiAgLy8vIExPR0lOIEhBTkRMRVJTXG4gIC8vL1xuXG4gIC8vIFRoZSBtYWluIGVudHJ5IHBvaW50IGZvciBhdXRoIHBhY2thZ2VzIHRvIGhvb2sgaW4gdG8gbG9naW4uXG4gIC8vXG4gIC8vIEEgbG9naW4gaGFuZGxlciBpcyBhIGxvZ2luIG1ldGhvZCB3aGljaCBjYW4gcmV0dXJuIGB1bmRlZmluZWRgIHRvXG4gIC8vIGluZGljYXRlIHRoYXQgdGhlIGxvZ2luIHJlcXVlc3QgaXMgbm90IGhhbmRsZWQgYnkgdGhpcyBoYW5kbGVyLlxuICAvL1xuICAvLyBAcGFyYW0gbmFtZSB7U3RyaW5nfSBPcHRpb25hbC4gIFRoZSBzZXJ2aWNlIG5hbWUsIHVzZWQgYnkgZGVmYXVsdFxuICAvLyBpZiBhIHNwZWNpZmljIHNlcnZpY2UgbmFtZSBpc24ndCByZXR1cm5lZCBpbiB0aGUgcmVzdWx0LlxuICAvL1xuICAvLyBAcGFyYW0gaGFuZGxlciB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdGhhdCByZWNlaXZlcyBhbiBvcHRpb25zIG9iamVjdFxuICAvLyAoYXMgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBgbG9naW5gIG1ldGhvZCkgYW5kIHJldHVybnMgb25lIG9mOlxuICAvLyAtIGB1bmRlZmluZWRgLCBtZWFuaW5nIGRvbid0IGhhbmRsZTtcbiAgLy8gLSBhIGxvZ2luIG1ldGhvZCByZXN1bHQgb2JqZWN0XG5cbiAgcmVnaXN0ZXJMb2dpbkhhbmRsZXIobmFtZSwgaGFuZGxlcikge1xuICAgIGlmICghIGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIgPSBuYW1lO1xuICAgICAgbmFtZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9naW5IYW5kbGVycy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBoYW5kbGVyOiBoYW5kbGVyXG4gICAgfSk7XG4gIH07XG5cblxuICAvLyBDaGVja3MgYSB1c2VyJ3MgY3JlZGVudGlhbHMgYWdhaW5zdCBhbGwgdGhlIHJlZ2lzdGVyZWQgbG9naW5cbiAgLy8gaGFuZGxlcnMsIGFuZCByZXR1cm5zIGEgbG9naW4gdG9rZW4gaWYgdGhlIGNyZWRlbnRpYWxzIGFyZSB2YWxpZC4gSXRcbiAgLy8gaXMgbGlrZSB0aGUgbG9naW4gbWV0aG9kLCBleGNlcHQgdGhhdCBpdCBkb2Vzbid0IHNldCB0aGUgbG9nZ2VkLWluXG4gIC8vIHVzZXIgb24gdGhlIGNvbm5lY3Rpb24uIFRocm93cyBhIE1ldGVvci5FcnJvciBpZiBsb2dnaW5nIGluIGZhaWxzLFxuICAvLyBpbmNsdWRpbmcgdGhlIGNhc2Ugd2hlcmUgbm9uZSBvZiB0aGUgbG9naW4gaGFuZGxlcnMgaGFuZGxlZCB0aGUgbG9naW5cbiAgLy8gcmVxdWVzdC4gT3RoZXJ3aXNlLCByZXR1cm5zIHtpZDogdXNlcklkLCB0b2tlbjogKiwgdG9rZW5FeHBpcmVzOiAqfS5cbiAgLy9cbiAgLy8gRm9yIGV4YW1wbGUsIGlmIHlvdSB3YW50IHRvIGxvZ2luIHdpdGggYSBwbGFpbnRleHQgcGFzc3dvcmQsIGBvcHRpb25zYCBjb3VsZCBiZVxuICAvLyAgIHsgdXNlcjogeyB1c2VybmFtZTogPHVzZXJuYW1lPiB9LCBwYXNzd29yZDogPHBhc3N3b3JkPiB9LCBvclxuICAvLyAgIHsgdXNlcjogeyBlbWFpbDogPGVtYWlsPiB9LCBwYXNzd29yZDogPHBhc3N3b3JkPiB9LlxuXG4gIC8vIFRyeSBhbGwgb2YgdGhlIHJlZ2lzdGVyZWQgbG9naW4gaGFuZGxlcnMgdW50aWwgb25lIG9mIHRoZW0gZG9lc24ndFxuICAvLyByZXR1cm4gYHVuZGVmaW5lZGAsIG1lYW5pbmcgaXQgaGFuZGxlZCB0aGlzIGNhbGwgdG8gYGxvZ2luYC4gUmV0dXJuXG4gIC8vIHRoYXQgcmV0dXJuIHZhbHVlLlxuICBfcnVuTG9naW5IYW5kbGVycyhtZXRob2RJbnZvY2F0aW9uLCBvcHRpb25zKSB7XG4gICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLl9sb2dpbkhhbmRsZXJzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0cnlMb2dpbk1ldGhvZChcbiAgICAgICAgaGFuZGxlci5uYW1lLFxuICAgICAgICAoKSA9PiBoYW5kbGVyLmhhbmRsZXIuY2FsbChtZXRob2RJbnZvY2F0aW9uLCBvcHRpb25zKVxuICAgICAgKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsIFwiQSBsb2dpbiBoYW5kbGVyIHNob3VsZCByZXR1cm4gYSByZXN1bHQgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBudWxsLFxuICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCBcIlVucmVjb2duaXplZCBvcHRpb25zIGZvciBsb2dpbiByZXF1ZXN0XCIpXG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxldGVzIHRoZSBnaXZlbiBsb2dpblRva2VuIGZyb20gdGhlIGRhdGFiYXNlLlxuICAvL1xuICAvLyBGb3IgbmV3LXN0eWxlIGhhc2hlZCB0b2tlbiwgdGhpcyB3aWxsIGNhdXNlIGFsbCBjb25uZWN0aW9uc1xuICAvLyBhc3NvY2lhdGVkIHdpdGggdGhlIHRva2VuIHRvIGJlIGNsb3NlZC5cbiAgLy9cbiAgLy8gQW55IGNvbm5lY3Rpb25zIGFzc29jaWF0ZWQgd2l0aCBvbGQtc3R5bGUgdW5oYXNoZWQgdG9rZW5zIHdpbGwgYmVcbiAgLy8gaW4gdGhlIHByb2Nlc3Mgb2YgYmVjb21pbmcgYXNzb2NpYXRlZCB3aXRoIGhhc2hlZCB0b2tlbnMgYW5kIHRoZW5cbiAgLy8gdGhleSdsbCBnZXQgY2xvc2VkLlxuICBkZXN0cm95VG9rZW4odXNlcklkLCBsb2dpblRva2VuKSB7XG4gICAgdGhpcy51c2Vycy51cGRhdGUodXNlcklkLCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7XG4gICAgICAgICAgJG9yOiBbXG4gICAgICAgICAgICB7IGhhc2hlZFRva2VuOiBsb2dpblRva2VuIH0sXG4gICAgICAgICAgICB7IHRva2VuOiBsb2dpblRva2VuIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBfaW5pdFNlcnZlck1ldGhvZHMoKSB7XG4gICAgLy8gVGhlIG1ldGhvZHMgY3JlYXRlZCBpbiB0aGlzIGZ1bmN0aW9uIG5lZWQgdG8gYmUgY3JlYXRlZCBoZXJlIHNvIHRoYXRcbiAgICAvLyB0aGlzIHZhcmlhYmxlIGlzIGF2YWlsYWJsZSBpbiB0aGVpciBzY29wZS5cbiAgICBjb25zdCBhY2NvdW50cyA9IHRoaXM7XG5cblxuICAgIC8vIFRoaXMgb2JqZWN0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggbWV0aG9kcyBhbmQgdGhlbiBwYXNzZWQgdG9cbiAgICAvLyBhY2NvdW50cy5fc2VydmVyLm1ldGhvZHMgZnVydGhlciBiZWxvdy5cbiAgICBjb25zdCBtZXRob2RzID0ge307XG5cbiAgICAvLyBAcmV0dXJucyB7T2JqZWN0fG51bGx9XG4gICAgLy8gICBJZiBzdWNjZXNzZnVsLCByZXR1cm5zIHt0b2tlbjogcmVjb25uZWN0VG9rZW4sIGlkOiB1c2VySWR9XG4gICAgLy8gICBJZiB1bnN1Y2Nlc3NmdWwgKGZvciBleGFtcGxlLCBpZiB0aGUgdXNlciBjbG9zZWQgdGhlIG9hdXRoIGxvZ2luIHBvcHVwKSxcbiAgICAvLyAgICAgdGhyb3dzIGFuIGVycm9yIGRlc2NyaWJpbmcgdGhlIHJlYXNvblxuICAgIG1ldGhvZHMubG9naW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgLy8gTG9naW4gaGFuZGxlcnMgc2hvdWxkIHJlYWxseSBhbHNvIGNoZWNrIHdoYXRldmVyIGZpZWxkIHRoZXkgbG9vayBhdCBpblxuICAgICAgLy8gb3B0aW9ucywgYnV0IHdlIGRvbid0IGVuZm9yY2UgaXQuXG4gICAgICBjaGVjayhvcHRpb25zLCBPYmplY3QpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhY2NvdW50cy5fcnVuTG9naW5IYW5kbGVycyh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgcmV0dXJuIGFjY291bnRzLl9hdHRlbXB0TG9naW4odGhpcywgXCJsb2dpblwiLCBhcmd1bWVudHMsIHJlc3VsdCk7XG4gICAgfTtcblxuICAgIG1ldGhvZHMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICAgICAgYWNjb3VudHMuX3NldExvZ2luVG9rZW4odGhpcy51c2VySWQsIHRoaXMuY29ubmVjdGlvbiwgbnVsbCk7XG4gICAgICBpZiAodG9rZW4gJiYgdGhpcy51c2VySWQpIHtcbiAgICAgICAgYWNjb3VudHMuZGVzdHJveVRva2VuKHRoaXMudXNlcklkLCB0b2tlbik7XG4gICAgICB9XG4gICAgICBhY2NvdW50cy5fc3VjY2Vzc2Z1bExvZ291dCh0aGlzLmNvbm5lY3Rpb24sIHRoaXMudXNlcklkKTtcbiAgICAgIHRoaXMuc2V0VXNlcklkKG51bGwpO1xuICAgIH07XG5cbiAgICAvLyBEZWxldGUgYWxsIHRoZSBjdXJyZW50IHVzZXIncyB0b2tlbnMgYW5kIGNsb3NlIGFsbCBvcGVuIGNvbm5lY3Rpb25zIGxvZ2dlZFxuICAgIC8vIGluIGFzIHRoaXMgdXNlci4gUmV0dXJucyBhIGZyZXNoIG5ldyBsb2dpbiB0b2tlbiB0aGF0IHRoaXMgY2xpZW50IGNhblxuICAgIC8vIHVzZS4gVGVzdHMgc2V0IEFjY291bnRzLl9ub0Nvbm5lY3Rpb25DbG9zZURlbGF5Rm9yVGVzdCB0byBkZWxldGUgdG9rZW5zXG4gICAgLy8gaW1tZWRpYXRlbHkgaW5zdGVhZCBvZiB1c2luZyBhIGRlbGF5LlxuICAgIC8vXG4gICAgLy8gWFhYIENPTVBBVCBXSVRIIDAuNy4yXG4gICAgLy8gVGhpcyBzaW5nbGUgYGxvZ291dE90aGVyQ2xpZW50c2AgbWV0aG9kIGhhcyBiZWVuIHJlcGxhY2VkIHdpdGggdHdvXG4gICAgLy8gbWV0aG9kcywgb25lIHRoYXQgeW91IGNhbGwgdG8gZ2V0IGEgbmV3IHRva2VuLCBhbmQgYW5vdGhlciB0aGF0IHlvdVxuICAgIC8vIGNhbGwgdG8gcmVtb3ZlIGFsbCB0b2tlbnMgZXhjZXB0IHlvdXIgb3duLiBUaGUgbmV3IGRlc2lnbiBhbGxvd3NcbiAgICAvLyBjbGllbnRzIHRvIGtub3cgd2hlbiBvdGhlciBjbGllbnRzIGhhdmUgYWN0dWFsbHkgYmVlbiBsb2dnZWRcbiAgICAvLyBvdXQuIChUaGUgYGxvZ291dE90aGVyQ2xpZW50c2AgbWV0aG9kIGd1YXJhbnRlZXMgdGhlIGNhbGxlciB0aGF0XG4gICAgLy8gdGhlIG90aGVyIGNsaWVudHMgd2lsbCBiZSBsb2dnZWQgb3V0IGF0IHNvbWUgcG9pbnQsIGJ1dCBtYWtlcyBub1xuICAgIC8vIGd1YXJhbnRlZXMgYWJvdXQgd2hlbi4pIFRoaXMgbWV0aG9kIGlzIGxlZnQgaW4gZm9yIGJhY2t3YXJkc1xuICAgIC8vIGNvbXBhdGliaWxpdHksIGVzcGVjaWFsbHkgc2luY2UgYXBwbGljYXRpb24gY29kZSBtaWdodCBiZSBjYWxsaW5nXG4gICAgLy8gdGhpcyBtZXRob2QgZGlyZWN0bHkuXG4gICAgLy9cbiAgICAvLyBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCB0b2tlbiBhbmQgdG9rZW5FeHBpcmVzIGtleXMuXG4gICAgbWV0aG9kcy5sb2dvdXRPdGhlckNsaWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB1c2VyID0gYWNjb3VudHMudXNlcnMuZmluZE9uZSh0aGlzLnVzZXJJZCwge1xuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCB0b2tlbnMgaW4gdGhlIGRhdGFiYXNlIHRvIGJlIGRlbGV0ZWQgaW5cbiAgICAgICAgLy8gQ09OTkVDVElPTl9DTE9TRV9ERUxBWV9NUyBtcy4gVGhpcyBnaXZlcyBvdGhlciBjb25uZWN0aW9ucyBpbiB0aGVcbiAgICAgICAgLy8gY2FsbGVyJ3MgYnJvd3NlciB0aW1lIHRvIGZpbmQgdGhlIGZyZXNoIHRva2VuIGluIGxvY2FsU3RvcmFnZS4gV2Ugc2F2ZVxuICAgICAgICAvLyB0aGUgdG9rZW5zIGluIHRoZSBkYXRhYmFzZSBpbiBjYXNlIHdlIGNyYXNoIGJlZm9yZSBhY3R1YWxseSBkZWxldGluZ1xuICAgICAgICAvLyB0aGVtLlxuICAgICAgICBjb25zdCB0b2tlbnMgPSB1c2VyLnNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2VucztcbiAgICAgICAgY29uc3QgbmV3VG9rZW4gPSBhY2NvdW50cy5fZ2VuZXJhdGVTdGFtcGVkTG9naW5Ub2tlbigpO1xuICAgICAgICBhY2NvdW50cy51c2Vycy51cGRhdGUodGhpcy51c2VySWQsIHtcbiAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1RvRGVsZXRlXCI6IHRva2VucyxcbiAgICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmhhdmVMb2dpblRva2Vuc1RvRGVsZXRlXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgICRwdXNoOiB7IFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IGFjY291bnRzLl9oYXNoU3RhbXBlZFRva2VuKG5ld1Rva2VuKSB9XG4gICAgICAgIH0pO1xuICAgICAgICBNZXRlb3Iuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgLy8gVGhlIG9ic2VydmUgb24gTWV0ZW9yLnVzZXJzIHdpbGwgdGFrZSBjYXJlIG9mIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb25zXG4gICAgICAgICAgLy8gYXNzb2NpYXRlZCB3aXRoIGB0b2tlbnNgLlxuICAgICAgICAgIGFjY291bnRzLl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIodGhpcy51c2VySWQsIHRva2Vucyk7XG4gICAgICAgIH0sIGFjY291bnRzLl9ub0Nvbm5lY3Rpb25DbG9zZURlbGF5Rm9yVGVzdCA/IDAgOlxuICAgICAgICAgIENPTk5FQ1RJT05fQ0xPU0VfREVMQVlfTVMpO1xuICAgICAgICAvLyBXZSBkbyBub3Qgc2V0IHRoZSBsb2dpbiB0b2tlbiBvbiB0aGlzIGNvbm5lY3Rpb24sIGJ1dCBpbnN0ZWFkIHRoZVxuICAgICAgICAvLyBvYnNlcnZlIGNsb3NlcyB0aGUgY29ubmVjdGlvbiBhbmQgdGhlIGNsaWVudCB3aWxsIHJlY29ubmVjdCB3aXRoIHRoZVxuICAgICAgICAvLyBuZXcgdG9rZW4uXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG5ld1Rva2VuLnRva2VuLFxuICAgICAgICAgIHRva2VuRXhwaXJlczogYWNjb3VudHMuX3Rva2VuRXhwaXJhdGlvbihuZXdUb2tlbi53aGVuKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbi5cIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEdlbmVyYXRlcyBhIG5ldyBsb2dpbiB0b2tlbiB3aXRoIHRoZSBzYW1lIGV4cGlyYXRpb24gYXMgdGhlXG4gICAgLy8gY29ubmVjdGlvbidzIGN1cnJlbnQgdG9rZW4gYW5kIHNhdmVzIGl0IHRvIHRoZSBkYXRhYmFzZS4gQXNzb2NpYXRlc1xuICAgIC8vIHRoZSBjb25uZWN0aW9uIHdpdGggdGhpcyBuZXcgdG9rZW4gYW5kIHJldHVybnMgaXQuIFRocm93cyBhbiBlcnJvclxuICAgIC8vIGlmIGNhbGxlZCBvbiBhIGNvbm5lY3Rpb24gdGhhdCBpc24ndCBsb2dnZWQgaW4uXG4gICAgLy9cbiAgICAvLyBAcmV0dXJucyBPYmplY3RcbiAgICAvLyAgIElmIHN1Y2Nlc3NmdWwsIHJldHVybnMgeyB0b2tlbjogPG5ldyB0b2tlbj4sIGlkOiA8dXNlciBpZD4sXG4gICAgLy8gICB0b2tlbkV4cGlyZXM6IDxleHBpcmF0aW9uIGRhdGU+IH0uXG4gICAgbWV0aG9kcy5nZXROZXdUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHVzZXIgPSBhY2NvdW50cy51c2Vycy5maW5kT25lKHRoaXMudXNlcklkLCB7XG4gICAgICAgIGZpZWxkczogeyBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiAxIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCEgdGhpcy51c2VySWQgfHwgISB1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXCJZb3UgYXJlIG5vdCBsb2dnZWQgaW4uXCIpO1xuICAgICAgfVxuICAgICAgLy8gQmUgY2FyZWZ1bCBub3QgdG8gZ2VuZXJhdGUgYSBuZXcgdG9rZW4gdGhhdCBoYXMgYSBsYXRlclxuICAgICAgLy8gZXhwaXJhdGlvbiB0aGFuIHRoZSBjdXJyZW4gdG9rZW4uIE90aGVyd2lzZSwgYSBiYWQgZ3V5IHdpdGggYVxuICAgICAgLy8gc3RvbGVuIHRva2VuIGNvdWxkIHVzZSB0aGlzIG1ldGhvZCB0byBzdG9wIGhpcyBzdG9sZW4gdG9rZW4gZnJvbVxuICAgICAgLy8gZXZlciBleHBpcmluZy5cbiAgICAgIGNvbnN0IGN1cnJlbnRIYXNoZWRUb2tlbiA9IGFjY291bnRzLl9nZXRMb2dpblRva2VuKHRoaXMuY29ubmVjdGlvbi5pZCk7XG4gICAgICBjb25zdCBjdXJyZW50U3RhbXBlZFRva2VuID0gdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuZmluZChcbiAgICAgICAgc3RhbXBlZFRva2VuID0+IHN0YW1wZWRUb2tlbi5oYXNoZWRUb2tlbiA9PT0gY3VycmVudEhhc2hlZFRva2VuXG4gICAgICApO1xuICAgICAgaWYgKCEgY3VycmVudFN0YW1wZWRUb2tlbikgeyAvLyBzYWZldHkgYmVsdDogdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXCJJbnZhbGlkIGxvZ2luIHRva2VuXCIpO1xuICAgICAgfVxuICAgICAgY29uc3QgbmV3U3RhbXBlZFRva2VuID0gYWNjb3VudHMuX2dlbmVyYXRlU3RhbXBlZExvZ2luVG9rZW4oKTtcbiAgICAgIG5ld1N0YW1wZWRUb2tlbi53aGVuID0gY3VycmVudFN0YW1wZWRUb2tlbi53aGVuO1xuICAgICAgYWNjb3VudHMuX2luc2VydExvZ2luVG9rZW4odGhpcy51c2VySWQsIG5ld1N0YW1wZWRUb2tlbik7XG4gICAgICByZXR1cm4gYWNjb3VudHMuX2xvZ2luVXNlcih0aGlzLCB0aGlzLnVzZXJJZCwgbmV3U3RhbXBlZFRva2VuKTtcbiAgICB9O1xuXG4gICAgLy8gUmVtb3ZlcyBhbGwgdG9rZW5zIGV4Y2VwdCB0aGUgdG9rZW4gYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50XG4gICAgLy8gY29ubmVjdGlvbi4gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBjb25uZWN0aW9uIGlzIG5vdCBsb2dnZWRcbiAgICAvLyBpbi4gUmV0dXJucyBub3RoaW5nIG9uIHN1Y2Nlc3MuXG4gICAgbWV0aG9kcy5yZW1vdmVPdGhlclRva2VucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghIHRoaXMudXNlcklkKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXCJZb3UgYXJlIG5vdCBsb2dnZWQgaW4uXCIpO1xuICAgICAgfVxuICAgICAgY29uc3QgY3VycmVudFRva2VuID0gYWNjb3VudHMuX2dldExvZ2luVG9rZW4odGhpcy5jb25uZWN0aW9uLmlkKTtcbiAgICAgIGFjY291bnRzLnVzZXJzLnVwZGF0ZSh0aGlzLnVzZXJJZCwge1xuICAgICAgICAkcHVsbDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHsgaGFzaGVkVG9rZW46IHsgJG5lOiBjdXJyZW50VG9rZW4gfSB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBbGxvdyBhIG9uZS10aW1lIGNvbmZpZ3VyYXRpb24gZm9yIGEgbG9naW4gc2VydmljZS4gTW9kaWZpY2F0aW9uc1xuICAgIC8vIHRvIHRoaXMgY29sbGVjdGlvbiBhcmUgYWxzbyBhbGxvd2VkIGluIGluc2VjdXJlIG1vZGUuXG4gICAgbWV0aG9kcy5jb25maWd1cmVMb2dpblNlcnZpY2UgPSAob3B0aW9ucykgPT4ge1xuICAgICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHtzZXJ2aWNlOiBTdHJpbmd9KSk7XG4gICAgICAvLyBEb24ndCBsZXQgcmFuZG9tIHVzZXJzIGNvbmZpZ3VyZSBhIHNlcnZpY2Ugd2UgaGF2ZW4ndCBhZGRlZCB5ZXQgKHNvXG4gICAgICAvLyB0aGF0IHdoZW4gd2UgZG8gbGF0ZXIgYWRkIGl0LCBpdCdzIHNldCB1cCB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIGluc3RlYWQgb2Ygb3VycykuXG4gICAgICAvLyBYWFggaWYgc2VydmljZSBjb25maWd1cmF0aW9uIGlzIG9hdXRoLXNwZWNpZmljIHRoZW4gdGhpcyBjb2RlIHNob3VsZFxuICAgICAgLy8gICAgIGJlIGluIGFjY291bnRzLW9hdXRoOyBpZiBpdCdzIG5vdCB0aGVuIHRoZSByZWdpc3RyeSBzaG91bGQgYmVcbiAgICAgIC8vICAgICBpbiB0aGlzIHBhY2thZ2VcbiAgICAgIGlmICghKGFjY291bnRzLm9hdXRoXG4gICAgICAgICYmIGFjY291bnRzLm9hdXRoLnNlcnZpY2VOYW1lcygpLmluY2x1ZGVzKG9wdGlvbnMuc2VydmljZSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlNlcnZpY2UgdW5rbm93blwiKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeyBTZXJ2aWNlQ29uZmlndXJhdGlvbiB9ID0gUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ107XG4gICAgICBpZiAoU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZSh7c2VydmljZTogb3B0aW9ucy5zZXJ2aWNlfSkpXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBgU2VydmljZSAke29wdGlvbnMuc2VydmljZX0gYWxyZWFkeSBjb25maWd1cmVkYCk7XG5cbiAgICAgIGlmIChoYXNPd24uY2FsbChvcHRpb25zLCAnc2VjcmV0JykgJiYgdXNpbmdPQXV0aEVuY3J5cHRpb24oKSlcbiAgICAgICAgb3B0aW9ucy5zZWNyZXQgPSBPQXV0aEVuY3J5cHRpb24uc2VhbChvcHRpb25zLnNlY3JldCk7XG5cbiAgICAgIFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmluc2VydChvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgYWNjb3VudHMuX3NlcnZlci5tZXRob2RzKG1ldGhvZHMpO1xuICB9O1xuXG4gIF9pbml0QWNjb3VudERhdGFIb29rcygpIHtcbiAgICB0aGlzLl9zZXJ2ZXIub25Db25uZWN0aW9uKGNvbm5lY3Rpb24gPT4ge1xuICAgICAgdGhpcy5fYWNjb3VudERhdGFbY29ubmVjdGlvbi5pZF0gPSB7XG4gICAgICAgIGNvbm5lY3Rpb246IGNvbm5lY3Rpb25cbiAgICAgIH07XG5cbiAgICAgIGNvbm5lY3Rpb24ub25DbG9zZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24oY29ubmVjdGlvbi5pZCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9hY2NvdW50RGF0YVtjb25uZWN0aW9uLmlkXTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIF9pbml0U2VydmVyUHVibGljYXRpb25zKCkge1xuICAgIC8vIEJyaW5nIGludG8gbGV4aWNhbCBzY29wZSBmb3IgcHVibGlzaCBjYWxsYmFja3MgdGhhdCBuZWVkIGB0aGlzYFxuICAgIGNvbnN0IHsgdXNlcnMsIF9hdXRvcHVibGlzaEZpZWxkcyB9ID0gdGhpcztcblxuICAgIC8vIFB1Ymxpc2ggYWxsIGxvZ2luIHNlcnZpY2UgY29uZmlndXJhdGlvbiBmaWVsZHMgb3RoZXIgdGhhbiBzZWNyZXQuXG4gICAgdGhpcy5fc2VydmVyLnB1Ymxpc2goXCJtZXRlb3IubG9naW5TZXJ2aWNlQ29uZmlndXJhdGlvblwiLCAoKSA9PiB7XG4gICAgICBjb25zdCB7IFNlcnZpY2VDb25maWd1cmF0aW9uIH0gPSBQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXTtcbiAgICAgIHJldHVybiBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kKHt9LCB7ZmllbGRzOiB7c2VjcmV0OiAwfX0pO1xuICAgIH0sIHtpc19hdXRvOiB0cnVlfSk7IC8vIG5vdCB0ZWNoaW5jYWxseSBhdXRvcHVibGlzaCwgYnV0IHN0b3BzIHRoZSB3YXJuaW5nLlxuXG4gICAgLy8gUHVibGlzaCB0aGUgY3VycmVudCB1c2VyJ3MgcmVjb3JkIHRvIHRoZSBjbGllbnQuXG4gICAgdGhpcy5fc2VydmVyLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMudXNlcklkKSB7XG4gICAgICAgIHJldHVybiB1c2Vycy5maW5kKHtcbiAgICAgICAgICBfaWQ6IHRoaXMudXNlcklkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgIHByb2ZpbGU6IDEsXG4gICAgICAgICAgICB1c2VybmFtZTogMSxcbiAgICAgICAgICAgIGVtYWlsczogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9LCAvKnN1cHByZXNzIGF1dG9wdWJsaXNoIHdhcm5pbmcqL3tpc19hdXRvOiB0cnVlfSk7XG5cbiAgICAvLyBVc2UgTWV0ZW9yLnN0YXJ0dXAgdG8gZ2l2ZSBvdGhlciBwYWNrYWdlcyBhIGNoYW5jZSB0byBjYWxsXG4gICAgLy8gYWRkQXV0b3B1Ymxpc2hGaWVsZHMuXG4gICAgUGFja2FnZS5hdXRvcHVibGlzaCAmJiBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICAvLyBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnXSAtPiB7cHJvZmlsZTogMSwgdXNlcm5hbWU6IDF9XG4gICAgICBjb25zdCB0b0ZpZWxkU2VsZWN0b3IgPSBmaWVsZHMgPT4gZmllbGRzLnJlZHVjZSgocHJldiwgZmllbGQpID0+IChcbiAgICAgICAgICB7IC4uLnByZXYsIFtmaWVsZF06IDEgfSksXG4gICAgICAgIHt9XG4gICAgICApO1xuICAgICAgdGhpcy5fc2VydmVyLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy51c2VySWQpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcnMuZmluZCh7IF9pZDogdGhpcy51c2VySWQgfSwge1xuICAgICAgICAgICAgZmllbGRzOiB0b0ZpZWxkU2VsZWN0b3IoX2F1dG9wdWJsaXNoRmllbGRzLmxvZ2dlZEluVXNlciksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgLypzdXBwcmVzcyBhdXRvcHVibGlzaCB3YXJuaW5nKi97aXNfYXV0bzogdHJ1ZX0pO1xuXG4gICAgICAvLyBYWFggdGhpcyBwdWJsaXNoIGlzIG5laXRoZXIgZGVkdXAtYWJsZSBub3IgaXMgaXQgb3B0aW1pemVkIGJ5IG91ciBzcGVjaWFsXG4gICAgICAvLyB0cmVhdG1lbnQgb2YgcXVlcmllcyBvbiBhIHNwZWNpZmljIF9pZC4gVGhlcmVmb3JlIHRoaXMgd2lsbCBoYXZlIE8obl4yKVxuICAgICAgLy8gcnVuLXRpbWUgcGVyZm9ybWFuY2UgZXZlcnkgdGltZSBhIHVzZXIgZG9jdW1lbnQgaXMgY2hhbmdlZCAoZWcgc29tZW9uZVxuICAgICAgLy8gbG9nZ2luZyBpbikuIElmIHRoaXMgaXMgYSBwcm9ibGVtLCB3ZSBjYW4gaW5zdGVhZCB3cml0ZSBhIG1hbnVhbCBwdWJsaXNoXG4gICAgICAvLyBmdW5jdGlvbiB3aGljaCBmaWx0ZXJzIG91dCBmaWVsZHMgYmFzZWQgb24gJ3RoaXMudXNlcklkJy5cbiAgICAgIHRoaXMuX3NlcnZlci5wdWJsaXNoKG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSB0aGlzLnVzZXJJZCA/IHsgX2lkOiB7ICRuZTogdGhpcy51c2VySWQgfSB9IDoge307XG4gICAgICAgIHJldHVybiB1c2Vycy5maW5kKHNlbGVjdG9yLCB7XG4gICAgICAgICAgZmllbGRzOiB0b0ZpZWxkU2VsZWN0b3IoX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMpLFxuICAgICAgICB9KVxuICAgICAgfSwgLypzdXBwcmVzcyBhdXRvcHVibGlzaCB3YXJuaW5nKi97aXNfYXV0bzogdHJ1ZX0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCB0byB0aGUgbGlzdCBvZiBmaWVsZHMgb3Igc3ViZmllbGRzIHRvIGJlIGF1dG9tYXRpY2FsbHlcbiAgLy8gcHVibGlzaGVkIGlmIGF1dG9wdWJsaXNoIGlzIG9uLiBNdXN0IGJlIGNhbGxlZCBmcm9tIHRvcC1sZXZlbFxuICAvLyBjb2RlIChpZSwgYmVmb3JlIE1ldGVvci5zdGFydHVwIGhvb2tzIHJ1bikuXG4gIC8vXG4gIC8vIEBwYXJhbSBvcHRzIHtPYmplY3R9IHdpdGg6XG4gIC8vICAgLSBmb3JMb2dnZWRJblVzZXIge0FycmF5fSBBcnJheSBvZiBmaWVsZHMgcHVibGlzaGVkIHRvIHRoZSBsb2dnZWQtaW4gdXNlclxuICAvLyAgIC0gZm9yT3RoZXJVc2VycyB7QXJyYXl9IEFycmF5IG9mIGZpZWxkcyBwdWJsaXNoZWQgdG8gdXNlcnMgdGhhdCBhcmVuJ3QgbG9nZ2VkIGluXG4gIGFkZEF1dG9wdWJsaXNoRmllbGRzKG9wdHMpIHtcbiAgICB0aGlzLl9hdXRvcHVibGlzaEZpZWxkcy5sb2dnZWRJblVzZXIucHVzaC5hcHBseShcbiAgICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLmxvZ2dlZEluVXNlciwgb3B0cy5mb3JMb2dnZWRJblVzZXIpO1xuICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMucHVzaC5hcHBseShcbiAgICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMsIG9wdHMuZm9yT3RoZXJVc2Vycyk7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBBQ0NPVU5UIERBVEFcbiAgLy8vXG5cbiAgLy8gSEFDSzogVGhpcyBpcyB1c2VkIGJ5ICdtZXRlb3ItYWNjb3VudHMnIHRvIGdldCB0aGUgbG9naW5Ub2tlbiBmb3IgYVxuICAvLyBjb25uZWN0aW9uLiBNYXliZSB0aGVyZSBzaG91bGQgYmUgYSBwdWJsaWMgd2F5IHRvIGRvIHRoYXQuXG4gIF9nZXRBY2NvdW50RGF0YShjb25uZWN0aW9uSWQsIGZpZWxkKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb25JZF07XG4gICAgcmV0dXJuIGRhdGEgJiYgZGF0YVtmaWVsZF07XG4gIH07XG5cbiAgX3NldEFjY291bnREYXRhKGNvbm5lY3Rpb25JZCwgZmllbGQsIHZhbHVlKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb25JZF07XG5cbiAgICAvLyBzYWZldHkgYmVsdC4gc2hvdWxkbid0IGhhcHBlbi4gYWNjb3VudERhdGEgaXMgc2V0IGluIG9uQ29ubmVjdGlvbixcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGEgY29ubmVjdGlvbklkIHVudGlsIGl0IGlzIHNldC5cbiAgICBpZiAoIWRhdGEpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcbiAgICAgIGRlbGV0ZSBkYXRhW2ZpZWxkXTtcbiAgICBlbHNlXG4gICAgICBkYXRhW2ZpZWxkXSA9IHZhbHVlO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gUkVDT05ORUNUIFRPS0VOU1xuICAvLy9cbiAgLy8vIHN1cHBvcnQgcmVjb25uZWN0aW5nIHVzaW5nIGEgbWV0ZW9yIGxvZ2luIHRva2VuXG5cbiAgX2hhc2hMb2dpblRva2VuKGxvZ2luVG9rZW4pIHtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgIGhhc2gudXBkYXRlKGxvZ2luVG9rZW4pO1xuICAgIHJldHVybiBoYXNoLmRpZ2VzdCgnYmFzZTY0Jyk7XG4gIH07XG5cbiAgLy8ge3Rva2VuLCB3aGVufSA9PiB7aGFzaGVkVG9rZW4sIHdoZW59XG4gIF9oYXNoU3RhbXBlZFRva2VuKHN0YW1wZWRUb2tlbikge1xuICAgIGNvbnN0IHsgdG9rZW4sIC4uLmhhc2hlZFN0YW1wZWRUb2tlbiB9ID0gc3RhbXBlZFRva2VuO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5oYXNoZWRTdGFtcGVkVG9rZW4sXG4gICAgICBoYXNoZWRUb2tlbjogdGhpcy5faGFzaExvZ2luVG9rZW4odG9rZW4pXG4gICAgfTtcbiAgfTtcblxuICAvLyBVc2luZyAkYWRkVG9TZXQgYXZvaWRzIGdldHRpbmcgYW4gaW5kZXggZXJyb3IgaWYgYW5vdGhlciBjbGllbnRcbiAgLy8gbG9nZ2luZyBpbiBzaW11bHRhbmVvdXNseSBoYXMgYWxyZWFkeSBpbnNlcnRlZCB0aGUgbmV3IGhhc2hlZFxuICAvLyB0b2tlbi5cbiAgX2luc2VydEhhc2hlZExvZ2luVG9rZW4odXNlcklkLCBoYXNoZWRUb2tlbiwgcXVlcnkpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5ID8geyAuLi5xdWVyeSB9IDoge307XG4gICAgcXVlcnkuX2lkID0gdXNlcklkO1xuICAgIHRoaXMudXNlcnMudXBkYXRlKHF1ZXJ5LCB7XG4gICAgICAkYWRkVG9TZXQ6IHtcbiAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjogaGFzaGVkVG9rZW5cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBFeHBvcnRlZCBmb3IgdGVzdHMuXG4gIF9pbnNlcnRMb2dpblRva2VuKHVzZXJJZCwgc3RhbXBlZFRva2VuLCBxdWVyeSkge1xuICAgIHRoaXMuX2luc2VydEhhc2hlZExvZ2luVG9rZW4oXG4gICAgICB1c2VySWQsXG4gICAgICB0aGlzLl9oYXNoU3RhbXBlZFRva2VuKHN0YW1wZWRUb2tlbiksXG4gICAgICBxdWVyeVxuICAgICk7XG4gIH07XG5cbiAgX2NsZWFyQWxsTG9naW5Ub2tlbnModXNlcklkKSB7XG4gICAgdGhpcy51c2Vycy51cGRhdGUodXNlcklkLCB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgICdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMnOiBbXVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIHRlc3QgaG9va1xuICBfZ2V0VXNlck9ic2VydmUoY29ubmVjdGlvbklkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gIH07XG5cbiAgLy8gQ2xlYW4gdXAgdGhpcyBjb25uZWN0aW9uJ3MgYXNzb2NpYXRpb24gd2l0aCB0aGUgdG9rZW46IHRoYXQgaXMsIHN0b3BcbiAgLy8gdGhlIG9ic2VydmUgdGhhdCB3ZSBzdGFydGVkIHdoZW4gd2UgYXNzb2NpYXRlZCB0aGUgY29ubmVjdGlvbiB3aXRoXG4gIC8vIHRoaXMgdG9rZW4uXG4gIF9yZW1vdmVUb2tlbkZyb21Db25uZWN0aW9uKGNvbm5lY3Rpb25JZCkge1xuICAgIGlmIChoYXNPd24uY2FsbCh0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9ucywgY29ubmVjdGlvbklkKSkge1xuICAgICAgY29uc3Qgb2JzZXJ2ZSA9IHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gICAgICBpZiAodHlwZW9mIG9ic2VydmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIFdlJ3JlIGluIHRoZSBwcm9jZXNzIG9mIHNldHRpbmcgdXAgYW4gb2JzZXJ2ZSBmb3IgdGhpcyBjb25uZWN0aW9uLiBXZVxuICAgICAgICAvLyBjYW4ndCBjbGVhbiB1cCB0aGF0IG9ic2VydmUgeWV0LCBidXQgaWYgd2UgZGVsZXRlIHRoZSBwbGFjZWhvbGRlciBmb3JcbiAgICAgICAgLy8gdGhpcyBjb25uZWN0aW9uLCB0aGVuIHRoZSBvYnNlcnZlIHdpbGwgZ2V0IGNsZWFuZWQgdXAgYXMgc29vbiBhcyBpdCBoYXNcbiAgICAgICAgLy8gYmVlbiBzZXQgdXAuXG4gICAgICAgIGRlbGV0ZSB0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9uc1tjb25uZWN0aW9uSWRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gICAgICAgIG9ic2VydmUuc3RvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfZ2V0TG9naW5Ub2tlbihjb25uZWN0aW9uSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QWNjb3VudERhdGEoY29ubmVjdGlvbklkLCAnbG9naW5Ub2tlbicpO1xuICB9O1xuXG4gIC8vIG5ld1Rva2VuIGlzIGEgaGFzaGVkIHRva2VuLlxuICBfc2V0TG9naW5Ub2tlbih1c2VySWQsIGNvbm5lY3Rpb24sIG5ld1Rva2VuKSB7XG4gICAgdGhpcy5fcmVtb3ZlVG9rZW5Gcm9tQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcbiAgICB0aGlzLl9zZXRBY2NvdW50RGF0YShjb25uZWN0aW9uLmlkLCAnbG9naW5Ub2tlbicsIG5ld1Rva2VuKTtcblxuICAgIGlmIChuZXdUb2tlbikge1xuICAgICAgLy8gU2V0IHVwIGFuIG9ic2VydmUgZm9yIHRoaXMgdG9rZW4uIElmIHRoZSB0b2tlbiBnb2VzIGF3YXksIHdlIG5lZWRcbiAgICAgIC8vIHRvIGNsb3NlIHRoZSBjb25uZWN0aW9uLiAgV2UgZGVmZXIgdGhlIG9ic2VydmUgYmVjYXVzZSB0aGVyZSdzXG4gICAgICAvLyBubyBuZWVkIGZvciBpdCB0byBiZSBvbiB0aGUgY3JpdGljYWwgcGF0aCBmb3IgbG9naW47IHdlIGp1c3QgbmVlZFxuICAgICAgLy8gdG8gZW5zdXJlIHRoYXQgdGhlIGNvbm5lY3Rpb24gd2lsbCBnZXQgY2xvc2VkIGF0IHNvbWUgcG9pbnQgaWZcbiAgICAgIC8vIHRoZSB0b2tlbiBnZXRzIGRlbGV0ZWQuXG4gICAgICAvL1xuICAgICAgLy8gSW5pdGlhbGx5LCB3ZSBzZXQgdGhlIG9ic2VydmUgZm9yIHRoaXMgY29ubmVjdGlvbiB0byBhIG51bWJlcjsgdGhpc1xuICAgICAgLy8gc2lnbmlmaWVzIHRvIG90aGVyIGNvZGUgKHdoaWNoIG1pZ2h0IHJ1biB3aGlsZSB3ZSB5aWVsZCkgdGhhdCB3ZSBhcmUgaW5cbiAgICAgIC8vIHRoZSBwcm9jZXNzIG9mIHNldHRpbmcgdXAgYW4gb2JzZXJ2ZSBmb3IgdGhpcyBjb25uZWN0aW9uLiBPbmNlIHRoZVxuICAgICAgLy8gb2JzZXJ2ZSBpcyByZWFkeSB0byBnbywgd2UgcmVwbGFjZSB0aGUgbnVtYmVyIHdpdGggdGhlIHJlYWwgb2JzZXJ2ZVxuICAgICAgLy8gaGFuZGxlICh1bmxlc3MgdGhlIHBsYWNlaG9sZGVyIGhhcyBiZWVuIGRlbGV0ZWQgb3IgcmVwbGFjZWQgYnkgYVxuICAgICAgLy8gZGlmZmVyZW50IHBsYWNlaG9sZCBudW1iZXIsIHNpZ25pZnlpbmcgdGhhdCB0aGUgY29ubmVjdGlvbiB3YXMgY2xvc2VkXG4gICAgICAvLyBhbHJlYWR5IC0tIGluIHRoaXMgY2FzZSB3ZSBqdXN0IGNsZWFuIHVwIHRoZSBvYnNlcnZlIHRoYXQgd2Ugc3RhcnRlZCkuXG4gICAgICBjb25zdCBteU9ic2VydmVOdW1iZXIgPSArK3RoaXMuX25leHRVc2VyT2JzZXJ2ZU51bWJlcjtcbiAgICAgIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdID0gbXlPYnNlcnZlTnVtYmVyO1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgLy8gSWYgc29tZXRoaW5nIGVsc2UgaGFwcGVuZWQgb24gdGhpcyBjb25uZWN0aW9uIGluIHRoZSBtZWFudGltZSAoaXQgZ290XG4gICAgICAgIC8vIGNsb3NlZCwgb3IgYW5vdGhlciBjYWxsIHRvIF9zZXRMb2dpblRva2VuIGhhcHBlbmVkKSwganVzdCBkb1xuICAgICAgICAvLyBub3RoaW5nLiBXZSBkb24ndCBuZWVkIHRvIHN0YXJ0IGFuIG9ic2VydmUgZm9yIGFuIG9sZCBjb25uZWN0aW9uIG9yIG9sZFxuICAgICAgICAvLyB0b2tlbi5cbiAgICAgICAgaWYgKHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdICE9PSBteU9ic2VydmVOdW1iZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZm91bmRNYXRjaGluZ1VzZXI7XG4gICAgICAgIC8vIEJlY2F1c2Ugd2UgdXBncmFkZSB1bmhhc2hlZCBsb2dpbiB0b2tlbnMgdG8gaGFzaGVkIHRva2VucyBhdFxuICAgICAgICAvLyBsb2dpbiB0aW1lLCBzZXNzaW9ucyB3aWxsIG9ubHkgYmUgbG9nZ2VkIGluIHdpdGggYSBoYXNoZWRcbiAgICAgICAgLy8gdG9rZW4uIFRodXMgd2Ugb25seSBuZWVkIHRvIG9ic2VydmUgaGFzaGVkIHRva2VucyBoZXJlLlxuICAgICAgICBjb25zdCBvYnNlcnZlID0gdGhpcy51c2Vycy5maW5kKHtcbiAgICAgICAgICBfaWQ6IHVzZXJJZCxcbiAgICAgICAgICAnc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuJzogbmV3VG9rZW5cbiAgICAgICAgfSwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSkub2JzZXJ2ZUNoYW5nZXMoe1xuICAgICAgICAgIGFkZGVkOiAoKSA9PiB7XG4gICAgICAgICAgICBmb3VuZE1hdGNoaW5nVXNlciA9IHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW1vdmVkOiBjb25uZWN0aW9uLmNsb3NlLFxuICAgICAgICAgIC8vIFRoZSBvbkNsb3NlIGNhbGxiYWNrIGZvciB0aGUgY29ubmVjdGlvbiB0YWtlcyBjYXJlIG9mXG4gICAgICAgICAgLy8gY2xlYW5pbmcgdXAgdGhlIG9ic2VydmUgaGFuZGxlIGFuZCBhbnkgb3RoZXIgc3RhdGUgd2UgaGF2ZVxuICAgICAgICAgIC8vIGx5aW5nIGFyb3VuZC5cbiAgICAgICAgfSwgeyBub25NdXRhdGluZ0NhbGxiYWNrczogdHJ1ZSB9KTtcblxuICAgICAgICAvLyBJZiB0aGUgdXNlciByYW4gYW5vdGhlciBsb2dpbiBvciBsb2dvdXQgY29tbWFuZCB3ZSB3ZXJlIHdhaXRpbmcgZm9yIHRoZVxuICAgICAgICAvLyBkZWZlciBvciBhZGRlZCB0byBmaXJlIChpZSwgYW5vdGhlciBjYWxsIHRvIF9zZXRMb2dpblRva2VuIG9jY3VycmVkKSxcbiAgICAgICAgLy8gdGhlbiB3ZSBsZXQgdGhlIGxhdGVyIG9uZSB3aW4gKHN0YXJ0IGFuIG9ic2VydmUsIGV0YykgYW5kIGp1c3Qgc3RvcCBvdXJcbiAgICAgICAgLy8gb2JzZXJ2ZSBub3cuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNpbWlsYXJseSwgaWYgdGhlIGNvbm5lY3Rpb24gd2FzIGFscmVhZHkgY2xvc2VkLCB0aGVuIHRoZSBvbkNsb3NlXG4gICAgICAgIC8vIGNhbGxiYWNrIHdvdWxkIGhhdmUgY2FsbGVkIF9yZW1vdmVUb2tlbkZyb21Db25uZWN0aW9uIGFuZCB0aGVyZSB3b24ndFxuICAgICAgICAvLyBiZSBhbiBlbnRyeSBpbiBfdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnMuIFdlIGNhbiBzdG9wIHRoZSBvYnNlcnZlLlxuICAgICAgICBpZiAodGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gIT09IG15T2JzZXJ2ZU51bWJlcikge1xuICAgICAgICAgIG9ic2VydmUuc3RvcCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdID0gb2JzZXJ2ZTtcblxuICAgICAgICBpZiAoISBmb3VuZE1hdGNoaW5nVXNlcikge1xuICAgICAgICAgIC8vIFdlJ3ZlIHNldCB1cCBhbiBvYnNlcnZlIG9uIHRoZSB1c2VyIGFzc29jaWF0ZWQgd2l0aCBgbmV3VG9rZW5gLFxuICAgICAgICAgIC8vIHNvIGlmIHRoZSBuZXcgdG9rZW4gaXMgcmVtb3ZlZCBmcm9tIHRoZSBkYXRhYmFzZSwgd2UnbGwgY2xvc2VcbiAgICAgICAgICAvLyB0aGUgY29ubmVjdGlvbi4gQnV0IHRoZSB0b2tlbiBtaWdodCBoYXZlIGFscmVhZHkgYmVlbiBkZWxldGVkXG4gICAgICAgICAgLy8gYmVmb3JlIHdlIHNldCB1cCB0aGUgb2JzZXJ2ZSwgd2hpY2ggd291bGRuJ3QgaGF2ZSBjbG9zZWQgdGhlXG4gICAgICAgICAgLy8gY29ubmVjdGlvbiBiZWNhdXNlIHRoZSBvYnNlcnZlIHdhc24ndCBydW5uaW5nIHlldC5cbiAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyAoQWxzbyB1c2VkIGJ5IE1ldGVvciBBY2NvdW50cyBzZXJ2ZXIgYW5kIHRlc3RzKS5cbiAgLy9cbiAgX2dlbmVyYXRlU3RhbXBlZExvZ2luVG9rZW4oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuOiBSYW5kb20uc2VjcmV0KCksXG4gICAgICB3aGVuOiBuZXcgRGF0ZVxuICAgIH07XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBUT0tFTiBFWFBJUkFUSU9OXG4gIC8vL1xuXG4gIC8vIERlbGV0ZXMgZXhwaXJlZCBwYXNzd29yZCByZXNldCB0b2tlbnMgZnJvbSB0aGUgZGF0YWJhc2UuXG4gIC8vXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy4gQWxzbywgdGhlIGFyZ3VtZW50cyBhcmUgb25seSB1c2VkIGJ5XG4gIC8vIHRlc3RzLiBvbGRlc3RWYWxpZERhdGUgaXMgc2ltdWxhdGUgZXhwaXJpbmcgdG9rZW5zIHdpdGhvdXQgd2FpdGluZ1xuICAvLyBmb3IgdGhlbSB0byBhY3R1YWxseSBleHBpcmUuIHVzZXJJZCBpcyB1c2VkIGJ5IHRlc3RzIHRvIG9ubHkgZXhwaXJlXG4gIC8vIHRva2VucyBmb3IgdGhlIHRlc3QgdXNlci5cbiAgX2V4cGlyZVBhc3N3b3JkUmVzZXRUb2tlbnMob2xkZXN0VmFsaWREYXRlLCB1c2VySWQpIHtcbiAgICBjb25zdCB0b2tlbkxpZmV0aW1lTXMgPSB0aGlzLl9nZXRQYXNzd29yZFJlc2V0VG9rZW5MaWZldGltZU1zKCk7XG5cbiAgICAvLyB3aGVuIGNhbGxpbmcgZnJvbSBhIHRlc3Qgd2l0aCBleHRyYSBhcmd1bWVudHMsIHlvdSBtdXN0IHNwZWNpZnkgYm90aCFcbiAgICBpZiAoKG9sZGVzdFZhbGlkRGF0ZSAmJiAhdXNlcklkKSB8fCAoIW9sZGVzdFZhbGlkRGF0ZSAmJiB1c2VySWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgdGVzdC4gTXVzdCBzcGVjaWZ5IGJvdGggb2xkZXN0VmFsaWREYXRlIGFuZCB1c2VySWQuXCIpO1xuICAgIH1cblxuICAgIG9sZGVzdFZhbGlkRGF0ZSA9IG9sZGVzdFZhbGlkRGF0ZSB8fFxuICAgICAgKG5ldyBEYXRlKG5ldyBEYXRlKCkgLSB0b2tlbkxpZmV0aW1lTXMpKTtcblxuICAgIGNvbnN0IHRva2VuRmlsdGVyID0ge1xuICAgICAgJG9yOiBbXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC5yZWFzb25cIjogXCJyZXNldFwifSxcbiAgICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LnJlYXNvblwiOiB7JGV4aXN0czogZmFsc2V9fVxuICAgICAgXVxuICAgIH07XG5cbiAgICBleHBpcmVQYXNzd29yZFRva2VuKHRoaXMsIG9sZGVzdFZhbGlkRGF0ZSwgdG9rZW5GaWx0ZXIsIHVzZXJJZCk7XG4gIH1cblxuICAvLyBEZWxldGVzIGV4cGlyZWQgcGFzc3dvcmQgZW5yb2xsIHRva2VucyBmcm9tIHRoZSBkYXRhYmFzZS5cbiAgLy9cbiAgLy8gRXhwb3J0ZWQgZm9yIHRlc3RzLiBBbHNvLCB0aGUgYXJndW1lbnRzIGFyZSBvbmx5IHVzZWQgYnlcbiAgLy8gdGVzdHMuIG9sZGVzdFZhbGlkRGF0ZSBpcyBzaW11bGF0ZSBleHBpcmluZyB0b2tlbnMgd2l0aG91dCB3YWl0aW5nXG4gIC8vIGZvciB0aGVtIHRvIGFjdHVhbGx5IGV4cGlyZS4gdXNlcklkIGlzIHVzZWQgYnkgdGVzdHMgdG8gb25seSBleHBpcmVcbiAgLy8gdG9rZW5zIGZvciB0aGUgdGVzdCB1c2VyLlxuICBfZXhwaXJlUGFzc3dvcmRFbnJvbGxUb2tlbnMob2xkZXN0VmFsaWREYXRlLCB1c2VySWQpIHtcbiAgICBjb25zdCB0b2tlbkxpZmV0aW1lTXMgPSB0aGlzLl9nZXRQYXNzd29yZEVucm9sbFRva2VuTGlmZXRpbWVNcygpO1xuXG4gICAgLy8gd2hlbiBjYWxsaW5nIGZyb20gYSB0ZXN0IHdpdGggZXh0cmEgYXJndW1lbnRzLCB5b3UgbXVzdCBzcGVjaWZ5IGJvdGghXG4gICAgaWYgKChvbGRlc3RWYWxpZERhdGUgJiYgIXVzZXJJZCkgfHwgKCFvbGRlc3RWYWxpZERhdGUgJiYgdXNlcklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHRlc3QuIE11c3Qgc3BlY2lmeSBib3RoIG9sZGVzdFZhbGlkRGF0ZSBhbmQgdXNlcklkLlwiKTtcbiAgICB9XG5cbiAgICBvbGRlc3RWYWxpZERhdGUgPSBvbGRlc3RWYWxpZERhdGUgfHxcbiAgICAgIChuZXcgRGF0ZShuZXcgRGF0ZSgpIC0gdG9rZW5MaWZldGltZU1zKSk7XG5cbiAgICBjb25zdCB0b2tlbkZpbHRlciA9IHtcbiAgICAgIFwic2VydmljZXMucGFzc3dvcmQucmVzZXQucmVhc29uXCI6IFwiZW5yb2xsXCJcbiAgICB9O1xuXG4gICAgZXhwaXJlUGFzc3dvcmRUb2tlbih0aGlzLCBvbGRlc3RWYWxpZERhdGUsIHRva2VuRmlsdGVyLCB1c2VySWQpO1xuICB9XG5cbiAgLy8gRGVsZXRlcyBleHBpcmVkIHRva2VucyBmcm9tIHRoZSBkYXRhYmFzZSBhbmQgY2xvc2VzIGFsbCBvcGVuIGNvbm5lY3Rpb25zXG4gIC8vIGFzc29jaWF0ZWQgd2l0aCB0aGVzZSB0b2tlbnMuXG4gIC8vXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy4gQWxzbywgdGhlIGFyZ3VtZW50cyBhcmUgb25seSB1c2VkIGJ5XG4gIC8vIHRlc3RzLiBvbGRlc3RWYWxpZERhdGUgaXMgc2ltdWxhdGUgZXhwaXJpbmcgdG9rZW5zIHdpdGhvdXQgd2FpdGluZ1xuICAvLyBmb3IgdGhlbSB0byBhY3R1YWxseSBleHBpcmUuIHVzZXJJZCBpcyB1c2VkIGJ5IHRlc3RzIHRvIG9ubHkgZXhwaXJlXG4gIC8vIHRva2VucyBmb3IgdGhlIHRlc3QgdXNlci5cbiAgX2V4cGlyZVRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpO1xuXG4gICAgLy8gd2hlbiBjYWxsaW5nIGZyb20gYSB0ZXN0IHdpdGggZXh0cmEgYXJndW1lbnRzLCB5b3UgbXVzdCBzcGVjaWZ5IGJvdGghXG4gICAgaWYgKChvbGRlc3RWYWxpZERhdGUgJiYgIXVzZXJJZCkgfHwgKCFvbGRlc3RWYWxpZERhdGUgJiYgdXNlcklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHRlc3QuIE11c3Qgc3BlY2lmeSBib3RoIG9sZGVzdFZhbGlkRGF0ZSBhbmQgdXNlcklkLlwiKTtcbiAgICB9XG5cbiAgICBvbGRlc3RWYWxpZERhdGUgPSBvbGRlc3RWYWxpZERhdGUgfHxcbiAgICAgIChuZXcgRGF0ZShuZXcgRGF0ZSgpIC0gdG9rZW5MaWZldGltZU1zKSk7XG4gICAgY29uc3QgdXNlckZpbHRlciA9IHVzZXJJZCA/IHtfaWQ6IHVzZXJJZH0gOiB7fTtcblxuXG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aCBvbGRlciB2ZXJzaW9ucyBvZiBtZXRlb3IgdGhhdCBzdG9yZWQgbG9naW4gdG9rZW5cbiAgICAvLyB0aW1lc3RhbXBzIGFzIG51bWJlcnMuXG4gICAgdGhpcy51c2Vycy51cGRhdGUoeyAuLi51c2VyRmlsdGVyLFxuICAgICAgJG9yOiBbXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMud2hlblwiOiB7ICRsdDogb2xkZXN0VmFsaWREYXRlIH0gfSxcbiAgICAgICAgeyBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy53aGVuXCI6IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgXVxuICAgIH0sIHtcbiAgICAgICRwdWxsOiB7XG4gICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHtcbiAgICAgICAgICAkb3I6IFtcbiAgICAgICAgICAgIHsgd2hlbjogeyAkbHQ6IG9sZGVzdFZhbGlkRGF0ZSB9IH0sXG4gICAgICAgICAgICB7IHdoZW46IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHsgbXVsdGk6IHRydWUgfSk7XG4gICAgLy8gVGhlIG9ic2VydmUgb24gTWV0ZW9yLnVzZXJzIHdpbGwgdGFrZSBjYXJlIG9mIGNsb3NpbmcgY29ubmVjdGlvbnMgZm9yXG4gICAgLy8gZXhwaXJlZCB0b2tlbnMuXG4gIH07XG5cbiAgLy8gQG92ZXJyaWRlIGZyb20gYWNjb3VudHNfY29tbW9uLmpzXG4gIGNvbmZpZyhvcHRpb25zKSB7XG4gICAgLy8gQ2FsbCB0aGUgb3ZlcnJpZGRlbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWV0aG9kLlxuICAgIGNvbnN0IHN1cGVyUmVzdWx0ID0gQWNjb3VudHNDb21tb24ucHJvdG90eXBlLmNvbmZpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgLy8gSWYgdGhlIHVzZXIgc2V0IGxvZ2luRXhwaXJhdGlvbkluRGF5cyB0byBudWxsLCB0aGVuIHdlIG5lZWQgdG8gY2xlYXIgdGhlXG4gICAgLy8gdGltZXIgdGhhdCBwZXJpb2RpY2FsbHkgZXhwaXJlcyB0b2tlbnMuXG4gICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX29wdGlvbnMsICdsb2dpbkV4cGlyYXRpb25JbkRheXMnKSAmJlxuICAgICAgdGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXMgPT09IG51bGwgJiZcbiAgICAgIHRoaXMuZXhwaXJlVG9rZW5JbnRlcnZhbCkge1xuICAgICAgTWV0ZW9yLmNsZWFySW50ZXJ2YWwodGhpcy5leHBpcmVUb2tlbkludGVydmFsKTtcbiAgICAgIHRoaXMuZXhwaXJlVG9rZW5JbnRlcnZhbCA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyUmVzdWx0O1xuICB9O1xuXG4gIC8vIENhbGxlZCBieSBhY2NvdW50cy1wYXNzd29yZFxuICBpbnNlcnRVc2VyRG9jKG9wdGlvbnMsIHVzZXIpIHtcbiAgICAvLyAtIGNsb25lIHVzZXIgZG9jdW1lbnQsIHRvIHByb3RlY3QgZnJvbSBtb2RpZmljYXRpb25cbiAgICAvLyAtIGFkZCBjcmVhdGVkQXQgdGltZXN0YW1wXG4gICAgLy8gLSBwcmVwYXJlIGFuIF9pZCwgc28gdGhhdCB5b3UgY2FuIG1vZGlmeSBvdGhlciBjb2xsZWN0aW9ucyAoZWdcbiAgICAvLyBjcmVhdGUgYSBmaXJzdCB0YXNrIGZvciBldmVyeSBuZXcgdXNlcilcbiAgICAvL1xuICAgIC8vIFhYWCBJZiB0aGUgb25DcmVhdGVVc2VyIG9yIHZhbGlkYXRlTmV3VXNlciBob29rcyBmYWlsLCB3ZSBtaWdodFxuICAgIC8vIGVuZCB1cCBoYXZpbmcgbW9kaWZpZWQgc29tZSBvdGhlciBjb2xsZWN0aW9uXG4gICAgLy8gaW5hcHByb3ByaWF0ZWx5LiBUaGUgc29sdXRpb24gaXMgcHJvYmFibHkgdG8gaGF2ZSBvbkNyZWF0ZVVzZXJcbiAgICAvLyBhY2NlcHQgdHdvIGNhbGxiYWNrcyAtIG9uZSB0aGF0IGdldHMgY2FsbGVkIGJlZm9yZSBpbnNlcnRpbmdcbiAgICAvLyB0aGUgdXNlciBkb2N1bWVudCAoaW4gd2hpY2ggeW91IGNhbiBtb2RpZnkgaXRzIGNvbnRlbnRzKSwgYW5kXG4gICAgLy8gb25lIHRoYXQgZ2V0cyBjYWxsZWQgYWZ0ZXIgKGluIHdoaWNoIHlvdSBzaG91bGQgY2hhbmdlIG90aGVyXG4gICAgLy8gY29sbGVjdGlvbnMpXG4gICAgdXNlciA9IHtcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgIF9pZDogUmFuZG9tLmlkKCksXG4gICAgICAuLi51c2VyLFxuICAgIH07XG5cbiAgICBpZiAodXNlci5zZXJ2aWNlcykge1xuICAgICAgT2JqZWN0LmtleXModXNlci5zZXJ2aWNlcykuZm9yRWFjaChzZXJ2aWNlID0+XG4gICAgICAgIHBpbkVuY3J5cHRlZEZpZWxkc1RvVXNlcih1c2VyLnNlcnZpY2VzW3NlcnZpY2VdLCB1c2VyLl9pZClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGZ1bGxVc2VyO1xuICAgIGlmICh0aGlzLl9vbkNyZWF0ZVVzZXJIb29rKSB7XG4gICAgICBmdWxsVXNlciA9IHRoaXMuX29uQ3JlYXRlVXNlckhvb2sob3B0aW9ucywgdXNlcik7XG5cbiAgICAgIC8vIFRoaXMgaXMgKm5vdCogcGFydCBvZiB0aGUgQVBJLiBXZSBuZWVkIHRoaXMgYmVjYXVzZSB3ZSBjYW4ndCBpc29sYXRlXG4gICAgICAvLyB0aGUgZ2xvYmFsIHNlcnZlciBlbnZpcm9ubWVudCBiZXR3ZWVuIHRlc3RzLCBtZWFuaW5nIHdlIGNhbid0IHRlc3RcbiAgICAgIC8vIGJvdGggaGF2aW5nIGEgY3JlYXRlIHVzZXIgaG9vayBzZXQgYW5kIG5vdCBoYXZpbmcgb25lIHNldC5cbiAgICAgIGlmIChmdWxsVXNlciA9PT0gJ1RFU1QgREVGQVVMVCBIT09LJylcbiAgICAgICAgZnVsbFVzZXIgPSBkZWZhdWx0Q3JlYXRlVXNlckhvb2sob3B0aW9ucywgdXNlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGxVc2VyID0gZGVmYXVsdENyZWF0ZVVzZXJIb29rKG9wdGlvbnMsIHVzZXIpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzLmZvckVhY2goaG9vayA9PiB7XG4gICAgICBpZiAoISBob29rKGZ1bGxVc2VyKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciB2YWxpZGF0aW9uIGZhaWxlZFwiKTtcbiAgICB9KTtcblxuICAgIGxldCB1c2VySWQ7XG4gICAgdHJ5IHtcbiAgICAgIHVzZXJJZCA9IHRoaXMudXNlcnMuaW5zZXJ0KGZ1bGxVc2VyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBYWFggc3RyaW5nIHBhcnNpbmcgc3Vja3MsIG1heWJlXG4gICAgICAvLyBodHRwczovL2ppcmEubW9uZ29kYi5vcmcvYnJvd3NlL1NFUlZFUi0zMDY5IHdpbGwgZ2V0IGZpeGVkIG9uZSBkYXlcbiAgICAgIGlmICghZS5lcnJtc2cpIHRocm93IGU7XG4gICAgICBpZiAoZS5lcnJtc2cuaW5jbHVkZXMoJ2VtYWlscy5hZGRyZXNzJykpXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkVtYWlsIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICAgIGlmIChlLmVycm1zZy5pbmNsdWRlcygndXNlcm5hbWUnKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlcm5hbWUgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJJZDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZnVuY3Rpb246IHJldHVybnMgZmFsc2UgaWYgZW1haWwgZG9lcyBub3QgbWF0Y2ggY29tcGFueSBkb21haW4gZnJvbVxuICAvLyB0aGUgY29uZmlndXJhdGlvbi5cbiAgX3Rlc3RFbWFpbERvbWFpbihlbWFpbCkge1xuICAgIGNvbnN0IGRvbWFpbiA9IHRoaXMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW47XG5cbiAgICByZXR1cm4gIWRvbWFpbiB8fFxuICAgICAgKHR5cGVvZiBkb21haW4gPT09ICdmdW5jdGlvbicgJiYgZG9tYWluKGVtYWlsKSkgfHxcbiAgICAgICh0eXBlb2YgZG9tYWluID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAobmV3IFJlZ0V4cChgQCR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAoZG9tYWluKX0kYCwgJ2knKSkudGVzdChlbWFpbCkpO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gQ0xFQU4gVVAgRk9SIGBsb2dvdXRPdGhlckNsaWVudHNgXG4gIC8vL1xuXG4gIF9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIodXNlcklkLCB0b2tlbnNUb0RlbGV0ZSkge1xuICAgIGlmICh0b2tlbnNUb0RlbGV0ZSkge1xuICAgICAgdGhpcy51c2Vycy51cGRhdGUodXNlcklkLCB7XG4gICAgICAgICR1bnNldDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmhhdmVMb2dpblRva2Vuc1RvRGVsZXRlXCI6IDEsXG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgICRwdWxsQWxsOiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjogdG9rZW5zVG9EZWxldGVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIF9kZWxldGVTYXZlZFRva2Vuc0ZvckFsbFVzZXJzT25TdGFydHVwKCkge1xuICAgIC8vIElmIHdlIGZpbmQgdXNlcnMgd2hvIGhhdmUgc2F2ZWQgdG9rZW5zIHRvIGRlbGV0ZSBvbiBzdGFydHVwLCBkZWxldGVcbiAgICAvLyB0aGVtIG5vdy4gSXQncyBwb3NzaWJsZSB0aGF0IHRoZSBzZXJ2ZXIgY291bGQgaGF2ZSBjcmFzaGVkIGFuZCBjb21lXG4gICAgLy8gYmFjayB1cCBiZWZvcmUgbmV3IHRva2VucyBhcmUgZm91bmQgaW4gbG9jYWxTdG9yYWdlLCBidXQgdGhpc1xuICAgIC8vIHNob3VsZG4ndCBoYXBwZW4gdmVyeSBvZnRlbi4gV2Ugc2hvdWxkbid0IHB1dCBhIGRlbGF5IGhlcmUgYmVjYXVzZVxuICAgIC8vIHRoYXQgd291bGQgZ2l2ZSBhIGxvdCBvZiBwb3dlciB0byBhbiBhdHRhY2tlciB3aXRoIGEgc3RvbGVuIGxvZ2luXG4gICAgLy8gdG9rZW4gYW5kIHRoZSBhYmlsaXR5IHRvIGNyYXNoIHRoZSBzZXJ2ZXIuXG4gICAgTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAgICAgdGhpcy51c2Vycy5maW5kKHtcbiAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUuaGF2ZUxvZ2luVG9rZW5zVG9EZWxldGVcIjogdHJ1ZVxuICAgICAgfSwge2ZpZWxkczoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1RvRGVsZXRlXCI6IDFcbiAgICAgIH19KS5mb3JFYWNoKHVzZXIgPT4ge1xuICAgICAgICB0aGlzLl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIoXG4gICAgICAgICAgdXNlci5faWQsXG4gICAgICAgICAgdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBNQU5BR0lORyBVU0VSIE9CSkVDVFNcbiAgLy8vXG5cbiAgLy8gVXBkYXRlcyBvciBjcmVhdGVzIGEgdXNlciBhZnRlciB3ZSBhdXRoZW50aWNhdGUgd2l0aCBhIDNyZCBwYXJ0eS5cbiAgLy9cbiAgLy8gQHBhcmFtIHNlcnZpY2VOYW1lIHtTdHJpbmd9IFNlcnZpY2UgbmFtZSAoZWcsIHR3aXR0ZXIpLlxuICAvLyBAcGFyYW0gc2VydmljZURhdGEge09iamVjdH0gRGF0YSB0byBzdG9yZSBpbiB0aGUgdXNlcidzIHJlY29yZFxuICAvLyAgICAgICAgdW5kZXIgc2VydmljZXNbc2VydmljZU5hbWVdLiBNdXN0IGluY2x1ZGUgYW4gXCJpZFwiIGZpZWxkXG4gIC8vICAgICAgICB3aGljaCBpcyBhIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgdXNlciBpbiB0aGUgc2VydmljZS5cbiAgLy8gQHBhcmFtIG9wdGlvbnMge09iamVjdCwgb3B0aW9uYWx9IE90aGVyIG9wdGlvbnMgdG8gcGFzcyB0byBpbnNlcnRVc2VyRG9jXG4gIC8vICAgICAgICAoZWcsIHByb2ZpbGUpXG4gIC8vIEByZXR1cm5zIHtPYmplY3R9IE9iamVjdCB3aXRoIHRva2VuIGFuZCBpZCBrZXlzLCBsaWtlIHRoZSByZXN1bHRcbiAgLy8gICAgICAgIG9mIHRoZSBcImxvZ2luXCIgbWV0aG9kLlxuICAvL1xuICB1cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKFxuICAgIHNlcnZpY2VOYW1lLFxuICAgIHNlcnZpY2VEYXRhLFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuXG4gICAgaWYgKHNlcnZpY2VOYW1lID09PSBcInBhc3N3b3JkXCIgfHwgc2VydmljZU5hbWUgPT09IFwicmVzdW1lXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJDYW4ndCB1c2UgdXBkYXRlT3JDcmVhdGVVc2VyRnJvbUV4dGVybmFsU2VydmljZSB3aXRoIGludGVybmFsIHNlcnZpY2UgXCJcbiAgICAgICAgKyBzZXJ2aWNlTmFtZSk7XG4gICAgfVxuICAgIGlmICghaGFzT3duLmNhbGwoc2VydmljZURhdGEsICdpZCcpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBTZXJ2aWNlIGRhdGEgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX0gbXVzdCBpbmNsdWRlIGlkYCk7XG4gICAgfVxuXG4gICAgLy8gTG9vayBmb3IgYSB1c2VyIHdpdGggdGhlIGFwcHJvcHJpYXRlIHNlcnZpY2UgdXNlciBpZC5cbiAgICBjb25zdCBzZWxlY3RvciA9IHt9O1xuICAgIGNvbnN0IHNlcnZpY2VJZEtleSA9IGBzZXJ2aWNlcy4ke3NlcnZpY2VOYW1lfS5pZGA7XG5cbiAgICAvLyBYWFggVGVtcG9yYXJ5IHNwZWNpYWwgY2FzZSBmb3IgVHdpdHRlci4gKElzc3VlICM2MjkpXG4gICAgLy8gICBUaGUgc2VydmljZURhdGEuaWQgd2lsbCBiZSBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyLlxuICAgIC8vICAgV2Ugd2FudCBpdCB0byBtYXRjaCBlaXRoZXIgYSBzdG9yZWQgc3RyaW5nIG9yIGludCByZXByZXNlbnRhdGlvbi5cbiAgICAvLyAgIFRoaXMgaXMgdG8gY2F0ZXIgdG8gZWFybGllciB2ZXJzaW9ucyBvZiBNZXRlb3Igc3RvcmluZyB0d2l0dGVyXG4gICAgLy8gICB1c2VyIElEcyBpbiBudW1iZXIgZm9ybSwgYW5kIHJlY2VudCB2ZXJzaW9ucyBzdG9yaW5nIHRoZW0gYXMgc3RyaW5ncy5cbiAgICAvLyAgIFRoaXMgY2FuIGJlIHJlbW92ZWQgb25jZSBtaWdyYXRpb24gdGVjaG5vbG9neSBpcyBpbiBwbGFjZSwgYW5kIHR3aXR0ZXJcbiAgICAvLyAgIHVzZXJzIHN0b3JlZCB3aXRoIGludGVnZXIgSURzIGhhdmUgYmVlbiBtaWdyYXRlZCB0byBzdHJpbmcgSURzLlxuICAgIGlmIChzZXJ2aWNlTmFtZSA9PT0gXCJ0d2l0dGVyXCIgJiYgIWlzTmFOKHNlcnZpY2VEYXRhLmlkKSkge1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl0gPSBbe30se31dO1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl1bMF1bc2VydmljZUlkS2V5XSA9IHNlcnZpY2VEYXRhLmlkO1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl1bMV1bc2VydmljZUlkS2V5XSA9IHBhcnNlSW50KHNlcnZpY2VEYXRhLmlkLCAxMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdG9yW3NlcnZpY2VJZEtleV0gPSBzZXJ2aWNlRGF0YS5pZDtcbiAgICB9XG5cbiAgICBsZXQgdXNlciA9IHRoaXMudXNlcnMuZmluZE9uZShzZWxlY3Rvciwge2ZpZWxkczogdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3Rvcn0pO1xuXG4gICAgLy8gV2hlbiBjcmVhdGluZyBhIG5ldyB1c2VyIHdlIHBhc3MgdGhyb3VnaCBhbGwgb3B0aW9ucy4gV2hlbiB1cGRhdGluZyBhblxuICAgIC8vIGV4aXN0aW5nIHVzZXIsIGJ5IGRlZmF1bHQgd2Ugb25seSBwcm9jZXNzL3Bhc3MgdGhyb3VnaCB0aGUgc2VydmljZURhdGFcbiAgICAvLyAoZWcsIHNvIHRoYXQgd2Uga2VlcCBhbiB1bmV4cGlyZWQgYWNjZXNzIHRva2VuIGFuZCBkb24ndCBjYWNoZSBvbGQgZW1haWxcbiAgICAvLyBhZGRyZXNzZXMgaW4gc2VydmljZURhdGEuZW1haWwpLiBUaGUgb25FeHRlcm5hbExvZ2luIGhvb2sgY2FuIGJlIHVzZWQgd2hlblxuICAgIC8vIGNyZWF0aW5nIG9yIHVwZGF0aW5nIGEgdXNlciwgdG8gbW9kaWZ5IG9yIHBhc3MgdGhyb3VnaCBtb3JlIG9wdGlvbnMgYXNcbiAgICAvLyBuZWVkZWQuXG4gICAgbGV0IG9wdHMgPSB1c2VyID8ge30gOiBvcHRpb25zO1xuICAgIGlmICh0aGlzLl9vbkV4dGVybmFsTG9naW5Ib29rKSB7XG4gICAgICBvcHRzID0gdGhpcy5fb25FeHRlcm5hbExvZ2luSG9vayhvcHRpb25zLCB1c2VyKTtcbiAgICB9XG5cbiAgICBpZiAodXNlcikge1xuICAgICAgcGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyKHNlcnZpY2VEYXRhLCB1c2VyLl9pZCk7XG5cbiAgICAgIGxldCBzZXRBdHRycyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+XG4gICAgICAgIHNldEF0dHJzW2BzZXJ2aWNlcy4ke3NlcnZpY2VOYW1lfS4ke2tleX1gXSA9IHNlcnZpY2VEYXRhW2tleV1cbiAgICAgICk7XG5cbiAgICAgIC8vIFhYWCBNYXliZSB3ZSBzaG91bGQgcmUtdXNlIHRoZSBzZWxlY3RvciBhYm92ZSBhbmQgbm90aWNlIGlmIHRoZSB1cGRhdGVcbiAgICAgIC8vICAgICB0b3VjaGVzIG5vdGhpbmc/XG4gICAgICBzZXRBdHRycyA9IHsgLi4uc2V0QXR0cnMsIC4uLm9wdHMgfTtcbiAgICAgIHRoaXMudXNlcnMudXBkYXRlKHVzZXIuX2lkLCB7XG4gICAgICAgICRzZXQ6IHNldEF0dHJzXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogc2VydmljZU5hbWUsXG4gICAgICAgIHVzZXJJZDogdXNlci5faWRcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyB1c2VyIHdpdGggdGhlIHNlcnZpY2UgZGF0YS5cbiAgICAgIHVzZXIgPSB7c2VydmljZXM6IHt9fTtcbiAgICAgIHVzZXIuc2VydmljZXNbc2VydmljZU5hbWVdID0gc2VydmljZURhdGE7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBzZXJ2aWNlTmFtZSxcbiAgICAgICAgdXNlcklkOiB0aGlzLmluc2VydFVzZXJEb2Mob3B0cywgdXNlcilcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlbW92ZXMgZGVmYXVsdCByYXRlIGxpbWl0aW5nIHJ1bGVcbiAgcmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCgpIHtcbiAgICBjb25zdCByZXNwID0gRERQUmF0ZUxpbWl0ZXIucmVtb3ZlUnVsZSh0aGlzLmRlZmF1bHRSYXRlTGltaXRlclJ1bGVJZCk7XG4gICAgdGhpcy5kZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQgPSBudWxsO1xuICAgIHJldHVybiByZXNwO1xuICB9O1xuXG4gIC8vIEFkZCBhIGRlZmF1bHQgcnVsZSBvZiBsaW1pdGluZyBsb2dpbnMsIGNyZWF0aW5nIG5ldyB1c2VycyBhbmQgcGFzc3dvcmQgcmVzZXRcbiAgLy8gdG8gNSB0aW1lcyBldmVyeSAxMCBzZWNvbmRzIHBlciBjb25uZWN0aW9uLlxuICBhZGREZWZhdWx0UmF0ZUxpbWl0KCkge1xuICAgIGlmICghdGhpcy5kZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQpIHtcbiAgICAgIHRoaXMuZGVmYXVsdFJhdGVMaW1pdGVyUnVsZUlkID0gRERQUmF0ZUxpbWl0ZXIuYWRkUnVsZSh7XG4gICAgICAgIHVzZXJJZDogbnVsbCxcbiAgICAgICAgY2xpZW50QWRkcmVzczogbnVsbCxcbiAgICAgICAgdHlwZTogJ21ldGhvZCcsXG4gICAgICAgIG5hbWU6IG5hbWUgPT4gWydsb2dpbicsICdjcmVhdGVVc2VyJywgJ3Jlc2V0UGFzc3dvcmQnLCAnZm9yZ290UGFzc3dvcmQnXVxuICAgICAgICAgIC5pbmNsdWRlcyhuYW1lKSxcbiAgICAgICAgY29ubmVjdGlvbklkOiAoY29ubmVjdGlvbklkKSA9PiB0cnVlLFxuICAgICAgfSwgNSwgMTAwMDApO1xuICAgIH1cbiAgfTtcblxufVxuXG4vLyBHaXZlIGVhY2ggbG9naW4gaG9vayBjYWxsYmFjayBhIGZyZXNoIGNsb25lZCBjb3B5IG9mIHRoZSBhdHRlbXB0XG4vLyBvYmplY3QsIGJ1dCBkb24ndCBjbG9uZSB0aGUgY29ubmVjdGlvbi5cbi8vXG5jb25zdCBjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbiA9IChjb25uZWN0aW9uLCBhdHRlbXB0KSA9PiB7XG4gIGNvbnN0IGNsb25lZEF0dGVtcHQgPSBFSlNPTi5jbG9uZShhdHRlbXB0KTtcbiAgY2xvbmVkQXR0ZW1wdC5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgcmV0dXJuIGNsb25lZEF0dGVtcHQ7XG59O1xuXG5jb25zdCB0cnlMb2dpbk1ldGhvZCA9ICh0eXBlLCBmbikgPT4ge1xuICBsZXQgcmVzdWx0O1xuICB0cnkge1xuICAgIHJlc3VsdCA9IGZuKCk7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICByZXN1bHQgPSB7ZXJyb3I6IGV9O1xuICB9XG5cbiAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LnR5cGUgJiYgdHlwZSlcbiAgICByZXN1bHQudHlwZSA9IHR5cGU7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHNldHVwRGVmYXVsdExvZ2luSGFuZGxlcnMgPSBhY2NvdW50cyA9PiB7XG4gIGFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicmVzdW1lXCIsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIuY2FsbCh0aGlzLCBhY2NvdW50cywgb3B0aW9ucyk7XG4gIH0pO1xufTtcblxuLy8gTG9naW4gaGFuZGxlciBmb3IgcmVzdW1lIHRva2Vucy5cbmNvbnN0IGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIgPSAoYWNjb3VudHMsIG9wdGlvbnMpID0+IHtcbiAgaWYgKCFvcHRpb25zLnJlc3VtZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNoZWNrKG9wdGlvbnMucmVzdW1lLCBTdHJpbmcpO1xuXG4gIGNvbnN0IGhhc2hlZFRva2VuID0gYWNjb3VudHMuX2hhc2hMb2dpblRva2VuKG9wdGlvbnMucmVzdW1lKTtcblxuICAvLyBGaXJzdCBsb29rIGZvciBqdXN0IHRoZSBuZXctc3R5bGUgaGFzaGVkIGxvZ2luIHRva2VuLCB0byBhdm9pZFxuICAvLyBzZW5kaW5nIHRoZSB1bmhhc2hlZCB0b2tlbiB0byB0aGUgZGF0YWJhc2UgaW4gYSBxdWVyeSBpZiB3ZSBkb24ndFxuICAvLyBuZWVkIHRvLlxuICBsZXQgdXNlciA9IGFjY291bnRzLnVzZXJzLmZpbmRPbmUoXG4gICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VufSxcbiAgICB7ZmllbGRzOiB7XCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuJFwiOiAxfX0pO1xuXG4gIGlmICghIHVzZXIpIHtcbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCB0aGUgaGFzaGVkIGxvZ2luIHRva2VuLCB0cnkgYWxzbyBsb29raW5nIGZvclxuICAgIC8vIHRoZSBvbGQtc3R5bGUgdW5oYXNoZWQgdG9rZW4uICBCdXQgd2UgbmVlZCB0byBsb29rIGZvciBlaXRoZXJcbiAgICAvLyB0aGUgb2xkLXN0eWxlIHRva2VuIE9SIHRoZSBuZXctc3R5bGUgdG9rZW4sIGJlY2F1c2UgYW5vdGhlclxuICAgIC8vIGNsaWVudCBjb25uZWN0aW9uIGxvZ2dpbmcgaW4gc2ltdWx0YW5lb3VzbHkgbWlnaHQgaGF2ZSBhbHJlYWR5XG4gICAgLy8gY29udmVydGVkIHRoZSB0b2tlbi5cbiAgICB1c2VyID0gYWNjb3VudHMudXNlcnMuZmluZE9uZSh7XG4gICAgICAkb3I6IFtcbiAgICAgICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VufSxcbiAgICAgICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLnRva2VuXCI6IG9wdGlvbnMucmVzdW1lfVxuICAgICAgXVxuICAgIH0sXG4gICAgLy8gTm90ZTogQ2Fubm90IHVzZSAuLi5sb2dpblRva2Vucy4kIHBvc2l0aW9uYWwgb3BlcmF0b3Igd2l0aCAkb3IgcXVlcnkuXG4gICAge2ZpZWxkczoge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IDF9fSk7XG4gIH1cblxuICBpZiAoISB1c2VyKVxuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiWW91J3ZlIGJlZW4gbG9nZ2VkIG91dCBieSB0aGUgc2VydmVyLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiKVxuICAgIH07XG5cbiAgLy8gRmluZCB0aGUgdG9rZW4sIHdoaWNoIHdpbGwgZWl0aGVyIGJlIGFuIG9iamVjdCB3aXRoIGZpZWxkc1xuICAvLyB7aGFzaGVkVG9rZW4sIHdoZW59IGZvciBhIGhhc2hlZCB0b2tlbiBvciB7dG9rZW4sIHdoZW59IGZvciBhblxuICAvLyB1bmhhc2hlZCB0b2tlbi5cbiAgbGV0IG9sZFVuaGFzaGVkU3R5bGVUb2tlbjtcbiAgbGV0IHRva2VuID0gdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuZmluZCh0b2tlbiA9PlxuICAgIHRva2VuLmhhc2hlZFRva2VuID09PSBoYXNoZWRUb2tlblxuICApO1xuICBpZiAodG9rZW4pIHtcbiAgICBvbGRVbmhhc2hlZFN0eWxlVG9rZW4gPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbiA9IHVzZXIuc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmZpbmQodG9rZW4gPT5cbiAgICAgIHRva2VuLnRva2VuID09PSBvcHRpb25zLnJlc3VtZVxuICAgICk7XG4gICAgb2xkVW5oYXNoZWRTdHlsZVRva2VuID0gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuRXhwaXJlcyA9IGFjY291bnRzLl90b2tlbkV4cGlyYXRpb24odG9rZW4ud2hlbik7XG4gIGlmIChuZXcgRGF0ZSgpID49IHRva2VuRXhwaXJlcylcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJZb3VyIHNlc3Npb24gaGFzIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIpXG4gICAgfTtcblxuICAvLyBVcGRhdGUgdG8gYSBoYXNoZWQgdG9rZW4gd2hlbiBhbiB1bmhhc2hlZCB0b2tlbiBpcyBlbmNvdW50ZXJlZC5cbiAgaWYgKG9sZFVuaGFzaGVkU3R5bGVUb2tlbikge1xuICAgIC8vIE9ubHkgYWRkIHRoZSBuZXcgaGFzaGVkIHRva2VuIGlmIHRoZSBvbGQgdW5oYXNoZWQgdG9rZW4gc3RpbGxcbiAgICAvLyBleGlzdHMgKHRoaXMgYXZvaWRzIHJlc3VycmVjdGluZyB0aGUgdG9rZW4gaWYgaXQgd2FzIGRlbGV0ZWRcbiAgICAvLyBhZnRlciB3ZSByZWFkIGl0KS4gIFVzaW5nICRhZGRUb1NldCBhdm9pZHMgZ2V0dGluZyBhbiBpbmRleFxuICAgIC8vIGVycm9yIGlmIGFub3RoZXIgY2xpZW50IGxvZ2dpbmcgaW4gc2ltdWx0YW5lb3VzbHkgaGFzIGFscmVhZHlcbiAgICAvLyBpbnNlcnRlZCB0aGUgbmV3IGhhc2hlZCB0b2tlbi5cbiAgICBhY2NvdW50cy51c2Vycy51cGRhdGUoXG4gICAgICB7XG4gICAgICAgIF9pZDogdXNlci5faWQsXG4gICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLnRva2VuXCI6IG9wdGlvbnMucmVzdW1lXG4gICAgICB9LFxuICAgICAgeyRhZGRUb1NldDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHtcbiAgICAgICAgICAgIFwiaGFzaGVkVG9rZW5cIjogaGFzaGVkVG9rZW4sXG4gICAgICAgICAgICBcIndoZW5cIjogdG9rZW4ud2hlblxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICApO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBvbGQgdG9rZW4gKmFmdGVyKiBhZGRpbmcgdGhlIG5ldywgc2luY2Ugb3RoZXJ3aXNlXG4gICAgLy8gYW5vdGhlciBjbGllbnQgdHJ5aW5nIHRvIGxvZ2luIGJldHdlZW4gb3VyIHJlbW92aW5nIHRoZSBvbGQgYW5kXG4gICAgLy8gYWRkaW5nIHRoZSBuZXcgd291bGRuJ3QgZmluZCBhIHRva2VuIHRvIGxvZ2luIHdpdGguXG4gICAgYWNjb3VudHMudXNlcnMudXBkYXRlKHVzZXIuX2lkLCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7IFwidG9rZW5cIjogb3B0aW9ucy5yZXN1bWUgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1c2VySWQ6IHVzZXIuX2lkLFxuICAgIHN0YW1wZWRMb2dpblRva2VuOiB7XG4gICAgICB0b2tlbjogb3B0aW9ucy5yZXN1bWUsXG4gICAgICB3aGVuOiB0b2tlbi53aGVuXG4gICAgfVxuICB9O1xufTtcblxuY29uc3QgZXhwaXJlUGFzc3dvcmRUb2tlbiA9IChcbiAgYWNjb3VudHMsXG4gIG9sZGVzdFZhbGlkRGF0ZSxcbiAgdG9rZW5GaWx0ZXIsXG4gIHVzZXJJZFxuKSA9PiB7XG4gIGNvbnN0IHVzZXJGaWx0ZXIgPSB1c2VySWQgPyB7X2lkOiB1c2VySWR9IDoge307XG4gIGNvbnN0IHJlc2V0UmFuZ2VPciA9IHtcbiAgICAkb3I6IFtcbiAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC53aGVuXCI6IHsgJGx0OiBvbGRlc3RWYWxpZERhdGUgfSB9LFxuICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LndoZW5cIjogeyAkbHQ6ICtvbGRlc3RWYWxpZERhdGUgfSB9XG4gICAgXVxuICB9O1xuICBjb25zdCBleHBpcmVGaWx0ZXIgPSB7ICRhbmQ6IFt0b2tlbkZpbHRlciwgcmVzZXRSYW5nZU9yXSB9O1xuXG4gIGFjY291bnRzLnVzZXJzLnVwZGF0ZSh7Li4udXNlckZpbHRlciwgLi4uZXhwaXJlRmlsdGVyfSwge1xuICAgICR1bnNldDoge1xuICAgICAgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldFwiOiBcIlwiXG4gICAgfVxuICB9LCB7IG11bHRpOiB0cnVlIH0pO1xufTtcblxuY29uc3Qgc2V0RXhwaXJlVG9rZW5zSW50ZXJ2YWwgPSBhY2NvdW50cyA9PiB7XG4gIGFjY291bnRzLmV4cGlyZVRva2VuSW50ZXJ2YWwgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIGFjY291bnRzLl9leHBpcmVUb2tlbnMoKTtcbiAgICBhY2NvdW50cy5fZXhwaXJlUGFzc3dvcmRSZXNldFRva2VucygpO1xuICAgIGFjY291bnRzLl9leHBpcmVQYXNzd29yZEVucm9sbFRva2VucygpO1xuICB9LCBFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TKTtcbn07XG5cbi8vL1xuLy8vIE9BdXRoIEVuY3J5cHRpb24gU3VwcG9ydFxuLy8vXG5cbmNvbnN0IE9BdXRoRW5jcnlwdGlvbiA9XG4gIFBhY2thZ2VbXCJvYXV0aC1lbmNyeXB0aW9uXCJdICYmXG4gIFBhY2thZ2VbXCJvYXV0aC1lbmNyeXB0aW9uXCJdLk9BdXRoRW5jcnlwdGlvbjtcblxuY29uc3QgdXNpbmdPQXV0aEVuY3J5cHRpb24gPSAoKSA9PiB7XG4gIHJldHVybiBPQXV0aEVuY3J5cHRpb24gJiYgT0F1dGhFbmNyeXB0aW9uLmtleUlzTG9hZGVkKCk7XG59O1xuXG4vLyBPQXV0aCBzZXJ2aWNlIGRhdGEgaXMgdGVtcG9yYXJpbHkgc3RvcmVkIGluIHRoZSBwZW5kaW5nIGNyZWRlbnRpYWxzXG4vLyBjb2xsZWN0aW9uIGR1cmluZyB0aGUgb2F1dGggYXV0aGVudGljYXRpb24gcHJvY2Vzcy4gIFNlbnNpdGl2ZSBkYXRhXG4vLyBzdWNoIGFzIGFjY2VzcyB0b2tlbnMgYXJlIGVuY3J5cHRlZCB3aXRob3V0IHRoZSB1c2VyIGlkIGJlY2F1c2Vcbi8vIHdlIGRvbid0IGtub3cgdGhlIHVzZXIgaWQgeWV0LiAgV2UgcmUtZW5jcnlwdCB0aGVzZSBmaWVsZHMgd2l0aCB0aGVcbi8vIHVzZXIgaWQgaW5jbHVkZWQgd2hlbiBzdG9yaW5nIHRoZSBzZXJ2aWNlIGRhdGEgcGVybWFuZW50bHkgaW5cbi8vIHRoZSB1c2VycyBjb2xsZWN0aW9uLlxuLy9cbmNvbnN0IHBpbkVuY3J5cHRlZEZpZWxkc1RvVXNlciA9IChzZXJ2aWNlRGF0YSwgdXNlcklkKSA9PiB7XG4gIE9iamVjdC5rZXlzKHNlcnZpY2VEYXRhKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc2VydmljZURhdGFba2V5XTtcbiAgICBpZiAoT0F1dGhFbmNyeXB0aW9uICYmIE9BdXRoRW5jcnlwdGlvbi5pc1NlYWxlZCh2YWx1ZSkpXG4gICAgICB2YWx1ZSA9IE9BdXRoRW5jcnlwdGlvbi5zZWFsKE9BdXRoRW5jcnlwdGlvbi5vcGVuKHZhbHVlKSwgdXNlcklkKTtcbiAgICBzZXJ2aWNlRGF0YVtrZXldID0gdmFsdWU7XG4gIH0pO1xufTtcblxuXG4vLyBFbmNyeXB0IHVuZW5jcnlwdGVkIGxvZ2luIHNlcnZpY2Ugc2VjcmV0cyB3aGVuIG9hdXRoLWVuY3J5cHRpb24gaXNcbi8vIGFkZGVkLlxuLy9cbi8vIFhYWCBGb3IgdGhlIG9hdXRoU2VjcmV0S2V5IHRvIGJlIGF2YWlsYWJsZSBoZXJlIGF0IHN0YXJ0dXAsIHRoZVxuLy8gZGV2ZWxvcGVyIG11c3QgY2FsbCBBY2NvdW50cy5jb25maWcoe29hdXRoU2VjcmV0S2V5OiAuLi59KSBhdCBsb2FkXG4vLyB0aW1lLCBpbnN0ZWFkIG9mIGluIGEgTWV0ZW9yLnN0YXJ0dXAgYmxvY2ssIGJlY2F1c2UgdGhlIHN0YXJ0dXBcbi8vIGJsb2NrIGluIHRoZSBhcHAgY29kZSB3aWxsIHJ1biBhZnRlciB0aGlzIGFjY291bnRzLWJhc2Ugc3RhcnR1cFxuLy8gYmxvY2suICBQZXJoYXBzIHdlIG5lZWQgYSBwb3N0LXN0YXJ0dXAgY2FsbGJhY2s/XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgaWYgKCEgdXNpbmdPQXV0aEVuY3J5cHRpb24oKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgU2VydmljZUNvbmZpZ3VyYXRpb24gfSA9IFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddO1xuXG4gIFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmQoe1xuICAgICRhbmQ6IFt7XG4gICAgICBzZWNyZXQ6IHsgJGV4aXN0czogdHJ1ZSB9XG4gICAgfSwge1xuICAgICAgXCJzZWNyZXQuYWxnb3JpdGhtXCI6IHsgJGV4aXN0czogZmFsc2UgfVxuICAgIH1dXG4gIH0pLmZvckVhY2goY29uZmlnID0+IHtcbiAgICBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy51cGRhdGUoY29uZmlnLl9pZCwge1xuICAgICAgJHNldDoge1xuICAgICAgICBzZWNyZXQ6IE9BdXRoRW5jcnlwdGlvbi5zZWFsKGNvbmZpZy5zZWNyZXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIFhYWCBzZWUgY29tbWVudCBvbiBBY2NvdW50cy5jcmVhdGVVc2VyIGluIHBhc3N3b3Jkc19zZXJ2ZXIgYWJvdXQgYWRkaW5nIGFcbi8vIHNlY29uZCBcInNlcnZlciBvcHRpb25zXCIgYXJndW1lbnQuXG5jb25zdCBkZWZhdWx0Q3JlYXRlVXNlckhvb2sgPSAob3B0aW9ucywgdXNlcikgPT4ge1xuICBpZiAob3B0aW9ucy5wcm9maWxlKVxuICAgIHVzZXIucHJvZmlsZSA9IG9wdGlvbnMucHJvZmlsZTtcbiAgcmV0dXJuIHVzZXI7XG59O1xuXG4vLyBWYWxpZGF0ZSBuZXcgdXNlcidzIGVtYWlsIG9yIEdvb2dsZS9GYWNlYm9vay9HaXRIdWIgYWNjb3VudCdzIGVtYWlsXG5mdW5jdGlvbiBkZWZhdWx0VmFsaWRhdGVOZXdVc2VySG9vayh1c2VyKSB7XG4gIGNvbnN0IGRvbWFpbiA9IHRoaXMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW47XG4gIGlmICghZG9tYWluKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsZXQgZW1haWxJc0dvb2QgPSBmYWxzZTtcbiAgaWYgKHVzZXIuZW1haWxzICYmIHVzZXIuZW1haWxzLmxlbmd0aCA+IDApIHtcbiAgICBlbWFpbElzR29vZCA9IHVzZXIuZW1haWxzLnJlZHVjZShcbiAgICAgIChwcmV2LCBlbWFpbCkgPT4gcHJldiB8fCB0aGlzLl90ZXN0RW1haWxEb21haW4oZW1haWwuYWRkcmVzcyksIGZhbHNlXG4gICAgKTtcbiAgfSBlbHNlIGlmICh1c2VyLnNlcnZpY2VzICYmIE9iamVjdC52YWx1ZXModXNlci5zZXJ2aWNlcykubGVuZ3RoID4gMCkge1xuICAgIC8vIEZpbmQgYW55IGVtYWlsIG9mIGFueSBzZXJ2aWNlIGFuZCBjaGVjayBpdFxuICAgIGVtYWlsSXNHb29kID0gT2JqZWN0LnZhbHVlcyh1c2VyLnNlcnZpY2VzKS5yZWR1Y2UoXG4gICAgICAocHJldiwgc2VydmljZSkgPT4gc2VydmljZS5lbWFpbCAmJiB0aGlzLl90ZXN0RW1haWxEb21haW4oc2VydmljZS5lbWFpbCksXG4gICAgICBmYWxzZSxcbiAgICApO1xuICB9XG5cbiAgaWYgKGVtYWlsSXNHb29kKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAodHlwZW9mIGRvbWFpbiA9PT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgYEAke2RvbWFpbn0gZW1haWwgcmVxdWlyZWRgKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJFbWFpbCBkb2Vzbid0IG1hdGNoIHRoZSBjcml0ZXJpYS5cIik7XG4gIH1cbn1cblxuY29uc3Qgc2V0dXBVc2Vyc0NvbGxlY3Rpb24gPSB1c2VycyA9PiB7XG4gIC8vL1xuICAvLy8gUkVTVFJJQ1RJTkcgV1JJVEVTIFRPIFVTRVIgT0JKRUNUU1xuICAvLy9cbiAgdXNlcnMuYWxsb3coe1xuICAgIC8vIGNsaWVudHMgY2FuIG1vZGlmeSB0aGUgcHJvZmlsZSBmaWVsZCBvZiB0aGVpciBvd24gZG9jdW1lbnQsIGFuZFxuICAgIC8vIG5vdGhpbmcgZWxzZS5cbiAgICB1cGRhdGU6ICh1c2VySWQsIHVzZXIsIGZpZWxkcywgbW9kaWZpZXIpID0+IHtcbiAgICAgIC8vIG1ha2Ugc3VyZSBpdCBpcyBvdXIgcmVjb3JkXG4gICAgICBpZiAodXNlci5faWQgIT09IHVzZXJJZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHVzZXIgY2FuIG9ubHkgbW9kaWZ5IHRoZSAncHJvZmlsZScgZmllbGQuIHNldHMgdG8gbXVsdGlwbGVcbiAgICAgIC8vIHN1Yi1rZXlzIChlZyBwcm9maWxlLmZvbyBhbmQgcHJvZmlsZS5iYXIpIGFyZSBtZXJnZWQgaW50byBlbnRyeVxuICAgICAgLy8gaW4gdGhlIGZpZWxkcyBsaXN0LlxuICAgICAgaWYgKGZpZWxkcy5sZW5ndGggIT09IDEgfHwgZmllbGRzWzBdICE9PSAncHJvZmlsZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGZldGNoOiBbJ19pZCddIC8vIHdlIG9ubHkgbG9vayBhdCBfaWQuXG4gIH0pO1xuXG4gIC8vLyBERUZBVUxUIElOREVYRVMgT04gVVNFUlNcbiAgdXNlcnMuX2Vuc3VyZUluZGV4KCd1c2VybmFtZScsIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG4gIHVzZXJzLl9lbnN1cmVJbmRleCgnZW1haWxzLmFkZHJlc3MnLCB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuICB1c2Vycy5fZW5zdXJlSW5kZXgoJ3NlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy5oYXNoZWRUb2tlbicsXG4gICAgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbiAgdXNlcnMuX2Vuc3VyZUluZGV4KCdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMudG9rZW4nLFxuICAgIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG4gIC8vIEZvciB0YWtpbmcgY2FyZSBvZiBsb2dvdXRPdGhlckNsaWVudHMgY2FsbHMgdGhhdCBjcmFzaGVkIGJlZm9yZSB0aGVcbiAgLy8gdG9rZW5zIHdlcmUgZGVsZXRlZC5cbiAgdXNlcnMuX2Vuc3VyZUluZGV4KCdzZXJ2aWNlcy5yZXN1bWUuaGF2ZUxvZ2luVG9rZW5zVG9EZWxldGUnLFxuICAgIHsgc3BhcnNlOiB0cnVlIH0pO1xuICAvLyBGb3IgZXhwaXJpbmcgbG9naW4gdG9rZW5zXG4gIHVzZXJzLl9lbnN1cmVJbmRleChcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy53aGVuXCIsIHsgc3BhcnNlOiB0cnVlIH0pO1xuICAvLyBGb3IgZXhwaXJpbmcgcGFzc3dvcmQgdG9rZW5zXG4gIHVzZXJzLl9lbnN1cmVJbmRleCgnc2VydmljZXMucGFzc3dvcmQucmVzZXQud2hlbicsIHsgc3BhcnNlOiB0cnVlIH0pO1xufTtcbiJdfQ==
