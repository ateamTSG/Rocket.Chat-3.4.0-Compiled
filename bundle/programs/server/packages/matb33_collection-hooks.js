(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var CollectionHooks;

var require = meteorInstall({"node_modules":{"meteor":{"matb33:collection-hooks":{"server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/server.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  CollectionHooks: () => CollectionHooks
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);
module.link("./advices");
const publishUserId = new Meteor.EnvironmentVariable();

CollectionHooks.getUserId = function getUserId() {
  let userId;

  try {
    // Will throw an error unless within method call.
    // Attempt to recover gracefully by catching:
    userId = Meteor.userId && Meteor.userId();
  } catch (e) {}

  if (userId == null) {
    // Get the userId if we are in a publish function.
    userId = publishUserId.get();
  }

  if (userId == null) {
    userId = CollectionHooks.defaultUserId;
  }

  return userId;
};

const _publish = Meteor.publish;

Meteor.publish = function (name, handler, options) {
  return _publish.call(this, name, function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // This function is called repeatedly in publications
    return publishUserId.withValue(this && this.userId, () => handler.apply(this, args));
  }, options);
}; // Make the above available for packages with hooks that want to determine
// whether they are running inside a publish function or not.


CollectionHooks.isWithinPublish = () => publishUserId.get() !== undefined;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"advices.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/advices.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.link("./insert.js");
module.link("./update.js");
module.link("./remove.js");
module.link("./upsert.js");
module.link("./find.js");
module.link("./findone.js");
module.link("./users-compat.js");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection-hooks.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/collection-hooks.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  CollectionHooks: () => CollectionHooks
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 2);
let LocalCollection;
module.link("meteor/minimongo", {
  LocalCollection(v) {
    LocalCollection = v;
  }

}, 3);
// Relevant AOP terminology:
// Aspect: User code that runs before/after (hook)
// Advice: Wrapper code that knows when to call user code (aspects)
// Pointcut: before/after
const advices = {};
const CollectionHooks = {
  defaults: {
    before: {
      insert: {},
      update: {},
      remove: {},
      upsert: {},
      find: {},
      findOne: {},
      all: {}
    },
    after: {
      insert: {},
      update: {},
      remove: {},
      find: {},
      findOne: {},
      all: {}
    },
    all: {
      insert: {},
      update: {},
      remove: {},
      find: {},
      findOne: {},
      all: {}
    }
  },
  directEnv: new Meteor.EnvironmentVariable(),

  directOp(func) {
    return this.directEnv.withValue(true, func);
  },

  hookedOp(func) {
    return this.directEnv.withValue(false, func);
  }

};

CollectionHooks.extendCollectionInstance = function extendCollectionInstance(self, constructor) {
  // Offer a public API to allow the user to define aspects
  // Example: collection.before.insert(func);
  ['before', 'after'].forEach(function (pointcut) {
    Object.entries(advices).forEach(function (_ref) {
      let [method, advice] = _ref;
      if (advice === 'upsert' && pointcut === 'after') return;

      Meteor._ensure(self, pointcut, method);

      Meteor._ensure(self, '_hookAspects', method);

      self._hookAspects[method][pointcut] = [];

      self[pointcut][method] = function (aspect, options) {
        const len = self._hookAspects[method][pointcut].push({
          aspect,
          options: CollectionHooks.initOptions(options, pointcut, method)
        });

        return {
          replace(aspect, options) {
            self._hookAspects[method][pointcut].splice(len - 1, 1, {
              aspect,
              options: CollectionHooks.initOptions(options, pointcut, method)
            });
          },

          remove() {
            self._hookAspects[method][pointcut].splice(len - 1, 1);
          }

        };
      };
    });
  }); // Offer a publicly accessible object to allow the user to define
  // collection-wide hook options.
  // Example: collection.hookOptions.after.update = {fetchPrevious: false};

  self.hookOptions = EJSON.clone(CollectionHooks.defaults); // Wrap mutator methods, letting the defined advice do the work

  Object.entries(advices).forEach(function (_ref2) {
    let [method, advice] = _ref2;
    const collection = Meteor.isClient || method === 'upsert' ? self : self._collection; // Store a reference to the original mutator method

    const _super = collection[method];

    Meteor._ensure(self, 'direct', method);

    self.direct[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return CollectionHooks.directOp(function () {
        return constructor.prototype[method].apply(self, args);
      });
    };

    collection[method] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (CollectionHooks.directEnv.get() === true) {
        return _super.apply(collection, args);
      } // NOTE: should we decide to force `update` with `{upsert:true}` to use
      // the `upsert` hooks, this is what will accomplish it. It's important to
      // realize that Meteor won't distinguish between an `update` and an
      // `insert` though, so we'll end up with `after.update` getting called
      // even on an `insert`. That's why we've chosen to disable this for now.
      // if (method === "update" && Object(args[2]) === args[2] && args[2].upsert) {
      //   method = "upsert";
      //   advice = CollectionHooks.getAdvice(method);
      // }


      return advice.call(this, CollectionHooks.getUserId(), _super, self, method === 'upsert' ? {
        insert: self._hookAspects.insert || {},
        update: self._hookAspects.update || {},
        upsert: self._hookAspects.upsert || {}
      } : self._hookAspects[method] || {}, function (doc) {
        return typeof self._transform === 'function' ? function (d) {
          return self._transform(d || doc);
        } : function (d) {
          return d || doc;
        };
      }, args, false);
    };
  });
};

CollectionHooks.defineAdvice = (method, advice) => {
  advices[method] = advice;
};

CollectionHooks.getAdvice = method => advices[method];

CollectionHooks.initOptions = (options, pointcut, method) => CollectionHooks.extendOptions(CollectionHooks.defaults, options, pointcut, method);

CollectionHooks.extendOptions = (source, options, pointcut, method) => _objectSpread({}, options, {}, source.all.all, {}, source[pointcut].all, {}, source.all[method], {}, source[pointcut][method]);

CollectionHooks.getDocs = function getDocs(collection, selector, options) {
  const findOptions = {
    transform: null,
    reactive: false
  }; // added reactive: false

  /*
  // No "fetch" support at this time.
  if (!this._validators.fetchAllFields) {
    findOptions.fields = {};
    this._validators.fetch.forEach(function(fieldName) {
      findOptions.fields[fieldName] = 1;
    });
  }
  */
  // Bit of a magic condition here... only "update" passes options, so this is
  // only relevant to when update calls getDocs:

  if (options) {
    // This was added because in our case, we are potentially iterating over
    // multiple docs. If multi isn't enabled, force a limit (almost like
    // findOne), as the default for update without multi enabled is to affect
    // only the first matched document:
    if (!options.multi) {
      findOptions.limit = 1;
    }

    const {
      multi,
      upsert
    } = options,
          rest = _objectWithoutProperties(options, ["multi", "upsert"]);

    Object.assign(findOptions, rest);
  } // Unlike validators, we iterate over multiple docs, so use
  // find instead of findOne:


  return collection.find(selector, findOptions);
}; // This function normalizes the selector (converting it to an Object)


CollectionHooks.normalizeSelector = function (selector) {
  if (typeof selector === 'string' || selector && selector.constructor === Mongo.ObjectID) {
    return {
      _id: selector
    };
  } else {
    return selector;
  }
}; // This function contains a snippet of code pulled and modified from:
// ~/.meteor/packages/mongo-livedata/collection.js
// It's contained in these utility functions to make updates easier for us in
// case this code changes.


CollectionHooks.getFields = function getFields(mutator) {
  // compute modified fields
  const fields = []; // ====ADDED START=======================

  const operators = ['$addToSet', '$bit', '$currentDate', '$inc', '$max', '$min', '$pop', '$pull', '$pullAll', '$push', '$rename', '$set', '$unset']; // ====ADDED END=========================

  Object.entries(mutator).forEach(function (_ref3) {
    let [op, params] = _ref3;

    // ====ADDED START=======================
    if (operators.includes(op)) {
      // ====ADDED END=========================
      Object.keys(params).forEach(function (field) {
        // treat dotted fields as if they are replacing their
        // top-level part
        if (field.indexOf('.') !== -1) {
          field = field.substring(0, field.indexOf('.'));
        } // record the field we are trying to change


        if (!fields.includes(field)) {
          fields.push(field);
        }
      }); // ====ADDED START=======================
    } else {
      fields.push(op);
    } // ====ADDED END=========================

  });
  return fields;
};

CollectionHooks.reassignPrototype = function reassignPrototype(instance, constr) {
  const hasSetPrototypeOf = typeof Object.setPrototypeOf === 'function';
  constr = constr || Mongo.Collection; // __proto__ is not available in < IE11
  // Note: Assigning a prototype dynamically has performance implications

  if (hasSetPrototypeOf) {
    Object.setPrototypeOf(instance, constr.prototype);
  } else if (instance.__proto__) {
    // eslint-disable-line no-proto
    instance.__proto__ = constr.prototype; // eslint-disable-line no-proto
  }
};

CollectionHooks.wrapCollection = function wrapCollection(ns, as) {
  if (!as._CollectionConstructor) as._CollectionConstructor = as.Collection;
  if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);
  const constructor = ns._NewCollectionContructor || as._CollectionConstructor;
  const proto = as._CollectionPrototype;

  ns.Collection = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const ret = constructor.apply(this, args);
    CollectionHooks.extendCollectionInstance(this, constructor);
    return ret;
  }; // Retain a reference to the new constructor to allow further wrapping.


  ns._NewCollectionContructor = ns.Collection;
  ns.Collection.prototype = proto;
  ns.Collection.prototype.constructor = ns.Collection;

  for (const prop of Object.keys(constructor)) {
    ns.Collection[prop] = constructor[prop];
  } // Meteor overrides the apply method which is copied from the constructor in the loop above. Replace it with the
  // default method which we need if we were to further wrap ns.Collection.


  ns.Collection.apply = Function.prototype.apply;
};

CollectionHooks.modify = LocalCollection._modify;

if (typeof Mongo !== 'undefined') {
  CollectionHooks.wrapCollection(Meteor, Mongo);
  CollectionHooks.wrapCollection(Mongo, Mongo);
} else {
  CollectionHooks.wrapCollection(Meteor, Meteor);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"find.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/find.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 0);
CollectionHooks.defineAdvice('find', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  const options = instance._getFindOptions(args);

  let abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return instance.find(undefined);
  }

  const after = cursor => {
    if (!suppressAspects) {
      aspects.after.forEach(o => {
        o.aspect.call(ctx, userId, selector, options, cursor);
      });
    }
  };

  const ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"findone.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/findone.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 0);
CollectionHooks.defineAdvice('findOne', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  const options = instance._getFindOptions(args);

  let abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return;
  }

  function after(doc) {
    if (!suppressAspects) {
      aspects.after.forEach(o => {
        o.aspect.call(ctx, userId, selector, options, doc);
      });
    }
  }

  const ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"insert.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/insert.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 2);
CollectionHooks.defineAdvice('insert', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  let [doc, callback] = args;
  const async = typeof callback === 'function';
  let abort;
  let ret; // before

  if (!suppressAspects) {
    try {
      aspects.before.forEach(o => {
        const r = o.aspect.call(_objectSpread({
          transform: getTransform(doc)
        }, ctx), userId, doc);
        if (r === false) abort = true;
      });
      if (abort) return;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  const after = (id, err) => {
    if (id) {
      // In some cases (namely Meteor.users on Meteor 1.4+), the _id property
      // is a raw mongo _id object. We need to extract the _id from this object
      if (typeof id === 'object' && id.ops) {
        // If _str then collection is using Mongo.ObjectID as ids
        if (doc._id._str) {
          id = new Mongo.ObjectID(doc._id._str.toString());
        } else {
          id = id.ops && id.ops[0] && id.ops[0]._id;
        }
      }

      doc = EJSON.clone(doc);
      doc._id = id;
    }

    if (!suppressAspects) {
      const lctx = _objectSpread({
        transform: getTransform(doc),
        _id: id,
        err
      }, ctx);

      aspects.after.forEach(o => {
        o.aspect.call(lctx, userId, doc);
      });
    }

    return id;
  };

  if (async) {
    const wrappedCallback = function (err, obj) {
      after(obj && obj[0] && obj[0]._id || obj, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return callback.call(this, err, obj, ...args);
    };

    return _super.call(this, doc, wrappedCallback);
  } else {
    ret = _super.call(this, doc, callback);
    return after(ret && ret[0] && ret[0]._id || ret);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remove.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/remove.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('remove', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const [selector, callback] = args;
  const async = typeof callback === 'function';
  let docs;
  let abort;
  const prev = [];

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        docs = CollectionHooks.getDocs.call(this, instance, selector).fetch();
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        docs.forEach(doc => prev.push(EJSON.clone(doc)));
      } // before


      aspects.before.forEach(o => {
        docs.forEach(doc => {
          const r = o.aspect.call(_objectSpread({
            transform: getTransform(doc)
          }, ctx), userId, doc);
          if (r === false) abort = true;
        });
      });
      if (abort) return 0;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  function after(err) {
    if (!suppressAspects) {
      aspects.after.forEach(o => {
        prev.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            err
          }, ctx), userId, doc);
        });
      });
    }
  }

  if (async) {
    const wrappedCallback = function (err) {
      after(err);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return callback.call(this, err, ...args);
    };

    return _super.call(this, selector, wrappedCallback);
  } else {
    const result = _super.call(this, selector, callback);

    after();
    return result;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/update.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('update', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  let [selector, mutator, options, callback] = args;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const async = typeof callback === 'function';
  let docs;
  let docIds;
  let fields;
  let abort;
  const prev = {};

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        fields = CollectionHooks.getFields(mutator);
        docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
        docIds = docs.map(doc => doc._id);
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);

        if (aspects.after.some(o => o.options.fetchPrevious !== false) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
          prev.docs = {};
          docs.forEach(doc => {
            prev.docs[doc._id] = EJSON.clone(doc);
          });
        }
      } // before


      aspects.before.forEach(function (o) {
        docs.forEach(function (doc) {
          const r = o.aspect.call(_objectSpread({
            transform: getTransform(doc)
          }, ctx), userId, doc, fields, mutator, options);
          if (r === false) abort = true;
        });
      });
      if (abort) return 0;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  const after = (affected, err) => {
    if (!suppressAspects && !isEmpty(aspects.after)) {
      const fields = CollectionHooks.getFields(mutator);
      const docs = CollectionHooks.getDocs.call(this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();
      aspects.after.forEach(o => {
        docs.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected,
            err
          }, ctx), userId, doc, fields, prev.mutator, prev.options);
        });
      });
    }
  };

  if (async) {
    const wrappedCallback = function (err, affected) {
      after(affected, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return callback.call(this, err, affected, ...args);
    };

    return _super.call(this, selector, mutator, options, wrappedCallback);
  } else {
    const affected = _super.call(this, selector, mutator, options, callback);

    after(affected);
    return affected;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"upsert.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/upsert.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('upsert', function (userId, _super, instance, aspectGroup, getTransform, args, suppressAspects) {
  args[0] = CollectionHooks.normalizeSelector(instance._getFindSelector(args));
  const ctx = {
    context: this,
    _super,
    args
  };
  let [selector, mutator, options, callback] = args;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const async = typeof callback === 'function';
  let docs;
  let docIds;
  let abort;
  const prev = {};

  if (!suppressAspects) {
    if (!isEmpty(aspectGroup.upsert.before) || !isEmpty(aspectGroup.update.after)) {
      docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
      docIds = docs.map(doc => doc._id);
    } // copy originals for convenience for the 'after' pointcut


    if (!isEmpty(aspectGroup.update.after)) {
      if (aspectGroup.update.after.some(o => o.options.fetchPrevious !== false) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);
        prev.docs = {};
        docs.forEach(doc => {
          prev.docs[doc._id] = EJSON.clone(doc);
        });
      }
    } // before


    aspectGroup.upsert.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, mutator, options);
      if (r === false) abort = true;
    });
    if (abort) return {
      numberAffected: 0
    };
  }

  const afterUpdate = (affected, err) => {
    if (!suppressAspects && !isEmpty(aspectGroup.update.after)) {
      const fields = CollectionHooks.getFields(mutator);
      const docs = CollectionHooks.getDocs.call(this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();
      aspectGroup.update.after.forEach(o => {
        docs.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected,
            err
          }, ctx), userId, doc, fields, prev.mutator, prev.options);
        });
      });
    }
  };

  const afterInsert = (_id, err) => {
    if (!suppressAspects && !isEmpty(aspectGroup.insert.after)) {
      const doc = CollectionHooks.getDocs.call(this, instance, {
        _id
      }, selector, {}).fetch()[0]; // 3rd argument passes empty object which causes magic logic to imply limit:1

      const lctx = _objectSpread({
        transform: getTransform(doc),
        _id,
        err
      }, ctx);

      aspectGroup.insert.after.forEach(o => {
        o.aspect.call(lctx, userId, doc);
      });
    }
  };

  if (async) {
    const wrappedCallback = function (err, ret) {
      if (err || ret && ret.insertedId) {
        // Send any errors to afterInsert
        afterInsert(ret.insertedId, err);
      } else {
        afterUpdate(ret && ret.numberAffected, err); // Note that err can never reach here
      }

      return CollectionHooks.hookedOp(function () {
        return callback.call(this, err, ret);
      });
    };

    return CollectionHooks.directOp(() => _super.call(this, selector, mutator, options, wrappedCallback));
  } else {
    const ret = CollectionHooks.directOp(() => _super.call(this, selector, mutator, options, callback));

    if (ret && ret.insertedId) {
      afterInsert(ret.insertedId);
    } else {
      afterUpdate(ret && ret.numberAffected);
    }

    return ret;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"users-compat.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/users-compat.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 2);

if (Meteor.users) {
  // If Meteor.users has been instantiated, attempt to re-assign its prototype:
  CollectionHooks.reassignPrototype(Meteor.users); // Next, give it the hook aspects:

  CollectionHooks.extendCollectionInstance(Meteor.users, Mongo.Collection);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/matb33:collection-hooks/server.js");

/* Exports */
Package._define("matb33:collection-hooks", exports, {
  CollectionHooks: CollectionHooks
});

})();

//# sourceURL=meteor://💻app/packages/matb33_collection-hooks.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWF0YjMzOmNvbGxlY3Rpb24taG9va3Mvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9hZHZpY2VzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9jb2xsZWN0aW9uLWhvb2tzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9maW5kLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9maW5kb25lLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9pbnNlcnQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21hdGIzMzpjb2xsZWN0aW9uLWhvb2tzL3JlbW92ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWF0YjMzOmNvbGxlY3Rpb24taG9va3MvdXBkYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy91cHNlcnQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21hdGIzMzpjb2xsZWN0aW9uLWhvb2tzL3VzZXJzLWNvbXBhdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb2xsZWN0aW9uSG9va3MiLCJNZXRlb3IiLCJsaW5rIiwidiIsInB1Ymxpc2hVc2VySWQiLCJFbnZpcm9ubWVudFZhcmlhYmxlIiwiZ2V0VXNlcklkIiwidXNlcklkIiwiZSIsImdldCIsImRlZmF1bHRVc2VySWQiLCJfcHVibGlzaCIsInB1Ymxpc2giLCJuYW1lIiwiaGFuZGxlciIsIm9wdGlvbnMiLCJjYWxsIiwiYXJncyIsIndpdGhWYWx1ZSIsImFwcGx5IiwiaXNXaXRoaW5QdWJsaXNoIiwidW5kZWZpbmVkIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiZGVmYXVsdCIsIl9vYmplY3RTcHJlYWQiLCJNb25nbyIsIkVKU09OIiwiTG9jYWxDb2xsZWN0aW9uIiwiYWR2aWNlcyIsImRlZmF1bHRzIiwiYmVmb3JlIiwiaW5zZXJ0IiwidXBkYXRlIiwicmVtb3ZlIiwidXBzZXJ0IiwiZmluZCIsImZpbmRPbmUiLCJhbGwiLCJhZnRlciIsImRpcmVjdEVudiIsImRpcmVjdE9wIiwiZnVuYyIsImhvb2tlZE9wIiwiZXh0ZW5kQ29sbGVjdGlvbkluc3RhbmNlIiwic2VsZiIsImNvbnN0cnVjdG9yIiwiZm9yRWFjaCIsInBvaW50Y3V0IiwiT2JqZWN0IiwiZW50cmllcyIsIm1ldGhvZCIsImFkdmljZSIsIl9lbnN1cmUiLCJfaG9va0FzcGVjdHMiLCJhc3BlY3QiLCJsZW4iLCJwdXNoIiwiaW5pdE9wdGlvbnMiLCJyZXBsYWNlIiwic3BsaWNlIiwiaG9va09wdGlvbnMiLCJjbG9uZSIsImNvbGxlY3Rpb24iLCJpc0NsaWVudCIsIl9jb2xsZWN0aW9uIiwiX3N1cGVyIiwiZGlyZWN0IiwicHJvdG90eXBlIiwiZG9jIiwiX3RyYW5zZm9ybSIsImQiLCJkZWZpbmVBZHZpY2UiLCJnZXRBZHZpY2UiLCJleHRlbmRPcHRpb25zIiwic291cmNlIiwiZ2V0RG9jcyIsInNlbGVjdG9yIiwiZmluZE9wdGlvbnMiLCJ0cmFuc2Zvcm0iLCJyZWFjdGl2ZSIsIm11bHRpIiwibGltaXQiLCJyZXN0IiwiYXNzaWduIiwibm9ybWFsaXplU2VsZWN0b3IiLCJPYmplY3RJRCIsIl9pZCIsImdldEZpZWxkcyIsIm11dGF0b3IiLCJmaWVsZHMiLCJvcGVyYXRvcnMiLCJvcCIsInBhcmFtcyIsImluY2x1ZGVzIiwia2V5cyIsImZpZWxkIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsInJlYXNzaWduUHJvdG90eXBlIiwiaW5zdGFuY2UiLCJjb25zdHIiLCJoYXNTZXRQcm90b3R5cGVPZiIsInNldFByb3RvdHlwZU9mIiwiQ29sbGVjdGlvbiIsIl9fcHJvdG9fXyIsIndyYXBDb2xsZWN0aW9uIiwibnMiLCJhcyIsIl9Db2xsZWN0aW9uQ29uc3RydWN0b3IiLCJfQ29sbGVjdGlvblByb3RvdHlwZSIsIl9OZXdDb2xsZWN0aW9uQ29udHJ1Y3RvciIsInByb3RvIiwicmV0IiwicHJvcCIsIkZ1bmN0aW9uIiwibW9kaWZ5IiwiX21vZGlmeSIsImFzcGVjdHMiLCJnZXRUcmFuc2Zvcm0iLCJzdXBwcmVzc0FzcGVjdHMiLCJjdHgiLCJjb250ZXh0IiwiX2dldEZpbmRTZWxlY3RvciIsIl9nZXRGaW5kT3B0aW9ucyIsImFib3J0IiwibyIsInIiLCJjdXJzb3IiLCJjYWxsYmFjayIsImFzeW5jIiwiaWQiLCJlcnIiLCJvcHMiLCJfc3RyIiwidG9TdHJpbmciLCJsY3R4Iiwid3JhcHBlZENhbGxiYWNrIiwib2JqIiwiaXNFbXB0eSIsImEiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJkb2NzIiwicHJldiIsImZldGNoIiwicmVzdWx0IiwiZG9jSWRzIiwibWFwIiwic29tZSIsImZldGNoUHJldmlvdXMiLCJhZmZlY3RlZCIsIiRpbiIsInByZXZpb3VzIiwiYXNwZWN0R3JvdXAiLCJudW1iZXJBZmZlY3RlZCIsImFmdGVyVXBkYXRlIiwiYWZ0ZXJJbnNlcnQiLCJpbnNlcnRlZElkIiwidXNlcnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsaUJBQWUsRUFBQyxNQUFJQTtBQUFyQixDQUFkO0FBQXFELElBQUlDLE1BQUo7QUFBV0gsTUFBTSxDQUFDSSxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDRCxRQUFNLENBQUNFLENBQUQsRUFBRztBQUFDRixVQUFNLEdBQUNFLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSUgsZUFBSjtBQUFvQkYsTUFBTSxDQUFDSSxJQUFQLENBQVksb0JBQVosRUFB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Q0FBekU7O0FBSWhKLElBQUlGLE1BQU0sQ0FBQzhKLEtBQVgsRUFBa0I7QUFDaEI7QUFDQS9KLGlCQUFlLENBQUNrRyxpQkFBaEIsQ0FBa0NqRyxNQUFNLENBQUM4SixLQUF6QyxFQUZnQixDQUloQjs7QUFDQS9KLGlCQUFlLENBQUMyQyx3QkFBaEIsQ0FBeUMxQyxNQUFNLENBQUM4SixLQUFoRCxFQUF1RHRJLEtBQUssQ0FBQzhFLFVBQTdEO0FBQ0QsQyIsImZpbGUiOiIvcGFja2FnZXMvbWF0YjMzX2NvbGxlY3Rpb24taG9va3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbkhvb2tzIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWhvb2tzJ1xuXG5pbXBvcnQgJy4vYWR2aWNlcydcblxuY29uc3QgcHVibGlzaFVzZXJJZCA9IG5ldyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZSgpXG5cbkNvbGxlY3Rpb25Ib29rcy5nZXRVc2VySWQgPSBmdW5jdGlvbiBnZXRVc2VySWQgKCkge1xuICBsZXQgdXNlcklkXG5cbiAgdHJ5IHtcbiAgICAvLyBXaWxsIHRocm93IGFuIGVycm9yIHVubGVzcyB3aXRoaW4gbWV0aG9kIGNhbGwuXG4gICAgLy8gQXR0ZW1wdCB0byByZWNvdmVyIGdyYWNlZnVsbHkgYnkgY2F0Y2hpbmc6XG4gICAgdXNlcklkID0gTWV0ZW9yLnVzZXJJZCAmJiBNZXRlb3IudXNlcklkKClcbiAgfSBjYXRjaCAoZSkge31cblxuICBpZiAodXNlcklkID09IG51bGwpIHtcbiAgICAvLyBHZXQgdGhlIHVzZXJJZCBpZiB3ZSBhcmUgaW4gYSBwdWJsaXNoIGZ1bmN0aW9uLlxuICAgIHVzZXJJZCA9IHB1Ymxpc2hVc2VySWQuZ2V0KClcbiAgfVxuXG4gIGlmICh1c2VySWQgPT0gbnVsbCkge1xuICAgIHVzZXJJZCA9IENvbGxlY3Rpb25Ib29rcy5kZWZhdWx0VXNlcklkXG4gIH1cblxuICByZXR1cm4gdXNlcklkXG59XG5cbmNvbnN0IF9wdWJsaXNoID0gTWV0ZW9yLnB1Ymxpc2hcbk1ldGVvci5wdWJsaXNoID0gZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIF9wdWJsaXNoLmNhbGwodGhpcywgbmFtZSwgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCByZXBlYXRlZGx5IGluIHB1YmxpY2F0aW9uc1xuICAgIHJldHVybiBwdWJsaXNoVXNlcklkLndpdGhWYWx1ZSh0aGlzICYmIHRoaXMudXNlcklkLCAoKSA9PiBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpKVxuICB9LCBvcHRpb25zKVxufVxuXG4vLyBNYWtlIHRoZSBhYm92ZSBhdmFpbGFibGUgZm9yIHBhY2thZ2VzIHdpdGggaG9va3MgdGhhdCB3YW50IHRvIGRldGVybWluZVxuLy8gd2hldGhlciB0aGV5IGFyZSBydW5uaW5nIGluc2lkZSBhIHB1Ymxpc2ggZnVuY3Rpb24gb3Igbm90LlxuQ29sbGVjdGlvbkhvb2tzLmlzV2l0aGluUHVibGlzaCA9ICgpID0+IHB1Ymxpc2hVc2VySWQuZ2V0KCkgIT09IHVuZGVmaW5lZFxuXG5leHBvcnQge1xuICBDb2xsZWN0aW9uSG9va3Ncbn1cbiIsImltcG9ydCAnLi9pbnNlcnQuanMnXG5pbXBvcnQgJy4vdXBkYXRlLmpzJ1xuaW1wb3J0ICcuL3JlbW92ZS5qcydcbmltcG9ydCAnLi91cHNlcnQuanMnXG5pbXBvcnQgJy4vZmluZC5qcydcbmltcG9ydCAnLi9maW5kb25lLmpzJ1xuXG4vLyBMb2FkIGFmdGVyIGFsbCBhZHZpY2VzIGhhdmUgYmVlbiBkZWZpbmVkXG5pbXBvcnQgJy4vdXNlcnMtY29tcGF0LmpzJ1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcidcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJ1xuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nXG5pbXBvcnQgeyBMb2NhbENvbGxlY3Rpb24gfSBmcm9tICdtZXRlb3IvbWluaW1vbmdvJ1xuXG4vLyBSZWxldmFudCBBT1AgdGVybWlub2xvZ3k6XG4vLyBBc3BlY3Q6IFVzZXIgY29kZSB0aGF0IHJ1bnMgYmVmb3JlL2FmdGVyIChob29rKVxuLy8gQWR2aWNlOiBXcmFwcGVyIGNvZGUgdGhhdCBrbm93cyB3aGVuIHRvIGNhbGwgdXNlciBjb2RlIChhc3BlY3RzKVxuLy8gUG9pbnRjdXQ6IGJlZm9yZS9hZnRlclxuY29uc3QgYWR2aWNlcyA9IHt9XG5cbmV4cG9ydCBjb25zdCBDb2xsZWN0aW9uSG9va3MgPSB7XG4gIGRlZmF1bHRzOiB7XG4gICAgYmVmb3JlOiB7IGluc2VydDoge30sIHVwZGF0ZToge30sIHJlbW92ZToge30sIHVwc2VydDoge30sIGZpbmQ6IHt9LCBmaW5kT25lOiB7fSwgYWxsOiB7fSB9LFxuICAgIGFmdGVyOiB7IGluc2VydDoge30sIHVwZGF0ZToge30sIHJlbW92ZToge30sIGZpbmQ6IHt9LCBmaW5kT25lOiB7fSwgYWxsOiB7fSB9LFxuICAgIGFsbDogeyBpbnNlcnQ6IHt9LCB1cGRhdGU6IHt9LCByZW1vdmU6IHt9LCBmaW5kOiB7fSwgZmluZE9uZToge30sIGFsbDoge30gfVxuICB9LFxuICBkaXJlY3RFbnY6IG5ldyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZSgpLFxuICBkaXJlY3RPcCAoZnVuYykge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdEVudi53aXRoVmFsdWUodHJ1ZSwgZnVuYylcbiAgfSxcbiAgaG9va2VkT3AgKGZ1bmMpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3RFbnYud2l0aFZhbHVlKGZhbHNlLCBmdW5jKVxuICB9XG59XG5cbkNvbGxlY3Rpb25Ib29rcy5leHRlbmRDb2xsZWN0aW9uSW5zdGFuY2UgPSBmdW5jdGlvbiBleHRlbmRDb2xsZWN0aW9uSW5zdGFuY2UgKHNlbGYsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIE9mZmVyIGEgcHVibGljIEFQSSB0byBhbGxvdyB0aGUgdXNlciB0byBkZWZpbmUgYXNwZWN0c1xuICAvLyBFeGFtcGxlOiBjb2xsZWN0aW9uLmJlZm9yZS5pbnNlcnQoZnVuYyk7XG4gIFsnYmVmb3JlJywgJ2FmdGVyJ10uZm9yRWFjaChmdW5jdGlvbiAocG9pbnRjdXQpIHtcbiAgICBPYmplY3QuZW50cmllcyhhZHZpY2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChbbWV0aG9kLCBhZHZpY2VdKSB7XG4gICAgICBpZiAoYWR2aWNlID09PSAndXBzZXJ0JyAmJiBwb2ludGN1dCA9PT0gJ2FmdGVyJykgcmV0dXJuXG5cbiAgICAgIE1ldGVvci5fZW5zdXJlKHNlbGYsIHBvaW50Y3V0LCBtZXRob2QpXG4gICAgICBNZXRlb3IuX2Vuc3VyZShzZWxmLCAnX2hvb2tBc3BlY3RzJywgbWV0aG9kKVxuXG4gICAgICBzZWxmLl9ob29rQXNwZWN0c1ttZXRob2RdW3BvaW50Y3V0XSA9IFtdXG4gICAgICBzZWxmW3BvaW50Y3V0XVttZXRob2RdID0gZnVuY3Rpb24gKGFzcGVjdCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsZW4gPSBzZWxmLl9ob29rQXNwZWN0c1ttZXRob2RdW3BvaW50Y3V0XS5wdXNoKHtcbiAgICAgICAgICBhc3BlY3QsXG4gICAgICAgICAgb3B0aW9uczogQ29sbGVjdGlvbkhvb2tzLmluaXRPcHRpb25zKG9wdGlvbnMsIHBvaW50Y3V0LCBtZXRob2QpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXBsYWNlIChhc3BlY3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHNlbGYuX2hvb2tBc3BlY3RzW21ldGhvZF1bcG9pbnRjdXRdLnNwbGljZShsZW4gLSAxLCAxLCB7XG4gICAgICAgICAgICAgIGFzcGVjdCxcbiAgICAgICAgICAgICAgb3B0aW9uczogQ29sbGVjdGlvbkhvb2tzLmluaXRPcHRpb25zKG9wdGlvbnMsIHBvaW50Y3V0LCBtZXRob2QpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVtb3ZlICgpIHtcbiAgICAgICAgICAgIHNlbGYuX2hvb2tBc3BlY3RzW21ldGhvZF1bcG9pbnRjdXRdLnNwbGljZShsZW4gLSAxLCAxKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgLy8gT2ZmZXIgYSBwdWJsaWNseSBhY2Nlc3NpYmxlIG9iamVjdCB0byBhbGxvdyB0aGUgdXNlciB0byBkZWZpbmVcbiAgLy8gY29sbGVjdGlvbi13aWRlIGhvb2sgb3B0aW9ucy5cbiAgLy8gRXhhbXBsZTogY29sbGVjdGlvbi5ob29rT3B0aW9ucy5hZnRlci51cGRhdGUgPSB7ZmV0Y2hQcmV2aW91czogZmFsc2V9O1xuICBzZWxmLmhvb2tPcHRpb25zID0gRUpTT04uY2xvbmUoQ29sbGVjdGlvbkhvb2tzLmRlZmF1bHRzKVxuXG4gIC8vIFdyYXAgbXV0YXRvciBtZXRob2RzLCBsZXR0aW5nIHRoZSBkZWZpbmVkIGFkdmljZSBkbyB0aGUgd29ya1xuICBPYmplY3QuZW50cmllcyhhZHZpY2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChbbWV0aG9kLCBhZHZpY2VdKSB7XG4gICAgY29uc3QgY29sbGVjdGlvbiA9IE1ldGVvci5pc0NsaWVudCB8fCBtZXRob2QgPT09ICd1cHNlcnQnID8gc2VsZiA6IHNlbGYuX2NvbGxlY3Rpb25cblxuICAgIC8vIFN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBvcmlnaW5hbCBtdXRhdG9yIG1ldGhvZFxuICAgIGNvbnN0IF9zdXBlciA9IGNvbGxlY3Rpb25bbWV0aG9kXVxuXG4gICAgTWV0ZW9yLl9lbnN1cmUoc2VsZiwgJ2RpcmVjdCcsIG1ldGhvZClcbiAgICBzZWxmLmRpcmVjdFttZXRob2RdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIHJldHVybiBDb2xsZWN0aW9uSG9va3MuZGlyZWN0T3AoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZF0uYXBwbHkoc2VsZiwgYXJncylcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29sbGVjdGlvblttZXRob2RdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIGlmIChDb2xsZWN0aW9uSG9va3MuZGlyZWN0RW52LmdldCgpID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuYXBwbHkoY29sbGVjdGlvbiwgYXJncylcbiAgICAgIH1cblxuICAgICAgLy8gTk9URTogc2hvdWxkIHdlIGRlY2lkZSB0byBmb3JjZSBgdXBkYXRlYCB3aXRoIGB7dXBzZXJ0OnRydWV9YCB0byB1c2VcbiAgICAgIC8vIHRoZSBgdXBzZXJ0YCBob29rcywgdGhpcyBpcyB3aGF0IHdpbGwgYWNjb21wbGlzaCBpdC4gSXQncyBpbXBvcnRhbnQgdG9cbiAgICAgIC8vIHJlYWxpemUgdGhhdCBNZXRlb3Igd29uJ3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBhbiBgdXBkYXRlYCBhbmQgYW5cbiAgICAgIC8vIGBpbnNlcnRgIHRob3VnaCwgc28gd2UnbGwgZW5kIHVwIHdpdGggYGFmdGVyLnVwZGF0ZWAgZ2V0dGluZyBjYWxsZWRcbiAgICAgIC8vIGV2ZW4gb24gYW4gYGluc2VydGAuIFRoYXQncyB3aHkgd2UndmUgY2hvc2VuIHRvIGRpc2FibGUgdGhpcyBmb3Igbm93LlxuICAgICAgLy8gaWYgKG1ldGhvZCA9PT0gXCJ1cGRhdGVcIiAmJiBPYmplY3QoYXJnc1syXSkgPT09IGFyZ3NbMl0gJiYgYXJnc1syXS51cHNlcnQpIHtcbiAgICAgIC8vICAgbWV0aG9kID0gXCJ1cHNlcnRcIjtcbiAgICAgIC8vICAgYWR2aWNlID0gQ29sbGVjdGlvbkhvb2tzLmdldEFkdmljZShtZXRob2QpO1xuICAgICAgLy8gfVxuXG4gICAgICByZXR1cm4gYWR2aWNlLmNhbGwodGhpcyxcbiAgICAgICAgQ29sbGVjdGlvbkhvb2tzLmdldFVzZXJJZCgpLFxuICAgICAgICBfc3VwZXIsXG4gICAgICAgIHNlbGYsXG4gICAgICAgIG1ldGhvZCA9PT0gJ3Vwc2VydCcgPyB7XG4gICAgICAgICAgaW5zZXJ0OiBzZWxmLl9ob29rQXNwZWN0cy5pbnNlcnQgfHwge30sXG4gICAgICAgICAgdXBkYXRlOiBzZWxmLl9ob29rQXNwZWN0cy51cGRhdGUgfHwge30sXG4gICAgICAgICAgdXBzZXJ0OiBzZWxmLl9ob29rQXNwZWN0cy51cHNlcnQgfHwge31cbiAgICAgICAgfSA6IHNlbGYuX2hvb2tBc3BlY3RzW21ldGhvZF0gfHwge30sXG4gICAgICAgIGZ1bmN0aW9uIChkb2MpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdHlwZW9mIHNlbGYuX3RyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IGZ1bmN0aW9uIChkKSB7IHJldHVybiBzZWxmLl90cmFuc2Zvcm0oZCB8fCBkb2MpIH1cbiAgICAgICAgICAgICAgOiBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZCB8fCBkb2MgfVxuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgZmFsc2VcbiAgICAgIClcbiAgICB9XG4gIH0pXG59XG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UgPSAobWV0aG9kLCBhZHZpY2UpID0+IHtcbiAgYWR2aWNlc1ttZXRob2RdID0gYWR2aWNlXG59XG5cbkNvbGxlY3Rpb25Ib29rcy5nZXRBZHZpY2UgPSBtZXRob2QgPT4gYWR2aWNlc1ttZXRob2RdXG5cbkNvbGxlY3Rpb25Ib29rcy5pbml0T3B0aW9ucyA9IChvcHRpb25zLCBwb2ludGN1dCwgbWV0aG9kKSA9PlxuICBDb2xsZWN0aW9uSG9va3MuZXh0ZW5kT3B0aW9ucyhDb2xsZWN0aW9uSG9va3MuZGVmYXVsdHMsIG9wdGlvbnMsIHBvaW50Y3V0LCBtZXRob2QpXG5cbkNvbGxlY3Rpb25Ib29rcy5leHRlbmRPcHRpb25zID0gKHNvdXJjZSwgb3B0aW9ucywgcG9pbnRjdXQsIG1ldGhvZCkgPT5cbiAgKHsgLi4ub3B0aW9ucywgLi4uc291cmNlLmFsbC5hbGwsIC4uLnNvdXJjZVtwb2ludGN1dF0uYWxsLCAuLi5zb3VyY2UuYWxsW21ldGhvZF0sIC4uLnNvdXJjZVtwb2ludGN1dF1bbWV0aG9kXSB9KVxuXG5Db2xsZWN0aW9uSG9va3MuZ2V0RG9jcyA9IGZ1bmN0aW9uIGdldERvY3MgKGNvbGxlY3Rpb24sIHNlbGVjdG9yLCBvcHRpb25zKSB7XG4gIGNvbnN0IGZpbmRPcHRpb25zID0geyB0cmFuc2Zvcm06IG51bGwsIHJlYWN0aXZlOiBmYWxzZSB9IC8vIGFkZGVkIHJlYWN0aXZlOiBmYWxzZVxuXG4gIC8qXG4gIC8vIE5vIFwiZmV0Y2hcIiBzdXBwb3J0IGF0IHRoaXMgdGltZS5cbiAgaWYgKCF0aGlzLl92YWxpZGF0b3JzLmZldGNoQWxsRmllbGRzKSB7XG4gICAgZmluZE9wdGlvbnMuZmllbGRzID0ge307XG4gICAgdGhpcy5fdmFsaWRhdG9ycy5mZXRjaC5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkTmFtZSkge1xuICAgICAgZmluZE9wdGlvbnMuZmllbGRzW2ZpZWxkTmFtZV0gPSAxO1xuICAgIH0pO1xuICB9XG4gICovXG5cbiAgLy8gQml0IG9mIGEgbWFnaWMgY29uZGl0aW9uIGhlcmUuLi4gb25seSBcInVwZGF0ZVwiIHBhc3NlcyBvcHRpb25zLCBzbyB0aGlzIGlzXG4gIC8vIG9ubHkgcmVsZXZhbnQgdG8gd2hlbiB1cGRhdGUgY2FsbHMgZ2V0RG9jczpcbiAgaWYgKG9wdGlvbnMpIHtcbiAgICAvLyBUaGlzIHdhcyBhZGRlZCBiZWNhdXNlIGluIG91ciBjYXNlLCB3ZSBhcmUgcG90ZW50aWFsbHkgaXRlcmF0aW5nIG92ZXJcbiAgICAvLyBtdWx0aXBsZSBkb2NzLiBJZiBtdWx0aSBpc24ndCBlbmFibGVkLCBmb3JjZSBhIGxpbWl0IChhbG1vc3QgbGlrZVxuICAgIC8vIGZpbmRPbmUpLCBhcyB0aGUgZGVmYXVsdCBmb3IgdXBkYXRlIHdpdGhvdXQgbXVsdGkgZW5hYmxlZCBpcyB0byBhZmZlY3RcbiAgICAvLyBvbmx5IHRoZSBmaXJzdCBtYXRjaGVkIGRvY3VtZW50OlxuICAgIGlmICghb3B0aW9ucy5tdWx0aSkge1xuICAgICAgZmluZE9wdGlvbnMubGltaXQgPSAxXG4gICAgfVxuICAgIGNvbnN0IHsgbXVsdGksIHVwc2VydCwgLi4ucmVzdCB9ID0gb3B0aW9uc1xuICAgIE9iamVjdC5hc3NpZ24oZmluZE9wdGlvbnMsIHJlc3QpXG4gIH1cblxuICAvLyBVbmxpa2UgdmFsaWRhdG9ycywgd2UgaXRlcmF0ZSBvdmVyIG11bHRpcGxlIGRvY3MsIHNvIHVzZVxuICAvLyBmaW5kIGluc3RlYWQgb2YgZmluZE9uZTpcbiAgcmV0dXJuIGNvbGxlY3Rpb24uZmluZChzZWxlY3RvciwgZmluZE9wdGlvbnMpXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gbm9ybWFsaXplcyB0aGUgc2VsZWN0b3IgKGNvbnZlcnRpbmcgaXQgdG8gYW4gT2JqZWN0KVxuQ29sbGVjdGlvbkhvb2tzLm5vcm1hbGl6ZVNlbGVjdG9yID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnIHx8IChzZWxlY3RvciAmJiBzZWxlY3Rvci5jb25zdHJ1Y3RvciA9PT0gTW9uZ28uT2JqZWN0SUQpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9pZDogc2VsZWN0b3JcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yXG4gIH1cbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBjb250YWlucyBhIHNuaXBwZXQgb2YgY29kZSBwdWxsZWQgYW5kIG1vZGlmaWVkIGZyb206XG4vLyB+Ly5tZXRlb3IvcGFja2FnZXMvbW9uZ28tbGl2ZWRhdGEvY29sbGVjdGlvbi5qc1xuLy8gSXQncyBjb250YWluZWQgaW4gdGhlc2UgdXRpbGl0eSBmdW5jdGlvbnMgdG8gbWFrZSB1cGRhdGVzIGVhc2llciBmb3IgdXMgaW5cbi8vIGNhc2UgdGhpcyBjb2RlIGNoYW5nZXMuXG5Db2xsZWN0aW9uSG9va3MuZ2V0RmllbGRzID0gZnVuY3Rpb24gZ2V0RmllbGRzIChtdXRhdG9yKSB7XG4gIC8vIGNvbXB1dGUgbW9kaWZpZWQgZmllbGRzXG4gIGNvbnN0IGZpZWxkcyA9IFtdXG4gIC8vID09PT1BRERFRCBTVEFSVD09PT09PT09PT09PT09PT09PT09PT09XG4gIGNvbnN0IG9wZXJhdG9ycyA9IFtcbiAgICAnJGFkZFRvU2V0JyxcbiAgICAnJGJpdCcsXG4gICAgJyRjdXJyZW50RGF0ZScsXG4gICAgJyRpbmMnLFxuICAgICckbWF4JyxcbiAgICAnJG1pbicsXG4gICAgJyRwb3AnLFxuICAgICckcHVsbCcsXG4gICAgJyRwdWxsQWxsJyxcbiAgICAnJHB1c2gnLFxuICAgICckcmVuYW1lJyxcbiAgICAnJHNldCcsXG4gICAgJyR1bnNldCdcbiAgXVxuICAvLyA9PT09QURERUQgRU5EPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIE9iamVjdC5lbnRyaWVzKG11dGF0b3IpLmZvckVhY2goZnVuY3Rpb24gKFtvcCwgcGFyYW1zXSkge1xuICAgIC8vID09PT1BRERFRCBTVEFSVD09PT09PT09PT09PT09PT09PT09PT09XG4gICAgaWYgKG9wZXJhdG9ycy5pbmNsdWRlcyhvcCkpIHtcbiAgICAvLyA9PT09QURERUQgRU5EPT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAvLyB0cmVhdCBkb3R0ZWQgZmllbGRzIGFzIGlmIHRoZXkgYXJlIHJlcGxhY2luZyB0aGVpclxuICAgICAgICAvLyB0b3AtbGV2ZWwgcGFydFxuICAgICAgICBpZiAoZmllbGQuaW5kZXhPZignLicpICE9PSAtMSkge1xuICAgICAgICAgIGZpZWxkID0gZmllbGQuc3Vic3RyaW5nKDAsIGZpZWxkLmluZGV4T2YoJy4nKSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlY29yZCB0aGUgZmllbGQgd2UgYXJlIHRyeWluZyB0byBjaGFuZ2VcbiAgICAgICAgaWYgKCFmaWVsZHMuaW5jbHVkZXMoZmllbGQpKSB7XG4gICAgICAgICAgZmllbGRzLnB1c2goZmllbGQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAvLyA9PT09QURERUQgU1RBUlQ9PT09PT09PT09PT09PT09PT09PT09PVxuICAgIH0gZWxzZSB7XG4gICAgICBmaWVsZHMucHVzaChvcClcbiAgICB9XG4gICAgLy8gPT09PUFEREVEIEVORD09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgfSlcblxuICByZXR1cm4gZmllbGRzXG59XG5cbkNvbGxlY3Rpb25Ib29rcy5yZWFzc2lnblByb3RvdHlwZSA9IGZ1bmN0aW9uIHJlYXNzaWduUHJvdG90eXBlIChpbnN0YW5jZSwgY29uc3RyKSB7XG4gIGNvbnN0IGhhc1NldFByb3RvdHlwZU9mID0gdHlwZW9mIE9iamVjdC5zZXRQcm90b3R5cGVPZiA9PT0gJ2Z1bmN0aW9uJ1xuICBjb25zdHIgPSBjb25zdHIgfHwgTW9uZ28uQ29sbGVjdGlvblxuXG4gIC8vIF9fcHJvdG9fXyBpcyBub3QgYXZhaWxhYmxlIGluIDwgSUUxMVxuICAvLyBOb3RlOiBBc3NpZ25pbmcgYSBwcm90b3R5cGUgZHluYW1pY2FsbHkgaGFzIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9uc1xuICBpZiAoaGFzU2V0UHJvdG90eXBlT2YpIHtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIGNvbnN0ci5wcm90b3R5cGUpXG4gIH0gZWxzZSBpZiAoaW5zdGFuY2UuX19wcm90b19fKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG9cbiAgICBpbnN0YW5jZS5fX3Byb3RvX18gPSBjb25zdHIucHJvdG90eXBlIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG9cbiAgfVxufVxuXG5Db2xsZWN0aW9uSG9va3Mud3JhcENvbGxlY3Rpb24gPSBmdW5jdGlvbiB3cmFwQ29sbGVjdGlvbiAobnMsIGFzKSB7XG4gIGlmICghYXMuX0NvbGxlY3Rpb25Db25zdHJ1Y3RvcikgYXMuX0NvbGxlY3Rpb25Db25zdHJ1Y3RvciA9IGFzLkNvbGxlY3Rpb25cbiAgaWYgKCFhcy5fQ29sbGVjdGlvblByb3RvdHlwZSkgYXMuX0NvbGxlY3Rpb25Qcm90b3R5cGUgPSBuZXcgYXMuQ29sbGVjdGlvbihudWxsKVxuXG4gIGNvbnN0IGNvbnN0cnVjdG9yID0gbnMuX05ld0NvbGxlY3Rpb25Db250cnVjdG9yIHx8IGFzLl9Db2xsZWN0aW9uQ29uc3RydWN0b3JcbiAgY29uc3QgcHJvdG8gPSBhcy5fQ29sbGVjdGlvblByb3RvdHlwZVxuXG4gIG5zLkNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIGNvbnN0IHJldCA9IGNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgQ29sbGVjdGlvbkhvb2tzLmV4dGVuZENvbGxlY3Rpb25JbnN0YW5jZSh0aGlzLCBjb25zdHJ1Y3RvcilcbiAgICByZXR1cm4gcmV0XG4gIH1cbiAgLy8gUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgY29uc3RydWN0b3IgdG8gYWxsb3cgZnVydGhlciB3cmFwcGluZy5cbiAgbnMuX05ld0NvbGxlY3Rpb25Db250cnVjdG9yID0gbnMuQ29sbGVjdGlvblxuXG4gIG5zLkNvbGxlY3Rpb24ucHJvdG90eXBlID0gcHJvdG9cbiAgbnMuQ29sbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBucy5Db2xsZWN0aW9uXG5cbiAgZm9yIChjb25zdCBwcm9wIG9mIE9iamVjdC5rZXlzKGNvbnN0cnVjdG9yKSkge1xuICAgIG5zLkNvbGxlY3Rpb25bcHJvcF0gPSBjb25zdHJ1Y3Rvcltwcm9wXVxuICB9XG5cbiAgLy8gTWV0ZW9yIG92ZXJyaWRlcyB0aGUgYXBwbHkgbWV0aG9kIHdoaWNoIGlzIGNvcGllZCBmcm9tIHRoZSBjb25zdHJ1Y3RvciBpbiB0aGUgbG9vcCBhYm92ZS4gUmVwbGFjZSBpdCB3aXRoIHRoZVxuICAvLyBkZWZhdWx0IG1ldGhvZCB3aGljaCB3ZSBuZWVkIGlmIHdlIHdlcmUgdG8gZnVydGhlciB3cmFwIG5zLkNvbGxlY3Rpb24uXG4gIG5zLkNvbGxlY3Rpb24uYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlcbn1cblxuQ29sbGVjdGlvbkhvb2tzLm1vZGlmeSA9IExvY2FsQ29sbGVjdGlvbi5fbW9kaWZ5XG5cbmlmICh0eXBlb2YgTW9uZ28gIT09ICd1bmRlZmluZWQnKSB7XG4gIENvbGxlY3Rpb25Ib29rcy53cmFwQ29sbGVjdGlvbihNZXRlb3IsIE1vbmdvKVxuICBDb2xsZWN0aW9uSG9va3Mud3JhcENvbGxlY3Rpb24oTW9uZ28sIE1vbmdvKVxufSBlbHNlIHtcbiAgQ29sbGVjdGlvbkhvb2tzLndyYXBDb2xsZWN0aW9uKE1ldGVvciwgTWV0ZW9yKVxufVxuIiwiaW1wb3J0IHsgQ29sbGVjdGlvbkhvb2tzIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWhvb2tzJ1xuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCdmaW5kJywgZnVuY3Rpb24gKHVzZXJJZCwgX3N1cGVyLCBpbnN0YW5jZSwgYXNwZWN0cywgZ2V0VHJhbnNmb3JtLCBhcmdzLCBzdXBwcmVzc0FzcGVjdHMpIHtcbiAgY29uc3QgY3R4ID0geyBjb250ZXh0OiB0aGlzLCBfc3VwZXIsIGFyZ3MgfVxuICBjb25zdCBzZWxlY3RvciA9IENvbGxlY3Rpb25Ib29rcy5ub3JtYWxpemVTZWxlY3RvcihpbnN0YW5jZS5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpKVxuICBjb25zdCBvcHRpb25zID0gaW5zdGFuY2UuX2dldEZpbmRPcHRpb25zKGFyZ3MpXG4gIGxldCBhYm9ydFxuICAvLyBiZWZvcmVcbiAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICBhc3BlY3RzLmJlZm9yZS5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCByID0gby5hc3BlY3QuY2FsbChjdHgsIHVzZXJJZCwgc2VsZWN0b3IsIG9wdGlvbnMpXG4gICAgICBpZiAociA9PT0gZmFsc2UpIGFib3J0ID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBpZiAoYWJvcnQpIHJldHVybiBpbnN0YW5jZS5maW5kKHVuZGVmaW5lZClcbiAgfVxuXG4gIGNvbnN0IGFmdGVyID0gKGN1cnNvcikgPT4ge1xuICAgIGlmICghc3VwcHJlc3NBc3BlY3RzKSB7XG4gICAgICBhc3BlY3RzLmFmdGVyLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgby5hc3BlY3QuY2FsbChjdHgsIHVzZXJJZCwgc2VsZWN0b3IsIG9wdGlvbnMsIGN1cnNvcilcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmV0ID0gX3N1cGVyLmNhbGwodGhpcywgc2VsZWN0b3IsIG9wdGlvbnMpXG4gIGFmdGVyKHJldClcblxuICByZXR1cm4gcmV0XG59KVxuIiwiaW1wb3J0IHsgQ29sbGVjdGlvbkhvb2tzIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWhvb2tzJ1xuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCdmaW5kT25lJywgZnVuY3Rpb24gKHVzZXJJZCwgX3N1cGVyLCBpbnN0YW5jZSwgYXNwZWN0cywgZ2V0VHJhbnNmb3JtLCBhcmdzLCBzdXBwcmVzc0FzcGVjdHMpIHtcbiAgY29uc3QgY3R4ID0geyBjb250ZXh0OiB0aGlzLCBfc3VwZXIsIGFyZ3MgfVxuICBjb25zdCBzZWxlY3RvciA9IENvbGxlY3Rpb25Ib29rcy5ub3JtYWxpemVTZWxlY3RvcihpbnN0YW5jZS5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpKVxuICBjb25zdCBvcHRpb25zID0gaW5zdGFuY2UuX2dldEZpbmRPcHRpb25zKGFyZ3MpXG4gIGxldCBhYm9ydFxuXG4gIC8vIGJlZm9yZVxuICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgIGFzcGVjdHMuYmVmb3JlLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IHIgPSBvLmFzcGVjdC5jYWxsKGN0eCwgdXNlcklkLCBzZWxlY3Rvciwgb3B0aW9ucylcbiAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgfSlcblxuICAgIGlmIChhYm9ydCkgcmV0dXJuXG4gIH1cblxuICBmdW5jdGlvbiBhZnRlciAoZG9jKSB7XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICAgIGFzcGVjdHMuYWZ0ZXIuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBvLmFzcGVjdC5jYWxsKGN0eCwgdXNlcklkLCBzZWxlY3Rvciwgb3B0aW9ucywgZG9jKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXQgPSBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3Rvciwgb3B0aW9ucylcbiAgYWZ0ZXIocmV0KVxuXG4gIHJldHVybiByZXRcbn0pXG4iLCJpbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbidcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbkhvb2tzIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWhvb2tzJ1xuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCdpbnNlcnQnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RzLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBjb25zdCBjdHggPSB7IGNvbnRleHQ6IHRoaXMsIF9zdXBlciwgYXJncyB9XG4gIGxldCBbZG9jLCBjYWxsYmFja10gPSBhcmdzXG4gIGNvbnN0IGFzeW5jID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nXG4gIGxldCBhYm9ydFxuICBsZXQgcmV0XG5cbiAgLy8gYmVmb3JlXG4gIGlmICghc3VwcHJlc3NBc3BlY3RzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGFzcGVjdHMuYmVmb3JlLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgY29uc3QgciA9IG8uYXNwZWN0LmNhbGwoeyB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLCAuLi5jdHggfSwgdXNlcklkLCBkb2MpXG4gICAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgICB9KVxuXG4gICAgICBpZiAoYWJvcnQpIHJldHVyblxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChhc3luYykgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZSlcbiAgICAgIHRocm93IGVcbiAgICB9XG4gIH1cblxuICBjb25zdCBhZnRlciA9IChpZCwgZXJyKSA9PiB7XG4gICAgaWYgKGlkKSB7XG4gICAgICAvLyBJbiBzb21lIGNhc2VzIChuYW1lbHkgTWV0ZW9yLnVzZXJzIG9uIE1ldGVvciAxLjQrKSwgdGhlIF9pZCBwcm9wZXJ0eVxuICAgICAgLy8gaXMgYSByYXcgbW9uZ28gX2lkIG9iamVjdC4gV2UgbmVlZCB0byBleHRyYWN0IHRoZSBfaWQgZnJvbSB0aGlzIG9iamVjdFxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ29iamVjdCcgJiYgaWQub3BzKSB7XG4gICAgICAgIC8vIElmIF9zdHIgdGhlbiBjb2xsZWN0aW9uIGlzIHVzaW5nIE1vbmdvLk9iamVjdElEIGFzIGlkc1xuICAgICAgICBpZiAoZG9jLl9pZC5fc3RyKSB7XG4gICAgICAgICAgaWQgPSBuZXcgTW9uZ28uT2JqZWN0SUQoZG9jLl9pZC5fc3RyLnRvU3RyaW5nKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWQgPSBpZC5vcHMgJiYgaWQub3BzWzBdICYmIGlkLm9wc1swXS5faWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZG9jID0gRUpTT04uY2xvbmUoZG9jKVxuICAgICAgZG9jLl9pZCA9IGlkXG4gICAgfVxuICAgIGlmICghc3VwcHJlc3NBc3BlY3RzKSB7XG4gICAgICBjb25zdCBsY3R4ID0geyB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLCBfaWQ6IGlkLCBlcnIsIC4uLmN0eCB9XG4gICAgICBhc3BlY3RzLmFmdGVyLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgby5hc3BlY3QuY2FsbChsY3R4LCB1c2VySWQsIGRvYylcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBpZFxuICB9XG5cbiAgaWYgKGFzeW5jKSB7XG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gZnVuY3Rpb24gKGVyciwgb2JqLCAuLi5hcmdzKSB7XG4gICAgICBhZnRlcigob2JqICYmIG9ialswXSAmJiBvYmpbMF0uX2lkKSB8fCBvYmosIGVycilcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXMsIGVyciwgb2JqLCAuLi5hcmdzKVxuICAgIH1cbiAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgZG9jLCB3cmFwcGVkQ2FsbGJhY2spXG4gIH0gZWxzZSB7XG4gICAgcmV0ID0gX3N1cGVyLmNhbGwodGhpcywgZG9jLCBjYWxsYmFjaylcbiAgICByZXR1cm4gYWZ0ZXIoKHJldCAmJiByZXRbMF0gJiYgcmV0WzBdLl9pZCkgfHwgcmV0KVxuICB9XG59KVxuIiwiaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbmNvbnN0IGlzRW1wdHkgPSBhID0+ICFBcnJheS5pc0FycmF5KGEpIHx8ICFhLmxlbmd0aFxuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCdyZW1vdmUnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RzLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBjb25zdCBjdHggPSB7IGNvbnRleHQ6IHRoaXMsIF9zdXBlciwgYXJncyB9XG4gIGNvbnN0IFtzZWxlY3RvciwgY2FsbGJhY2tdID0gYXJnc1xuICBjb25zdCBhc3luYyA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJ1xuICBsZXQgZG9jc1xuICBsZXQgYWJvcnRcbiAgY29uc3QgcHJldiA9IFtdXG5cbiAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFpc0VtcHR5KGFzcGVjdHMuYmVmb3JlKSB8fCAhaXNFbXB0eShhc3BlY3RzLmFmdGVyKSkge1xuICAgICAgICBkb2NzID0gQ29sbGVjdGlvbkhvb2tzLmdldERvY3MuY2FsbCh0aGlzLCBpbnN0YW5jZSwgc2VsZWN0b3IpLmZldGNoKClcbiAgICAgIH1cblxuICAgICAgLy8gY29weSBvcmlnaW5hbHMgZm9yIGNvbnZlbmllbmNlIGZvciB0aGUgJ2FmdGVyJyBwb2ludGN1dFxuICAgICAgaWYgKCFpc0VtcHR5KGFzcGVjdHMuYWZ0ZXIpKSB7XG4gICAgICAgIGRvY3MuZm9yRWFjaChkb2MgPT4gcHJldi5wdXNoKEVKU09OLmNsb25lKGRvYykpKVxuICAgICAgfVxuXG4gICAgICAvLyBiZWZvcmVcbiAgICAgIGFzcGVjdHMuYmVmb3JlLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgZG9jcy5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgICAgICBjb25zdCByID0gby5hc3BlY3QuY2FsbCh7IHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksIC4uLmN0eCB9LCB1c2VySWQsIGRvYylcbiAgICAgICAgICBpZiAociA9PT0gZmFsc2UpIGFib3J0ID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaWYgKGFib3J0KSByZXR1cm4gMFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChhc3luYykgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZSlcbiAgICAgIHRocm93IGVcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZnRlciAoZXJyKSB7XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICAgIGFzcGVjdHMuYWZ0ZXIuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBwcmV2LmZvckVhY2goKGRvYykgPT4ge1xuICAgICAgICAgIG8uYXNwZWN0LmNhbGwoeyB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLCBlcnIsIC4uLmN0eCB9LCB1c2VySWQsIGRvYylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKGFzeW5jKSB7XG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gZnVuY3Rpb24gKGVyciwgLi4uYXJncykge1xuICAgICAgYWZ0ZXIoZXJyKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZXJyLCAuLi5hcmdzKVxuICAgIH1cbiAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgc2VsZWN0b3IsIHdyYXBwZWRDYWxsYmFjaylcbiAgfSBlbHNlIHtcbiAgICBjb25zdCByZXN1bHQgPSBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3RvciwgY2FsbGJhY2spXG4gICAgYWZ0ZXIoKVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufSlcbiIsImltcG9ydCB7IEVKU09OIH0gZnJvbSAnbWV0ZW9yL2Vqc29uJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbkhvb2tzIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWhvb2tzJ1xuXG5jb25zdCBpc0VtcHR5ID0gYSA9PiAhQXJyYXkuaXNBcnJheShhKSB8fCAhYS5sZW5ndGhcblxuQ29sbGVjdGlvbkhvb2tzLmRlZmluZUFkdmljZSgndXBkYXRlJywgZnVuY3Rpb24gKHVzZXJJZCwgX3N1cGVyLCBpbnN0YW5jZSwgYXNwZWN0cywgZ2V0VHJhbnNmb3JtLCBhcmdzLCBzdXBwcmVzc0FzcGVjdHMpIHtcbiAgY29uc3QgY3R4ID0geyBjb250ZXh0OiB0aGlzLCBfc3VwZXIsIGFyZ3MgfVxuICBsZXQgW3NlbGVjdG9yLCBtdXRhdG9yLCBvcHRpb25zLCBjYWxsYmFja10gPSBhcmdzXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG4gIGNvbnN0IGFzeW5jID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nXG4gIGxldCBkb2NzXG4gIGxldCBkb2NJZHNcbiAgbGV0IGZpZWxkc1xuICBsZXQgYWJvcnRcbiAgY29uc3QgcHJldiA9IHt9XG5cbiAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFpc0VtcHR5KGFzcGVjdHMuYmVmb3JlKSB8fCAhaXNFbXB0eShhc3BlY3RzLmFmdGVyKSkge1xuICAgICAgICBmaWVsZHMgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RmllbGRzKG11dGF0b3IpXG4gICAgICAgIGRvY3MgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RG9jcy5jYWxsKHRoaXMsIGluc3RhbmNlLCBzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKVxuICAgICAgICBkb2NJZHMgPSBkb2NzLm1hcChkb2MgPT4gZG9jLl9pZClcbiAgICAgIH1cblxuICAgICAgLy8gY29weSBvcmlnaW5hbHMgZm9yIGNvbnZlbmllbmNlIGZvciB0aGUgJ2FmdGVyJyBwb2ludGN1dFxuICAgICAgaWYgKCFpc0VtcHR5KGFzcGVjdHMuYWZ0ZXIpKSB7XG4gICAgICAgIHByZXYubXV0YXRvciA9IEVKU09OLmNsb25lKG11dGF0b3IpXG4gICAgICAgIHByZXYub3B0aW9ucyA9IEVKU09OLmNsb25lKG9wdGlvbnMpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhc3BlY3RzLmFmdGVyLnNvbWUobyA9PiBvLm9wdGlvbnMuZmV0Y2hQcmV2aW91cyAhPT0gZmFsc2UpICYmXG4gICAgICAgICAgQ29sbGVjdGlvbkhvb2tzLmV4dGVuZE9wdGlvbnMoaW5zdGFuY2UuaG9va09wdGlvbnMsIHt9LCAnYWZ0ZXInLCAndXBkYXRlJykuZmV0Y2hQcmV2aW91cyAhPT0gZmFsc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgcHJldi5kb2NzID0ge31cbiAgICAgICAgICBkb2NzLmZvckVhY2goKGRvYykgPT4ge1xuICAgICAgICAgICAgcHJldi5kb2NzW2RvYy5faWRdID0gRUpTT04uY2xvbmUoZG9jKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYmVmb3JlXG4gICAgICBhc3BlY3RzLmJlZm9yZS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIGRvY3MuZm9yRWFjaChmdW5jdGlvbiAoZG9jKSB7XG4gICAgICAgICAgY29uc3QgciA9IG8uYXNwZWN0LmNhbGwoeyB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLCAuLi5jdHggfSwgdXNlcklkLCBkb2MsIGZpZWxkcywgbXV0YXRvciwgb3B0aW9ucylcbiAgICAgICAgICBpZiAociA9PT0gZmFsc2UpIGFib3J0ID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaWYgKGFib3J0KSByZXR1cm4gMFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChhc3luYykgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZSlcbiAgICAgIHRocm93IGVcbiAgICB9XG4gIH1cblxuICBjb25zdCBhZnRlciA9IChhZmZlY3RlZCwgZXJyKSA9PiB7XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMgJiYgIWlzRW1wdHkoYXNwZWN0cy5hZnRlcikpIHtcbiAgICAgIGNvbnN0IGZpZWxkcyA9IENvbGxlY3Rpb25Ib29rcy5nZXRGaWVsZHMobXV0YXRvcilcbiAgICAgIGNvbnN0IGRvY3MgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RG9jcy5jYWxsKHRoaXMsIGluc3RhbmNlLCB7IF9pZDogeyAkaW46IGRvY0lkcyB9IH0sIG9wdGlvbnMpLmZldGNoKClcblxuICAgICAgYXNwZWN0cy5hZnRlci5mb3JFYWNoKChvKSA9PiB7XG4gICAgICAgIGRvY3MuZm9yRWFjaCgoZG9jKSA9PiB7XG4gICAgICAgICAgby5hc3BlY3QuY2FsbCh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLFxuICAgICAgICAgICAgcHJldmlvdXM6IHByZXYuZG9jcyAmJiBwcmV2LmRvY3NbZG9jLl9pZF0sXG4gICAgICAgICAgICBhZmZlY3RlZCxcbiAgICAgICAgICAgIGVycixcbiAgICAgICAgICAgIC4uLmN0eFxuICAgICAgICAgIH0sIHVzZXJJZCwgZG9jLCBmaWVsZHMsIHByZXYubXV0YXRvciwgcHJldi5vcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoYXN5bmMpIHtcbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyLCBhZmZlY3RlZCwgLi4uYXJncykge1xuICAgICAgYWZ0ZXIoYWZmZWN0ZWQsIGVycilcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXMsIGVyciwgYWZmZWN0ZWQsIC4uLmFyZ3MpXG4gICAgfVxuICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3RvciwgbXV0YXRvciwgb3B0aW9ucywgd3JhcHBlZENhbGxiYWNrKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFmZmVjdGVkID0gX3N1cGVyLmNhbGwodGhpcywgc2VsZWN0b3IsIG11dGF0b3IsIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgIGFmdGVyKGFmZmVjdGVkKVxuICAgIHJldHVybiBhZmZlY3RlZFxuICB9XG59KVxuIiwiaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbmNvbnN0IGlzRW1wdHkgPSBhID0+ICFBcnJheS5pc0FycmF5KGEpIHx8ICFhLmxlbmd0aFxuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCd1cHNlcnQnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RHcm91cCwgZ2V0VHJhbnNmb3JtLCBhcmdzLCBzdXBwcmVzc0FzcGVjdHMpIHtcbiAgYXJnc1swXSA9IENvbGxlY3Rpb25Ib29rcy5ub3JtYWxpemVTZWxlY3RvcihpbnN0YW5jZS5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpKVxuXG4gIGNvbnN0IGN0eCA9IHsgY29udGV4dDogdGhpcywgX3N1cGVyLCBhcmdzIH1cbiAgbGV0IFtzZWxlY3RvciwgbXV0YXRvciwgb3B0aW9ucywgY2FsbGJhY2tdID0gYXJnc1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGNvbnN0IGFzeW5jID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nXG4gIGxldCBkb2NzXG4gIGxldCBkb2NJZHNcbiAgbGV0IGFib3J0XG4gIGNvbnN0IHByZXYgPSB7fVxuXG4gIGlmICghc3VwcHJlc3NBc3BlY3RzKSB7XG4gICAgaWYgKCFpc0VtcHR5KGFzcGVjdEdyb3VwLnVwc2VydC5iZWZvcmUpIHx8ICFpc0VtcHR5KGFzcGVjdEdyb3VwLnVwZGF0ZS5hZnRlcikpIHtcbiAgICAgIGRvY3MgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RG9jcy5jYWxsKHRoaXMsIGluc3RhbmNlLCBzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKVxuICAgICAgZG9jSWRzID0gZG9jcy5tYXAoZG9jID0+IGRvYy5faWQpXG4gICAgfVxuXG4gICAgLy8gY29weSBvcmlnaW5hbHMgZm9yIGNvbnZlbmllbmNlIGZvciB0aGUgJ2FmdGVyJyBwb2ludGN1dFxuICAgIGlmICghaXNFbXB0eShhc3BlY3RHcm91cC51cGRhdGUuYWZ0ZXIpKSB7XG4gICAgICBpZiAoYXNwZWN0R3JvdXAudXBkYXRlLmFmdGVyLnNvbWUobyA9PiBvLm9wdGlvbnMuZmV0Y2hQcmV2aW91cyAhPT0gZmFsc2UpICYmXG4gICAgICAgIENvbGxlY3Rpb25Ib29rcy5leHRlbmRPcHRpb25zKGluc3RhbmNlLmhvb2tPcHRpb25zLCB7fSwgJ2FmdGVyJywgJ3VwZGF0ZScpLmZldGNoUHJldmlvdXMgIT09IGZhbHNlKSB7XG4gICAgICAgIHByZXYubXV0YXRvciA9IEVKU09OLmNsb25lKG11dGF0b3IpXG4gICAgICAgIHByZXYub3B0aW9ucyA9IEVKU09OLmNsb25lKG9wdGlvbnMpXG5cbiAgICAgICAgcHJldi5kb2NzID0ge31cbiAgICAgICAgZG9jcy5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgICAgICBwcmV2LmRvY3NbZG9jLl9pZF0gPSBFSlNPTi5jbG9uZShkb2MpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYmVmb3JlXG4gICAgYXNwZWN0R3JvdXAudXBzZXJ0LmJlZm9yZS5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCByID0gby5hc3BlY3QuY2FsbChjdHgsIHVzZXJJZCwgc2VsZWN0b3IsIG11dGF0b3IsIG9wdGlvbnMpXG4gICAgICBpZiAociA9PT0gZmFsc2UpIGFib3J0ID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBpZiAoYWJvcnQpIHJldHVybiB7IG51bWJlckFmZmVjdGVkOiAwIH1cbiAgfVxuXG4gIGNvbnN0IGFmdGVyVXBkYXRlID0gKGFmZmVjdGVkLCBlcnIpID0+IHtcbiAgICBpZiAoIXN1cHByZXNzQXNwZWN0cyAmJiAhaXNFbXB0eShhc3BlY3RHcm91cC51cGRhdGUuYWZ0ZXIpKSB7XG4gICAgICBjb25zdCBmaWVsZHMgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RmllbGRzKG11dGF0b3IpXG4gICAgICBjb25zdCBkb2NzID0gQ29sbGVjdGlvbkhvb2tzLmdldERvY3MuY2FsbCh0aGlzLCBpbnN0YW5jZSwgeyBfaWQ6IHsgJGluOiBkb2NJZHMgfSB9LCBvcHRpb25zKS5mZXRjaCgpXG5cbiAgICAgIGFzcGVjdEdyb3VwLnVwZGF0ZS5hZnRlci5mb3JFYWNoKChvKSA9PiB7XG4gICAgICAgIGRvY3MuZm9yRWFjaCgoZG9jKSA9PiB7XG4gICAgICAgICAgby5hc3BlY3QuY2FsbCh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLFxuICAgICAgICAgICAgcHJldmlvdXM6IHByZXYuZG9jcyAmJiBwcmV2LmRvY3NbZG9jLl9pZF0sXG4gICAgICAgICAgICBhZmZlY3RlZCxcbiAgICAgICAgICAgIGVycixcbiAgICAgICAgICAgIC4uLmN0eFxuICAgICAgICAgIH0sIHVzZXJJZCwgZG9jLCBmaWVsZHMsIHByZXYubXV0YXRvciwgcHJldi5vcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBhZnRlckluc2VydCA9IChfaWQsIGVycikgPT4ge1xuICAgIGlmICghc3VwcHJlc3NBc3BlY3RzICYmICFpc0VtcHR5KGFzcGVjdEdyb3VwLmluc2VydC5hZnRlcikpIHtcbiAgICAgIGNvbnN0IGRvYyA9IENvbGxlY3Rpb25Ib29rcy5nZXREb2NzLmNhbGwodGhpcywgaW5zdGFuY2UsIHsgX2lkIH0sIHNlbGVjdG9yLCB7fSkuZmV0Y2goKVswXSAvLyAzcmQgYXJndW1lbnQgcGFzc2VzIGVtcHR5IG9iamVjdCB3aGljaCBjYXVzZXMgbWFnaWMgbG9naWMgdG8gaW1wbHkgbGltaXQ6MVxuICAgICAgY29uc3QgbGN0eCA9IHsgdHJhbnNmb3JtOiBnZXRUcmFuc2Zvcm0oZG9jKSwgX2lkLCBlcnIsIC4uLmN0eCB9XG5cbiAgICAgIGFzcGVjdEdyb3VwLmluc2VydC5hZnRlci5mb3JFYWNoKChvKSA9PiB7XG4gICAgICAgIG8uYXNwZWN0LmNhbGwobGN0eCwgdXNlcklkLCBkb2MpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChhc3luYykge1xuICAgIGNvbnN0IHdyYXBwZWRDYWxsYmFjayA9IGZ1bmN0aW9uIChlcnIsIHJldCkge1xuICAgICAgaWYgKGVyciB8fCAocmV0ICYmIHJldC5pbnNlcnRlZElkKSkge1xuICAgICAgICAvLyBTZW5kIGFueSBlcnJvcnMgdG8gYWZ0ZXJJbnNlcnRcbiAgICAgICAgYWZ0ZXJJbnNlcnQocmV0Lmluc2VydGVkSWQsIGVycilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFmdGVyVXBkYXRlKHJldCAmJiByZXQubnVtYmVyQWZmZWN0ZWQsIGVycikgLy8gTm90ZSB0aGF0IGVyciBjYW4gbmV2ZXIgcmVhY2ggaGVyZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29sbGVjdGlvbkhvb2tzLmhvb2tlZE9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZXJyLCByZXQpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBDb2xsZWN0aW9uSG9va3MuZGlyZWN0T3AoKCkgPT4gX3N1cGVyLmNhbGwodGhpcywgc2VsZWN0b3IsIG11dGF0b3IsIG9wdGlvbnMsIHdyYXBwZWRDYWxsYmFjaykpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcmV0ID0gQ29sbGVjdGlvbkhvb2tzLmRpcmVjdE9wKCgpID0+IF9zdXBlci5jYWxsKHRoaXMsIHNlbGVjdG9yLCBtdXRhdG9yLCBvcHRpb25zLCBjYWxsYmFjaykpXG5cbiAgICBpZiAocmV0ICYmIHJldC5pbnNlcnRlZElkKSB7XG4gICAgICBhZnRlckluc2VydChyZXQuaW5zZXJ0ZWRJZClcbiAgICB9IGVsc2Uge1xuICAgICAgYWZ0ZXJVcGRhdGUocmV0ICYmIHJldC5udW1iZXJBZmZlY3RlZClcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0XG4gIH1cbn0pXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJ1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbmlmIChNZXRlb3IudXNlcnMpIHtcbiAgLy8gSWYgTWV0ZW9yLnVzZXJzIGhhcyBiZWVuIGluc3RhbnRpYXRlZCwgYXR0ZW1wdCB0byByZS1hc3NpZ24gaXRzIHByb3RvdHlwZTpcbiAgQ29sbGVjdGlvbkhvb2tzLnJlYXNzaWduUHJvdG90eXBlKE1ldGVvci51c2VycylcblxuICAvLyBOZXh0LCBnaXZlIGl0IHRoZSBob29rIGFzcGVjdHM6XG4gIENvbGxlY3Rpb25Ib29rcy5leHRlbmRDb2xsZWN0aW9uSW5zdGFuY2UoTWV0ZW9yLnVzZXJzLCBNb25nby5Db2xsZWN0aW9uKVxufVxuIl19
