(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var NpmModuleBcrypt = Package['npm-bcrypt'].NpmModuleBcrypt;
var Accounts = Package['accounts-base'].Accounts;
var SRP = Package.srp.SRP;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-password":{"email_templates.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/email_templates.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const greet = welcomeMsg => (user, url) => {
  const greeting = user.profile && user.profile.name ? "Hello ".concat(user.profile.name, ",") : "Hello,";
  return "".concat(greeting, "\n\n").concat(welcomeMsg, ", simply click the link below.\n\n").concat(url, "\n\nThanks.\n");
};
/**
 * @summary Options to customize emails sent from the Accounts system.
 * @locus Server
 * @importFromPackage accounts-base
 */


Accounts.emailTemplates = {
  from: "Accounts Example <no-reply@example.com>",
  siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
  resetPassword: {
    subject: () => "How to reset your password on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To reset your password")
  },
  verifyEmail: {
    subject: () => "How to verify email address on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To verify your account email")
  },
  enrollAccount: {
    subject: () => "An account has been created for you on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To start using the service")
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"password_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/password_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
/// BCRYPT
const bcrypt = NpmModuleBcrypt;
const bcryptHash = Meteor.wrapAsync(bcrypt.hash);
const bcryptCompare = Meteor.wrapAsync(bcrypt.compare); // Utility for grabbing user

const getUserById = (id, options) => Meteor.users.findOne(id, Accounts._addDefaultFieldSelector(options)); // User records have a 'services.password.bcrypt' field on them to hold
// their hashed passwords (unless they have a 'services.password.srp'
// field, in which case they will be upgraded to bcrypt the next time
// they log in).
//
// When the client sends a password to the server, it can either be a
// string (the plaintext password) or an object with keys 'digest' and
// 'algorithm' (must be "sha-256" for now). The Meteor client always sends
// password objects { digest: *, algorithm: "sha-256" }, but DDP clients
// that don't have access to SHA can just send plaintext passwords as
// strings.
//
// When the server receives a plaintext password as a string, it always
// hashes it with SHA256 before passing it into bcrypt. When the server
// receives a password as an object, it asserts that the algorithm is
// "sha-256" and then passes the digest to bcrypt.


Accounts._bcryptRounds = () => Accounts._options.bcryptRounds || 10; // Given a 'password' from the client, extract the string that we should
// bcrypt. 'password' can be one of:
//  - String (the plaintext password)
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".
//


const getPasswordString = password => {
  if (typeof password === "string") {
    password = SHA256(password);
  } else {
    // 'password' is an object
    if (password.algorithm !== "sha-256") {
      throw new Error("Invalid password hash algorithm. " + "Only 'sha-256' is allowed.");
    }

    password = password.digest;
  }

  return password;
}; // Use bcrypt to hash the password for storage in the database.
// `password` can be a string (in which case it will be run through
// SHA256 before bcrypt) or an object with properties `digest` and
// `algorithm` (in which case we bcrypt `password.digest`).
//


const hashPassword = password => {
  password = getPasswordString(password);
  return bcryptHash(password, Accounts._bcryptRounds());
}; // Extract the number of rounds used in the specified bcrypt hash.


const getRoundsFromBcryptHash = hash => {
  let rounds;

  if (hash) {
    const hashSegments = hash.split('$');

    if (hashSegments.length > 2) {
      rounds = parseInt(hashSegments[2], 10);
    }
  }

  return rounds;
}; // Check whether the provided password matches the bcrypt'ed password in
// the database user record. `password` can be a string (in which case
// it will be run through SHA256 before bcrypt) or an object with
// properties `digest` and `algorithm` (in which case we bcrypt
// `password.digest`).
//
// The user parameter needs at least user._id and user.services


Accounts._checkPasswordUserFields = {
  _id: 1,
  services: 1
}, //
Accounts._checkPassword = (user, password) => {
  const result = {
    userId: user._id
  };
  const formattedPassword = getPasswordString(password);
  const hash = user.services.password.bcrypt;
  const hashRounds = getRoundsFromBcryptHash(hash);

  if (!bcryptCompare(formattedPassword, hash)) {
    result.error = handleError("Incorrect password", false);
  } else if (hash && Accounts._bcryptRounds() != hashRounds) {
    // The password checks out, but the user's bcrypt hash needs to be updated.
    Meteor.defer(() => {
      Meteor.users.update({
        _id: user._id
      }, {
        $set: {
          'services.password.bcrypt': bcryptHash(formattedPassword, Accounts._bcryptRounds())
        }
      });
    });
  }

  return result;
};
const checkPassword = Accounts._checkPassword; ///
/// ERROR HANDLER
///

const handleError = function (msg) {
  let throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  const error = new Meteor.Error(403, Accounts._options.ambiguousErrorMessages ? "Something went wrong. Please check your credentials." : msg);

  if (throwError) {
    throw error;
  }

  return error;
}; ///
/// LOGIN
///


Accounts._findUserByQuery = (query, options) => {
  let user = null;

  if (query.id) {
    // default field selector is added within getUserById()
    user = getUserById(query.id, options);
  } else {
    options = Accounts._addDefaultFieldSelector(options);
    let fieldName;
    let fieldValue;

    if (query.username) {
      fieldName = 'username';
      fieldValue = query.username;
    } else if (query.email) {
      fieldName = 'emails.address';
      fieldValue = query.email;
    } else {
      throw new Error("shouldn't happen (validation missed something)");
    }

    let selector = {};
    selector[fieldName] = fieldValue;
    user = Meteor.users.findOne(selector, options); // If user is not found, try a case insensitive lookup

    if (!user) {
      selector = selectorForFastCaseInsensitiveLookup(fieldName, fieldValue);
      const candidateUsers = Meteor.users.find(selector, options).fetch(); // No match if multiple candidates are found

      if (candidateUsers.length === 1) {
        user = candidateUsers[0];
      }
    }
  }

  return user;
};
/**
 * @summary Finds the user with the specified username.
 * First tries to match username case sensitively; if that fails, it
 * tries case insensitively; but if more than one user matches the case
 * insensitive search, it returns null.
 * @locus Server
 * @param {String} username The username to look for
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 * @returns {Object} A user if found, else null
 * @importFromPackage accounts-base
 */


Accounts.findUserByUsername = (username, options) => Accounts._findUserByQuery({
  username
}, options);
/**
 * @summary Finds the user with the specified email.
 * First tries to match email case sensitively; if that fails, it
 * tries case insensitively; but if more than one user matches the case
 * insensitive search, it returns null.
 * @locus Server
 * @param {String} email The email address to look for
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 * @returns {Object} A user if found, else null
 * @importFromPackage accounts-base
 */


Accounts.findUserByEmail = (email, options) => Accounts._findUserByQuery({
  email
}, options); // Generates a MongoDB selector that can be used to perform a fast case
// insensitive lookup for the given fieldName and string. Since MongoDB does
// not support case insensitive indexes, and case insensitive regex queries
// are slow, we construct a set of prefix selectors for all permutations of
// the first 4 characters ourselves. We first attempt to matching against
// these, and because 'prefix expression' regex queries do use indexes (see
// http://docs.mongodb.org/v2.6/reference/operator/query/regex/#index-use),
// this has been found to greatly improve performance (from 1200ms to 5ms in a
// test with 1.000.000 users).


const selectorForFastCaseInsensitiveLookup = (fieldName, string) => {
  // Performance seems to improve up to 4 prefix characters
  const prefix = string.substring(0, Math.min(string.length, 4));
  const orClause = generateCasePermutationsForString(prefix).map(prefixPermutation => {
    const selector = {};
    selector[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(prefixPermutation)));
    return selector;
  });
  const caseInsensitiveClause = {};
  caseInsensitiveClause[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(string), "$"), 'i');
  return {
    $and: [{
      $or: orClause
    }, caseInsensitiveClause]
  };
}; // Generates permutations of all case variations of a given string.


const generateCasePermutationsForString = string => {
  let permutations = [''];

  for (let i = 0; i < string.length; i++) {
    const ch = string.charAt(i);
    permutations = [].concat(...permutations.map(prefix => {
      const lowerCaseChar = ch.toLowerCase();
      const upperCaseChar = ch.toUpperCase(); // Don't add unneccesary permutations when ch is not a letter

      if (lowerCaseChar === upperCaseChar) {
        return [prefix + ch];
      } else {
        return [prefix + lowerCaseChar, prefix + upperCaseChar];
      }
    }));
  }

  return permutations;
};

const checkForCaseInsensitiveDuplicates = (fieldName, displayName, fieldValue, ownUserId) => {
  // Some tests need the ability to add users with the same case insensitive
  // value, hence the _skipCaseInsensitiveChecksForTest check
  const skipCheck = Object.prototype.hasOwnProperty.call(Accounts._skipCaseInsensitiveChecksForTest, fieldValue);

  if (fieldValue && !skipCheck) {
    const matchedUsers = Meteor.users.find(selectorForFastCaseInsensitiveLookup(fieldName, fieldValue), {
      fields: {
        _id: 1
      },
      // we only need a maximum of 2 users for the logic below to work
      limit: 2
    }).fetch();

    if (matchedUsers.length > 0 && ( // If we don't have a userId yet, any match we find is a duplicate
    !ownUserId || // Otherwise, check to see if there are multiple matches or a match
    // that is not us
    matchedUsers.length > 1 || matchedUsers[0]._id !== ownUserId)) {
      handleError("".concat(displayName, " already exists."));
    }
  }
}; // XXX maybe this belongs in the check package


const NonEmptyString = Match.Where(x => {
  check(x, String);
  return x.length > 0;
});
const userQueryValidator = Match.Where(user => {
  check(user, {
    id: Match.Optional(NonEmptyString),
    username: Match.Optional(NonEmptyString),
    email: Match.Optional(NonEmptyString)
  });
  if (Object.keys(user).length !== 1) throw new Match.Error("User property must have exactly one field");
  return true;
});
const passwordValidator = Match.OneOf(String, {
  digest: String,
  algorithm: String
}); // Handler to login with a password.
//
// The Meteor client sets options.password to an object with keys
// 'digest' (set to SHA256(password)) and 'algorithm' ("sha-256").
//
// For other DDP clients which don't have access to SHA, the handler
// also accepts the plaintext password in options.password as a string.
//
// (It might be nice if servers could turn the plaintext password
// option off. Or maybe it should be opt-in, not opt-out?
// Accounts.config option?)
//
// Note that neither password option is secure without SSL.
//

Accounts.registerLoginHandler("password", options => {
  if (!options.password || options.srp) return undefined; // don't handle

  check(options, {
    user: userQueryValidator,
    password: passwordValidator
  });

  const user = Accounts._findUserByQuery(options.user, {
    fields: _objectSpread({
      services: 1
    }, Accounts._checkPasswordUserFields)
  });

  if (!user) {
    handleError("User not found");
  }

  if (!user.services || !user.services.password || !(user.services.password.bcrypt || user.services.password.srp)) {
    handleError("User has no password set");
  }

  if (!user.services.password.bcrypt) {
    if (typeof options.password === "string") {
      // The client has presented a plaintext password, and the user is
      // not upgraded to bcrypt yet. We don't attempt to tell the client
      // to upgrade to bcrypt, because it might be a standalone DDP
      // client doesn't know how to do such a thing.
      const verifier = user.services.password.srp;
      const newVerifier = SRP.generateVerifier(options.password, {
        identity: verifier.identity,
        salt: verifier.salt
      });

      if (verifier.verifier !== newVerifier.verifier) {
        return {
          userId: Accounts._options.ambiguousErrorMessages ? null : user._id,
          error: handleError("Incorrect password", false)
        };
      }

      return {
        userId: user._id
      };
    } else {
      // Tell the client to use the SRP upgrade process.
      throw new Meteor.Error(400, "old password format", EJSON.stringify({
        format: 'srp',
        identity: user.services.password.srp.identity
      }));
    }
  }

  return checkPassword(user, options.password);
}); // Handler to login using the SRP upgrade path. To use this login
// handler, the client must provide:
//   - srp: H(identity + ":" + password)
//   - password: a string or an object with properties 'digest' and 'algorithm'
//
// We use `options.srp` to verify that the client knows the correct
// password without doing a full SRP flow. Once we've checked that, we
// upgrade the user to bcrypt and remove the SRP information from the
// user document.
//
// The client ends up using this login handler after trying the normal
// login handler (above), which throws an error telling the client to
// try the SRP upgrade path.
//
// XXX COMPAT WITH 0.8.1.3

Accounts.registerLoginHandler("password", options => {
  if (!options.srp || !options.password) {
    return undefined; // don't handle
  }

  check(options, {
    user: userQueryValidator,
    srp: String,
    password: passwordValidator
  });

  const user = Accounts._findUserByQuery(options.user, {
    fields: _objectSpread({
      services: 1
    }, Accounts._checkPasswordUserFields)
  });

  if (!user) {
    handleError("User not found");
  } // Check to see if another simultaneous login has already upgraded
  // the user record to bcrypt.


  if (user.services && user.services.password && user.services.password.bcrypt) {
    return checkPassword(user, options.password);
  }

  if (!(user.services && user.services.password && user.services.password.srp)) {
    handleError("User has no password set");
  }

  const v1 = user.services.password.srp.verifier;
  const v2 = SRP.generateVerifier(null, {
    hashedIdentityAndPassword: options.srp,
    salt: user.services.password.srp.salt
  }).verifier;

  if (v1 !== v2) {
    return {
      userId: Accounts._options.ambiguousErrorMessages ? null : user._id,
      error: handleError("Incorrect password", false)
    };
  } // Upgrade to bcrypt on successful login.


  const salted = hashPassword(options.password);
  Meteor.users.update(user._id, {
    $unset: {
      'services.password.srp': 1
    },
    $set: {
      'services.password.bcrypt': salted
    }
  });
  return {
    userId: user._id
  };
}); ///
/// CHANGING
///

/**
 * @summary Change a user's username. Use this instead of updating the
 * database directly. The operation will fail if there is an existing user
 * with a username only differing in case.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} newUsername A new username for the user.
 * @importFromPackage accounts-base
 */

Accounts.setUsername = (userId, newUsername) => {
  check(userId, NonEmptyString);
  check(newUsername, NonEmptyString);
  const user = getUserById(userId, {
    fields: {
      username: 1
    }
  });

  if (!user) {
    handleError("User not found");
  }

  const oldUsername = user.username; // Perform a case insensitive check for duplicates before update

  checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
  Meteor.users.update({
    _id: user._id
  }, {
    $set: {
      username: newUsername
    }
  }); // Perform another check after update, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
  } catch (ex) {
    // Undo update if the check fails
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        username: oldUsername
      }
    });
    throw ex;
  }
}; // Let the user change their own password if they know the old
// password. `oldPassword` and `newPassword` should be objects with keys
// `digest` and `algorithm` (representing the SHA256 of the password).
//
// XXX COMPAT WITH 0.8.1.3
// Like the login method, if the user hasn't been upgraded from SRP to
// bcrypt yet, then this method will throw an 'old password format'
// error. The client should call the SRP upgrade login handler and then
// retry this method again.
//
// UNLIKE the login method, there is no way to avoid getting SRP upgrade
// errors thrown. The reasoning for this is that clients using this
// method directly will need to be updated anyway because we no longer
// support the SRP flow that they would have been doing to use this
// method previously.


Meteor.methods({
  changePassword: function (oldPassword, newPassword) {
    check(oldPassword, passwordValidator);
    check(newPassword, passwordValidator);

    if (!this.userId) {
      throw new Meteor.Error(401, "Must be logged in");
    }

    const user = getUserById(this.userId, {
      fields: _objectSpread({
        services: 1
      }, Accounts._checkPasswordUserFields)
    });

    if (!user) {
      handleError("User not found");
    }

    if (!user.services || !user.services.password || !user.services.password.bcrypt && !user.services.password.srp) {
      handleError("User has no password set");
    }

    if (!user.services.password.bcrypt) {
      throw new Meteor.Error(400, "old password format", EJSON.stringify({
        format: 'srp',
        identity: user.services.password.srp.identity
      }));
    }

    const result = checkPassword(user, oldPassword);

    if (result.error) {
      throw result.error;
    }

    const hashed = hashPassword(newPassword); // It would be better if this removed ALL existing tokens and replaced
    // the token for the current connection with a new one, but that would
    // be tricky, so we'll settle for just replacing all tokens other than
    // the one for the current connection.

    const currentToken = Accounts._getLoginToken(this.connection.id);

    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        'services.password.bcrypt': hashed
      },
      $pull: {
        'services.resume.loginTokens': {
          hashedToken: {
            $ne: currentToken
          }
        }
      },
      $unset: {
        'services.password.reset': 1
      }
    });
    return {
      passwordChanged: true
    };
  }
}); // Force change the users password.

/**
 * @summary Forcibly change the password for a user.
 * @locus Server
 * @param {String} userId The id of the user to update.
 * @param {String} newPassword A new password for the user.
 * @param {Object} [options]
 * @param {Object} options.logout Logout all current connections with this userId (default: true)
 * @importFromPackage accounts-base
 */

Accounts.setPassword = (userId, newPlaintextPassword, options) => {
  options = _objectSpread({
    logout: true
  }, options);
  const user = getUserById(userId, {
    fields: {
      _id: 1
    }
  });

  if (!user) {
    throw new Meteor.Error(403, "User not found");
  }

  const update = {
    $unset: {
      'services.password.srp': 1,
      // XXX COMPAT WITH 0.8.1.3
      'services.password.reset': 1
    },
    $set: {
      'services.password.bcrypt': hashPassword(newPlaintextPassword)
    }
  };

  if (options.logout) {
    update.$unset['services.resume.loginTokens'] = 1;
  }

  Meteor.users.update({
    _id: user._id
  }, update);
}; ///
/// RESETTING VIA EMAIL
///
// Utility for plucking addresses from emails


const pluckAddresses = function () {
  let emails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return emails.map(email => email.address);
}; // Method called by a user to request a password reset email. This is
// the start of the reset process.


Meteor.methods({
  forgotPassword: options => {
    check(options, {
      email: String
    });
    const user = Accounts.findUserByEmail(options.email, {
      fields: {
        emails: 1
      }
    });

    if (!user) {
      handleError("User not found");
    }

    const emails = pluckAddresses(user.emails);
    const caseSensitiveEmail = emails.find(email => email.toLowerCase() === options.email.toLowerCase());
    Accounts.sendResetPasswordEmail(user._id, caseSensitiveEmail);
  }
});
/**
 * @summary Generates a reset token and saves it into the database.
 * @locus Server
 * @param {String} userId The id of the user to generate the reset token for.
 * @param {String} email Which address of the user to generate the reset token for. This address must be in the user's `emails` list. If `null`, defaults to the first email in the list.
 * @param {String} reason `resetPassword` or `enrollAccount`.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token} values.
 * @importFromPackage accounts-base
 */

Accounts.generateResetToken = (userId, email, reason, extraTokenData) => {
  // Make sure the user exists, and email is one of their addresses.
  // Don't limit the fields in the user object since the user is returned
  // by the function and some other fields might be used elsewhere.
  const user = getUserById(userId);

  if (!user) {
    handleError("Can't find user");
  } // pick the first email if we weren't passed an email.


  if (!email && user.emails && user.emails[0]) {
    email = user.emails[0].address;
  } // make sure we have a valid email


  if (!email || !pluckAddresses(user.emails).includes(email)) {
    handleError("No such email for user.");
  }

  const token = Random.secret();
  const tokenRecord = {
    token,
    email,
    when: new Date()
  };

  if (reason === 'resetPassword') {
    tokenRecord.reason = 'reset';
  } else if (reason === 'enrollAccount') {
    tokenRecord.reason = 'enroll';
  } else if (reason) {
    // fallback so that this function can be used for unknown reasons as well
    tokenRecord.reason = reason;
  }

  if (extraTokenData) {
    Object.assign(tokenRecord, extraTokenData);
  }

  Meteor.users.update({
    _id: user._id
  }, {
    $set: {
      'services.password.reset': tokenRecord
    }
  }); // before passing to template, update user object with new token

  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;
  return {
    email,
    user,
    token
  };
};
/**
 * @summary Generates an e-mail verification token and saves it into the database.
 * @locus Server
 * @param {String} userId The id of the user to generate the  e-mail verification token for.
 * @param {String} email Which address of the user to generate the e-mail verification token for. This address must be in the user's `emails` list. If `null`, defaults to the first unverified email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token} values.
 * @importFromPackage accounts-base
 */


Accounts.generateVerificationToken = (userId, email, extraTokenData) => {
  // Make sure the user exists, and email is one of their addresses.
  // Don't limit the fields in the user object since the user is returned
  // by the function and some other fields might be used elsewhere.
  const user = getUserById(userId);

  if (!user) {
    handleError("Can't find user");
  } // pick the first unverified email if we weren't passed an email.


  if (!email) {
    const emailRecord = (user.emails || []).find(e => !e.verified);
    email = (emailRecord || {}).address;

    if (!email) {
      handleError("That user has no unverified email addresses.");
    }
  } // make sure we have a valid email


  if (!email || !pluckAddresses(user.emails).includes(email)) {
    handleError("No such email for user.");
  }

  const token = Random.secret();
  const tokenRecord = {
    token,
    // TODO: This should probably be renamed to "email" to match reset token record.
    address: email,
    when: new Date()
  };

  if (extraTokenData) {
    Object.assign(tokenRecord, extraTokenData);
  }

  Meteor.users.update({
    _id: user._id
  }, {
    $push: {
      'services.email.verificationTokens': tokenRecord
    }
  }); // before passing to template, update user object with new token

  Meteor._ensure(user, 'services', 'email');

  if (!user.services.email.verificationTokens) {
    user.services.email.verificationTokens = [];
  }

  user.services.email.verificationTokens.push(tokenRecord);
  return {
    email,
    user,
    token
  };
};
/**
 * @summary Creates options for email sending for reset password and enroll account emails.
 * You can use this function when customizing a reset password or enroll account email sending.
 * @locus Server
 * @param {Object} email Which address of the user's to send the email to.
 * @param {Object} user The user object to generate options for.
 * @param {String} url URL to which user is directed to confirm the email.
 * @param {String} reason `resetPassword` or `enrollAccount`.
 * @returns {Object} Options which can be passed to `Email.send`.
 * @importFromPackage accounts-base
 */


Accounts.generateOptionsForEmail = (email, user, url, reason) => {
  const options = {
    to: email,
    from: Accounts.emailTemplates[reason].from ? Accounts.emailTemplates[reason].from(user) : Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates[reason].subject(user)
  };

  if (typeof Accounts.emailTemplates[reason].text === 'function') {
    options.text = Accounts.emailTemplates[reason].text(user, url);
  }

  if (typeof Accounts.emailTemplates[reason].html === 'function') {
    options.html = Accounts.emailTemplates[reason].html(user, url);
  }

  if (typeof Accounts.emailTemplates.headers === 'object') {
    options.headers = Accounts.emailTemplates.headers;
  }

  return options;
}; // send the user an email with a link that when opened allows the user
// to set a new password, without the old password.

/**
 * @summary Send an email with a link the user can use to reset their password.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */


Accounts.sendResetPasswordEmail = (userId, email, extraTokenData) => {
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateResetToken(userId, email, 'resetPassword', extraTokenData);
  const url = Accounts.urls.resetPassword(token);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'resetPassword');
  Email.send(options);
  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // send the user an email informing them that their account was created, with
// a link that when opened both marks their email as verified and forces them
// to choose their password. The email must be one of the addresses in the
// user's emails field, or undefined to pick the first email automatically.
//
// This is not called automatically. It must be called manually if you
// want to use enrollment emails.

/**
 * @summary Send an email with a link the user can use to set their initial password.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */


Accounts.sendEnrollmentEmail = (userId, email, extraTokenData) => {
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateResetToken(userId, email, 'enrollAccount', extraTokenData);
  const url = Accounts.urls.enrollAccount(token);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'enrollAccount');
  Email.send(options);
  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // Take token from sendResetPasswordEmail or sendEnrollmentEmail, change
// the users password, and log them in.


Meteor.methods({
  resetPassword: function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    const token = args[0];
    const newPassword = args[1];
    return Accounts._loginMethod(this, "resetPassword", args, "password", () => {
      check(token, String);
      check(newPassword, passwordValidator);
      const user = Meteor.users.findOne({
        "services.password.reset.token": token
      }, {
        fields: {
          services: 1,
          emails: 1
        }
      });

      if (!user) {
        throw new Meteor.Error(403, "Token expired");
      }

      const {
        when,
        reason,
        email
      } = user.services.password.reset;

      let tokenLifetimeMs = Accounts._getPasswordResetTokenLifetimeMs();

      if (reason === "enroll") {
        tokenLifetimeMs = Accounts._getPasswordEnrollTokenLifetimeMs();
      }

      const currentTimeMs = Date.now();
      if (currentTimeMs - when > tokenLifetimeMs) throw new Meteor.Error(403, "Token expired");
      if (!pluckAddresses(user.emails).includes(email)) return {
        userId: user._id,
        error: new Meteor.Error(403, "Token has invalid email address")
      };
      const hashed = hashPassword(newPassword); // NOTE: We're about to invalidate tokens on the user, who we might be
      // logged in as. Make sure to avoid logging ourselves out if this
      // happens. But also make sure not to leave the connection in a state
      // of having a bad token set if things fail.

      const oldToken = Accounts._getLoginToken(this.connection.id);

      Accounts._setLoginToken(user._id, this.connection, null);

      const resetToOldToken = () => Accounts._setLoginToken(user._id, this.connection, oldToken);

      try {
        // Update the user record by:
        // - Changing the password to the new one
        // - Forgetting about the reset token that was just used
        // - Verifying their email, since they got the password reset via email.
        const affectedRecords = Meteor.users.update({
          _id: user._id,
          'emails.address': email,
          'services.password.reset.token': token
        }, {
          $set: {
            'services.password.bcrypt': hashed,
            'emails.$.verified': true
          },
          $unset: {
            'services.password.reset': 1,
            'services.password.srp': 1
          }
        });
        if (affectedRecords !== 1) return {
          userId: user._id,
          error: new Meteor.Error(403, "Invalid email")
        };
      } catch (err) {
        resetToOldToken();
        throw err;
      } // Replace all valid login tokens with new ones (changing
      // password should invalidate existing sessions).


      Accounts._clearAllLoginTokens(user._id);

      return {
        userId: user._id
      };
    });
  }
}); ///
/// EMAIL VERIFICATION
///
// send the user an email with a link that when opened marks that
// address as verified

/**
 * @summary Send an email with a link the user can use verify their email address.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */

Accounts.sendVerificationEmail = (userId, email, extraTokenData) => {
  // XXX Also generate a link using which someone can delete this
  // account if they own said address but weren't those who created
  // this account.
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateVerificationToken(userId, email, extraTokenData);
  const url = Accounts.urls.verifyEmail(token);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'verifyEmail');
  Email.send(options);
  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // Take token from sendVerificationEmail, mark the email as verified,
// and log them in.


Meteor.methods({
  verifyEmail: function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    const token = args[0];
    return Accounts._loginMethod(this, "verifyEmail", args, "password", () => {
      check(token, String);
      const user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      }, {
        fields: {
          services: 1,
          emails: 1
        }
      });
      if (!user) throw new Meteor.Error(403, "Verify email link expired");
      const tokenRecord = user.services.email.verificationTokens.find(t => t.token == token);
      if (!tokenRecord) return {
        userId: user._id,
        error: new Meteor.Error(403, "Verify email link expired")
      };
      const emailsRecord = user.emails.find(e => e.address == tokenRecord.address);
      if (!emailsRecord) return {
        userId: user._id,
        error: new Meteor.Error(403, "Verify email link is for unknown address")
      }; // By including the address in the query, we can use 'emails.$' in the
      // modifier to get a reference to the specific object in the emails
      // array. See
      // http://www.mongodb.org/display/DOCS/Updating/#Updating-The%24positionaloperator)
      // http://www.mongodb.org/display/DOCS/Updating#Updating-%24pull

      Meteor.users.update({
        _id: user._id,
        'emails.address': tokenRecord.address
      }, {
        $set: {
          'emails.$.verified': true
        },
        $pull: {
          'services.email.verificationTokens': {
            address: tokenRecord.address
          }
        }
      });
      return {
        userId: user._id
      };
    });
  }
});
/**
 * @summary Add an email address for a user. Use this instead of directly
 * updating the database. The operation will fail if there is a different user
 * with an email only differing in case. If the specified user has an existing
 * email only differing in case however, we replace it.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} newEmail A new email address for the user.
 * @param {Boolean} [verified] Optional - whether the new email address should
 * be marked as verified. Defaults to false.
 * @importFromPackage accounts-base
 */

Accounts.addEmail = (userId, newEmail, verified) => {
  check(userId, NonEmptyString);
  check(newEmail, NonEmptyString);
  check(verified, Match.Optional(Boolean));

  if (verified === void 0) {
    verified = false;
  }

  const user = getUserById(userId, {
    fields: {
      emails: 1
    }
  });
  if (!user) throw new Meteor.Error(403, "User not found"); // Allow users to change their own email to a version with a different case
  // We don't have to call checkForCaseInsensitiveDuplicates to do a case
  // insensitive check across all emails in the database here because: (1) if
  // there is no case-insensitive duplicate between this user and other users,
  // then we are OK and (2) if this would create a conflict with other users
  // then there would already be a case-insensitive duplicate and we can't fix
  // that in this code anyway.

  const caseInsensitiveRegExp = new RegExp("^".concat(Meteor._escapeRegExp(newEmail), "$"), 'i');
  const didUpdateOwnEmail = (user.emails || []).reduce((prev, email) => {
    if (caseInsensitiveRegExp.test(email.address)) {
      Meteor.users.update({
        _id: user._id,
        'emails.address': email.address
      }, {
        $set: {
          'emails.$.address': newEmail,
          'emails.$.verified': verified
        }
      });
      return true;
    } else {
      return prev;
    }
  }, false); // In the other updates below, we have to do another call to
  // checkForCaseInsensitiveDuplicates to make sure that no conflicting values
  // were added to the database in the meantime. We don't have to do this for
  // the case where the user is updating their email address to one that is the
  // same as before, but only different because of capitalization. Read the
  // big comment above to understand why.

  if (didUpdateOwnEmail) {
    return;
  } // Perform a case insensitive check for duplicates before update


  checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);
  Meteor.users.update({
    _id: user._id
  }, {
    $addToSet: {
      emails: {
        address: newEmail,
        verified: verified
      }
    }
  }); // Perform another check after update, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);
  } catch (ex) {
    // Undo update if the check fails
    Meteor.users.update({
      _id: user._id
    }, {
      $pull: {
        emails: {
          address: newEmail
        }
      }
    });
    throw ex;
  }
};
/**
 * @summary Remove an email address for a user. Use this instead of updating
 * the database directly.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} email The email address to remove.
 * @importFromPackage accounts-base
 */


Accounts.removeEmail = (userId, email) => {
  check(userId, NonEmptyString);
  check(email, NonEmptyString);
  const user = getUserById(userId, {
    fields: {
      _id: 1
    }
  });
  if (!user) throw new Meteor.Error(403, "User not found");
  Meteor.users.update({
    _id: user._id
  }, {
    $pull: {
      emails: {
        address: email
      }
    }
  });
}; ///
/// CREATING USERS
///
// Shared createUser function called from the createUser method, both
// if originates in client or server code. Calls user provided hooks,
// does the actual user insertion.
//
// returns the user id


const createUser = options => {
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary
  // options.
  check(options, Match.ObjectIncluding({
    username: Match.Optional(String),
    email: Match.Optional(String),
    password: Match.Optional(passwordValidator)
  }));
  const {
    username,
    email,
    password
  } = options;
  if (!username && !email) throw new Meteor.Error(400, "Need to set a username or email");
  const user = {
    services: {}
  };

  if (password) {
    const hashed = hashPassword(password);
    user.services.password = {
      bcrypt: hashed
    };
  }

  if (username) user.username = username;
  if (email) user.emails = [{
    address: email,
    verified: false
  }]; // Perform a case insensitive check before insert

  checkForCaseInsensitiveDuplicates('username', 'Username', username);
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', email);
  const userId = Accounts.insertUserDoc(options, user); // Perform another check after insert, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('username', 'Username', username, userId);
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', email, userId);
  } catch (ex) {
    // Remove inserted user if the check fails
    Meteor.users.remove(userId);
    throw ex;
  }

  return userId;
}; // method for create user. Requests come from the client.


Meteor.methods({
  createUser: function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const options = args[0];
    return Accounts._loginMethod(this, "createUser", args, "password", () => {
      // createUser() above does more checking.
      check(options, Object);
      if (Accounts._options.forbidClientAccountCreation) return {
        error: new Meteor.Error(403, "Signups forbidden")
      }; // Create user. result contains id and token.

      const userId = createUser(options); // safety belt. createUser is supposed to throw on error. send 500 error
      // instead of sending a verification email with empty userid.

      if (!userId) throw new Error("createUser failed to insert new user"); // If `Accounts._options.sendVerificationEmail` is set, register
      // a token to verify the user's primary email, and send it to
      // that address.

      if (options.email && Accounts._options.sendVerificationEmail) Accounts.sendVerificationEmail(userId, options.email); // client gets logged in as the new user afterwards.

      return {
        userId: userId
      };
    });
  }
}); // Create user directly on the server.
//
// Unlike the client version, this does not log you in as this user
// after creation.
//
// returns userId or throws an error if it can't create
//
// XXX add another argument ("server options") that gets sent to onCreateUser,
// which is always empty when called from the createUser method? eg, "admin:
// true", which we want to prevent the client from setting, but which a custom
// method calling Accounts.createUser could set?
//

Accounts.createUser = (options, callback) => {
  options = _objectSpread({}, options); // XXX allow an optional callback?

  if (callback) {
    throw new Error("Accounts.createUser with callback not supported on the server yet.");
  }

  return createUser(options);
}; ///
/// PASSWORD-SPECIFIC INDEXES ON USERS
///


Meteor.users._ensureIndex('services.email.verificationTokens.token', {
  unique: true,
  sparse: true
});

Meteor.users._ensureIndex('services.password.reset.token', {
  unique: true,
  sparse: true
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-password/email_templates.js");
require("/node_modules/meteor/accounts-password/password_server.js");

/* Exports */
Package._define("accounts-password");

})();

//# sourceURL=meteor://💻app/packages/accounts-password.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtcGFzc3dvcmQvZW1haWxfdGVtcGxhdGVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1wYXNzd29yZC9wYXNzd29yZF9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiZ3JlZXQiLCJ3ZWxjb21lTXNnIiwidXNlciIsInVybCIsImdyZWV0aW5nIiwicHJvZmlsZSIsIm5hbWUiLCJBY2NvdW50cyIsImVtYWlsVGVtcGxhdGVzIiwiZnJvbSIsInNpdGVOYW1lIiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJyZXBsYWNlIiwicmVzZXRQYXNzd29yZCIsInN1YmplY3QiLCJ0ZXh0IiwidmVyaWZ5RW1haWwiLCJlbnJvbGxBY2NvdW50IiwiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsImJjcnlwdCIsIk5wbU1vZHVsZUJjcnlwdCIsImJjcnlwdEhhc2giLCJ3cmFwQXN5bmMiLCJoYXNoIiwiYmNyeXB0Q29tcGFyZSIsImNvbXBhcmUiLCJnZXRVc2VyQnlJZCIsImlkIiwib3B0aW9ucyIsInVzZXJzIiwiZmluZE9uZSIsIl9hZGREZWZhdWx0RmllbGRTZWxlY3RvciIsIl9iY3J5cHRSb3VuZHMiLCJfb3B0aW9ucyIsImJjcnlwdFJvdW5kcyIsImdldFBhc3N3b3JkU3RyaW5nIiwicGFzc3dvcmQiLCJTSEEyNTYiLCJhbGdvcml0aG0iLCJFcnJvciIsImRpZ2VzdCIsImhhc2hQYXNzd29yZCIsImdldFJvdW5kc0Zyb21CY3J5cHRIYXNoIiwicm91bmRzIiwiaGFzaFNlZ21lbnRzIiwic3BsaXQiLCJsZW5ndGgiLCJwYXJzZUludCIsIl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyIsIl9pZCIsInNlcnZpY2VzIiwiX2NoZWNrUGFzc3dvcmQiLCJyZXN1bHQiLCJ1c2VySWQiLCJmb3JtYXR0ZWRQYXNzd29yZCIsImhhc2hSb3VuZHMiLCJlcnJvciIsImhhbmRsZUVycm9yIiwiZGVmZXIiLCJ1cGRhdGUiLCIkc2V0IiwiY2hlY2tQYXNzd29yZCIsIm1zZyIsInRocm93RXJyb3IiLCJhbWJpZ3VvdXNFcnJvck1lc3NhZ2VzIiwiX2ZpbmRVc2VyQnlRdWVyeSIsInF1ZXJ5IiwiZmllbGROYW1lIiwiZmllbGRWYWx1ZSIsInVzZXJuYW1lIiwiZW1haWwiLCJzZWxlY3RvciIsInNlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cCIsImNhbmRpZGF0ZVVzZXJzIiwiZmluZCIsImZldGNoIiwiZmluZFVzZXJCeVVzZXJuYW1lIiwiZmluZFVzZXJCeUVtYWlsIiwic3RyaW5nIiwicHJlZml4Iiwic3Vic3RyaW5nIiwiTWF0aCIsIm1pbiIsIm9yQ2xhdXNlIiwiZ2VuZXJhdGVDYXNlUGVybXV0YXRpb25zRm9yU3RyaW5nIiwibWFwIiwicHJlZml4UGVybXV0YXRpb24iLCJSZWdFeHAiLCJfZXNjYXBlUmVnRXhwIiwiY2FzZUluc2Vuc2l0aXZlQ2xhdXNlIiwiJGFuZCIsIiRvciIsInBlcm11dGF0aW9ucyIsImkiLCJjaCIsImNoYXJBdCIsImNvbmNhdCIsImxvd2VyQ2FzZUNoYXIiLCJ0b0xvd2VyQ2FzZSIsInVwcGVyQ2FzZUNoYXIiLCJ0b1VwcGVyQ2FzZSIsImNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyIsImRpc3BsYXlOYW1lIiwib3duVXNlcklkIiwic2tpcENoZWNrIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0IiwibWF0Y2hlZFVzZXJzIiwiZmllbGRzIiwibGltaXQiLCJOb25FbXB0eVN0cmluZyIsIk1hdGNoIiwiV2hlcmUiLCJ4IiwiY2hlY2siLCJTdHJpbmciLCJ1c2VyUXVlcnlWYWxpZGF0b3IiLCJPcHRpb25hbCIsImtleXMiLCJwYXNzd29yZFZhbGlkYXRvciIsIk9uZU9mIiwicmVnaXN0ZXJMb2dpbkhhbmRsZXIiLCJzcnAiLCJ1bmRlZmluZWQiLCJ2ZXJpZmllciIsIm5ld1ZlcmlmaWVyIiwiU1JQIiwiZ2VuZXJhdGVWZXJpZmllciIsImlkZW50aXR5Iiwic2FsdCIsIkVKU09OIiwic3RyaW5naWZ5IiwiZm9ybWF0IiwidjEiLCJ2MiIsImhhc2hlZElkZW50aXR5QW5kUGFzc3dvcmQiLCJzYWx0ZWQiLCIkdW5zZXQiLCJzZXRVc2VybmFtZSIsIm5ld1VzZXJuYW1lIiwib2xkVXNlcm5hbWUiLCJleCIsIm1ldGhvZHMiLCJjaGFuZ2VQYXNzd29yZCIsIm9sZFBhc3N3b3JkIiwibmV3UGFzc3dvcmQiLCJoYXNoZWQiLCJjdXJyZW50VG9rZW4iLCJfZ2V0TG9naW5Ub2tlbiIsImNvbm5lY3Rpb24iLCIkcHVsbCIsImhhc2hlZFRva2VuIiwiJG5lIiwicGFzc3dvcmRDaGFuZ2VkIiwic2V0UGFzc3dvcmQiLCJuZXdQbGFpbnRleHRQYXNzd29yZCIsImxvZ291dCIsInBsdWNrQWRkcmVzc2VzIiwiZW1haWxzIiwiYWRkcmVzcyIsImZvcmdvdFBhc3N3b3JkIiwiY2FzZVNlbnNpdGl2ZUVtYWlsIiwic2VuZFJlc2V0UGFzc3dvcmRFbWFpbCIsImdlbmVyYXRlUmVzZXRUb2tlbiIsInJlYXNvbiIsImV4dHJhVG9rZW5EYXRhIiwiaW5jbHVkZXMiLCJ0b2tlbiIsIlJhbmRvbSIsInNlY3JldCIsInRva2VuUmVjb3JkIiwid2hlbiIsIkRhdGUiLCJhc3NpZ24iLCJfZW5zdXJlIiwicmVzZXQiLCJnZW5lcmF0ZVZlcmlmaWNhdGlvblRva2VuIiwiZW1haWxSZWNvcmQiLCJlIiwidmVyaWZpZWQiLCIkcHVzaCIsInZlcmlmaWNhdGlvblRva2VucyIsInB1c2giLCJnZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbCIsInRvIiwiaHRtbCIsImhlYWRlcnMiLCJyZWFsRW1haWwiLCJ1cmxzIiwiRW1haWwiLCJzZW5kIiwic2VuZEVucm9sbG1lbnRFbWFpbCIsImFyZ3MiLCJfbG9naW5NZXRob2QiLCJ0b2tlbkxpZmV0aW1lTXMiLCJfZ2V0UGFzc3dvcmRSZXNldFRva2VuTGlmZXRpbWVNcyIsIl9nZXRQYXNzd29yZEVucm9sbFRva2VuTGlmZXRpbWVNcyIsImN1cnJlbnRUaW1lTXMiLCJub3ciLCJvbGRUb2tlbiIsIl9zZXRMb2dpblRva2VuIiwicmVzZXRUb09sZFRva2VuIiwiYWZmZWN0ZWRSZWNvcmRzIiwiZXJyIiwiX2NsZWFyQWxsTG9naW5Ub2tlbnMiLCJzZW5kVmVyaWZpY2F0aW9uRW1haWwiLCJ0IiwiZW1haWxzUmVjb3JkIiwiYWRkRW1haWwiLCJuZXdFbWFpbCIsIkJvb2xlYW4iLCJjYXNlSW5zZW5zaXRpdmVSZWdFeHAiLCJkaWRVcGRhdGVPd25FbWFpbCIsInJlZHVjZSIsInByZXYiLCJ0ZXN0IiwiJGFkZFRvU2V0IiwicmVtb3ZlRW1haWwiLCJjcmVhdGVVc2VyIiwiT2JqZWN0SW5jbHVkaW5nIiwiaW5zZXJ0VXNlckRvYyIsInJlbW92ZSIsImZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbiIsImNhbGxiYWNrIiwiX2Vuc3VyZUluZGV4IiwidW5pcXVlIiwic3BhcnNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxNQUFNQSxLQUFLLEdBQUdDLFVBQVUsSUFBSSxDQUFDQyxJQUFELEVBQU9DLEdBQVAsS0FBZTtBQUNyQyxRQUFNQyxRQUFRLEdBQUlGLElBQUksQ0FBQ0csT0FBTCxJQUFnQkgsSUFBSSxDQUFDRyxPQUFMLENBQWFDLElBQTlCLG1CQUNESixJQUFJLENBQUNHLE9BQUwsQ0FBYUMsSUFEWixTQUN1QixRQUR4QztBQUVBLG1CQUFVRixRQUFWLGlCQUVKSCxVQUZJLCtDQUlKRSxHQUpJO0FBUUwsQ0FYRDtBQWFBOzs7Ozs7O0FBS0FJLFFBQVEsQ0FBQ0MsY0FBVCxHQUEwQjtBQUN4QkMsTUFBSSxFQUFFLHlDQURrQjtBQUV4QkMsVUFBUSxFQUFFQyxNQUFNLENBQUNDLFdBQVAsR0FBcUJDLE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLEVBQWlEQSxPQUFqRCxDQUF5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VUFBTSxJQUFJM0wsS0FBSixDQUFVLG9FQUFWLENBQU47QUFDRDs7QUFFRCxTQUFPc0wsVUFBVSxDQUFDak0sT0FBRCxDQUFqQjtBQUNELENBVEQsQyxDQVdBO0FBQ0E7QUFDQTs7O0FBQ0F0QixNQUFNLENBQUN1QixLQUFQLENBQWFzTSxZQUFiLENBQTBCLHlDQUExQixFQUMwQjtBQUFFQyxRQUFNLEVBQUUsSUFBVjtBQUFnQkMsUUFBTSxFQUFFO0FBQXhCLENBRDFCOztBQUVBL04sTUFBTSxDQUFDdUIsS0FBUCxDQUFhc00sWUFBYixDQUEwQiwrQkFBMUIsRUFDMEI7QUFBRUMsUUFBTSxFQUFFLElBQVY7QUFBZ0JDLFFBQU0sRUFBRTtBQUF4QixDQUQxQixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9hY2NvdW50cy1wYXNzd29yZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGdyZWV0ID0gd2VsY29tZU1zZyA9PiAodXNlciwgdXJsKSA9PiB7XG4gICAgICBjb25zdCBncmVldGluZyA9ICh1c2VyLnByb2ZpbGUgJiYgdXNlci5wcm9maWxlLm5hbWUpID9cbiAgICAgICAgICAgIChgSGVsbG8gJHt1c2VyLnByb2ZpbGUubmFtZX0sYCkgOiBcIkhlbGxvLFwiO1xuICAgICAgcmV0dXJuIGAke2dyZWV0aW5nfVxuXG4ke3dlbGNvbWVNc2d9LCBzaW1wbHkgY2xpY2sgdGhlIGxpbmsgYmVsb3cuXG5cbiR7dXJsfVxuXG5UaGFua3MuXG5gO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBPcHRpb25zIHRvIGN1c3RvbWl6ZSBlbWFpbHMgc2VudCBmcm9tIHRoZSBBY2NvdW50cyBzeXN0ZW0uXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5lbWFpbFRlbXBsYXRlcyA9IHtcbiAgZnJvbTogXCJBY2NvdW50cyBFeGFtcGxlIDxuby1yZXBseUBleGFtcGxlLmNvbT5cIixcbiAgc2l0ZU5hbWU6IE1ldGVvci5hYnNvbHV0ZVVybCgpLnJlcGxhY2UoL15odHRwcz86XFwvXFwvLywgJycpLnJlcGxhY2UoL1xcLyQvLCAnJyksXG5cbiAgcmVzZXRQYXNzd29yZDoge1xuICAgIHN1YmplY3Q6ICgpID0+IGBIb3cgdG8gcmVzZXQgeW91ciBwYXNzd29yZCBvbiAke0FjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lfWAsXG4gICAgdGV4dDogZ3JlZXQoXCJUbyByZXNldCB5b3VyIHBhc3N3b3JkXCIpLFxuICB9LFxuICB2ZXJpZnlFbWFpbDoge1xuICAgIHN1YmplY3Q6ICgpID0+IGBIb3cgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3Mgb24gJHtBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZX1gLFxuICAgIHRleHQ6IGdyZWV0KFwiVG8gdmVyaWZ5IHlvdXIgYWNjb3VudCBlbWFpbFwiKSxcbiAgfSxcbiAgZW5yb2xsQWNjb3VudDoge1xuICAgIHN1YmplY3Q6ICgpID0+IGBBbiBhY2NvdW50IGhhcyBiZWVuIGNyZWF0ZWQgZm9yIHlvdSBvbiAke0FjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lfWAsXG4gICAgdGV4dDogZ3JlZXQoXCJUbyBzdGFydCB1c2luZyB0aGUgc2VydmljZVwiKSxcbiAgfSxcbn07XG4iLCIvLy8gQkNSWVBUXG5cbmNvbnN0IGJjcnlwdCA9IE5wbU1vZHVsZUJjcnlwdDtcbmNvbnN0IGJjcnlwdEhhc2ggPSBNZXRlb3Iud3JhcEFzeW5jKGJjcnlwdC5oYXNoKTtcbmNvbnN0IGJjcnlwdENvbXBhcmUgPSBNZXRlb3Iud3JhcEFzeW5jKGJjcnlwdC5jb21wYXJlKTtcblxuLy8gVXRpbGl0eSBmb3IgZ3JhYmJpbmcgdXNlclxuY29uc3QgZ2V0VXNlckJ5SWQgPSAoaWQsIG9wdGlvbnMpID0+IE1ldGVvci51c2Vycy5maW5kT25lKGlkLCBBY2NvdW50cy5fYWRkRGVmYXVsdEZpZWxkU2VsZWN0b3Iob3B0aW9ucykpO1xuXG4vLyBVc2VyIHJlY29yZHMgaGF2ZSBhICdzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQnIGZpZWxkIG9uIHRoZW0gdG8gaG9sZFxuLy8gdGhlaXIgaGFzaGVkIHBhc3N3b3JkcyAodW5sZXNzIHRoZXkgaGF2ZSBhICdzZXJ2aWNlcy5wYXNzd29yZC5zcnAnXG4vLyBmaWVsZCwgaW4gd2hpY2ggY2FzZSB0aGV5IHdpbGwgYmUgdXBncmFkZWQgdG8gYmNyeXB0IHRoZSBuZXh0IHRpbWVcbi8vIHRoZXkgbG9nIGluKS5cbi8vXG4vLyBXaGVuIHRoZSBjbGllbnQgc2VuZHMgYSBwYXNzd29yZCB0byB0aGUgc2VydmVyLCBpdCBjYW4gZWl0aGVyIGJlIGFcbi8vIHN0cmluZyAodGhlIHBsYWludGV4dCBwYXNzd29yZCkgb3IgYW4gb2JqZWN0IHdpdGgga2V5cyAnZGlnZXN0JyBhbmRcbi8vICdhbGdvcml0aG0nIChtdXN0IGJlIFwic2hhLTI1NlwiIGZvciBub3cpLiBUaGUgTWV0ZW9yIGNsaWVudCBhbHdheXMgc2VuZHNcbi8vIHBhc3N3b3JkIG9iamVjdHMgeyBkaWdlc3Q6ICosIGFsZ29yaXRobTogXCJzaGEtMjU2XCIgfSwgYnV0IEREUCBjbGllbnRzXG4vLyB0aGF0IGRvbid0IGhhdmUgYWNjZXNzIHRvIFNIQSBjYW4ganVzdCBzZW5kIHBsYWludGV4dCBwYXNzd29yZHMgYXNcbi8vIHN0cmluZ3MuXG4vL1xuLy8gV2hlbiB0aGUgc2VydmVyIHJlY2VpdmVzIGEgcGxhaW50ZXh0IHBhc3N3b3JkIGFzIGEgc3RyaW5nLCBpdCBhbHdheXNcbi8vIGhhc2hlcyBpdCB3aXRoIFNIQTI1NiBiZWZvcmUgcGFzc2luZyBpdCBpbnRvIGJjcnlwdC4gV2hlbiB0aGUgc2VydmVyXG4vLyByZWNlaXZlcyBhIHBhc3N3b3JkIGFzIGFuIG9iamVjdCwgaXQgYXNzZXJ0cyB0aGF0IHRoZSBhbGdvcml0aG0gaXNcbi8vIFwic2hhLTI1NlwiIGFuZCB0aGVuIHBhc3NlcyB0aGUgZGlnZXN0IHRvIGJjcnlwdC5cblxuXG5BY2NvdW50cy5fYmNyeXB0Um91bmRzID0gKCkgPT4gQWNjb3VudHMuX29wdGlvbnMuYmNyeXB0Um91bmRzIHx8IDEwO1xuXG4vLyBHaXZlbiBhICdwYXNzd29yZCcgZnJvbSB0aGUgY2xpZW50LCBleHRyYWN0IHRoZSBzdHJpbmcgdGhhdCB3ZSBzaG91bGRcbi8vIGJjcnlwdC4gJ3Bhc3N3b3JkJyBjYW4gYmUgb25lIG9mOlxuLy8gIC0gU3RyaW5nICh0aGUgcGxhaW50ZXh0IHBhc3N3b3JkKVxuLy8gIC0gT2JqZWN0IHdpdGggJ2RpZ2VzdCcgYW5kICdhbGdvcml0aG0nIGtleXMuICdhbGdvcml0aG0nIG11c3QgYmUgXCJzaGEtMjU2XCIuXG4vL1xuY29uc3QgZ2V0UGFzc3dvcmRTdHJpbmcgPSBwYXNzd29yZCA9PiB7XG4gIGlmICh0eXBlb2YgcGFzc3dvcmQgPT09IFwic3RyaW5nXCIpIHtcbiAgICBwYXNzd29yZCA9IFNIQTI1NihwYXNzd29yZCk7XG4gIH0gZWxzZSB7IC8vICdwYXNzd29yZCcgaXMgYW4gb2JqZWN0XG4gICAgaWYgKHBhc3N3b3JkLmFsZ29yaXRobSAhPT0gXCJzaGEtMjU2XCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFzc3dvcmQgaGFzaCBhbGdvcml0aG0uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcIk9ubHkgJ3NoYS0yNTYnIGlzIGFsbG93ZWQuXCIpO1xuICAgIH1cbiAgICBwYXNzd29yZCA9IHBhc3N3b3JkLmRpZ2VzdDtcbiAgfVxuICByZXR1cm4gcGFzc3dvcmQ7XG59O1xuXG4vLyBVc2UgYmNyeXB0IHRvIGhhc2ggdGhlIHBhc3N3b3JkIGZvciBzdG9yYWdlIGluIHRoZSBkYXRhYmFzZS5cbi8vIGBwYXNzd29yZGAgY2FuIGJlIGEgc3RyaW5nIChpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmUgcnVuIHRocm91Z2hcbi8vIFNIQTI1NiBiZWZvcmUgYmNyeXB0KSBvciBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGBkaWdlc3RgIGFuZFxuLy8gYGFsZ29yaXRobWAgKGluIHdoaWNoIGNhc2Ugd2UgYmNyeXB0IGBwYXNzd29yZC5kaWdlc3RgKS5cbi8vXG5jb25zdCBoYXNoUGFzc3dvcmQgPSBwYXNzd29yZCA9PiB7XG4gIHBhc3N3b3JkID0gZ2V0UGFzc3dvcmRTdHJpbmcocGFzc3dvcmQpO1xuICByZXR1cm4gYmNyeXB0SGFzaChwYXNzd29yZCwgQWNjb3VudHMuX2JjcnlwdFJvdW5kcygpKTtcbn07XG5cbi8vIEV4dHJhY3QgdGhlIG51bWJlciBvZiByb3VuZHMgdXNlZCBpbiB0aGUgc3BlY2lmaWVkIGJjcnlwdCBoYXNoLlxuY29uc3QgZ2V0Um91bmRzRnJvbUJjcnlwdEhhc2ggPSBoYXNoID0+IHtcbiAgbGV0IHJvdW5kcztcbiAgaWYgKGhhc2gpIHtcbiAgICBjb25zdCBoYXNoU2VnbWVudHMgPSBoYXNoLnNwbGl0KCckJyk7XG4gICAgaWYgKGhhc2hTZWdtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICByb3VuZHMgPSBwYXJzZUludChoYXNoU2VnbWVudHNbMl0sIDEwKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcztcbn07XG5cbi8vIENoZWNrIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBhc3N3b3JkIG1hdGNoZXMgdGhlIGJjcnlwdCdlZCBwYXNzd29yZCBpblxuLy8gdGhlIGRhdGFiYXNlIHVzZXIgcmVjb3JkLiBgcGFzc3dvcmRgIGNhbiBiZSBhIHN0cmluZyAoaW4gd2hpY2ggY2FzZVxuLy8gaXQgd2lsbCBiZSBydW4gdGhyb3VnaCBTSEEyNTYgYmVmb3JlIGJjcnlwdCkgb3IgYW4gb2JqZWN0IHdpdGhcbi8vIHByb3BlcnRpZXMgYGRpZ2VzdGAgYW5kIGBhbGdvcml0aG1gIChpbiB3aGljaCBjYXNlIHdlIGJjcnlwdFxuLy8gYHBhc3N3b3JkLmRpZ2VzdGApLlxuLy9cbi8vIFRoZSB1c2VyIHBhcmFtZXRlciBuZWVkcyBhdCBsZWFzdCB1c2VyLl9pZCBhbmQgdXNlci5zZXJ2aWNlc1xuQWNjb3VudHMuX2NoZWNrUGFzc3dvcmRVc2VyRmllbGRzID0ge19pZDogMSwgc2VydmljZXM6IDF9LFxuLy9cbkFjY291bnRzLl9jaGVja1Bhc3N3b3JkID0gKHVzZXIsIHBhc3N3b3JkKSA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICB1c2VySWQ6IHVzZXIuX2lkXG4gIH07XG5cbiAgY29uc3QgZm9ybWF0dGVkUGFzc3dvcmQgPSBnZXRQYXNzd29yZFN0cmluZyhwYXNzd29yZCk7XG4gIGNvbnN0IGhhc2ggPSB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdDtcbiAgY29uc3QgaGFzaFJvdW5kcyA9IGdldFJvdW5kc0Zyb21CY3J5cHRIYXNoKGhhc2gpO1xuXG4gIGlmICghIGJjcnlwdENvbXBhcmUoZm9ybWF0dGVkUGFzc3dvcmQsIGhhc2gpKSB7XG4gICAgcmVzdWx0LmVycm9yID0gaGFuZGxlRXJyb3IoXCJJbmNvcnJlY3QgcGFzc3dvcmRcIiwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKGhhc2ggJiYgQWNjb3VudHMuX2JjcnlwdFJvdW5kcygpICE9IGhhc2hSb3VuZHMpIHtcbiAgICAvLyBUaGUgcGFzc3dvcmQgY2hlY2tzIG91dCwgYnV0IHRoZSB1c2VyJ3MgYmNyeXB0IGhhc2ggbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICBNZXRlb3IuZGVmZXIoKCkgPT4ge1xuICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7IF9pZDogdXNlci5faWQgfSwge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgJ3NlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCc6XG4gICAgICAgICAgICBiY3J5cHRIYXNoKGZvcm1hdHRlZFBhc3N3b3JkLCBBY2NvdW50cy5fYmNyeXB0Um91bmRzKCkpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5jb25zdCBjaGVja1Bhc3N3b3JkID0gQWNjb3VudHMuX2NoZWNrUGFzc3dvcmQ7XG5cbi8vL1xuLy8vIEVSUk9SIEhBTkRMRVJcbi8vL1xuY29uc3QgaGFuZGxlRXJyb3IgPSAobXNnLCB0aHJvd0Vycm9yID0gdHJ1ZSkgPT4ge1xuICBjb25zdCBlcnJvciA9IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgNDAzLFxuICAgIEFjY291bnRzLl9vcHRpb25zLmFtYmlndW91c0Vycm9yTWVzc2FnZXNcbiAgICAgID8gXCJTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCJcbiAgICAgIDogbXNnXG4gICk7XG4gIGlmICh0aHJvd0Vycm9yKSB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbiAgcmV0dXJuIGVycm9yO1xufTtcblxuLy8vXG4vLy8gTE9HSU5cbi8vL1xuXG5BY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5ID0gKHF1ZXJ5LCBvcHRpb25zKSA9PiB7XG4gIGxldCB1c2VyID0gbnVsbDtcblxuICBpZiAocXVlcnkuaWQpIHtcbiAgICAvLyBkZWZhdWx0IGZpZWxkIHNlbGVjdG9yIGlzIGFkZGVkIHdpdGhpbiBnZXRVc2VyQnlJZCgpXG4gICAgdXNlciA9IGdldFVzZXJCeUlkKHF1ZXJ5LmlkLCBvcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBvcHRpb25zID0gQWNjb3VudHMuX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKG9wdGlvbnMpO1xuICAgIGxldCBmaWVsZE5hbWU7XG4gICAgbGV0IGZpZWxkVmFsdWU7XG4gICAgaWYgKHF1ZXJ5LnVzZXJuYW1lKSB7XG4gICAgICBmaWVsZE5hbWUgPSAndXNlcm5hbWUnO1xuICAgICAgZmllbGRWYWx1ZSA9IHF1ZXJ5LnVzZXJuYW1lO1xuICAgIH0gZWxzZSBpZiAocXVlcnkuZW1haWwpIHtcbiAgICAgIGZpZWxkTmFtZSA9ICdlbWFpbHMuYWRkcmVzcyc7XG4gICAgICBmaWVsZFZhbHVlID0gcXVlcnkuZW1haWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInNob3VsZG4ndCBoYXBwZW4gKHZhbGlkYXRpb24gbWlzc2VkIHNvbWV0aGluZylcIik7XG4gICAgfVxuICAgIGxldCBzZWxlY3RvciA9IHt9O1xuICAgIHNlbGVjdG9yW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbHVlO1xuICAgIHVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZShzZWxlY3Rvciwgb3B0aW9ucyk7XG4gICAgLy8gSWYgdXNlciBpcyBub3QgZm91bmQsIHRyeSBhIGNhc2UgaW5zZW5zaXRpdmUgbG9va3VwXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cChmaWVsZE5hbWUsIGZpZWxkVmFsdWUpO1xuICAgICAgY29uc3QgY2FuZGlkYXRlVXNlcnMgPSBNZXRlb3IudXNlcnMuZmluZChzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKTtcbiAgICAgIC8vIE5vIG1hdGNoIGlmIG11bHRpcGxlIGNhbmRpZGF0ZXMgYXJlIGZvdW5kXG4gICAgICBpZiAoY2FuZGlkYXRlVXNlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHVzZXIgPSBjYW5kaWRhdGVVc2Vyc1swXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdXNlcjtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgRmluZHMgdGhlIHVzZXIgd2l0aCB0aGUgc3BlY2lmaWVkIHVzZXJuYW1lLlxuICogRmlyc3QgdHJpZXMgdG8gbWF0Y2ggdXNlcm5hbWUgY2FzZSBzZW5zaXRpdmVseTsgaWYgdGhhdCBmYWlscywgaXRcbiAqIHRyaWVzIGNhc2UgaW5zZW5zaXRpdmVseTsgYnV0IGlmIG1vcmUgdGhhbiBvbmUgdXNlciBtYXRjaGVzIHRoZSBjYXNlXG4gKiBpbnNlbnNpdGl2ZSBzZWFyY2gsIGl0IHJldHVybnMgbnVsbC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgdG8gbG9vayBmb3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHVzZXIgaWYgZm91bmQsIGVsc2UgbnVsbFxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZmluZFVzZXJCeVVzZXJuYW1lID1cbiAgKHVzZXJuYW1lLCBvcHRpb25zKSA9PiBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KHsgdXNlcm5hbWUgfSwgb3B0aW9ucyk7XG5cbi8qKlxuICogQHN1bW1hcnkgRmluZHMgdGhlIHVzZXIgd2l0aCB0aGUgc3BlY2lmaWVkIGVtYWlsLlxuICogRmlyc3QgdHJpZXMgdG8gbWF0Y2ggZW1haWwgY2FzZSBzZW5zaXRpdmVseTsgaWYgdGhhdCBmYWlscywgaXRcbiAqIHRyaWVzIGNhc2UgaW5zZW5zaXRpdmVseTsgYnV0IGlmIG1vcmUgdGhhbiBvbmUgdXNlciBtYXRjaGVzIHRoZSBjYXNlXG4gKiBpbnNlbnNpdGl2ZSBzZWFyY2gsIGl0IHJldHVybnMgbnVsbC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbWFpbCBUaGUgZW1haWwgYWRkcmVzcyB0byBsb29rIGZvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgdXNlciBpZiBmb3VuZCwgZWxzZSBudWxsXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5maW5kVXNlckJ5RW1haWwgPSBcbiAgKGVtYWlsLCBvcHRpb25zKSA9PiBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KHsgZW1haWwgfSwgb3B0aW9ucyk7XG5cbi8vIEdlbmVyYXRlcyBhIE1vbmdvREIgc2VsZWN0b3IgdGhhdCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGEgZmFzdCBjYXNlXG4vLyBpbnNlbnNpdGl2ZSBsb29rdXAgZm9yIHRoZSBnaXZlbiBmaWVsZE5hbWUgYW5kIHN0cmluZy4gU2luY2UgTW9uZ29EQiBkb2VzXG4vLyBub3Qgc3VwcG9ydCBjYXNlIGluc2Vuc2l0aXZlIGluZGV4ZXMsIGFuZCBjYXNlIGluc2Vuc2l0aXZlIHJlZ2V4IHF1ZXJpZXNcbi8vIGFyZSBzbG93LCB3ZSBjb25zdHJ1Y3QgYSBzZXQgb2YgcHJlZml4IHNlbGVjdG9ycyBmb3IgYWxsIHBlcm11dGF0aW9ucyBvZlxuLy8gdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBvdXJzZWx2ZXMuIFdlIGZpcnN0IGF0dGVtcHQgdG8gbWF0Y2hpbmcgYWdhaW5zdFxuLy8gdGhlc2UsIGFuZCBiZWNhdXNlICdwcmVmaXggZXhwcmVzc2lvbicgcmVnZXggcXVlcmllcyBkbyB1c2UgaW5kZXhlcyAoc2VlXG4vLyBodHRwOi8vZG9jcy5tb25nb2RiLm9yZy92Mi42L3JlZmVyZW5jZS9vcGVyYXRvci9xdWVyeS9yZWdleC8jaW5kZXgtdXNlKSxcbi8vIHRoaXMgaGFzIGJlZW4gZm91bmQgdG8gZ3JlYXRseSBpbXByb3ZlIHBlcmZvcm1hbmNlIChmcm9tIDEyMDBtcyB0byA1bXMgaW4gYVxuLy8gdGVzdCB3aXRoIDEuMDAwLjAwMCB1c2VycykuXG5jb25zdCBzZWxlY3RvckZvckZhc3RDYXNlSW5zZW5zaXRpdmVMb29rdXAgPSAoZmllbGROYW1lLCBzdHJpbmcpID0+IHtcbiAgLy8gUGVyZm9ybWFuY2Ugc2VlbXMgdG8gaW1wcm92ZSB1cCB0byA0IHByZWZpeCBjaGFyYWN0ZXJzXG4gIGNvbnN0IHByZWZpeCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgTWF0aC5taW4oc3RyaW5nLmxlbmd0aCwgNCkpO1xuICBjb25zdCBvckNsYXVzZSA9IGdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyhwcmVmaXgpLm1hcChcbiAgICBwcmVmaXhQZXJtdXRhdGlvbiA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IHt9O1xuICAgICAgc2VsZWN0b3JbZmllbGROYW1lXSA9XG4gICAgICAgIG5ldyBSZWdFeHAoYF4ke01ldGVvci5fZXNjYXBlUmVnRXhwKHByZWZpeFBlcm11dGF0aW9uKX1gKTtcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9KTtcbiAgY29uc3QgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlID0ge307XG4gIGNhc2VJbnNlbnNpdGl2ZUNsYXVzZVtmaWVsZE5hbWVdID1cbiAgICBuZXcgUmVnRXhwKGBeJHtNZXRlb3IuX2VzY2FwZVJlZ0V4cChzdHJpbmcpfSRgLCAnaScpXG4gIHJldHVybiB7JGFuZDogW3skb3I6IG9yQ2xhdXNlfSwgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlXX07XG59XG5cbi8vIEdlbmVyYXRlcyBwZXJtdXRhdGlvbnMgb2YgYWxsIGNhc2UgdmFyaWF0aW9ucyBvZiBhIGdpdmVuIHN0cmluZy5cbmNvbnN0IGdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyA9IHN0cmluZyA9PiB7XG4gIGxldCBwZXJtdXRhdGlvbnMgPSBbJyddO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoID0gc3RyaW5nLmNoYXJBdChpKTtcbiAgICBwZXJtdXRhdGlvbnMgPSBbXS5jb25jYXQoLi4uKHBlcm11dGF0aW9ucy5tYXAocHJlZml4ID0+IHtcbiAgICAgIGNvbnN0IGxvd2VyQ2FzZUNoYXIgPSBjaC50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgdXBwZXJDYXNlQ2hhciA9IGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgICAvLyBEb24ndCBhZGQgdW5uZWNjZXNhcnkgcGVybXV0YXRpb25zIHdoZW4gY2ggaXMgbm90IGEgbGV0dGVyXG4gICAgICBpZiAobG93ZXJDYXNlQ2hhciA9PT0gdXBwZXJDYXNlQ2hhcikge1xuICAgICAgICByZXR1cm4gW3ByZWZpeCArIGNoXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbcHJlZml4ICsgbG93ZXJDYXNlQ2hhciwgcHJlZml4ICsgdXBwZXJDYXNlQ2hhcl07XG4gICAgICB9XG4gICAgfSkpKTtcbiAgfVxuICByZXR1cm4gcGVybXV0YXRpb25zO1xufVxuXG5jb25zdCBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMgPSAoZmllbGROYW1lLCBkaXNwbGF5TmFtZSwgZmllbGRWYWx1ZSwgb3duVXNlcklkKSA9PiB7XG4gIC8vIFNvbWUgdGVzdHMgbmVlZCB0aGUgYWJpbGl0eSB0byBhZGQgdXNlcnMgd2l0aCB0aGUgc2FtZSBjYXNlIGluc2Vuc2l0aXZlXG4gIC8vIHZhbHVlLCBoZW5jZSB0aGUgX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0IGNoZWNrXG4gIGNvbnN0IHNraXBDaGVjayA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChBY2NvdW50cy5fc2tpcENhc2VJbnNlbnNpdGl2ZUNoZWNrc0ZvclRlc3QsIGZpZWxkVmFsdWUpO1xuXG4gIGlmIChmaWVsZFZhbHVlICYmICFza2lwQ2hlY2spIHtcbiAgICBjb25zdCBtYXRjaGVkVXNlcnMgPSBNZXRlb3IudXNlcnMuZmluZChcbiAgICAgIHNlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cChmaWVsZE5hbWUsIGZpZWxkVmFsdWUpLFxuICAgICAge1xuICAgICAgICBmaWVsZHM6IHtfaWQ6IDF9LFxuICAgICAgICAvLyB3ZSBvbmx5IG5lZWQgYSBtYXhpbXVtIG9mIDIgdXNlcnMgZm9yIHRoZSBsb2dpYyBiZWxvdyB0byB3b3JrXG4gICAgICAgIGxpbWl0OiAyLFxuICAgICAgfVxuICAgICkuZmV0Y2goKTtcblxuICAgIGlmIChtYXRjaGVkVXNlcnMubGVuZ3RoID4gMCAmJlxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdXNlcklkIHlldCwgYW55IG1hdGNoIHdlIGZpbmQgaXMgYSBkdXBsaWNhdGVcbiAgICAgICAgKCFvd25Vc2VySWQgfHxcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIG1hdGNoZXMgb3IgYSBtYXRjaFxuICAgICAgICAvLyB0aGF0IGlzIG5vdCB1c1xuICAgICAgICAobWF0Y2hlZFVzZXJzLmxlbmd0aCA+IDEgfHwgbWF0Y2hlZFVzZXJzWzBdLl9pZCAhPT0gb3duVXNlcklkKSkpIHtcbiAgICAgIGhhbmRsZUVycm9yKGAke2Rpc3BsYXlOYW1lfSBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIFhYWCBtYXliZSB0aGlzIGJlbG9uZ3MgaW4gdGhlIGNoZWNrIHBhY2thZ2VcbmNvbnN0IE5vbkVtcHR5U3RyaW5nID0gTWF0Y2guV2hlcmUoeCA9PiB7XG4gIGNoZWNrKHgsIFN0cmluZyk7XG4gIHJldHVybiB4Lmxlbmd0aCA+IDA7XG59KTtcblxuY29uc3QgdXNlclF1ZXJ5VmFsaWRhdG9yID0gTWF0Y2guV2hlcmUodXNlciA9PiB7XG4gIGNoZWNrKHVzZXIsIHtcbiAgICBpZDogTWF0Y2guT3B0aW9uYWwoTm9uRW1wdHlTdHJpbmcpLFxuICAgIHVzZXJuYW1lOiBNYXRjaC5PcHRpb25hbChOb25FbXB0eVN0cmluZyksXG4gICAgZW1haWw6IE1hdGNoLk9wdGlvbmFsKE5vbkVtcHR5U3RyaW5nKVxuICB9KTtcbiAgaWYgKE9iamVjdC5rZXlzKHVzZXIpLmxlbmd0aCAhPT0gMSlcbiAgICB0aHJvdyBuZXcgTWF0Y2guRXJyb3IoXCJVc2VyIHByb3BlcnR5IG11c3QgaGF2ZSBleGFjdGx5IG9uZSBmaWVsZFwiKTtcbiAgcmV0dXJuIHRydWU7XG59KTtcblxuY29uc3QgcGFzc3dvcmRWYWxpZGF0b3IgPSBNYXRjaC5PbmVPZihcbiAgU3RyaW5nLFxuICB7IGRpZ2VzdDogU3RyaW5nLCBhbGdvcml0aG06IFN0cmluZyB9XG4pO1xuXG4vLyBIYW5kbGVyIHRvIGxvZ2luIHdpdGggYSBwYXNzd29yZC5cbi8vXG4vLyBUaGUgTWV0ZW9yIGNsaWVudCBzZXRzIG9wdGlvbnMucGFzc3dvcmQgdG8gYW4gb2JqZWN0IHdpdGgga2V5c1xuLy8gJ2RpZ2VzdCcgKHNldCB0byBTSEEyNTYocGFzc3dvcmQpKSBhbmQgJ2FsZ29yaXRobScgKFwic2hhLTI1NlwiKS5cbi8vXG4vLyBGb3Igb3RoZXIgRERQIGNsaWVudHMgd2hpY2ggZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gU0hBLCB0aGUgaGFuZGxlclxuLy8gYWxzbyBhY2NlcHRzIHRoZSBwbGFpbnRleHQgcGFzc3dvcmQgaW4gb3B0aW9ucy5wYXNzd29yZCBhcyBhIHN0cmluZy5cbi8vXG4vLyAoSXQgbWlnaHQgYmUgbmljZSBpZiBzZXJ2ZXJzIGNvdWxkIHR1cm4gdGhlIHBsYWludGV4dCBwYXNzd29yZFxuLy8gb3B0aW9uIG9mZi4gT3IgbWF5YmUgaXQgc2hvdWxkIGJlIG9wdC1pbiwgbm90IG9wdC1vdXQ/XG4vLyBBY2NvdW50cy5jb25maWcgb3B0aW9uPylcbi8vXG4vLyBOb3RlIHRoYXQgbmVpdGhlciBwYXNzd29yZCBvcHRpb24gaXMgc2VjdXJlIHdpdGhvdXQgU1NMLlxuLy9cbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicGFzc3dvcmRcIiwgb3B0aW9ucyA9PiB7XG4gIGlmICghIG9wdGlvbnMucGFzc3dvcmQgfHwgb3B0aW9ucy5zcnApXG4gICAgcmV0dXJuIHVuZGVmaW5lZDsgLy8gZG9uJ3QgaGFuZGxlXG5cbiAgY2hlY2sob3B0aW9ucywge1xuICAgIHVzZXI6IHVzZXJRdWVyeVZhbGlkYXRvcixcbiAgICBwYXNzd29yZDogcGFzc3dvcmRWYWxpZGF0b3JcbiAgfSk7XG5cblxuICBjb25zdCB1c2VyID0gQWNjb3VudHMuX2ZpbmRVc2VyQnlRdWVyeShvcHRpb25zLnVzZXIsIHtmaWVsZHM6IHtcbiAgICBzZXJ2aWNlczogMSxcbiAgICAuLi5BY2NvdW50cy5fY2hlY2tQYXNzd29yZFVzZXJGaWVsZHMsXG4gIH19KTtcbiAgaWYgKCF1c2VyKSB7XG4gICAgaGFuZGxlRXJyb3IoXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgfVxuXG4gIGlmICghdXNlci5zZXJ2aWNlcyB8fCAhdXNlci5zZXJ2aWNlcy5wYXNzd29yZCB8fFxuICAgICAgISh1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCB8fCB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLnNycCkpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgaGFzIG5vIHBhc3N3b3JkIHNldFwiKTtcbiAgfVxuXG4gIGlmICghdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMucGFzc3dvcmQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIC8vIFRoZSBjbGllbnQgaGFzIHByZXNlbnRlZCBhIHBsYWludGV4dCBwYXNzd29yZCwgYW5kIHRoZSB1c2VyIGlzXG4gICAgICAvLyBub3QgdXBncmFkZWQgdG8gYmNyeXB0IHlldC4gV2UgZG9uJ3QgYXR0ZW1wdCB0byB0ZWxsIHRoZSBjbGllbnRcbiAgICAgIC8vIHRvIHVwZ3JhZGUgdG8gYmNyeXB0LCBiZWNhdXNlIGl0IG1pZ2h0IGJlIGEgc3RhbmRhbG9uZSBERFBcbiAgICAgIC8vIGNsaWVudCBkb2Vzbid0IGtub3cgaG93IHRvIGRvIHN1Y2ggYSB0aGluZy5cbiAgICAgIGNvbnN0IHZlcmlmaWVyID0gdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5zcnA7XG4gICAgICBjb25zdCBuZXdWZXJpZmllciA9IFNSUC5nZW5lcmF0ZVZlcmlmaWVyKG9wdGlvbnMucGFzc3dvcmQsIHtcbiAgICAgICAgaWRlbnRpdHk6IHZlcmlmaWVyLmlkZW50aXR5LCBzYWx0OiB2ZXJpZmllci5zYWx0fSk7XG5cbiAgICAgIGlmICh2ZXJpZmllci52ZXJpZmllciAhPT0gbmV3VmVyaWZpZXIudmVyaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1c2VySWQ6IEFjY291bnRzLl9vcHRpb25zLmFtYmlndW91c0Vycm9yTWVzc2FnZXMgPyBudWxsIDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IGhhbmRsZUVycm9yKFwiSW5jb3JyZWN0IHBhc3N3b3JkXCIsIGZhbHNlKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge3VzZXJJZDogdXNlci5faWR9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUZWxsIHRoZSBjbGllbnQgdG8gdXNlIHRoZSBTUlAgdXBncmFkZSBwcm9jZXNzLlxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsIFwib2xkIHBhc3N3b3JkIGZvcm1hdFwiLCBFSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBmb3JtYXQ6ICdzcnAnLFxuICAgICAgICBpZGVudGl0eTogdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5zcnAuaWRlbnRpdHlcbiAgICAgIH0pKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2hlY2tQYXNzd29yZChcbiAgICB1c2VyLFxuICAgIG9wdGlvbnMucGFzc3dvcmRcbiAgKTtcbn0pO1xuXG4vLyBIYW5kbGVyIHRvIGxvZ2luIHVzaW5nIHRoZSBTUlAgdXBncmFkZSBwYXRoLiBUbyB1c2UgdGhpcyBsb2dpblxuLy8gaGFuZGxlciwgdGhlIGNsaWVudCBtdXN0IHByb3ZpZGU6XG4vLyAgIC0gc3JwOiBIKGlkZW50aXR5ICsgXCI6XCIgKyBwYXNzd29yZClcbi8vICAgLSBwYXNzd29yZDogYSBzdHJpbmcgb3IgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyAnZGlnZXN0JyBhbmQgJ2FsZ29yaXRobSdcbi8vXG4vLyBXZSB1c2UgYG9wdGlvbnMuc3JwYCB0byB2ZXJpZnkgdGhhdCB0aGUgY2xpZW50IGtub3dzIHRoZSBjb3JyZWN0XG4vLyBwYXNzd29yZCB3aXRob3V0IGRvaW5nIGEgZnVsbCBTUlAgZmxvdy4gT25jZSB3ZSd2ZSBjaGVja2VkIHRoYXQsIHdlXG4vLyB1cGdyYWRlIHRoZSB1c2VyIHRvIGJjcnlwdCBhbmQgcmVtb3ZlIHRoZSBTUlAgaW5mb3JtYXRpb24gZnJvbSB0aGVcbi8vIHVzZXIgZG9jdW1lbnQuXG4vL1xuLy8gVGhlIGNsaWVudCBlbmRzIHVwIHVzaW5nIHRoaXMgbG9naW4gaGFuZGxlciBhZnRlciB0cnlpbmcgdGhlIG5vcm1hbFxuLy8gbG9naW4gaGFuZGxlciAoYWJvdmUpLCB3aGljaCB0aHJvd3MgYW4gZXJyb3IgdGVsbGluZyB0aGUgY2xpZW50IHRvXG4vLyB0cnkgdGhlIFNSUCB1cGdyYWRlIHBhdGguXG4vL1xuLy8gWFhYIENPTVBBVCBXSVRIIDAuOC4xLjNcbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicGFzc3dvcmRcIiwgb3B0aW9ucyA9PiB7XG4gIGlmICghb3B0aW9ucy5zcnAgfHwgIW9wdGlvbnMucGFzc3dvcmQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBkb24ndCBoYW5kbGVcbiAgfVxuXG4gIGNoZWNrKG9wdGlvbnMsIHtcbiAgICB1c2VyOiB1c2VyUXVlcnlWYWxpZGF0b3IsXG4gICAgc3JwOiBTdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkVmFsaWRhdG9yXG4gIH0pO1xuXG4gIGNvbnN0IHVzZXIgPSBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KG9wdGlvbnMudXNlciwge2ZpZWxkczoge1xuICAgIHNlcnZpY2VzOiAxLFxuICAgIC4uLkFjY291bnRzLl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyxcbiAgfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgbm90IGZvdW5kXCIpO1xuICB9XG5cbiAgLy8gQ2hlY2sgdG8gc2VlIGlmIGFub3RoZXIgc2ltdWx0YW5lb3VzIGxvZ2luIGhhcyBhbHJlYWR5IHVwZ3JhZGVkXG4gIC8vIHRoZSB1c2VyIHJlY29yZCB0byBiY3J5cHQuXG4gIGlmICh1c2VyLnNlcnZpY2VzICYmIHVzZXIuc2VydmljZXMucGFzc3dvcmQgJiYgdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQpIHtcbiAgICByZXR1cm4gY2hlY2tQYXNzd29yZCh1c2VyLCBvcHRpb25zLnBhc3N3b3JkKTtcbiAgfVxuXG4gIGlmICghKHVzZXIuc2VydmljZXMgJiYgdXNlci5zZXJ2aWNlcy5wYXNzd29yZCAmJiB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLnNycCkpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgaGFzIG5vIHBhc3N3b3JkIHNldFwiKTtcbiAgfVxuXG4gIGNvbnN0IHYxID0gdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5zcnAudmVyaWZpZXI7XG4gIGNvbnN0IHYyID0gU1JQLmdlbmVyYXRlVmVyaWZpZXIoXG4gICAgbnVsbCxcbiAgICB7XG4gICAgICBoYXNoZWRJZGVudGl0eUFuZFBhc3N3b3JkOiBvcHRpb25zLnNycCxcbiAgICAgIHNhbHQ6IHVzZXIuc2VydmljZXMucGFzc3dvcmQuc3JwLnNhbHRcbiAgICB9XG4gICkudmVyaWZpZXI7XG4gIGlmICh2MSAhPT0gdjIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcklkOiBBY2NvdW50cy5fb3B0aW9ucy5hbWJpZ3VvdXNFcnJvck1lc3NhZ2VzID8gbnVsbCA6IHVzZXIuX2lkLFxuICAgICAgZXJyb3I6IGhhbmRsZUVycm9yKFwiSW5jb3JyZWN0IHBhc3N3b3JkXCIsIGZhbHNlKVxuICAgIH07XG4gIH1cblxuICAvLyBVcGdyYWRlIHRvIGJjcnlwdCBvbiBzdWNjZXNzZnVsIGxvZ2luLlxuICBjb25zdCBzYWx0ZWQgPSBoYXNoUGFzc3dvcmQob3B0aW9ucy5wYXNzd29yZCk7XG4gIE1ldGVvci51c2Vycy51cGRhdGUoXG4gICAgdXNlci5faWQsXG4gICAge1xuICAgICAgJHVuc2V0OiB7ICdzZXJ2aWNlcy5wYXNzd29yZC5zcnAnOiAxIH0sXG4gICAgICAkc2V0OiB7ICdzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQnOiBzYWx0ZWQgfVxuICAgIH1cbiAgKTtcblxuICByZXR1cm4ge3VzZXJJZDogdXNlci5faWR9O1xufSk7XG5cblxuLy8vXG4vLy8gQ0hBTkdJTkdcbi8vL1xuXG4vKipcbiAqIEBzdW1tYXJ5IENoYW5nZSBhIHVzZXIncyB1c2VybmFtZS4gVXNlIHRoaXMgaW5zdGVhZCBvZiB1cGRhdGluZyB0aGVcbiAqIGRhdGFiYXNlIGRpcmVjdGx5LiBUaGUgb3BlcmF0aW9uIHdpbGwgZmFpbCBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyB1c2VyXG4gKiB3aXRoIGEgdXNlcm5hbWUgb25seSBkaWZmZXJpbmcgaW4gY2FzZS5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWQgVGhlIElEIG9mIHRoZSB1c2VyIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuZXdVc2VybmFtZSBBIG5ldyB1c2VybmFtZSBmb3IgdGhlIHVzZXIuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZXRVc2VybmFtZSA9ICh1c2VySWQsIG5ld1VzZXJuYW1lKSA9PiB7XG4gIGNoZWNrKHVzZXJJZCwgTm9uRW1wdHlTdHJpbmcpO1xuICBjaGVjayhuZXdVc2VybmFtZSwgTm9uRW1wdHlTdHJpbmcpO1xuXG4gIGNvbnN0IHVzZXIgPSBnZXRVc2VyQnlJZCh1c2VySWQsIHtmaWVsZHM6IHtcbiAgICB1c2VybmFtZTogMSxcbiAgfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgbm90IGZvdW5kXCIpO1xuICB9XG5cbiAgY29uc3Qgb2xkVXNlcm5hbWUgPSB1c2VyLnVzZXJuYW1lO1xuXG4gIC8vIFBlcmZvcm0gYSBjYXNlIGluc2Vuc2l0aXZlIGNoZWNrIGZvciBkdXBsaWNhdGVzIGJlZm9yZSB1cGRhdGVcbiAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCd1c2VybmFtZScsICdVc2VybmFtZScsIG5ld1VzZXJuYW1lLCB1c2VyLl9pZCk7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sIHskc2V0OiB7dXNlcm5hbWU6IG5ld1VzZXJuYW1lfX0pO1xuXG4gIC8vIFBlcmZvcm0gYW5vdGhlciBjaGVjayBhZnRlciB1cGRhdGUsIGluIGNhc2UgYSBtYXRjaGluZyB1c2VyIGhhcyBiZWVuXG4gIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICB0cnkge1xuICAgIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcygndXNlcm5hbWUnLCAnVXNlcm5hbWUnLCBuZXdVc2VybmFtZSwgdXNlci5faWQpO1xuICB9IGNhdGNoIChleCkge1xuICAgIC8vIFVuZG8gdXBkYXRlIGlmIHRoZSBjaGVjayBmYWlsc1xuICAgIE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlci5faWR9LCB7JHNldDoge3VzZXJuYW1lOiBvbGRVc2VybmFtZX19KTtcbiAgICB0aHJvdyBleDtcbiAgfVxufTtcblxuLy8gTGV0IHRoZSB1c2VyIGNoYW5nZSB0aGVpciBvd24gcGFzc3dvcmQgaWYgdGhleSBrbm93IHRoZSBvbGRcbi8vIHBhc3N3b3JkLiBgb2xkUGFzc3dvcmRgIGFuZCBgbmV3UGFzc3dvcmRgIHNob3VsZCBiZSBvYmplY3RzIHdpdGgga2V5c1xuLy8gYGRpZ2VzdGAgYW5kIGBhbGdvcml0aG1gIChyZXByZXNlbnRpbmcgdGhlIFNIQTI1NiBvZiB0aGUgcGFzc3dvcmQpLlxuLy9cbi8vIFhYWCBDT01QQVQgV0lUSCAwLjguMS4zXG4vLyBMaWtlIHRoZSBsb2dpbiBtZXRob2QsIGlmIHRoZSB1c2VyIGhhc24ndCBiZWVuIHVwZ3JhZGVkIGZyb20gU1JQIHRvXG4vLyBiY3J5cHQgeWV0LCB0aGVuIHRoaXMgbWV0aG9kIHdpbGwgdGhyb3cgYW4gJ29sZCBwYXNzd29yZCBmb3JtYXQnXG4vLyBlcnJvci4gVGhlIGNsaWVudCBzaG91bGQgY2FsbCB0aGUgU1JQIHVwZ3JhZGUgbG9naW4gaGFuZGxlciBhbmQgdGhlblxuLy8gcmV0cnkgdGhpcyBtZXRob2QgYWdhaW4uXG4vL1xuLy8gVU5MSUtFIHRoZSBsb2dpbiBtZXRob2QsIHRoZXJlIGlzIG5vIHdheSB0byBhdm9pZCBnZXR0aW5nIFNSUCB1cGdyYWRlXG4vLyBlcnJvcnMgdGhyb3duLiBUaGUgcmVhc29uaW5nIGZvciB0aGlzIGlzIHRoYXQgY2xpZW50cyB1c2luZyB0aGlzXG4vLyBtZXRob2QgZGlyZWN0bHkgd2lsbCBuZWVkIHRvIGJlIHVwZGF0ZWQgYW55d2F5IGJlY2F1c2Ugd2Ugbm8gbG9uZ2VyXG4vLyBzdXBwb3J0IHRoZSBTUlAgZmxvdyB0aGF0IHRoZXkgd291bGQgaGF2ZSBiZWVuIGRvaW5nIHRvIHVzZSB0aGlzXG4vLyBtZXRob2QgcHJldmlvdXNseS5cbk1ldGVvci5tZXRob2RzKHtjaGFuZ2VQYXNzd29yZDogZnVuY3Rpb24gKG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICBjaGVjayhvbGRQYXNzd29yZCwgcGFzc3dvcmRWYWxpZGF0b3IpO1xuICBjaGVjayhuZXdQYXNzd29yZCwgcGFzc3dvcmRWYWxpZGF0b3IpO1xuXG4gIGlmICghdGhpcy51c2VySWQpIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMSwgXCJNdXN0IGJlIGxvZ2dlZCBpblwiKTtcbiAgfVxuXG4gIGNvbnN0IHVzZXIgPSBnZXRVc2VyQnlJZCh0aGlzLnVzZXJJZCwge2ZpZWxkczoge1xuICAgIHNlcnZpY2VzOiAxLFxuICAgIC4uLkFjY291bnRzLl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyxcbiAgfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgbm90IGZvdW5kXCIpO1xuICB9XG5cbiAgaWYgKCF1c2VyLnNlcnZpY2VzIHx8ICF1c2VyLnNlcnZpY2VzLnBhc3N3b3JkIHx8XG4gICAgICAoIXVzZXIuc2VydmljZXMucGFzc3dvcmQuYmNyeXB0ICYmICF1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLnNycCkpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgaGFzIG5vIHBhc3N3b3JkIHNldFwiKTtcbiAgfVxuXG4gIGlmICghIHVzZXIuc2VydmljZXMucGFzc3dvcmQuYmNyeXB0KSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsIFwib2xkIHBhc3N3b3JkIGZvcm1hdFwiLCBFSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgZm9ybWF0OiAnc3JwJyxcbiAgICAgIGlkZW50aXR5OiB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLnNycC5pZGVudGl0eVxuICAgIH0pKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGNoZWNrUGFzc3dvcmQodXNlciwgb2xkUGFzc3dvcmQpO1xuICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICB9XG5cbiAgY29uc3QgaGFzaGVkID0gaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTtcblxuICAvLyBJdCB3b3VsZCBiZSBiZXR0ZXIgaWYgdGhpcyByZW1vdmVkIEFMTCBleGlzdGluZyB0b2tlbnMgYW5kIHJlcGxhY2VkXG4gIC8vIHRoZSB0b2tlbiBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvbiB3aXRoIGEgbmV3IG9uZSwgYnV0IHRoYXQgd291bGRcbiAgLy8gYmUgdHJpY2t5LCBzbyB3ZSdsbCBzZXR0bGUgZm9yIGp1c3QgcmVwbGFjaW5nIGFsbCB0b2tlbnMgb3RoZXIgdGhhblxuICAvLyB0aGUgb25lIGZvciB0aGUgY3VycmVudCBjb25uZWN0aW9uLlxuICBjb25zdCBjdXJyZW50VG9rZW4gPSBBY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICBNZXRlb3IudXNlcnMudXBkYXRlKFxuICAgIHsgX2lkOiB0aGlzLnVzZXJJZCB9LFxuICAgIHtcbiAgICAgICRzZXQ6IHsgJ3NlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCc6IGhhc2hlZCB9LFxuICAgICAgJHB1bGw6IHtcbiAgICAgICAgJ3NlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucyc6IHsgaGFzaGVkVG9rZW46IHsgJG5lOiBjdXJyZW50VG9rZW4gfSB9XG4gICAgICB9LFxuICAgICAgJHVuc2V0OiB7ICdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldCc6IDEgfVxuICAgIH1cbiAgKTtcblxuICByZXR1cm4ge3Bhc3N3b3JkQ2hhbmdlZDogdHJ1ZX07XG59fSk7XG5cblxuLy8gRm9yY2UgY2hhbmdlIHRoZSB1c2VycyBwYXNzd29yZC5cblxuLyoqXG4gKiBAc3VtbWFyeSBGb3JjaWJseSBjaGFuZ2UgdGhlIHBhc3N3b3JkIGZvciBhIHVzZXIuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3UGFzc3dvcmQgQSBuZXcgcGFzc3dvcmQgZm9yIHRoZSB1c2VyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMubG9nb3V0IExvZ291dCBhbGwgY3VycmVudCBjb25uZWN0aW9ucyB3aXRoIHRoaXMgdXNlcklkIChkZWZhdWx0OiB0cnVlKVxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuc2V0UGFzc3dvcmQgPSAodXNlcklkLCBuZXdQbGFpbnRleHRQYXNzd29yZCwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0geyBsb2dvdXQ6IHRydWUgLCAuLi5vcHRpb25zIH07XG5cbiAgY29uc3QgdXNlciA9IGdldFVzZXJCeUlkKHVzZXJJZCwge2ZpZWxkczoge19pZDogMX19KTtcbiAgaWYgKCF1c2VyKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG4gIH1cblxuICBjb25zdCB1cGRhdGUgPSB7XG4gICAgJHVuc2V0OiB7XG4gICAgICAnc2VydmljZXMucGFzc3dvcmQuc3JwJzogMSwgLy8gWFhYIENPTVBBVCBXSVRIIDAuOC4xLjNcbiAgICAgICdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldCc6IDFcbiAgICB9LFxuICAgICRzZXQ6IHsnc2VydmljZXMucGFzc3dvcmQuYmNyeXB0JzogaGFzaFBhc3N3b3JkKG5ld1BsYWludGV4dFBhc3N3b3JkKX1cbiAgfTtcblxuICBpZiAob3B0aW9ucy5sb2dvdXQpIHtcbiAgICB1cGRhdGUuJHVuc2V0WydzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMnXSA9IDE7XG4gIH1cblxuICBNZXRlb3IudXNlcnMudXBkYXRlKHtfaWQ6IHVzZXIuX2lkfSwgdXBkYXRlKTtcbn07XG5cblxuLy8vXG4vLy8gUkVTRVRUSU5HIFZJQSBFTUFJTFxuLy8vXG5cbi8vIFV0aWxpdHkgZm9yIHBsdWNraW5nIGFkZHJlc3NlcyBmcm9tIGVtYWlsc1xuY29uc3QgcGx1Y2tBZGRyZXNzZXMgPSAoZW1haWxzID0gW10pID0+IGVtYWlscy5tYXAoZW1haWwgPT4gZW1haWwuYWRkcmVzcyk7XG5cbi8vIE1ldGhvZCBjYWxsZWQgYnkgYSB1c2VyIHRvIHJlcXVlc3QgYSBwYXNzd29yZCByZXNldCBlbWFpbC4gVGhpcyBpc1xuLy8gdGhlIHN0YXJ0IG9mIHRoZSByZXNldCBwcm9jZXNzLlxuTWV0ZW9yLm1ldGhvZHMoe2ZvcmdvdFBhc3N3b3JkOiBvcHRpb25zID0+IHtcbiAgY2hlY2sob3B0aW9ucywge2VtYWlsOiBTdHJpbmd9KTtcblxuICBjb25zdCB1c2VyID0gQWNjb3VudHMuZmluZFVzZXJCeUVtYWlsKG9wdGlvbnMuZW1haWwsIHtmaWVsZHM6IHtlbWFpbHM6IDF9fSk7XG4gIGlmICghdXNlcikge1xuICAgIGhhbmRsZUVycm9yKFwiVXNlciBub3QgZm91bmRcIik7XG4gIH1cblxuICBjb25zdCBlbWFpbHMgPSBwbHVja0FkZHJlc3Nlcyh1c2VyLmVtYWlscyk7XG4gIGNvbnN0IGNhc2VTZW5zaXRpdmVFbWFpbCA9IGVtYWlscy5maW5kKFxuICAgIGVtYWlsID0+IGVtYWlsLnRvTG93ZXJDYXNlKCkgPT09IG9wdGlvbnMuZW1haWwudG9Mb3dlckNhc2UoKVxuICApO1xuXG4gIEFjY291bnRzLnNlbmRSZXNldFBhc3N3b3JkRW1haWwodXNlci5faWQsIGNhc2VTZW5zaXRpdmVFbWFpbCk7XG59fSk7XG5cbi8qKlxuICogQHN1bW1hcnkgR2VuZXJhdGVzIGEgcmVzZXQgdG9rZW4gYW5kIHNhdmVzIGl0IGludG8gdGhlIGRhdGFiYXNlLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gZ2VuZXJhdGUgdGhlIHJlc2V0IHRva2VuIGZvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBlbWFpbCBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyIHRvIGdlbmVyYXRlIHRoZSByZXNldCB0b2tlbiBmb3IuIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gSWYgYG51bGxgLCBkZWZhdWx0cyB0byB0aGUgZmlyc3QgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVhc29uIGByZXNldFBhc3N3b3JkYCBvciBgZW5yb2xsQWNjb3VudGAuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbn0gdmFsdWVzLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZ2VuZXJhdGVSZXNldFRva2VuID0gKHVzZXJJZCwgZW1haWwsIHJlYXNvbiwgZXh0cmFUb2tlbkRhdGEpID0+IHtcbiAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGV4aXN0cywgYW5kIGVtYWlsIGlzIG9uZSBvZiB0aGVpciBhZGRyZXNzZXMuXG4gIC8vIERvbid0IGxpbWl0IHRoZSBmaWVsZHMgaW4gdGhlIHVzZXIgb2JqZWN0IHNpbmNlIHRoZSB1c2VyIGlzIHJldHVybmVkXG4gIC8vIGJ5IHRoZSBmdW5jdGlvbiBhbmQgc29tZSBvdGhlciBmaWVsZHMgbWlnaHQgYmUgdXNlZCBlbHNld2hlcmUuXG4gIGNvbnN0IHVzZXIgPSBnZXRVc2VyQnlJZCh1c2VySWQpO1xuICBpZiAoIXVzZXIpIHtcbiAgICBoYW5kbGVFcnJvcihcIkNhbid0IGZpbmQgdXNlclwiKTtcbiAgfVxuXG4gIC8vIHBpY2sgdGhlIGZpcnN0IGVtYWlsIGlmIHdlIHdlcmVuJ3QgcGFzc2VkIGFuIGVtYWlsLlxuICBpZiAoIWVtYWlsICYmIHVzZXIuZW1haWxzICYmIHVzZXIuZW1haWxzWzBdKSB7XG4gICAgZW1haWwgPSB1c2VyLmVtYWlsc1swXS5hZGRyZXNzO1xuICB9XG5cbiAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSB2YWxpZCBlbWFpbFxuICBpZiAoIWVtYWlsIHx8XG4gICAgIShwbHVja0FkZHJlc3Nlcyh1c2VyLmVtYWlscykuaW5jbHVkZXMoZW1haWwpKSkge1xuICAgIGhhbmRsZUVycm9yKFwiTm8gc3VjaCBlbWFpbCBmb3IgdXNlci5cIik7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IFJhbmRvbS5zZWNyZXQoKTtcbiAgY29uc3QgdG9rZW5SZWNvcmQgPSB7XG4gICAgdG9rZW4sXG4gICAgZW1haWwsXG4gICAgd2hlbjogbmV3IERhdGUoKVxuICB9O1xuXG4gIGlmIChyZWFzb24gPT09ICdyZXNldFBhc3N3b3JkJykge1xuICAgIHRva2VuUmVjb3JkLnJlYXNvbiA9ICdyZXNldCc7XG4gIH0gZWxzZSBpZiAocmVhc29uID09PSAnZW5yb2xsQWNjb3VudCcpIHtcbiAgICB0b2tlblJlY29yZC5yZWFzb24gPSAnZW5yb2xsJztcbiAgfSBlbHNlIGlmIChyZWFzb24pIHtcbiAgICAvLyBmYWxsYmFjayBzbyB0aGF0IHRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgZm9yIHVua25vd24gcmVhc29ucyBhcyB3ZWxsXG4gICAgdG9rZW5SZWNvcmQucmVhc29uID0gcmVhc29uO1xuICB9XG5cbiAgaWYgKGV4dHJhVG9rZW5EYXRhKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0b2tlblJlY29yZCwgZXh0cmFUb2tlbkRhdGEpO1xuICB9XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sIHskc2V0OiB7XG4gICAgJ3NlcnZpY2VzLnBhc3N3b3JkLnJlc2V0JzogdG9rZW5SZWNvcmRcbiAgfX0pO1xuXG4gIC8vIGJlZm9yZSBwYXNzaW5nIHRvIHRlbXBsYXRlLCB1cGRhdGUgdXNlciBvYmplY3Qgd2l0aCBuZXcgdG9rZW5cbiAgTWV0ZW9yLl9lbnN1cmUodXNlciwgJ3NlcnZpY2VzJywgJ3Bhc3N3b3JkJykucmVzZXQgPSB0b2tlblJlY29yZDtcblxuICByZXR1cm4ge2VtYWlsLCB1c2VyLCB0b2tlbn07XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEdlbmVyYXRlcyBhbiBlLW1haWwgdmVyaWZpY2F0aW9uIHRva2VuIGFuZCBzYXZlcyBpdCBpbnRvIHRoZSBkYXRhYmFzZS5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWQgVGhlIGlkIG9mIHRoZSB1c2VyIHRvIGdlbmVyYXRlIHRoZSAgZS1tYWlsIHZlcmlmaWNhdGlvbiB0b2tlbiBmb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gZW1haWwgV2hpY2ggYWRkcmVzcyBvZiB0aGUgdXNlciB0byBnZW5lcmF0ZSB0aGUgZS1tYWlsIHZlcmlmaWNhdGlvbiB0b2tlbiBmb3IuIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gSWYgYG51bGxgLCBkZWZhdWx0cyB0byB0aGUgZmlyc3QgdW52ZXJpZmllZCBlbWFpbCBpbiB0aGUgbGlzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFUb2tlbkRhdGFdIE9wdGlvbmFsIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBhZGRlZCBpbnRvIHRoZSB0b2tlbiByZWNvcmQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCB7ZW1haWwsIHVzZXIsIHRva2VufSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5nZW5lcmF0ZVZlcmlmaWNhdGlvblRva2VuID0gKHVzZXJJZCwgZW1haWwsIGV4dHJhVG9rZW5EYXRhKSA9PiB7XG4gIC8vIE1ha2Ugc3VyZSB0aGUgdXNlciBleGlzdHMsIGFuZCBlbWFpbCBpcyBvbmUgb2YgdGhlaXIgYWRkcmVzc2VzLlxuICAvLyBEb24ndCBsaW1pdCB0aGUgZmllbGRzIGluIHRoZSB1c2VyIG9iamVjdCBzaW5jZSB0aGUgdXNlciBpcyByZXR1cm5lZFxuICAvLyBieSB0aGUgZnVuY3Rpb24gYW5kIHNvbWUgb3RoZXIgZmllbGRzIG1pZ2h0IGJlIHVzZWQgZWxzZXdoZXJlLlxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkKTtcbiAgaWYgKCF1c2VyKSB7XG4gICAgaGFuZGxlRXJyb3IoXCJDYW4ndCBmaW5kIHVzZXJcIik7XG4gIH1cblxuICAvLyBwaWNrIHRoZSBmaXJzdCB1bnZlcmlmaWVkIGVtYWlsIGlmIHdlIHdlcmVuJ3QgcGFzc2VkIGFuIGVtYWlsLlxuICBpZiAoIWVtYWlsKSB7XG4gICAgY29uc3QgZW1haWxSZWNvcmQgPSAodXNlci5lbWFpbHMgfHwgW10pLmZpbmQoZSA9PiAhZS52ZXJpZmllZCk7XG4gICAgZW1haWwgPSAoZW1haWxSZWNvcmQgfHwge30pLmFkZHJlc3M7XG5cbiAgICBpZiAoIWVtYWlsKSB7XG4gICAgICBoYW5kbGVFcnJvcihcIlRoYXQgdXNlciBoYXMgbm8gdW52ZXJpZmllZCBlbWFpbCBhZGRyZXNzZXMuXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgdmFsaWQgZW1haWxcbiAgaWYgKCFlbWFpbCB8fFxuICAgICEocGx1Y2tBZGRyZXNzZXModXNlci5lbWFpbHMpLmluY2x1ZGVzKGVtYWlsKSkpIHtcbiAgICBoYW5kbGVFcnJvcihcIk5vIHN1Y2ggZW1haWwgZm9yIHVzZXIuXCIpO1xuICB9XG5cbiAgY29uc3QgdG9rZW4gPSBSYW5kb20uc2VjcmV0KCk7XG4gIGNvbnN0IHRva2VuUmVjb3JkID0ge1xuICAgIHRva2VuLFxuICAgIC8vIFRPRE86IFRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgdG8gXCJlbWFpbFwiIHRvIG1hdGNoIHJlc2V0IHRva2VuIHJlY29yZC5cbiAgICBhZGRyZXNzOiBlbWFpbCxcbiAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gIH07XG5cbiAgaWYgKGV4dHJhVG9rZW5EYXRhKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0b2tlblJlY29yZCwgZXh0cmFUb2tlbkRhdGEpO1xuICB9XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sIHskcHVzaDoge1xuICAgICdzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMnOiB0b2tlblJlY29yZFxuICB9fSk7XG5cbiAgLy8gYmVmb3JlIHBhc3NpbmcgdG8gdGVtcGxhdGUsIHVwZGF0ZSB1c2VyIG9iamVjdCB3aXRoIG5ldyB0b2tlblxuICBNZXRlb3IuX2Vuc3VyZSh1c2VyLCAnc2VydmljZXMnLCAnZW1haWwnKTtcbiAgaWYgKCF1c2VyLnNlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2Vucykge1xuICAgIHVzZXIuc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zID0gW107XG4gIH1cbiAgdXNlci5zZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMucHVzaCh0b2tlblJlY29yZCk7XG5cbiAgcmV0dXJuIHtlbWFpbCwgdXNlciwgdG9rZW59O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBDcmVhdGVzIG9wdGlvbnMgZm9yIGVtYWlsIHNlbmRpbmcgZm9yIHJlc2V0IHBhc3N3b3JkIGFuZCBlbnJvbGwgYWNjb3VudCBlbWFpbHMuXG4gKiBZb3UgY2FuIHVzZSB0aGlzIGZ1bmN0aW9uIHdoZW4gY3VzdG9taXppbmcgYSByZXNldCBwYXNzd29yZCBvciBlbnJvbGwgYWNjb3VudCBlbWFpbCBzZW5kaW5nLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtPYmplY3R9IGVtYWlsIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIncyB0byBzZW5kIHRoZSBlbWFpbCB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyIFRoZSB1c2VyIG9iamVjdCB0byBnZW5lcmF0ZSBvcHRpb25zIGZvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVVJMIHRvIHdoaWNoIHVzZXIgaXMgZGlyZWN0ZWQgdG8gY29uZmlybSB0aGUgZW1haWwuXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVhc29uIGByZXNldFBhc3N3b3JkYCBvciBgZW5yb2xsQWNjb3VudGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPcHRpb25zIHdoaWNoIGNhbiBiZSBwYXNzZWQgdG8gYEVtYWlsLnNlbmRgLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZ2VuZXJhdGVPcHRpb25zRm9yRW1haWwgPSAoZW1haWwsIHVzZXIsIHVybCwgcmVhc29uKSA9PiB7XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgdG86IGVtYWlsLFxuICAgIGZyb206IEFjY291bnRzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0uZnJvbVxuICAgICAgPyBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmZyb20odXNlcilcbiAgICAgIDogQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuZnJvbSxcbiAgICBzdWJqZWN0OiBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLnN1YmplY3QodXNlcilcbiAgfTtcblxuICBpZiAodHlwZW9mIEFjY291bnRzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0udGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9wdGlvbnMudGV4dCA9IEFjY291bnRzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0udGV4dCh1c2VyLCB1cmwpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmh0bWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmh0bWwgPSBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmh0bWwodXNlciwgdXJsKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuaGVhZGVycyA9PT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zLmhlYWRlcnMgPSBBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5oZWFkZXJzO1xuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnM7XG59O1xuXG4vLyBzZW5kIHRoZSB1c2VyIGFuIGVtYWlsIHdpdGggYSBsaW5rIHRoYXQgd2hlbiBvcGVuZWQgYWxsb3dzIHRoZSB1c2VyXG4vLyB0byBzZXQgYSBuZXcgcGFzc3dvcmQsIHdpdGhvdXQgdGhlIG9sZCBwYXNzd29yZC5cblxuLyoqXG4gKiBAc3VtbWFyeSBTZW5kIGFuIGVtYWlsIHdpdGggYSBsaW5rIHRoZSB1c2VyIGNhbiB1c2UgdG8gcmVzZXQgdGhlaXIgcGFzc3dvcmQuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBzZW5kIGVtYWlsIHRvLlxuICogQHBhcmFtIHtTdHJpbmd9IFtlbWFpbF0gT3B0aW9uYWwuIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIncyB0byBzZW5kIHRoZSBlbWFpbCB0by4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBEZWZhdWx0cyB0byB0aGUgZmlyc3QgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZW5kUmVzZXRQYXNzd29yZEVtYWlsID0gKHVzZXJJZCwgZW1haWwsIGV4dHJhVG9rZW5EYXRhKSA9PiB7XG4gIGNvbnN0IHtlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbn0gPVxuICAgIEFjY291bnRzLmdlbmVyYXRlUmVzZXRUb2tlbih1c2VySWQsIGVtYWlsLCAncmVzZXRQYXNzd29yZCcsIGV4dHJhVG9rZW5EYXRhKTtcbiAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy5yZXNldFBhc3N3b3JkKHRva2VuKTtcbiAgY29uc3Qgb3B0aW9ucyA9IEFjY291bnRzLmdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsKHJlYWxFbWFpbCwgdXNlciwgdXJsLCAncmVzZXRQYXNzd29yZCcpO1xuICBFbWFpbC5zZW5kKG9wdGlvbnMpO1xuICByZXR1cm4ge2VtYWlsOiByZWFsRW1haWwsIHVzZXIsIHRva2VuLCB1cmwsIG9wdGlvbnN9O1xufTtcblxuLy8gc2VuZCB0aGUgdXNlciBhbiBlbWFpbCBpbmZvcm1pbmcgdGhlbSB0aGF0IHRoZWlyIGFjY291bnQgd2FzIGNyZWF0ZWQsIHdpdGhcbi8vIGEgbGluayB0aGF0IHdoZW4gb3BlbmVkIGJvdGggbWFya3MgdGhlaXIgZW1haWwgYXMgdmVyaWZpZWQgYW5kIGZvcmNlcyB0aGVtXG4vLyB0byBjaG9vc2UgdGhlaXIgcGFzc3dvcmQuIFRoZSBlbWFpbCBtdXN0IGJlIG9uZSBvZiB0aGUgYWRkcmVzc2VzIGluIHRoZVxuLy8gdXNlcidzIGVtYWlscyBmaWVsZCwgb3IgdW5kZWZpbmVkIHRvIHBpY2sgdGhlIGZpcnN0IGVtYWlsIGF1dG9tYXRpY2FsbHkuXG4vL1xuLy8gVGhpcyBpcyBub3QgY2FsbGVkIGF1dG9tYXRpY2FsbHkuIEl0IG11c3QgYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuLy8gd2FudCB0byB1c2UgZW5yb2xsbWVudCBlbWFpbHMuXG5cbi8qKlxuICogQHN1bW1hcnkgU2VuZCBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGUgdXNlciBjYW4gdXNlIHRvIHNldCB0aGVpciBpbml0aWFsIHBhc3N3b3JkLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2VuZCBlbWFpbCB0by5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbZW1haWxdIE9wdGlvbmFsLiBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gRGVmYXVsdHMgdG8gdGhlIGZpcnN0IGVtYWlsIGluIHRoZSBsaXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVRva2VuRGF0YV0gT3B0aW9uYWwgYWRkaXRpb25hbCBkYXRhIHRvIGJlIGFkZGVkIGludG8gdGhlIHRva2VuIHJlY29yZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IE9iamVjdCB3aXRoIHtlbWFpbCwgdXNlciwgdG9rZW4sIHVybCwgb3B0aW9uc30gdmFsdWVzLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuc2VuZEVucm9sbG1lbnRFbWFpbCA9ICh1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSkgPT4ge1xuICBjb25zdCB7ZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW59ID1cbiAgICBBY2NvdW50cy5nZW5lcmF0ZVJlc2V0VG9rZW4odXNlcklkLCBlbWFpbCwgJ2Vucm9sbEFjY291bnQnLCBleHRyYVRva2VuRGF0YSk7XG4gIGNvbnN0IHVybCA9IEFjY291bnRzLnVybHMuZW5yb2xsQWNjb3VudCh0b2tlbik7XG4gIGNvbnN0IG9wdGlvbnMgPSBBY2NvdW50cy5nZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbChyZWFsRW1haWwsIHVzZXIsIHVybCwgJ2Vucm9sbEFjY291bnQnKTtcbiAgRW1haWwuc2VuZChvcHRpb25zKTtcbiAgcmV0dXJuIHtlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfTtcbn07XG5cblxuLy8gVGFrZSB0b2tlbiBmcm9tIHNlbmRSZXNldFBhc3N3b3JkRW1haWwgb3Igc2VuZEVucm9sbG1lbnRFbWFpbCwgY2hhbmdlXG4vLyB0aGUgdXNlcnMgcGFzc3dvcmQsIGFuZCBsb2cgdGhlbSBpbi5cbk1ldGVvci5tZXRob2RzKHtyZXNldFBhc3N3b3JkOiBmdW5jdGlvbiAoLi4uYXJncykge1xuICBjb25zdCB0b2tlbiA9IGFyZ3NbMF07XG4gIGNvbnN0IG5ld1Bhc3N3b3JkID0gYXJnc1sxXTtcbiAgcmV0dXJuIEFjY291bnRzLl9sb2dpbk1ldGhvZChcbiAgICB0aGlzLFxuICAgIFwicmVzZXRQYXNzd29yZFwiLFxuICAgIGFyZ3MsXG4gICAgXCJwYXNzd29yZFwiLFxuICAgICgpID0+IHtcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xuICAgICAgY2hlY2sobmV3UGFzc3dvcmQsIHBhc3N3b3JkVmFsaWRhdG9yKTtcblxuICAgICAgY29uc3QgdXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lKFxuICAgICAgICB7XCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC50b2tlblwiOiB0b2tlbn0sXG4gICAgICAgIHtmaWVsZHM6IHtcbiAgICAgICAgICBzZXJ2aWNlczogMSxcbiAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgIH19XG4gICAgICApO1xuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlRva2VuIGV4cGlyZWRcIik7XG4gICAgICB9XG4gICAgICBjb25zdCB7IHdoZW4sIHJlYXNvbiwgZW1haWwgfSA9IHVzZXIuc2VydmljZXMucGFzc3dvcmQucmVzZXQ7XG4gICAgICBsZXQgdG9rZW5MaWZldGltZU1zID0gQWNjb3VudHMuX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMoKTtcbiAgICAgIGlmIChyZWFzb24gPT09IFwiZW5yb2xsXCIpIHtcbiAgICAgICAgdG9rZW5MaWZldGltZU1zID0gQWNjb3VudHMuX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zKCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50VGltZU1zID0gRGF0ZS5ub3coKTtcbiAgICAgIGlmICgoY3VycmVudFRpbWVNcyAtIHdoZW4pID4gdG9rZW5MaWZldGltZU1zKVxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJUb2tlbiBleHBpcmVkXCIpO1xuICAgICAgaWYgKCEocGx1Y2tBZGRyZXNzZXModXNlci5lbWFpbHMpLmluY2x1ZGVzKGVtYWlsKSkpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVG9rZW4gaGFzIGludmFsaWQgZW1haWwgYWRkcmVzc1wiKVxuICAgICAgICB9O1xuXG4gICAgICBjb25zdCBoYXNoZWQgPSBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuXG4gICAgICAvLyBOT1RFOiBXZSdyZSBhYm91dCB0byBpbnZhbGlkYXRlIHRva2VucyBvbiB0aGUgdXNlciwgd2hvIHdlIG1pZ2h0IGJlXG4gICAgICAvLyBsb2dnZWQgaW4gYXMuIE1ha2Ugc3VyZSB0byBhdm9pZCBsb2dnaW5nIG91cnNlbHZlcyBvdXQgaWYgdGhpc1xuICAgICAgLy8gaGFwcGVucy4gQnV0IGFsc28gbWFrZSBzdXJlIG5vdCB0byBsZWF2ZSB0aGUgY29ubmVjdGlvbiBpbiBhIHN0YXRlXG4gICAgICAvLyBvZiBoYXZpbmcgYSBiYWQgdG9rZW4gc2V0IGlmIHRoaW5ncyBmYWlsLlxuICAgICAgY29uc3Qgb2xkVG9rZW4gPSBBY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICAgICAgQWNjb3VudHMuX3NldExvZ2luVG9rZW4odXNlci5faWQsIHRoaXMuY29ubmVjdGlvbiwgbnVsbCk7XG4gICAgICBjb25zdCByZXNldFRvT2xkVG9rZW4gPSAoKSA9PlxuICAgICAgICBBY2NvdW50cy5fc2V0TG9naW5Ub2tlbih1c2VyLl9pZCwgdGhpcy5jb25uZWN0aW9uLCBvbGRUb2tlbik7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdXNlciByZWNvcmQgYnk6XG4gICAgICAgIC8vIC0gQ2hhbmdpbmcgdGhlIHBhc3N3b3JkIHRvIHRoZSBuZXcgb25lXG4gICAgICAgIC8vIC0gRm9yZ2V0dGluZyBhYm91dCB0aGUgcmVzZXQgdG9rZW4gdGhhdCB3YXMganVzdCB1c2VkXG4gICAgICAgIC8vIC0gVmVyaWZ5aW5nIHRoZWlyIGVtYWlsLCBzaW5jZSB0aGV5IGdvdCB0aGUgcGFzc3dvcmQgcmVzZXQgdmlhIGVtYWlsLlxuICAgICAgICBjb25zdCBhZmZlY3RlZFJlY29yZHMgPSBNZXRlb3IudXNlcnMudXBkYXRlKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIF9pZDogdXNlci5faWQsXG4gICAgICAgICAgICAnZW1haWxzLmFkZHJlc3MnOiBlbWFpbCxcbiAgICAgICAgICAgICdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC50b2tlbic6IHRva2VuXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7JHNldDogeydzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQnOiBoYXNoZWQsXG4gICAgICAgICAgICAgICAgICAnZW1haWxzLiQudmVyaWZpZWQnOiB0cnVlfSxcbiAgICAgICAgICAgJHVuc2V0OiB7J3NlcnZpY2VzLnBhc3N3b3JkLnJlc2V0JzogMSxcbiAgICAgICAgICAgICAgICAgICAgJ3NlcnZpY2VzLnBhc3N3b3JkLnNycCc6IDF9fSk7XG4gICAgICAgIGlmIChhZmZlY3RlZFJlY29yZHMgIT09IDEpXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiSW52YWxpZCBlbWFpbFwiKVxuICAgICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVzZXRUb09sZFRva2VuKCk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVwbGFjZSBhbGwgdmFsaWQgbG9naW4gdG9rZW5zIHdpdGggbmV3IG9uZXMgKGNoYW5naW5nXG4gICAgICAvLyBwYXNzd29yZCBzaG91bGQgaW52YWxpZGF0ZSBleGlzdGluZyBzZXNzaW9ucykuXG4gICAgICBBY2NvdW50cy5fY2xlYXJBbGxMb2dpblRva2Vucyh1c2VyLl9pZCk7XG5cbiAgICAgIHJldHVybiB7dXNlcklkOiB1c2VyLl9pZH07XG4gICAgfVxuICApO1xufX0pO1xuXG4vLy9cbi8vLyBFTUFJTCBWRVJJRklDQVRJT05cbi8vL1xuXG5cbi8vIHNlbmQgdGhlIHVzZXIgYW4gZW1haWwgd2l0aCBhIGxpbmsgdGhhdCB3aGVuIG9wZW5lZCBtYXJrcyB0aGF0XG4vLyBhZGRyZXNzIGFzIHZlcmlmaWVkXG5cbi8qKlxuICogQHN1bW1hcnkgU2VuZCBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGUgdXNlciBjYW4gdXNlIHZlcmlmeSB0aGVpciBlbWFpbCBhZGRyZXNzLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2VuZCBlbWFpbCB0by5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbZW1haWxdIE9wdGlvbmFsLiBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gRGVmYXVsdHMgdG8gdGhlIGZpcnN0IHVudmVyaWZpZWQgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZW5kVmVyaWZpY2F0aW9uRW1haWwgPSAodXNlcklkLCBlbWFpbCwgZXh0cmFUb2tlbkRhdGEpID0+IHtcbiAgLy8gWFhYIEFsc28gZ2VuZXJhdGUgYSBsaW5rIHVzaW5nIHdoaWNoIHNvbWVvbmUgY2FuIGRlbGV0ZSB0aGlzXG4gIC8vIGFjY291bnQgaWYgdGhleSBvd24gc2FpZCBhZGRyZXNzIGJ1dCB3ZXJlbid0IHRob3NlIHdobyBjcmVhdGVkXG4gIC8vIHRoaXMgYWNjb3VudC5cblxuICBjb25zdCB7ZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW59ID1cbiAgICBBY2NvdW50cy5nZW5lcmF0ZVZlcmlmaWNhdGlvblRva2VuKHVzZXJJZCwgZW1haWwsIGV4dHJhVG9rZW5EYXRhKTtcbiAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy52ZXJpZnlFbWFpbCh0b2tlbik7XG4gIGNvbnN0IG9wdGlvbnMgPSBBY2NvdW50cy5nZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbChyZWFsRW1haWwsIHVzZXIsIHVybCwgJ3ZlcmlmeUVtYWlsJyk7XG4gIEVtYWlsLnNlbmQob3B0aW9ucyk7XG4gIHJldHVybiB7ZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW4sIHVybCwgb3B0aW9uc307XG59O1xuXG4vLyBUYWtlIHRva2VuIGZyb20gc2VuZFZlcmlmaWNhdGlvbkVtYWlsLCBtYXJrIHRoZSBlbWFpbCBhcyB2ZXJpZmllZCxcbi8vIGFuZCBsb2cgdGhlbSBpbi5cbk1ldGVvci5tZXRob2RzKHt2ZXJpZnlFbWFpbDogZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgY29uc3QgdG9rZW4gPSBhcmdzWzBdO1xuICByZXR1cm4gQWNjb3VudHMuX2xvZ2luTWV0aG9kKFxuICAgIHRoaXMsXG4gICAgXCJ2ZXJpZnlFbWFpbFwiLFxuICAgIGFyZ3MsXG4gICAgXCJwYXNzd29yZFwiLFxuICAgICgpID0+IHtcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xuXG4gICAgICBjb25zdCB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoXG4gICAgICAgIHsnc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zLnRva2VuJzogdG9rZW59LFxuICAgICAgICB7ZmllbGRzOiB7XG4gICAgICAgICAgc2VydmljZXM6IDEsXG4gICAgICAgICAgZW1haWxzOiAxLFxuICAgICAgICB9fVxuICAgICAgKTtcbiAgICAgIGlmICghdXNlcilcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVmVyaWZ5IGVtYWlsIGxpbmsgZXhwaXJlZFwiKTtcblxuICAgICAgICBjb25zdCB0b2tlblJlY29yZCA9IHVzZXIuc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zLmZpbmQoXG4gICAgICAgICAgdCA9PiB0LnRva2VuID09IHRva2VuXG4gICAgICAgICk7XG4gICAgICBpZiAoIXRva2VuUmVjb3JkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGV4cGlyZWRcIilcbiAgICAgICAgfTtcblxuICAgICAgY29uc3QgZW1haWxzUmVjb3JkID0gdXNlci5lbWFpbHMuZmluZChcbiAgICAgICAgZSA9PiBlLmFkZHJlc3MgPT0gdG9rZW5SZWNvcmQuYWRkcmVzc1xuICAgICAgKTtcbiAgICAgIGlmICghZW1haWxzUmVjb3JkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGlzIGZvciB1bmtub3duIGFkZHJlc3NcIilcbiAgICAgICAgfTtcblxuICAgICAgLy8gQnkgaW5jbHVkaW5nIHRoZSBhZGRyZXNzIGluIHRoZSBxdWVyeSwgd2UgY2FuIHVzZSAnZW1haWxzLiQnIGluIHRoZVxuICAgICAgLy8gbW9kaWZpZXIgdG8gZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBzcGVjaWZpYyBvYmplY3QgaW4gdGhlIGVtYWlsc1xuICAgICAgLy8gYXJyYXkuIFNlZVxuICAgICAgLy8gaHR0cDovL3d3dy5tb25nb2RiLm9yZy9kaXNwbGF5L0RPQ1MvVXBkYXRpbmcvI1VwZGF0aW5nLVRoZSUyNHBvc2l0aW9uYWxvcGVyYXRvcilcbiAgICAgIC8vIGh0dHA6Ly93d3cubW9uZ29kYi5vcmcvZGlzcGxheS9ET0NTL1VwZGF0aW5nI1VwZGF0aW5nLSUyNHB1bGxcbiAgICAgIE1ldGVvci51c2Vycy51cGRhdGUoXG4gICAgICAgIHtfaWQ6IHVzZXIuX2lkLFxuICAgICAgICAgJ2VtYWlscy5hZGRyZXNzJzogdG9rZW5SZWNvcmQuYWRkcmVzc30sXG4gICAgICAgIHskc2V0OiB7J2VtYWlscy4kLnZlcmlmaWVkJzogdHJ1ZX0sXG4gICAgICAgICAkcHVsbDogeydzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMnOiB7YWRkcmVzczogdG9rZW5SZWNvcmQuYWRkcmVzc319fSk7XG5cbiAgICAgIHJldHVybiB7dXNlcklkOiB1c2VyLl9pZH07XG4gICAgfVxuICApO1xufX0pO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEFkZCBhbiBlbWFpbCBhZGRyZXNzIGZvciBhIHVzZXIuIFVzZSB0aGlzIGluc3RlYWQgb2YgZGlyZWN0bHlcbiAqIHVwZGF0aW5nIHRoZSBkYXRhYmFzZS4gVGhlIG9wZXJhdGlvbiB3aWxsIGZhaWwgaWYgdGhlcmUgaXMgYSBkaWZmZXJlbnQgdXNlclxuICogd2l0aCBhbiBlbWFpbCBvbmx5IGRpZmZlcmluZyBpbiBjYXNlLiBJZiB0aGUgc3BlY2lmaWVkIHVzZXIgaGFzIGFuIGV4aXN0aW5nXG4gKiBlbWFpbCBvbmx5IGRpZmZlcmluZyBpbiBjYXNlIGhvd2V2ZXIsIHdlIHJlcGxhY2UgaXQuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBJRCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3RW1haWwgQSBuZXcgZW1haWwgYWRkcmVzcyBmb3IgdGhlIHVzZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt2ZXJpZmllZF0gT3B0aW9uYWwgLSB3aGV0aGVyIHRoZSBuZXcgZW1haWwgYWRkcmVzcyBzaG91bGRcbiAqIGJlIG1hcmtlZCBhcyB2ZXJpZmllZC4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5hZGRFbWFpbCA9ICh1c2VySWQsIG5ld0VtYWlsLCB2ZXJpZmllZCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sobmV3RW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sodmVyaWZpZWQsIE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pKTtcblxuICBpZiAodmVyaWZpZWQgPT09IHZvaWQgMCkge1xuICAgIHZlcmlmaWVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkLCB7ZmllbGRzOiB7ZW1haWxzOiAxfX0pO1xuICBpZiAoIXVzZXIpXG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG5cbiAgLy8gQWxsb3cgdXNlcnMgdG8gY2hhbmdlIHRoZWlyIG93biBlbWFpbCB0byBhIHZlcnNpb24gd2l0aCBhIGRpZmZlcmVudCBjYXNlXG5cbiAgLy8gV2UgZG9uJ3QgaGF2ZSB0byBjYWxsIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyB0byBkbyBhIGNhc2VcbiAgLy8gaW5zZW5zaXRpdmUgY2hlY2sgYWNyb3NzIGFsbCBlbWFpbHMgaW4gdGhlIGRhdGFiYXNlIGhlcmUgYmVjYXVzZTogKDEpIGlmXG4gIC8vIHRoZXJlIGlzIG5vIGNhc2UtaW5zZW5zaXRpdmUgZHVwbGljYXRlIGJldHdlZW4gdGhpcyB1c2VyIGFuZCBvdGhlciB1c2VycyxcbiAgLy8gdGhlbiB3ZSBhcmUgT0sgYW5kICgyKSBpZiB0aGlzIHdvdWxkIGNyZWF0ZSBhIGNvbmZsaWN0IHdpdGggb3RoZXIgdXNlcnNcbiAgLy8gdGhlbiB0aGVyZSB3b3VsZCBhbHJlYWR5IGJlIGEgY2FzZS1pbnNlbnNpdGl2ZSBkdXBsaWNhdGUgYW5kIHdlIGNhbid0IGZpeFxuICAvLyB0aGF0IGluIHRoaXMgY29kZSBhbnl3YXkuXG4gIGNvbnN0IGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9XG4gICAgbmV3IFJlZ0V4cChgXiR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAobmV3RW1haWwpfSRgLCAnaScpO1xuXG4gIGNvbnN0IGRpZFVwZGF0ZU93bkVtYWlsID0gKHVzZXIuZW1haWxzIHx8IFtdKS5yZWR1Y2UoXG4gICAgKHByZXYsIGVtYWlsKSA9PiB7XG4gICAgICBpZiAoY2FzZUluc2Vuc2l0aXZlUmVnRXhwLnRlc3QoZW1haWwuYWRkcmVzcykpIHtcbiAgICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgICAgICAgX2lkOiB1c2VyLl9pZCxcbiAgICAgICAgICAnZW1haWxzLmFkZHJlc3MnOiBlbWFpbC5hZGRyZXNzXG4gICAgICAgIH0sIHskc2V0OiB7XG4gICAgICAgICAgJ2VtYWlscy4kLmFkZHJlc3MnOiBuZXdFbWFpbCxcbiAgICAgICAgICAnZW1haWxzLiQudmVyaWZpZWQnOiB2ZXJpZmllZFxuICAgICAgICB9fSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICB9XG4gICAgfSxcbiAgICBmYWxzZVxuICApO1xuXG4gIC8vIEluIHRoZSBvdGhlciB1cGRhdGVzIGJlbG93LCB3ZSBoYXZlIHRvIGRvIGFub3RoZXIgY2FsbCB0b1xuICAvLyBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMgdG8gbWFrZSBzdXJlIHRoYXQgbm8gY29uZmxpY3RpbmcgdmFsdWVzXG4gIC8vIHdlcmUgYWRkZWQgdG8gdGhlIGRhdGFiYXNlIGluIHRoZSBtZWFudGltZS4gV2UgZG9uJ3QgaGF2ZSB0byBkbyB0aGlzIGZvclxuICAvLyB0aGUgY2FzZSB3aGVyZSB0aGUgdXNlciBpcyB1cGRhdGluZyB0aGVpciBlbWFpbCBhZGRyZXNzIHRvIG9uZSB0aGF0IGlzIHRoZVxuICAvLyBzYW1lIGFzIGJlZm9yZSwgYnV0IG9ubHkgZGlmZmVyZW50IGJlY2F1c2Ugb2YgY2FwaXRhbGl6YXRpb24uIFJlYWQgdGhlXG4gIC8vIGJpZyBjb21tZW50IGFib3ZlIHRvIHVuZGVyc3RhbmQgd2h5LlxuXG4gIGlmIChkaWRVcGRhdGVPd25FbWFpbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gYSBjYXNlIGluc2Vuc2l0aXZlIGNoZWNrIGZvciBkdXBsaWNhdGVzIGJlZm9yZSB1cGRhdGVcbiAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCdlbWFpbHMuYWRkcmVzcycsICdFbWFpbCcsIG5ld0VtYWlsLCB1c2VyLl9pZCk7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgX2lkOiB1c2VyLl9pZFxuICB9LCB7XG4gICAgJGFkZFRvU2V0OiB7XG4gICAgICBlbWFpbHM6IHtcbiAgICAgICAgYWRkcmVzczogbmV3RW1haWwsXG4gICAgICAgIHZlcmlmaWVkOiB2ZXJpZmllZFxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gUGVyZm9ybSBhbm90aGVyIGNoZWNrIGFmdGVyIHVwZGF0ZSwgaW4gY2FzZSBhIG1hdGNoaW5nIHVzZXIgaGFzIGJlZW5cbiAgLy8gaW5zZXJ0ZWQgaW4gdGhlIG1lYW50aW1lXG4gIHRyeSB7XG4gICAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCdlbWFpbHMuYWRkcmVzcycsICdFbWFpbCcsIG5ld0VtYWlsLCB1c2VyLl9pZCk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgLy8gVW5kbyB1cGRhdGUgaWYgdGhlIGNoZWNrIGZhaWxzXG4gICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sXG4gICAgICB7JHB1bGw6IHtlbWFpbHM6IHthZGRyZXNzOiBuZXdFbWFpbH19fSk7XG4gICAgdGhyb3cgZXg7XG4gIH1cbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBSZW1vdmUgYW4gZW1haWwgYWRkcmVzcyBmb3IgYSB1c2VyLiBVc2UgdGhpcyBpbnN0ZWFkIG9mIHVwZGF0aW5nXG4gKiB0aGUgZGF0YWJhc2UgZGlyZWN0bHkuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBJRCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gZW1haWwgVGhlIGVtYWlsIGFkZHJlc3MgdG8gcmVtb3ZlLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMucmVtb3ZlRW1haWwgPSAodXNlcklkLCBlbWFpbCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2soZW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcblxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkLCB7ZmllbGRzOiB7X2lkOiAxfX0pO1xuICBpZiAoIXVzZXIpXG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sXG4gICAgeyRwdWxsOiB7ZW1haWxzOiB7YWRkcmVzczogZW1haWx9fX0pO1xufVxuXG4vLy9cbi8vLyBDUkVBVElORyBVU0VSU1xuLy8vXG5cbi8vIFNoYXJlZCBjcmVhdGVVc2VyIGZ1bmN0aW9uIGNhbGxlZCBmcm9tIHRoZSBjcmVhdGVVc2VyIG1ldGhvZCwgYm90aFxuLy8gaWYgb3JpZ2luYXRlcyBpbiBjbGllbnQgb3Igc2VydmVyIGNvZGUuIENhbGxzIHVzZXIgcHJvdmlkZWQgaG9va3MsXG4vLyBkb2VzIHRoZSBhY3R1YWwgdXNlciBpbnNlcnRpb24uXG4vL1xuLy8gcmV0dXJucyB0aGUgdXNlciBpZFxuY29uc3QgY3JlYXRlVXNlciA9IG9wdGlvbnMgPT4ge1xuICAvLyBVbmtub3duIGtleXMgYWxsb3dlZCwgYmVjYXVzZSBhIG9uQ3JlYXRlVXNlckhvb2sgY2FuIHRha2UgYXJiaXRyYXJ5XG4gIC8vIG9wdGlvbnMuXG4gIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9iamVjdEluY2x1ZGluZyh7XG4gICAgdXNlcm5hbWU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgZW1haWw6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgcGFzc3dvcmQ6IE1hdGNoLk9wdGlvbmFsKHBhc3N3b3JkVmFsaWRhdG9yKVxuICB9KSk7XG5cbiAgY29uc3QgeyB1c2VybmFtZSwgZW1haWwsIHBhc3N3b3JkIH0gPSBvcHRpb25zO1xuICBpZiAoIXVzZXJuYW1lICYmICFlbWFpbClcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJOZWVkIHRvIHNldCBhIHVzZXJuYW1lIG9yIGVtYWlsXCIpO1xuXG4gIGNvbnN0IHVzZXIgPSB7c2VydmljZXM6IHt9fTtcbiAgaWYgKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgaGFzaGVkID0gaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkID0geyBiY3J5cHQ6IGhhc2hlZCB9O1xuICB9XG5cbiAgaWYgKHVzZXJuYW1lKVxuICAgIHVzZXIudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgaWYgKGVtYWlsKVxuICAgIHVzZXIuZW1haWxzID0gW3thZGRyZXNzOiBlbWFpbCwgdmVyaWZpZWQ6IGZhbHNlfV07XG5cbiAgLy8gUGVyZm9ybSBhIGNhc2UgaW5zZW5zaXRpdmUgY2hlY2sgYmVmb3JlIGluc2VydFxuICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ3VzZXJuYW1lJywgJ1VzZXJuYW1lJywgdXNlcm5hbWUpO1xuICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ2VtYWlscy5hZGRyZXNzJywgJ0VtYWlsJywgZW1haWwpO1xuXG4gIGNvbnN0IHVzZXJJZCA9IEFjY291bnRzLmluc2VydFVzZXJEb2Mob3B0aW9ucywgdXNlcik7XG4gIC8vIFBlcmZvcm0gYW5vdGhlciBjaGVjayBhZnRlciBpbnNlcnQsIGluIGNhc2UgYSBtYXRjaGluZyB1c2VyIGhhcyBiZWVuXG4gIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICB0cnkge1xuICAgIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcygndXNlcm5hbWUnLCAnVXNlcm5hbWUnLCB1c2VybmFtZSwgdXNlcklkKTtcbiAgICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ2VtYWlscy5hZGRyZXNzJywgJ0VtYWlsJywgZW1haWwsIHVzZXJJZCk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgLy8gUmVtb3ZlIGluc2VydGVkIHVzZXIgaWYgdGhlIGNoZWNrIGZhaWxzXG4gICAgTWV0ZW9yLnVzZXJzLnJlbW92ZSh1c2VySWQpO1xuICAgIHRocm93IGV4O1xuICB9XG4gIHJldHVybiB1c2VySWQ7XG59O1xuXG4vLyBtZXRob2QgZm9yIGNyZWF0ZSB1c2VyLiBSZXF1ZXN0cyBjb21lIGZyb20gdGhlIGNsaWVudC5cbk1ldGVvci5tZXRob2RzKHtjcmVhdGVVc2VyOiBmdW5jdGlvbiAoLi4uYXJncykge1xuICBjb25zdCBvcHRpb25zID0gYXJnc1swXTtcbiAgcmV0dXJuIEFjY291bnRzLl9sb2dpbk1ldGhvZChcbiAgICB0aGlzLFxuICAgIFwiY3JlYXRlVXNlclwiLFxuICAgIGFyZ3MsXG4gICAgXCJwYXNzd29yZFwiLFxuICAgICgpID0+IHtcbiAgICAgIC8vIGNyZWF0ZVVzZXIoKSBhYm92ZSBkb2VzIG1vcmUgY2hlY2tpbmcuXG4gICAgICBjaGVjayhvcHRpb25zLCBPYmplY3QpO1xuICAgICAgaWYgKEFjY291bnRzLl9vcHRpb25zLmZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbilcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiU2lnbnVwcyBmb3JiaWRkZW5cIilcbiAgICAgICAgfTtcblxuICAgICAgLy8gQ3JlYXRlIHVzZXIuIHJlc3VsdCBjb250YWlucyBpZCBhbmQgdG9rZW4uXG4gICAgICBjb25zdCB1c2VySWQgPSBjcmVhdGVVc2VyKG9wdGlvbnMpO1xuICAgICAgLy8gc2FmZXR5IGJlbHQuIGNyZWF0ZVVzZXIgaXMgc3VwcG9zZWQgdG8gdGhyb3cgb24gZXJyb3IuIHNlbmQgNTAwIGVycm9yXG4gICAgICAvLyBpbnN0ZWFkIG9mIHNlbmRpbmcgYSB2ZXJpZmljYXRpb24gZW1haWwgd2l0aCBlbXB0eSB1c2VyaWQuXG4gICAgICBpZiAoISB1c2VySWQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNyZWF0ZVVzZXIgZmFpbGVkIHRvIGluc2VydCBuZXcgdXNlclwiKTtcblxuICAgICAgLy8gSWYgYEFjY291bnRzLl9vcHRpb25zLnNlbmRWZXJpZmljYXRpb25FbWFpbGAgaXMgc2V0LCByZWdpc3RlclxuICAgICAgLy8gYSB0b2tlbiB0byB2ZXJpZnkgdGhlIHVzZXIncyBwcmltYXJ5IGVtYWlsLCBhbmQgc2VuZCBpdCB0b1xuICAgICAgLy8gdGhhdCBhZGRyZXNzLlxuICAgICAgaWYgKG9wdGlvbnMuZW1haWwgJiYgQWNjb3VudHMuX29wdGlvbnMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsKVxuICAgICAgICBBY2NvdW50cy5zZW5kVmVyaWZpY2F0aW9uRW1haWwodXNlcklkLCBvcHRpb25zLmVtYWlsKTtcblxuICAgICAgLy8gY2xpZW50IGdldHMgbG9nZ2VkIGluIGFzIHRoZSBuZXcgdXNlciBhZnRlcndhcmRzLlxuICAgICAgcmV0dXJuIHt1c2VySWQ6IHVzZXJJZH07XG4gICAgfVxuICApO1xufX0pO1xuXG4vLyBDcmVhdGUgdXNlciBkaXJlY3RseSBvbiB0aGUgc2VydmVyLlxuLy9cbi8vIFVubGlrZSB0aGUgY2xpZW50IHZlcnNpb24sIHRoaXMgZG9lcyBub3QgbG9nIHlvdSBpbiBhcyB0aGlzIHVzZXJcbi8vIGFmdGVyIGNyZWF0aW9uLlxuLy9cbi8vIHJldHVybnMgdXNlcklkIG9yIHRocm93cyBhbiBlcnJvciBpZiBpdCBjYW4ndCBjcmVhdGVcbi8vXG4vLyBYWFggYWRkIGFub3RoZXIgYXJndW1lbnQgKFwic2VydmVyIG9wdGlvbnNcIikgdGhhdCBnZXRzIHNlbnQgdG8gb25DcmVhdGVVc2VyLFxuLy8gd2hpY2ggaXMgYWx3YXlzIGVtcHR5IHdoZW4gY2FsbGVkIGZyb20gdGhlIGNyZWF0ZVVzZXIgbWV0aG9kPyBlZywgXCJhZG1pbjpcbi8vIHRydWVcIiwgd2hpY2ggd2Ugd2FudCB0byBwcmV2ZW50IHRoZSBjbGllbnQgZnJvbSBzZXR0aW5nLCBidXQgd2hpY2ggYSBjdXN0b21cbi8vIG1ldGhvZCBjYWxsaW5nIEFjY291bnRzLmNyZWF0ZVVzZXIgY291bGQgc2V0P1xuLy9cbkFjY291bnRzLmNyZWF0ZVVzZXIgPSAob3B0aW9ucywgY2FsbGJhY2spID0+IHtcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuXG4gIC8vIFhYWCBhbGxvdyBhbiBvcHRpb25hbCBjYWxsYmFjaz9cbiAgaWYgKGNhbGxiYWNrKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQWNjb3VudHMuY3JlYXRlVXNlciB3aXRoIGNhbGxiYWNrIG5vdCBzdXBwb3J0ZWQgb24gdGhlIHNlcnZlciB5ZXQuXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZVVzZXIob3B0aW9ucyk7XG59O1xuXG4vLy9cbi8vLyBQQVNTV09SRC1TUEVDSUZJQyBJTkRFWEVTIE9OIFVTRVJTXG4vLy9cbk1ldGVvci51c2Vycy5fZW5zdXJlSW5kZXgoJ3NlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2Vucy50b2tlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG5NZXRlb3IudXNlcnMuX2Vuc3VyZUluZGV4KCdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC50b2tlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG4iXX0=
