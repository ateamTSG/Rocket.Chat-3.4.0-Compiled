(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var extension, options, path;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs":{"ufs.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs.js                                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!function (module1) {
  module1.export({
    UploadFS: () => UploadFS
  });
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 0);
  let Random;
  module1.link("meteor/random", {
    Random(v) {
      Random = v;
    }

  }, 1);
  let Config;
  module1.link("./ufs-config", {
    Config(v) {
      Config = v;
    }

  }, 2);
  let Filter;
  module1.link("./ufs-filter", {
    Filter(v) {
      Filter = v;
    }

  }, 3);
  let MIME;
  module1.link("./ufs-mime", {
    MIME(v) {
      MIME = v;
    }

  }, 4);
  let Store;
  module1.link("./ufs-store", {
    Store(v) {
      Store = v;
    }

  }, 5);
  let StorePermissions;
  module1.link("./ufs-store-permissions", {
    StorePermissions(v) {
      StorePermissions = v;
    }

  }, 6);
  let Tokens;
  module1.link("./ufs-tokens", {
    Tokens(v) {
      Tokens = v;
    }

  }, 7);
  let Uploader;
  module1.link("./ufs-uploader", {
    Uploader(v) {
      Uploader = v;
    }

  }, 8);
  let stores = {};
  const UploadFS = {
    /**
     * Contains all stores
     */
    store: {},

    /**
     * Collection of tokens
     */
    tokens: Tokens,

    /**
     * Adds the "etag" attribute to files
     * @param where
     */
    addETagAttributeToFiles(where) {
      this.getStores().forEach(store => {
        const files = store.getCollection(); // By default update only files with no path set

        files.find(where || {
          etag: null
        }, {
          fields: {
            _id: 1
          }
        }).forEach(file => {
          files.direct.update(file._id, {
            $set: {
              etag: this.generateEtag()
            }
          });
        });
      });
    },

    /**
     * Adds the MIME type for an extension
     * @param extension
     * @param mime
     */
    addMimeType(extension, mime) {
      MIME[extension.toLowerCase()] = mime;
    },

    /**
     * Adds the "path" attribute to files
     * @param where
     */
    addPathAttributeToFiles(where) {
      this.getStores().forEach(store => {
        const files = store.getCollection(); // By default update only files with no path set

        files.find(where || {
          path: null
        }, {
          fields: {
            _id: 1
          }
        }).forEach(file => {
          files.direct.update(file._id, {
            $set: {
              path: store.getFileRelativeURL(file._id)
            }
          });
        });
      });
    },

    /**
     * Registers the store
     * @param store
     */
    addStore(store) {
      if (!(store instanceof Store)) {
        throw new TypeError("ufs: store is not an instance of UploadFS.Store.");
      }

      stores[store.getName()] = store;
    },

    /**
     * Generates a unique ETag
     * @return {string}
     */
    generateEtag() {
      return Random.id();
    },

    /**
     * Returns the MIME type of the extension
     * @param extension
     * @returns {*}
     */
    getMimeType(extension) {
      extension = extension.toLowerCase();
      return MIME[extension];
    },

    /**
     * Returns all MIME types
     */
    getMimeTypes() {
      return MIME;
    },

    /**
     * Returns the store by its name
     * @param name
     * @return {UploadFS.Store}
     */
    getStore(name) {
      return stores[name];
    },

    /**
     * Returns all stores
     * @return {object}
     */
    getStores() {
      return stores;
    },

    /**
     * Returns the temporary file path
     * @param fileId
     * @return {string}
     */
    getTempFilePath(fileId) {
      return "".concat(this.config.tmpDir, "/").concat(fileId);
    },

    /**
     * Imports a file from a URL
     * @param url
     * @param file
     * @param store
     * @param callback
     */
    importFromURL(url, file, store, callback) {
      if (typeof store === 'string') {
        Meteor.call('ufsImportURL', url, file, store, callback);
      } else if (typeof store === 'object') {
        store.importFromURL(url, file, callback);
      }
    },

    /**
     * Returns file and data as ArrayBuffer for each files in the event
     * @deprecated
     * @param event
     * @param callback
     */
    readAsArrayBuffer(event, callback) {
      console.error('UploadFS.readAsArrayBuffer is deprecated, see https://github.com/jalik/jalik-ufs#uploading-from-a-file');
    },

    /**
     * Opens a dialog to select a single file
     * @param callback
     */
    selectFile(callback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;

      input.onchange = ev => {
        let files = ev.target.files;
        callback.call(UploadFS, files[0]);
      }; // Fix for iOS/Safari


      const div = document.createElement('div');
      div.className = 'ufs-file-selector';
      div.style = 'display:none; height:0; width:0; overflow: hidden;';
      div.appendChild(input);
      document.body.appendChild(div); // Trigger file selection

      input.click();
    },

    /**
     * Opens a dialog to select multiple files
     * @param callback
     */
    selectFiles(callback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;

      input.onchange = ev => {
        const files = ev.target.files;

        for (let i = 0; i < files.length; i += 1) {
          callback.call(UploadFS, files[i]);
        }
      }; // Fix for iOS/Safari


      const div = document.createElement('div');
      div.className = 'ufs-file-selector';
      div.style = 'display:none; height:0; width:0; overflow: hidden;';
      div.appendChild(input);
      document.body.appendChild(div); // Trigger file selection

      input.click();
    }

  };

  if (Meteor.isServer) {
    require('./ufs-methods');

    require('./ufs-server');
  }
  /**
   * UploadFS Configuration
   * @type {Config}
   */


  UploadFS.config = new Config(); // Add classes to global namespace

  UploadFS.Config = Config;
  UploadFS.Filter = Filter;
  UploadFS.Store = Store;
  UploadFS.StorePermissions = StorePermissions;
  UploadFS.Uploader = Uploader;

  if (Meteor.isServer) {
    // Expose the module globally
    if (typeof global !== 'undefined') {
      global['UploadFS'] = UploadFS;
    }
  } else if (Meteor.isClient) {
    // Expose the module globally
    if (typeof window !== 'undefined') {
      window.UploadFS = UploadFS;
    }
  }
}.call(this, module);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-config.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-config.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Config: () => Config
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 1);

class Config {
  constructor(options) {
    // Default options
    options = _.extend({
      defaultStorePermissions: null,
      https: false,
      simulateReadDelay: 0,
      simulateUploadSpeed: 0,
      simulateWriteDelay: 0,
      storesPath: 'ufs',
      tmpDir: '/tmp/ufs',
      tmpDirPermissions: '0700'
    }, options); // Check options

    if (options.defaultStorePermissions && !(options.defaultStorePermissions instanceof StorePermissions)) {
      throw new TypeError('Config: defaultStorePermissions is not an instance of StorePermissions');
    }

    if (typeof options.https !== 'boolean') {
      throw new TypeError('Config: https is not a function');
    }

    if (typeof options.simulateReadDelay !== 'number') {
      throw new TypeError('Config: simulateReadDelay is not a number');
    }

    if (typeof options.simulateUploadSpeed !== 'number') {
      throw new TypeError('Config: simulateUploadSpeed is not a number');
    }

    if (typeof options.simulateWriteDelay !== 'number') {
      throw new TypeError('Config: simulateWriteDelay is not a number');
    }

    if (typeof options.storesPath !== 'string') {
      throw new TypeError('Config: storesPath is not a string');
    }

    if (typeof options.tmpDir !== 'string') {
      throw new TypeError('Config: tmpDir is not a string');
    }

    if (typeof options.tmpDirPermissions !== 'string') {
      throw new TypeError('Config: tmpDirPermissions is not a string');
    }
    /**
     * Default store permissions
     * @type {UploadFS.StorePermissions}
     */


    this.defaultStorePermissions = options.defaultStorePermissions;
    /**
     * Use or not secured protocol in URLS
     * @type {boolean}
     */

    this.https = options.https;
    /**
     * The simulation read delay
     * @type {Number}
     */

    this.simulateReadDelay = parseInt(options.simulateReadDelay);
    /**
     * The simulation upload speed
     * @type {Number}
     */

    this.simulateUploadSpeed = parseInt(options.simulateUploadSpeed);
    /**
     * The simulation write delay
     * @type {Number}
     */

    this.simulateWriteDelay = parseInt(options.simulateWriteDelay);
    /**
     * The URL root path of stores
     * @type {string}
     */

    this.storesPath = options.storesPath;
    /**
     * The temporary directory of uploading files
     * @type {string}
     */

    this.tmpDir = options.tmpDir;
    /**
     * The permissions of the temporary directory
     * @type {string}
     */

    this.tmpDirPermissions = options.tmpDirPermissions;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-filter.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-filter.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Filter: () => Filter
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 1);

class Filter {
  constructor(options) {
    const self = this; // Default options

    options = _.extend({
      contentTypes: null,
      extensions: null,
      minSize: 1,
      maxSize: 0,
      invalidFileError: () => new Meteor.Error('invalid-file', 'File is not valid'),
      fileTooSmallError: (fileSize, minFileSize) => new Meteor.Error('file-too-small', "File size (size = ".concat(fileSize, ") is too small (min = ").concat(minFileSize, ")")),
      fileTooLargeError: (fileSize, maxFileSize) => new Meteor.Error('file-too-large', "File size (size = ".concat(fileSize, ") is too large (max = ").concat(maxFileSize, ")")),
      invalidFileExtension: (fileExtension, allowedExtensions) => new Meteor.Error('invalid-file-extension', "File extension \"".concat(fileExtension, "\" is not accepted (").concat(allowedExtensions, ")")),
      invalidFileType: (fileType, allowedContentTypes) => new Meteor.Error('invalid-file-type', "File type \"".concat(fileType, "\" is not accepted (").concat(allowedContentTypes, ")")),
      onCheck: this.onCheck
    }, options); // Check options

    if (options.contentTypes && !(options.contentTypes instanceof Array)) {
      throw new TypeError('Filter: contentTypes is not an Array');
    }

    if (options.extensions && !(options.extensions instanceof Array)) {
      throw new TypeError('Filter: extensions is not an Array');
    }

    if (typeof options.minSize !== 'number') {
      throw new TypeError('Filter: minSize is not a number');
    }

    if (typeof options.maxSize !== 'number') {
      throw new TypeError('Filter: maxSize is not a number');
    }

    if (options.onCheck && typeof options.onCheck !== 'function') {
      throw new TypeError('Filter: onCheck is not a function');
    } // Public attributes


    self.options = options;
    ['onCheck'].forEach(method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    });
  }
  /**
   * Checks the file
   * @param file
   */


  check(file) {
    let error = null;

    if (typeof file !== 'object' || !file) {
      error = this.options.invalidFileError();
    } // Check size


    let fileSize = file.size;
    let minSize = this.getMinSize();

    if (fileSize <= 0 || fileSize < minSize) {
      error = this.options.fileTooSmallError(fileSize, minSize);
    }

    let maxSize = this.getMaxSize();

    if (maxSize > 0 && fileSize > maxSize) {
      error = this.options.fileTooLargeError(fileSize, maxSize);
    } // Check extension


    let allowedExtensions = this.getExtensions();
    let fileExtension = file.extension;

    if (allowedExtensions && !allowedExtensions.includes(fileExtension)) {
      error = this.options.invalidFileExtension(fileExtension, allowedExtensions);
    } // Check content type


    let allowedContentTypes = this.getContentTypes();
    let fileTypes = file.type;

    if (allowedContentTypes && !this.isContentTypeInList(fileTypes, allowedContentTypes)) {
      error = this.options.invalidFileType(fileTypes, allowedContentTypes);
    } // Apply custom check


    if (typeof this.onCheck === 'function' && !this.onCheck(file)) {
      error = new Meteor.Error('invalid-file', 'File does not match filter');
    }

    if (error) {
      throw error;
    }
  }
  /**
   * Returns the allowed content types
   * @return {Array}
   */


  getContentTypes() {
    return this.options.contentTypes;
  }
  /**
   * Returns the allowed extensions
   * @return {Array}
   */


  getExtensions() {
    return this.options.extensions;
  }
  /**
   * Returns the maximum file size
   * @return {Number}
   */


  getMaxSize() {
    return this.options.maxSize;
  }
  /**
   * Returns the minimum file size
   * @return {Number}
   */


  getMinSize() {
    return this.options.minSize;
  }
  /**
   * Checks if content type is in the given list
   * @param type
   * @param list
   * @return {boolean}
   */


  isContentTypeInList(type, list) {
    if (typeof type === 'string' && list instanceof Array) {
      if (list.includes(type)) {
        return true;
      } else {
        let wildCardGlob = '/*';
        let wildcards = list.filter(item => {
          return item.indexOf(wildCardGlob) > 0;
        });

        if (wildcards.includes(type.replace(/(\/.*)$/, wildCardGlob))) {
          return true;
        }
      }
    }

    return false;
  }
  /**
   * Checks if the file matches filter
   * @param file
   * @return {boolean}
   */


  isValid(file) {
    let result = true;

    try {
      this.check(file);
    } catch (err) {
      result = false;
    }

    return result;
  }
  /**
   * Executes custom checks
   * @param file
   * @return {boolean}
   */


  onCheck(file) {
    return true;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-methods.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-methods.js                                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 2);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 3);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 4);

const fs = Npm.require('fs');

const http = Npm.require('http');

const https = Npm.require('https');

const Future = Npm.require('fibers/future');

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Completes the file transfer
     * @param fileId
     * @param storeName
     * @param token
     */
    ufsComplete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Get store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'Store not found');
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', 'Token is not valid');
      }

      let fut = new Future();
      let tmpFile = UploadFS.getTempFilePath(fileId);

      const removeTempFile = function () {
        fs.unlink(tmpFile, function (err) {
          err && console.error("ufs: cannot delete temp file \"".concat(tmpFile, "\" (").concat(err.message, ")"));
        });
      };

      try {
        // todo check if temp file exists
        // Get file
        let file = store.getCollection().findOne({
          _id: fileId
        }); // Validate file before moving to the store

        store.validate(file); // Get the temp file

        let rs = fs.createReadStream(tmpFile, {
          flags: 'r',
          encoding: null,
          autoClose: true
        }); // Clean upload if error occurs

        rs.on('error', Meteor.bindEnvironment(function (err) {
          console.error(err);
          store.getCollection().remove({
            _id: fileId
          });
          fut.throw(err);
        })); // Save file in the store

        store.write(rs, fileId, Meteor.bindEnvironment(function (err, file) {
          removeTempFile();

          if (err) {
            fut.throw(err);
          } else {
            // File has been fully uploaded
            // so we don't need to keep the token anymore.
            // Also this ensure that the file cannot be modified with extra chunks later.
            Tokens.remove({
              fileId: fileId
            });
            fut.return(file);
          }
        })); // catch will not work if fut.wait() is outside try/catch

        return fut.wait();
      } catch (err) {
        // If write failed, remove the file
        store.getCollection().remove({
          _id: fileId
        }); // removeTempFile(); // todo remove temp file on error or try again ?

        throw new Meteor.Error('ufs: cannot upload file', err);
      }
    },

    /**
     * Creates the file and returns the file upload token
     * @param file
     * @return {{fileId: string, token: *, url: *}}
     */
    ufsCreate(file) {
      check(file, Object);

      if (typeof file.name !== 'string' || !file.name.length) {
        throw new Meteor.Error('invalid-file-name', 'file name is not valid');
      }

      if (typeof file.store !== 'string' || !file.store.length) {
        throw new Meteor.Error('invalid-store', 'store is not valid');
      } // Get store


      let store = UploadFS.getStore(file.store);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'Store not found');
      } // Set default info


      file.complete = false;
      file.uploading = false;
      file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase(); // Assign file MIME type based on the extension

      if (file.extension && !file.type) {
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      }

      file.progress = 0;
      file.size = parseInt(file.size) || 0;
      file.userId = file.userId || this.userId; // Check if the file matches store filter

      let filter = store.getFilter();

      if (filter instanceof Filter) {
        filter.check(file);
      } // Create the file


      let fileId = store.create(file);
      let token = store.createToken(fileId);
      let uploadUrl = store.getURL("".concat(fileId, "?token=").concat(token));
      return {
        fileId: fileId,
        token: token,
        url: uploadUrl
      };
    },

    /**
     * Deletes a file
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsDelete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'Store not found');
      } // Ignore files that does not exist


      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        return 1;
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', 'Token is not valid');
      }

      return store.getCollection().remove({
        _id: fileId
      });
    },

    /**
     * Imports a file from the URL
     * @param url
     * @param file
     * @param storeName
     * @return {*}
     */
    ufsImportURL(url, file, storeName) {
      check(url, String);
      check(file, Object);
      check(storeName, String); // Check URL

      if (typeof url !== 'string' || url.length <= 0) {
        throw new Meteor.Error('invalid-url', 'The url is not valid');
      } // Check file


      if (typeof file !== 'object' || file === null) {
        throw new Meteor.Error('invalid-file', 'The file is not valid');
      } // Check store


      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'The store does not exist');
      } // Extract file info


      if (!file.name) {
        file.name = url.replace(/\?.*$/, '').split('/').pop();
      }

      if (file.name && !file.extension) {
        file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase();
      }

      if (file.extension && !file.type) {
        // Assign file MIME type based on the extension
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      } // Check if file is valid


      if (store.getFilter() instanceof Filter) {
        store.getFilter().check(file);
      }

      if (file.originalUrl) {
        console.warn("ufs: The \"originalUrl\" attribute is automatically set when importing a file from a URL");
      } // Add original URL


      file.originalUrl = url; // Create the file

      file.complete = false;
      file.uploading = true;
      file.progress = 0;
      file._id = store.create(file);
      let fut = new Future();
      let proto; // Detect protocol to use

      if (/http:\/\//i.test(url)) {
        proto = http;
      } else if (/https:\/\//i.test(url)) {
        proto = https;
      }

      this.unblock(); // Download file

      proto.get(url, Meteor.bindEnvironment(function (res) {
        // Save the file in the store
        store.write(res, file._id, function (err, file) {
          if (err) {
            fut.throw(err);
          } else {
            fut.return(file);
          }
        });
      })).on('error', function (err) {
        fut.throw(err);
      });
      return fut.wait();
    },

    /**
     * Marks the file uploading as stopped
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsStop(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'Store not found');
      } // Check file


      const file = store.getCollection().find({
        _id: fileId
      }, {
        fields: {
          userId: 1
        }
      });

      if (!file) {
        throw new Meteor.Error('invalid-file', 'File not found');
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', 'Token is not valid');
      }

      return store.getCollection().update({
        _id: fileId
      }, {
        $set: {
          uploading: false
        }
      });
    }

  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-mime.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-mime.js                                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  MIME: () => MIME
});
const MIME = {
  // application
  '7z': 'application/x-7z-compressed',
  'arc': 'application/octet-stream',
  'ai': 'application/postscript',
  'bin': 'application/octet-stream',
  'bz': 'application/x-bzip',
  'bz2': 'application/x-bzip2',
  'eps': 'application/postscript',
  'exe': 'application/octet-stream',
  'gz': 'application/x-gzip',
  'gzip': 'application/x-gzip',
  'js': 'application/javascript',
  'json': 'application/json',
  'ogx': 'application/ogg',
  'pdf': 'application/pdf',
  'ps': 'application/postscript',
  'psd': 'application/octet-stream',
  'rar': 'application/x-rar-compressed',
  'rev': 'application/x-rar-compressed',
  'swf': 'application/x-shockwave-flash',
  'tar': 'application/x-tar',
  'xhtml': 'application/xhtml+xml',
  'xml': 'application/xml',
  'zip': 'application/zip',
  // audio
  'aif': 'audio/aiff',
  'aifc': 'audio/aiff',
  'aiff': 'audio/aiff',
  'au': 'audio/basic',
  'flac': 'audio/flac',
  'midi': 'audio/midi',
  'mp2': 'audio/mpeg',
  'mp3': 'audio/mpeg',
  'mpa': 'audio/mpeg',
  'oga': 'audio/ogg',
  'ogg': 'audio/ogg',
  'opus': 'audio/ogg',
  'ra': 'audio/vnd.rn-realaudio',
  'spx': 'audio/ogg',
  'wav': 'audio/x-wav',
  'weba': 'audio/webm',
  'wma': 'audio/x-ms-wma',
  // image
  'avs': 'image/avs-video',
  'bmp': 'image/x-windows-bmp',
  'gif': 'image/gif',
  'ico': 'image/vnd.microsoft.icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpg',
  'mjpg': 'image/x-motion-jpeg',
  'pic': 'image/pic',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'tif': 'image/tiff',
  'tiff': 'image/tiff',
  // text
  'css': 'text/css',
  'csv': 'text/csv',
  'html': 'text/html',
  'txt': 'text/plain',
  // video
  'avi': 'video/avi',
  'dv': 'video/x-dv',
  'flv': 'video/x-flv',
  'mov': 'video/quicktime',
  'mp4': 'video/mp4',
  'mpeg': 'video/mpeg',
  'mpg': 'video/mpg',
  'ogv': 'video/ogg',
  'vdo': 'video/vdo',
  'webm': 'video/webm',
  'wmv': 'video/x-ms-wmv',
  // specific to vendors
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'odb': 'application/vnd.oasis.opendocument.database',
  'odc': 'application/vnd.oasis.opendocument.chart',
  'odf': 'application/vnd.oasis.opendocument.formula',
  'odg': 'application/vnd.oasis.opendocument.graphics',
  'odi': 'application/vnd.oasis.opendocument.image',
  'odm': 'application/vnd.oasis.opendocument.text-master',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odt': 'application/vnd.oasis.opendocument.text',
  'otg': 'application/vnd.oasis.opendocument.graphics-template',
  'otp': 'application/vnd.oasis.opendocument.presentation-template',
  'ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
  'ott': 'application/vnd.oasis.opendocument.text-template',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-server.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let WebApp;
module.link("meteor/webapp", {
  WebApp(v) {
    WebApp = v;
  }

}, 1);
let SparkMD5;
module.link("spark-md5", {
  default(v) {
    SparkMD5 = v;
  }

}, 2);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);

if (Meteor.isServer) {
  const domain = Npm.require('domain');

  const fs = Npm.require('fs');

  const http = Npm.require('http');

  const https = Npm.require('https');

  const mkdirp = Npm.require('mkdirp');

  const stream = Npm.require('stream');

  const URL = Npm.require('url');

  const zlib = Npm.require('zlib');

  Meteor.startup(() => {
    let path = UploadFS.config.tmpDir;
    let mode = UploadFS.config.tmpDirPermissions;
    fs.stat(path, err => {
      if (err) {
        // Create the temp directory
        mkdirp(path, {
          mode: mode
        }, err => {
          if (err) {
            console.error("ufs: cannot create temp directory at \"".concat(path, "\" (").concat(err.message, ")"));
          } else {
            console.log("ufs: temp directory created at \"".concat(path, "\""));
          }
        });
      } else {
        // Set directory permissions
        fs.chmod(path, mode, err => {
          err && console.error("ufs: cannot set temp directory permissions ".concat(mode, " (").concat(err.message, ")"));
        });
      }
    });
  }); // Create domain to handle errors
  // and possibly avoid server crashes.

  let d = domain.create();
  d.on('error', err => {
    console.error('ufs: ' + err.message);
  }); // Listen HTTP requests to serve files

  WebApp.connectHandlers.use((req, res, next) => {
    // Quick check to see if request should be catch
    if (req.url.indexOf(UploadFS.config.storesPath) === -1) {
      next();
      return;
    } // Remove store path


    let parsedUrl = URL.parse(req.url);
    let path = parsedUrl.pathname.substr(UploadFS.config.storesPath.length + 1);

    let allowCORS = () => {
      // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    };

    if (req.method === 'OPTIONS') {
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS();
      next();
    } else if (req.method === 'POST') {
      // Get store
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS(); // Get file

      let fileId = match[2];

      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        res.writeHead(404);
        res.end();
        return;
      } // Check upload token


      if (!store.checkToken(req.query.token, fileId)) {
        res.writeHead(403);
        res.end();
        return;
      } //Check if duplicate


      const unique = function (hash) {
        const originalId = store.getCollection().findOne({
          hash: hash,
          _id: {
            $ne: fileId
          }
        });
        return originalId ? originalId._id : false;
      };

      let spark = new SparkMD5.ArrayBuffer();
      let tmpFile = UploadFS.getTempFilePath(fileId);
      let ws = fs.createWriteStream(tmpFile, {
        flags: 'a'
      });
      let fields = {
        uploading: true
      };
      let progress = parseFloat(req.query.progress);

      if (!isNaN(progress) && progress > 0) {
        fields.progress = Math.min(progress, 1);
      }

      req.on('data', chunk => {
        ws.write(chunk);
        spark.append(chunk);
      });
      req.on('error', err => {
        res.writeHead(500);
        res.end();
      });
      req.on('end', Meteor.bindEnvironment(() => {
        // Update completed state without triggering hooks
        fields.hash = spark.end();
        fields.originalId = unique(fields.hash);
        store.getCollection().direct.update({
          _id: fileId
        }, {
          $set: fields
        });
        ws.end();
      }));
      ws.on('error', err => {
        console.error("ufs: cannot write chunk of file \"".concat(fileId, "\" (").concat(err.message, ")"));
        fs.unlink(tmpFile, err => {
          err && console.error("ufs: cannot delete temp file \"".concat(tmpFile, "\" (").concat(err.message, ")"));
        });
        res.writeHead(500);
        res.end();
      });
      ws.on('finish', () => {
        res.writeHead(204, {
          'Content-Type': 'text/plain'
        });
        res.end();
      });
    } else if (req.method === 'GET') {
      // Get store, file Id and file name
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)(?:\/([^\/\?]+))?$');
      let match = regExp.exec(path); // Avoid 504 Gateway timeout error
      // if file is not handled by UploadFS.

      if (match === null) {
        next();
        return;
      } // Get store


      const storeName = match[1];
      const store = UploadFS.getStore(storeName);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (store.onRead !== null && store.onRead !== undefined && typeof store.onRead !== 'function') {
        console.error("ufs: Store.onRead is not a function in store \"".concat(storeName, "\""));
        res.writeHead(500);
        res.end();
        return;
      } // Remove file extension from file Id


      let index = match[2].indexOf('.');
      let fileId = index !== -1 ? match[2].substr(0, index) : match[2]; // Get file from database

      const file = store.getCollection().findOne({
        _id: fileId
      });

      if (!file) {
        res.writeHead(404);
        res.end();
        return;
      } // Simulate read speed


      if (UploadFS.config.simulateReadDelay) {
        Meteor._sleepForMs(UploadFS.config.simulateReadDelay);
      }

      d.run(() => {
        // Check if the file can be accessed
        if (store.onRead.call(store, fileId, file, req, res) !== false) {
          let options = {};
          let status = 200; // Prepare response headers

          let headers = {
            'Content-Type': file.type,
            'Content-Length': file.size
          }; // Add ETag header

          if (typeof file.etag === 'string') {
            headers['ETag'] = file.etag;
          } // Add Last-Modified header


          if (file.modifiedAt instanceof Date) {
            headers['Last-Modified'] = file.modifiedAt.toUTCString();
          } else if (file.uploadedAt instanceof Date) {
            headers['Last-Modified'] = file.uploadedAt.toUTCString();
          } // Parse request headers


          if (typeof req.headers === 'object') {
            // Compare ETag
            if (req.headers['if-none-match']) {
              if (file.etag === req.headers['if-none-match']) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Compare file modification date


            if (req.headers['if-modified-since']) {
              const modifiedSince = new Date(req.headers['if-modified-since']);

              if (file.modifiedAt instanceof Date && file.modifiedAt > modifiedSince || file.uploadedAt instanceof Date && file.uploadedAt > modifiedSince) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Support range request


            if (typeof req.headers.range === 'string') {
              const range = req.headers.range; // Range is not valid

              if (!range) {
                res.writeHead(416);
                res.end();
                return;
              }

              const total = file.size;
              const unit = range.substr(0, range.indexOf('='));

              if (unit !== 'bytes') {
                res.writeHead(416);
                res.end();
                return;
              }

              const ranges = range.substr(unit.length).replace(/[^0-9\-,]/, '').split(',');

              if (ranges.length > 1) {//todo: support multipart ranges: https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
              } else {
                const r = ranges[0].split('-');
                const start = parseInt(r[0], 10);
                const end = r[1] ? parseInt(r[1], 10) : total - 1; // Range is not valid

                if (start < 0 || end >= total || start > end) {
                  res.writeHead(416);
                  res.end();
                  return;
                } // Update headers


                headers['Content-Range'] = "bytes ".concat(start, "-").concat(end, "/").concat(total);
                headers['Content-Length'] = end - start + 1;
                options.start = start;
                options.end = end;
              }

              status = 206; // partial content
            }
          } else {
            headers['Accept-Ranges'] = 'bytes';
          } // Open the file stream


          const rs = store.getReadStream(fileId, file, options);
          const ws = new stream.PassThrough();
          rs.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('close', () => {
            // Close output stream at the end
            ws.emit('end');
          }); // Transform stream

          store.transformRead(rs, ws, fileId, file, req, headers); // Parse request headers

          if (typeof req.headers === 'object') {
            // Compress data using if needed (ignore audio/video as they are already compressed)
            if (typeof req.headers['accept-encoding'] === 'string' && !/^(audio|video)/.test(file.type)) {
              let accept = req.headers['accept-encoding']; // Compress with gzip

              if (accept.match(/\bgzip\b/)) {
                headers['Content-Encoding'] = 'gzip';
                delete headers['Content-Length'];
                res.writeHead(status, headers);
                ws.pipe(zlib.createGzip()).pipe(res);
                return;
              } // Compress with deflate
              else if (accept.match(/\bdeflate\b/)) {
                  headers['Content-Encoding'] = 'deflate';
                  delete headers['Content-Length'];
                  res.writeHead(status, headers);
                  ws.pipe(zlib.createDeflate()).pipe(res);
                  return;
                }
            }
          } // Send raw data


          if (!headers['Content-Encoding']) {
            res.writeHead(status, headers);
            ws.pipe(res);
          }
        } else {
          res.end();
        }
      });
    } else {
      next();
    }
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store-permissions.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-store-permissions.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  StorePermissions: () => StorePermissions
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);

class StorePermissions {
  constructor(options) {
    // Default options
    options = _.extend({
      insert: null,
      remove: null,
      update: null
    }, options); // Check options

    if (options.insert && typeof options.insert !== 'function') {
      throw new TypeError('StorePermissions: insert is not a function');
    }

    if (options.remove && typeof options.remove !== 'function') {
      throw new TypeError('StorePermissions: remove is not a function');
    }

    if (options.update && typeof options.update !== 'function') {
      throw new TypeError('StorePermissions: update is not a function');
    } // Public attributes


    this.actions = {
      insert: options.insert,
      remove: options.remove,
      update: options.update
    };
  }
  /**
   * Checks the permission for the action
   * @param action
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @return {*}
   */


  check(action, userId, file, fields, modifiers) {
    if (typeof this.actions[action] === 'function') {
      return this.actions[action](userId, file, fields, modifiers);
    }

    return true; // by default allow all
  }
  /**
   * Checks the insert permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkInsert(userId, file) {
    return this.check('insert', userId, file);
  }
  /**
   * Checks the remove permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkRemove(userId, file) {
    return this.check('remove', userId, file);
  }
  /**
   * Checks the update permission
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @returns {*}
   */


  checkUpdate(userId, file, fields, modifiers) {
    return this.check('update', userId, file, fields, modifiers);
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-store.js                                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectWithoutProperties;

module.link("@babel/runtime/helpers/objectWithoutProperties", {
  default(v) {
    _objectWithoutProperties = v;
  }

}, 0);
module.export({
  Store: () => Store
});
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 3);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 4);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 5);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 6);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 7);

class Store {
  constructor(options) {
    let self = this; // Default options

    options = _.extend({
      collection: null,
      filter: null,
      name: null,
      onCopyError: this.onCopyError,
      onFinishUpload: this.onFinishUpload,
      onRead: this.onRead,
      onReadError: this.onReadError,
      onValidate: this.onValidate,
      onWriteError: this.onWriteError,
      permissions: null,
      transformRead: null,
      transformWrite: null
    }, options); // Check options

    if (!(options.collection instanceof Mongo.Collection)) {
      throw new TypeError('Store: collection is not a Mongo.Collection');
    }

    if (options.filter && !(options.filter instanceof Filter)) {
      throw new TypeError('Store: filter is not a UploadFS.Filter');
    }

    if (typeof options.name !== 'string') {
      throw new TypeError('Store: name is not a string');
    }

    if (UploadFS.getStore(options.name)) {
      throw new TypeError('Store: name already exists');
    }

    if (options.onCopyError && typeof options.onCopyError !== 'function') {
      throw new TypeError('Store: onCopyError is not a function');
    }

    if (options.onFinishUpload && typeof options.onFinishUpload !== 'function') {
      throw new TypeError('Store: onFinishUpload is not a function');
    }

    if (options.onRead && typeof options.onRead !== 'function') {
      throw new TypeError('Store: onRead is not a function');
    }

    if (options.onReadError && typeof options.onReadError !== 'function') {
      throw new TypeError('Store: onReadError is not a function');
    }

    if (options.onWriteError && typeof options.onWriteError !== 'function') {
      throw new TypeError('Store: onWriteError is not a function');
    }

    if (options.permissions && !(options.permissions instanceof StorePermissions)) {
      throw new TypeError('Store: permissions is not a UploadFS.StorePermissions');
    }

    if (options.transformRead && typeof options.transformRead !== 'function') {
      throw new TypeError('Store: transformRead is not a function');
    }

    if (options.transformWrite && typeof options.transformWrite !== 'function') {
      throw new TypeError('Store: transformWrite is not a function');
    }

    if (options.onValidate && typeof options.onValidate !== 'function') {
      throw new TypeError('Store: onValidate is not a function');
    } // Public attributes


    self.options = options;
    self.permissions = options.permissions;
    ['onCopyError', 'onFinishUpload', 'onRead', 'onReadError', 'onWriteError', 'onValidate'].forEach(method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    }); // Add the store to the list

    UploadFS.addStore(self); // Set default permissions

    if (!(self.permissions instanceof StorePermissions)) {
      // Uses custom default permissions or UFS default permissions
      if (UploadFS.config.defaultStorePermissions instanceof StorePermissions) {
        self.permissions = UploadFS.config.defaultStorePermissions;
      } else {
        self.permissions = new StorePermissions();
        console.warn("ufs: permissions are not defined for store \"".concat(options.name, "\""));
      }
    }

    if (Meteor.isServer) {
      /**
       * Checks token validity
       * @param token
       * @param fileId
       * @returns {boolean}
       */
      self.checkToken = function (token, fileId) {
        check(token, String);
        check(fileId, String);
        return Tokens.find({
          value: token,
          fileId: fileId
        }).count() === 1;
      };
      /**
       * Copies the file to a store
       * @param fileId
       * @param store
       * @param callback
       */


      self.copy = function (fileId, store, callback) {
        check(fileId, String);

        if (!(store instanceof Store)) {
          throw new TypeError('store is not an instance of UploadFS.Store');
        } // Get original file


        let file = self.getCollection().findOne({
          _id: fileId
        });

        if (!file) {
          throw new Meteor.Error('file-not-found', 'File not found');
        } // Silently ignore the file if it does not match filter


        const filter = store.getFilter();

        if (filter instanceof Filter && !filter.isValid(file)) {
          return;
        } // Prepare copy


        let {
          _id,
          url
        } = file,
            copy = _objectWithoutProperties(file, ["_id", "url"]);

        copy.originalStore = self.getName();
        copy.originalId = fileId; // Create the copy

        let copyId = store.create(copy); // Get original stream

        let rs = self.getReadStream(fileId, file); // Catch errors to avoid app crashing

        rs.on('error', Meteor.bindEnvironment(function (err) {
          callback.call(self, err, null);
        })); // Copy file data

        store.write(rs, copyId, Meteor.bindEnvironment(function (err) {
          if (err) {
            self.getCollection().remove({
              _id: copyId
            });
            self.onCopyError.call(self, err, fileId, file);
          }

          if (typeof callback === 'function') {
            callback.call(self, err, copyId, copy, store);
          }
        }));
      };
      /**
       * Creates the file in the collection
       * @param file
       * @param callback
       * @return {string}
       */


      self.create = function (file, callback) {
        check(file, Object);
        file.store = self.options.name; // assign store to file

        return self.getCollection().insert(file, callback);
      };
      /**
       * Creates a token for the file (only needed for client side upload)
       * @param fileId
       * @returns {*}
       */


      self.createToken = function (fileId) {
        let token = self.generateToken(); // Check if token exists

        if (Tokens.find({
          fileId: fileId
        }).count()) {
          Tokens.update({
            fileId: fileId
          }, {
            $set: {
              createdAt: new Date(),
              value: token
            }
          });
        } else {
          Tokens.insert({
            createdAt: new Date(),
            fileId: fileId,
            value: token
          });
        }

        return token;
      };
      /**
       * Writes the file to the store
       * @param rs
       * @param fileId
       * @param callback
       */


      self.write = function (rs, fileId, callback) {
        const file = self.getCollection().findOne({
          _id: fileId
        });
        const errorHandler = Meteor.bindEnvironment(function (err) {
          self.onWriteError.call(self, err, fileId, file);
          callback.call(self, err);
        });
        const finishHandler = Meteor.bindEnvironment(function () {
          let size = 0;
          const readStream = self.getReadStream(fileId, file);
          readStream.on('error', Meteor.bindEnvironment(function (error) {
            callback.call(self, error, null);
          }));
          readStream.on('data', Meteor.bindEnvironment(function (data) {
            size += data.length;
          }));
          readStream.on('end', Meteor.bindEnvironment(function () {
            // Set file attribute
            file.complete = true;
            file.etag = UploadFS.generateEtag();
            file.path = self.getFileRelativeURL(fileId);
            file.progress = 1;
            file.size = size;
            file.token = self.generateToken();
            file.uploading = false;
            file.uploadedAt = new Date();
            file.url = self.getFileURL(fileId); // Execute callback

            if (typeof self.onFinishUpload === 'function') {
              self.onFinishUpload.call(self, file);
            } // Sets the file URL when file transfer is complete,
            // this way, the image will loads entirely.


            self.getCollection().direct.update({
              _id: fileId
            }, {
              $set: {
                complete: file.complete,
                etag: file.etag,
                path: file.path,
                progress: file.progress,
                size: file.size,
                token: file.token,
                uploading: file.uploading,
                uploadedAt: file.uploadedAt,
                url: file.url
              }
            }); // Return file info

            callback.call(self, null, file); // Simulate write speed

            if (UploadFS.config.simulateWriteDelay) {
              Meteor._sleepForMs(UploadFS.config.simulateWriteDelay);
            } // Copy file to other stores


            if (self.options.copyTo instanceof Array) {
              for (let i = 0; i < self.options.copyTo.length; i += 1) {
                const store = self.options.copyTo[i];

                if (!store.getFilter() || store.getFilter().isValid(file)) {
                  self.copy(fileId, store);
                }
              }
            }
          }));
        });
        const ws = self.getWriteStream(fileId, file);
        ws.on('error', errorHandler);
        ws.on('finish', finishHandler); // Execute transformation

        self.transformWrite(rs, ws, fileId, file);
      };
    }

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      const collection = self.getCollection(); // Code executed after removing file

      collection.after.remove(function (userId, file) {
        // Remove associated tokens
        Tokens.remove({
          fileId: file._id
        });

        if (self.options.copyTo instanceof Array) {
          for (let i = 0; i < self.options.copyTo.length; i += 1) {
            // Remove copies in stores
            self.options.copyTo[i].getCollection().remove({
              originalId: file._id
            });
          }
        }
      }); // Code executed before inserting file

      collection.before.insert(function (userId, file) {
        if (!self.permissions.checkInsert(userId, file)) {
          throw new Meteor.Error('forbidden', 'Forbidden');
        }
      }); // Code executed before updating file

      collection.before.update(function (userId, file, fields, modifiers) {
        if (!self.permissions.checkUpdate(userId, file, fields, modifiers)) {
          throw new Meteor.Error('forbidden', 'Forbidden');
        }
      }); // Code executed before removing file

      collection.before.remove(function (userId, file) {
        if (!self.permissions.checkRemove(userId, file)) {
          throw new Meteor.Error('forbidden', 'Forbidden');
        } // Delete the physical file in the store


        self.delete(file._id);
        let tmpFile = UploadFS.getTempFilePath(file._id); // Delete the temp file

        fs.stat(tmpFile, function (err) {
          !err && fs.unlink(tmpFile, function (err) {
            err && console.error("ufs: cannot delete temp file at ".concat(tmpFile, " (").concat(err.message, ")"));
          });
        });
      });
    }
  }
  /**
   * Deletes a file async
   * @param fileId
   * @param callback
   */


  delete(fileId, callback) {
    throw new Error('delete is not implemented');
  }
  /**
   * Generates a random token
   * @param pattern
   * @return {string}
   */


  generateToken(pattern) {
    return (pattern || 'xyxyxyxyxy').replace(/[xy]/g, c => {
      let r = Math.random() * 16 | 0,
          v = c === 'x' ? r : r & 0x3 | 0x8;
      let s = v.toString(16);
      return Math.round(Math.random()) ? s.toUpperCase() : s;
    });
  }
  /**
   * Returns the collection
   * @return {Mongo.Collection}
   */


  getCollection() {
    return this.options.collection;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileRelativeURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getRelativeURL("".concat(fileId, "/").concat(file.name)) : null;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getURL("".concat(fileId, "/").concat(file.name)) : null;
  }
  /**
   * Returns the file filter
   * @return {UploadFS.Filter}
   */


  getFilter() {
    return this.options.filter;
  }
  /**
   * Returns the store name
   * @return {string}
   */


  getName() {
    return this.options.name;
  }
  /**
   * Returns the file read stream
   * @param fileId
   * @param file
   */


  getReadStream(fileId, file) {
    throw new Error('Store.getReadStream is not implemented');
  }
  /**
   * Returns the store relative URL
   * @param path
   * @return {string}
   */


  getRelativeURL(path) {
    const rootUrl = Meteor.absoluteUrl().replace(/\/+$/, '');
    const rootPath = rootUrl.replace(/^[a-z]+:\/\/[^/]+\/*/gi, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI("".concat(rootPath, "/").concat(UploadFS.config.storesPath, "/").concat(storeName, "/").concat(path));
  }
  /**
   * Returns the store absolute URL
   * @param path
   * @return {string}
   */


  getURL(path) {
    const rootUrl = Meteor.absoluteUrl({
      secure: UploadFS.config.https
    }).replace(/\/+$/, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI("".concat(rootUrl, "/").concat(UploadFS.config.storesPath, "/").concat(storeName, "/").concat(path));
  }
  /**
   * Returns the file write stream
   * @param fileId
   * @param file
   */


  getWriteStream(fileId, file) {
    throw new Error('getWriteStream is not implemented');
  }
  /**
   * Completes the file upload
   * @param url
   * @param file
   * @param callback
   */


  importFromURL(url, file, callback) {
    Meteor.call('ufsImportURL', url, file, this.getName(), callback);
  }
  /**
   * Called when a copy error happened
   * @param err
   * @param fileId
   * @param file
   */


  onCopyError(err, fileId, file) {
    console.error("ufs: cannot copy file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Called when a file has been uploaded
   * @param file
   */


  onFinishUpload(file) {}
  /**
   * Called when a file is read from the store
   * @param fileId
   * @param file
   * @param request
   * @param response
   * @return boolean
   */


  onRead(fileId, file, request, response) {
    return true;
  }
  /**
   * Called when a read error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onReadError(err, fileId, file) {
    console.error("ufs: cannot read file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Called when file is being validated
   * @param file
   */


  onValidate(file) {}
  /**
   * Called when a write error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onWriteError(err, fileId, file) {
    console.error("ufs: cannot write file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Sets the store permissions
   * @param permissions
   */


  setPermissions(permissions) {
    if (!(permissions instanceof StorePermissions)) {
      throw new TypeError('Permissions is not an instance of UploadFS.StorePermissions');
    }

    this.permissions = permissions;
  }
  /**
   * Transforms the file on reading
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   * @param request
   * @param headers
   */


  transformRead(readStream, writeStream, fileId, file, request, headers) {
    if (typeof this.options.transformRead === 'function') {
      this.options.transformRead.call(this, readStream, writeStream, fileId, file, request, headers);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Transforms the file on writing
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   */


  transformWrite(readStream, writeStream, fileId, file) {
    if (typeof this.options.transformWrite === 'function') {
      this.options.transformWrite.call(this, readStream, writeStream, fileId, file);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Validates the file
   * @param file
   */


  validate(file) {
    if (typeof this.onValidate === 'function') {
      this.onValidate(file);
    }
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-tokens.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-tokens.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Tokens: () => Tokens
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Tokens = new Mongo.Collection('ufsTokens');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-uploader.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-uploader.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Uploader: () => Uploader
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 1);
let Store;
module.link("./ufs-store", {
  Store(v) {
    Store = v;
  }

}, 2);

class Uploader {
  constructor(options) {
    let self = this; // Set default options

    options = _.extend({
      adaptive: true,
      capacity: 0.9,
      chunkSize: 16 * 1024,
      data: null,
      file: null,
      maxChunkSize: 4 * 1024 * 1000,
      maxTries: 5,
      onAbort: this.onAbort,
      onComplete: this.onComplete,
      onCreate: this.onCreate,
      onError: this.onError,
      onProgress: this.onProgress,
      onStart: this.onStart,
      onStop: this.onStop,
      retryDelay: 2000,
      store: null,
      transferDelay: 100
    }, options); // Check options

    if (typeof options.adaptive !== 'boolean') {
      throw new TypeError('adaptive is not a number');
    }

    if (typeof options.capacity !== 'number') {
      throw new TypeError('capacity is not a number');
    }

    if (options.capacity <= 0 || options.capacity > 1) {
      throw new RangeError('capacity must be a float between 0.1 and 1.0');
    }

    if (typeof options.chunkSize !== 'number') {
      throw new TypeError('chunkSize is not a number');
    }

    if (!(options.data instanceof Blob) && !(options.data instanceof File)) {
      throw new TypeError('data is not an Blob or File');
    }

    if (options.file === null || typeof options.file !== 'object') {
      throw new TypeError('file is not an object');
    }

    if (typeof options.maxChunkSize !== 'number') {
      throw new TypeError('maxChunkSize is not a number');
    }

    if (typeof options.maxTries !== 'number') {
      throw new TypeError('maxTries is not a number');
    }

    if (typeof options.retryDelay !== 'number') {
      throw new TypeError('retryDelay is not a number');
    }

    if (typeof options.transferDelay !== 'number') {
      throw new TypeError('transferDelay is not a number');
    }

    if (typeof options.onAbort !== 'function') {
      throw new TypeError('onAbort is not a function');
    }

    if (typeof options.onComplete !== 'function') {
      throw new TypeError('onComplete is not a function');
    }

    if (typeof options.onCreate !== 'function') {
      throw new TypeError('onCreate is not a function');
    }

    if (typeof options.onError !== 'function') {
      throw new TypeError('onError is not a function');
    }

    if (typeof options.onProgress !== 'function') {
      throw new TypeError('onProgress is not a function');
    }

    if (typeof options.onStart !== 'function') {
      throw new TypeError('onStart is not a function');
    }

    if (typeof options.onStop !== 'function') {
      throw new TypeError('onStop is not a function');
    }

    if (typeof options.store !== 'string' && !(options.store instanceof Store)) {
      throw new TypeError('store must be the name of the store or an instance of UploadFS.Store');
    } // Public attributes


    self.adaptive = options.adaptive;
    self.capacity = parseFloat(options.capacity);
    self.chunkSize = parseInt(options.chunkSize);
    self.maxChunkSize = parseInt(options.maxChunkSize);
    self.maxTries = parseInt(options.maxTries);
    self.retryDelay = parseInt(options.retryDelay);
    self.transferDelay = parseInt(options.transferDelay);
    self.onAbort = options.onAbort;
    self.onComplete = options.onComplete;
    self.onCreate = options.onCreate;
    self.onError = options.onError;
    self.onProgress = options.onProgress;
    self.onStart = options.onStart;
    self.onStop = options.onStop; // Private attributes

    let store = options.store;
    let data = options.data;
    let capacityMargin = 0.1;
    let file = options.file;
    let fileId = null;
    let offset = 0;
    let loaded = 0;
    let total = data.size;
    let tries = 0;
    let postUrl = null;
    let token = null;
    let complete = false;
    let uploading = false;
    let timeA = null;
    let timeB = null;
    let elapsedTime = 0;
    let startTime = 0; // Keep only the name of the store

    if (store instanceof Store) {
      store = store.getName();
    } // Assign file to store


    file.store = store;

    function finish() {
      // Finish the upload by telling the store the upload is complete
      Meteor.call('ufsComplete', fileId, store, token, function (err, uploadedFile) {
        if (err) {
          self.onError(err, file);
          self.abort();
        } else if (uploadedFile) {
          uploading = false;
          complete = true;
          file = uploadedFile;
          self.onComplete(uploadedFile);
        }
      });
    }
    /**
     * Aborts the current transfer
     */


    self.abort = function () {
      // Remove the file from database
      Meteor.call('ufsDelete', fileId, store, token, function (err, result) {
        if (err) {
          self.onError(err, file);
        }
      }); // Reset uploader status

      uploading = false;
      fileId = null;
      offset = 0;
      tries = 0;
      loaded = 0;
      complete = false;
      startTime = null;
      self.onAbort(file);
    };
    /**
     * Returns the average speed in bytes per second
     * @returns {number}
     */


    self.getAverageSpeed = function () {
      let seconds = self.getElapsedTime() / 1000;
      return self.getLoaded() / seconds;
    };
    /**
     * Returns the elapsed time in milliseconds
     * @returns {number}
     */


    self.getElapsedTime = function () {
      if (startTime && self.isUploading()) {
        return elapsedTime + (Date.now() - startTime);
      }

      return elapsedTime;
    };
    /**
     * Returns the file
     * @return {object}
     */


    self.getFile = function () {
      return file;
    };
    /**
     * Returns the loaded bytes
     * @return {number}
     */


    self.getLoaded = function () {
      return loaded;
    };
    /**
     * Returns current progress
     * @return {number}
     */


    self.getProgress = function () {
      return Math.min(loaded / total * 100 / 100, 1.0);
    };
    /**
     * Returns the remaining time in milliseconds
     * @returns {number}
     */


    self.getRemainingTime = function () {
      let averageSpeed = self.getAverageSpeed();
      let remainingBytes = total - self.getLoaded();
      return averageSpeed && remainingBytes ? Math.max(remainingBytes / averageSpeed, 0) : 0;
    };
    /**
     * Returns the upload speed in bytes per second
     * @returns {number}
     */


    self.getSpeed = function () {
      if (timeA && timeB && self.isUploading()) {
        let seconds = (timeB - timeA) / 1000;
        return self.chunkSize / seconds;
      }

      return 0;
    };
    /**
     * Returns the total bytes
     * @return {number}
     */


    self.getTotal = function () {
      return total;
    };
    /**
     * Checks if the transfer is complete
     * @return {boolean}
     */


    self.isComplete = function () {
      return complete;
    };
    /**
     * Checks if the transfer is active
     * @return {boolean}
     */


    self.isUploading = function () {
      return uploading;
    };
    /**
     * Reads a portion of file
     * @param start
     * @param length
     * @param callback
     * @returns {Blob}
     */


    self.readChunk = function (start, length, callback) {
      if (typeof callback != 'function') {
        throw new Error('readChunk is missing callback');
      }

      try {
        let end; // Calculate the chunk size

        if (length && start + length > total) {
          end = total;
        } else {
          end = start + length;
        } // Get chunk


        let chunk = data.slice(start, end); // Pass chunk to callback

        callback.call(self, null, chunk);
      } catch (err) {
        console.error('read error', err); // Retry to read chunk

        Meteor.setTimeout(function () {
          if (tries < self.maxTries) {
            tries += 1;
            self.readChunk(start, length, callback);
          }
        }, self.retryDelay);
      }
    };
    /**
     * Sends a file chunk to the store
     */


    self.sendChunk = function () {
      if (!complete && startTime !== null) {
        if (offset < total) {
          let chunkSize = self.chunkSize; // Use adaptive length

          if (self.adaptive && timeA && timeB && timeB > timeA) {
            let duration = (timeB - timeA) / 1000;
            let max = self.capacity * (1 + capacityMargin);
            let min = self.capacity * (1 - capacityMargin);

            if (duration >= max) {
              chunkSize = Math.abs(Math.round(chunkSize * (max - duration)));
            } else if (duration < min) {
              chunkSize = Math.round(chunkSize * (min / duration));
            } // Limit to max chunk size


            if (self.maxChunkSize > 0 && chunkSize > self.maxChunkSize) {
              chunkSize = self.maxChunkSize;
            }
          } // Reduce chunk size to fit total


          if (offset + chunkSize > total) {
            chunkSize = total - offset;
          } // Prepare the chunk


          self.readChunk(offset, chunkSize, function (err, chunk) {
            if (err) {
              self.onError(err, file);
              return;
            }

            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if ([200, 201, 202, 204].includes(xhr.status)) {
                  timeB = Date.now();
                  offset += chunkSize;
                  loaded += chunkSize; // Send next chunk

                  self.onProgress(file, self.getProgress()); // Finish upload

                  if (loaded >= total) {
                    elapsedTime = Date.now() - startTime;
                    finish();
                  } else {
                    Meteor.setTimeout(self.sendChunk, self.transferDelay);
                  }
                } else if (![402, 403, 404, 500].includes(xhr.status)) {
                  // Retry until max tries is reach
                  // But don't retry if these errors occur
                  if (tries <= self.maxTries) {
                    tries += 1; // Wait before retrying

                    Meteor.setTimeout(self.sendChunk, self.retryDelay);
                  } else {
                    self.abort();
                  }
                } else {
                  self.abort();
                }
              }
            }; // Calculate upload progress


            let progress = (offset + chunkSize) / total; // let formData = new FormData();
            // formData.append('progress', progress);
            // formData.append('chunk', chunk);

            let url = "".concat(postUrl, "&progress=").concat(progress);
            timeA = Date.now();
            timeB = null;
            uploading = true; // Send chunk to the store

            xhr.open('POST', url, true);
            xhr.send(chunk);
          });
        }
      }
    };
    /**
     * Starts or resumes the transfer
     */


    self.start = function () {
      if (!fileId) {
        // Create the file document and get the token
        // that allows the user to send chunks to the store.
        Meteor.call('ufsCreate', _.extend({}, file), function (err, result) {
          if (err) {
            self.onError(err, file);
          } else if (result) {
            token = result.token;
            postUrl = result.url;
            fileId = result.fileId;
            file._id = result.fileId;
            self.onCreate(file);
            tries = 0;
            startTime = Date.now();
            self.onStart(file);
            self.sendChunk();
          }
        });
      } else if (!uploading && !complete) {
        // Resume uploading
        tries = 0;
        startTime = Date.now();
        self.onStart(file);
        self.sendChunk();
      }
    };
    /**
     * Stops the transfer
     */


    self.stop = function () {
      if (uploading) {
        // Update elapsed time
        elapsedTime = Date.now() - startTime;
        startTime = null;
        uploading = false;
        self.onStop(file);
        Meteor.call('ufsStop', fileId, store, token, function (err, result) {
          if (err) {
            self.onError(err, file);
          }
        });
      }
    };
  }
  /**
   * Called when the file upload is aborted
   * @param file
   */


  onAbort(file) {}
  /**
   * Called when the file upload is complete
   * @param file
   */


  onComplete(file) {}
  /**
   * Called when the file is created in the collection
   * @param file
   */


  onCreate(file) {}
  /**
   * Called when an error occurs during file upload
   * @param err
   * @param file
   */


  onError(err, file) {
    console.error("ufs: ".concat(err.message));
  }
  /**
   * Called when a file chunk has been sent
   * @param file
   * @param progress is a float from 0.0 to 1.0
   */


  onProgress(file, progress) {}
  /**
   * Called when the file upload starts
   * @param file
   */


  onStart(file) {}
  /**
   * Called when the file upload stops
   * @param file
   */


  onStop(file) {}

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"spark-md5":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/jalik_ufs/node_modules/spark-md5/package.json                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "spark-md5",
  "version": "3.0.0",
  "main": "spark-md5.js"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"spark-md5.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/jalik_ufs/node_modules/spark-md5/spark-md5.js                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs/ufs.js");

/* Exports */
Package._define("jalik:ufs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1jb25maWcuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtZmlsdGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9qYWxpazp1ZnMvdWZzLW1ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtbWltZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUtcGVybWlzc2lvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtdG9rZW5zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9qYWxpazp1ZnMvdWZzLXVwbG9hZGVyLmpzIl0sIm5hbWVzIjpbIm1vZHVsZTEiLCJleHBvcnQiLCJVcGxvYWRGUyIsIk1ldGVvciIsImxpbmsiLCJ2IiwiUmFuZG9tIiwiQ29uZmlnIiwiRmlsdGVyIiwiTUlNRSIsIlN0b3JlIiwiU3RvcmVQZXJtaXNzaW9ucyIsIlRva2VucyIsIlVwbG9hZGVyIiwic3RvcmVzIiwic3RvcmUiLCJ0b2tlbnMiLCJhZGRFVGFnQXR0cmlidXRlVG9GaWxlcyIsIndoZXJlIiwiZ2V0U3RvcmVzIiwiZm9yRWFjaCIsImZpbGVzIiwiZ2V0Q29sbGVjdGlvbiIsImZpbmQiLCJldGFnIiwiZmllbGRzIiwiX2lkIiwiZmlsZSIsImRpcmVjdCIsInVwZGF0ZSIsIiRzZXQiLCJnZW5lcmF0ZUV0YWciLCJhZGRNaW1lVHlwZSIsImV4dGVuc2lvbiIsIm1pbWUiLCJ0b0xvd2VyQ2FzZSIsImFkZFBhdGhBdHRyaWJ1dGVUb0ZpbGVzIiwicGF0aCIsImdldEZpbGVSZWxhdGl2ZVVSTCIsImFkZFN0b3JlIiwiVHlwZUVycm9yIiwiZ2V0TmFtZSIsImlkIiwiZ2V0TWltZVR5cGUiLCJnZXRNaW1lVHlwZXMiLCJnZXRTdG9yZSIsIm5hbWUiLCJnZXRUZW1wRmlsZVBhdGgiLCJmaWxlSWQiLCJjb25maWciLCJ0bXBEaXIiLCJpbXBvcnRGcm9tVVJMIiwidXJsIiwiY2FsbGJhY2siLCJjYWxsIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJldmVudCIsImNvbnNvbGUiLCJlcnJvciIsInNlbGVjdEZpbGUiLCJpbnB1dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJtdWx0aXBsZSIsIm9uY2hhbmdlIiwiZXYiLCJ0YXJnZXQiLCJkaXYiLCJjbGFzc05hbWUiLCJzdHlsZSIsImFwcGVuZENoaWxkIiwiYm9keSIsImNsaWNrIiwic2VsZWN0RmlsZXMiLCJpIiwibGVuZ3RoIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiZ2xvYmFsIiwiaXNDbGllbnQiLCJ3aW5kb3ciLCJtb2R1bGUiLCJfIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwiZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMiLCJodHRwcyIsInNpbXVsYXRlUmVhZERlbGF5Iiwic2ltdWxhdGVVcGxvYWRTcGVlZCIsInNpbXVsYXRlV3JpdGVEZWxheSIsInN0b3Jlc1BhdGgiLCJ0bXBEaXJQZXJtaXNzaW9ucyIsInBhcnNlSW50Iiwic2VsZiIsImNvbnRlbnRUeXBlcyIsImV4dGVuc2lvbnMiLCJtaW5TaXplIiwibWF4U2l6ZSIsImludmFsaWRGaWxlRXJyb3IiLCJFcnJvciIsImZpbGVUb29TbWFsbEVycm9yIiwiZmlsZVNpemUiLCJtaW5GaWxlU2l6ZSIsImZpbGVUb29MYXJnZUVycm9yIiwibWF4RmlsZVNpemUiLCJpbnZhbGlkRmlsZUV4dGVuc2lvbiIsImZpbGVFeHRlbnNpb24iLCJhbGxvd2VkRXh0ZW5zaW9ucyIsImludmFsaWRGaWxlVHlwZSIsImZpbGVUeXBlIiwiYWxsb3dlZENvbnRlbnRUeXBlcyIsIm9uQ2hlY2siLCJBcnJheSIsIm1ldGhvZCIsImNoZWNrIiwic2l6ZSIsImdldE1pblNpemUiLCJnZXRNYXhTaXplIiwiZ2V0RXh0ZW5zaW9ucyIsImluY2x1ZGVzIiwiZ2V0Q29udGVudFR5cGVzIiwiZmlsZVR5cGVzIiwiaXNDb250ZW50VHlwZUluTGlzdCIsImxpc3QiLCJ3aWxkQ2FyZEdsb2IiLCJ3aWxkY2FyZHMiLCJmaWx0ZXIiLCJpdGVtIiwiaW5kZXhPZiIsInJlcGxhY2UiLCJpc1ZhbGlkIiwicmVzdWx0IiwiZXJyIiwiZnMiLCJOcG0iLCJodHRwIiwiRnV0dXJlIiwibWV0aG9kcyIsInVmc0NvbXBsZXRlIiwic3RvcmVOYW1lIiwidG9rZW4iLCJTdHJpbmciLCJjaGVja1Rva2VuIiwiZnV0IiwidG1wRmlsZSIsInJlbW92ZVRlbXBGaWxlIiwidW5saW5rIiwibWVzc2FnZSIsImZpbmRPbmUiLCJ2YWxpZGF0ZSIsInJzIiwiY3JlYXRlUmVhZFN0cmVhbSIsImZsYWdzIiwiZW5jb2RpbmciLCJhdXRvQ2xvc2UiLCJvbiIsImJpbmRFbnZpcm9ubWVudCIsInJlbW92ZSIsInRocm93Iiwid3JpdGUiLCJyZXR1cm4iLCJ3YWl0IiwidWZzQ3JlYXRlIiwiT2JqZWN0IiwiY29tcGxldGUiLCJ1cGxvYWRpbmciLCJzdWJzdHIiLCJsYXN0SW5kZXhPZiIsInByb2dyZXNzIiwidXNlcklkIiwiZ2V0RmlsdGVyIiwiY3JlYXRlIiwiY3JlYXRlVG9rZW4iLCJ1cGxvYWRVcmwiLCJnZXRVUkwiLCJ1ZnNEZWxldGUiLCJjb3VudCIsInVmc0ltcG9ydFVSTCIsInNwbGl0IiwicG9wIiwib3JpZ2luYWxVcmwiLCJ3YXJuIiwicHJvdG8iLCJ0ZXN0IiwidW5ibG9jayIsImdldCIsInJlcyIsInVmc1N0b3AiLCJXZWJBcHAiLCJTcGFya01ENSIsImRlZmF1bHQiLCJkb21haW4iLCJta2RpcnAiLCJzdHJlYW0iLCJVUkwiLCJ6bGliIiwic3RhcnR1cCIsIm1vZGUiLCJzdGF0IiwibG9nIiwiY2htb2QiLCJkIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwibmV4dCIsInBhcnNlZFVybCIsInBhcnNlIiwicGF0aG5hbWUiLCJhbGxvd0NPUlMiLCJzZXRIZWFkZXIiLCJyZWdFeHAiLCJSZWdFeHAiLCJtYXRjaCIsImV4ZWMiLCJ3cml0ZUhlYWQiLCJlbmQiLCJxdWVyeSIsInVuaXF1ZSIsImhhc2giLCJvcmlnaW5hbElkIiwiJG5lIiwic3BhcmsiLCJBcnJheUJ1ZmZlciIsIndzIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJwYXJzZUZsb2F0IiwiaXNOYU4iLCJNYXRoIiwibWluIiwiY2h1bmsiLCJhcHBlbmQiLCJvblJlYWQiLCJ1bmRlZmluZWQiLCJpbmRleCIsIl9zbGVlcEZvck1zIiwicnVuIiwic3RhdHVzIiwiaGVhZGVycyIsIm1vZGlmaWVkQXQiLCJEYXRlIiwidG9VVENTdHJpbmciLCJ1cGxvYWRlZEF0IiwibW9kaWZpZWRTaW5jZSIsInJhbmdlIiwidG90YWwiLCJ1bml0IiwicmFuZ2VzIiwiciIsInN0YXJ0IiwiZ2V0UmVhZFN0cmVhbSIsIlBhc3NUaHJvdWdoIiwib25SZWFkRXJyb3IiLCJlbWl0IiwidHJhbnNmb3JtUmVhZCIsImFjY2VwdCIsInBpcGUiLCJjcmVhdGVHemlwIiwiY3JlYXRlRGVmbGF0ZSIsImluc2VydCIsImFjdGlvbnMiLCJhY3Rpb24iLCJtb2RpZmllcnMiLCJjaGVja0luc2VydCIsImNoZWNrUmVtb3ZlIiwiY2hlY2tVcGRhdGUiLCJfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMiLCJNb25nbyIsImNvbGxlY3Rpb24iLCJvbkNvcHlFcnJvciIsIm9uRmluaXNoVXBsb2FkIiwib25WYWxpZGF0ZSIsIm9uV3JpdGVFcnJvciIsInBlcm1pc3Npb25zIiwidHJhbnNmb3JtV3JpdGUiLCJDb2xsZWN0aW9uIiwidmFsdWUiLCJjb3B5Iiwib3JpZ2luYWxTdG9yZSIsImNvcHlJZCIsImdlbmVyYXRlVG9rZW4iLCJjcmVhdGVkQXQiLCJlcnJvckhhbmRsZXIiLCJmaW5pc2hIYW5kbGVyIiwicmVhZFN0cmVhbSIsImRhdGEiLCJnZXRGaWxlVVJMIiwiY29weVRvIiwiZ2V0V3JpdGVTdHJlYW0iLCJhZnRlciIsImJlZm9yZSIsImRlbGV0ZSIsInBhdHRlcm4iLCJjIiwicmFuZG9tIiwicyIsInRvU3RyaW5nIiwicm91bmQiLCJ0b1VwcGVyQ2FzZSIsImdldFJlbGF0aXZlVVJMIiwicm9vdFVybCIsImFic29sdXRlVXJsIiwicm9vdFBhdGgiLCJ0cmltIiwiZW5jb2RlVVJJIiwic2VjdXJlIiwicmVxdWVzdCIsInJlc3BvbnNlIiwic2V0UGVybWlzc2lvbnMiLCJ3cml0ZVN0cmVhbSIsImFkYXB0aXZlIiwiY2FwYWNpdHkiLCJjaHVua1NpemUiLCJtYXhDaHVua1NpemUiLCJtYXhUcmllcyIsIm9uQWJvcnQiLCJvbkNvbXBsZXRlIiwib25DcmVhdGUiLCJvbkVycm9yIiwib25Qcm9ncmVzcyIsIm9uU3RhcnQiLCJvblN0b3AiLCJyZXRyeURlbGF5IiwidHJhbnNmZXJEZWxheSIsIlJhbmdlRXJyb3IiLCJCbG9iIiwiRmlsZSIsImNhcGFjaXR5TWFyZ2luIiwib2Zmc2V0IiwibG9hZGVkIiwidHJpZXMiLCJwb3N0VXJsIiwidGltZUEiLCJ0aW1lQiIsImVsYXBzZWRUaW1lIiwic3RhcnRUaW1lIiwiZmluaXNoIiwidXBsb2FkZWRGaWxlIiwiYWJvcnQiLCJnZXRBdmVyYWdlU3BlZWQiLCJzZWNvbmRzIiwiZ2V0RWxhcHNlZFRpbWUiLCJnZXRMb2FkZWQiLCJpc1VwbG9hZGluZyIsIm5vdyIsImdldEZpbGUiLCJnZXRQcm9ncmVzcyIsImdldFJlbWFpbmluZ1RpbWUiLCJhdmVyYWdlU3BlZWQiLCJyZW1haW5pbmdCeXRlcyIsIm1heCIsImdldFNwZWVkIiwiZ2V0VG90YWwiLCJpc0NvbXBsZXRlIiwicmVhZENodW5rIiwic2xpY2UiLCJzZXRUaW1lb3V0Iiwic2VuZENodW5rIiwiZHVyYXRpb24iLCJhYnMiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJvcGVuIiwic2VuZCIsInN0b3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsU0FBTyxDQUFDQyxNQUFSLENBQWU7QUFBQ0MsWUFBUSxFQUFDLE1BQUlBO0FBQWQsR0FBZjtBQUF3QyxNQUFJQyxNQUFKO0FBQVdILFNBQU8sQ0FBQ0ksSUFBUixDQUFhLGVBQWIsRUFBNkI7QUFBQ0QsVUFBTSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsWUFBTSxHQUFDRSxDQUFQO0FBQVM7O0FBQXBCLEdBQTdCLEVBQW1ELENBQW5EO0FBQXNELE1BQUlDLE1BQUo7QUFBV04sU0FBTyxDQUFDSSxJQUFSLENBQWEsZUFBYixFQUE2QjtBQUFDRSxVQUFNLENBQUNELENBQUQsRUFBRztBQUFDQyxZQUFNLEdBQUNELENBQVA7QUFBUzs7QUFBcEIsR0FBN0IsRUFBbUQsQ0FBbkQ7QUFBc0QsTUFBSUUsTUFBSjtBQUFXUCxTQUFPLENBQUNJLElBQVIsQ0FBYSxjQUFiLEVBQTRCO0FBQUNHLFVBQU0sQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLFlBQU0sR0FBQ0YsQ0FBUDtBQUFTOztBQUFwQixHQUE1QixFQUFrRCxDQUFsRDtBQUFxRCxNQUFJRyxNQUFKO0FBQVdSLFNBQU8sQ0FBQ0ksSUFBUixDQUFhLGNBQWIsRUFBNEI7QUFBQ0ksVUFBTSxDQUFDSCxDQUFELEVBQUc7QUFBQ0csWUFBTSxHQUFDSCxDQUFQO0FBQVM7O0FBQXBCLEdBQTVCLEVBQWtELENBQWxEO0FBQXFELE1BQUlJLElBQUo7QUFBU1QsU0FBTyxDQUFDSSxJQUFSLENBQWEsWUFBYixFQUEwQjtBQUFDSyxRQUFJLENBQUNKLENBQUQsRUFBRztBQUFDSSxVQUFJLEdBQUNKLENBQUw7QUFBTzs7QUFBaEIsR0FBMUIsRUFBNEMsQ0FBNUM7QUFBK0MsTUFBSUssS0FBSjtBQUFVVixTQUFPLENBQUNJLElBQVIsQ0FBYSxhQUFiLEVBQTJCO0FBQUNNLFNBQUssQ0FBQ0wsQ0FBRCxFQUFHO0FBQUNLLFdBQUssR0FBQ0wsQ0FBTjtBQUFROztBQUFsQixHQUEzQixFQUErQyxDQUEvQztBQUFrRCxNQUFJTSxnQkFBSjtBQUFxQlgsU0FBTyxDQUFDSSxJQUFSLENBQWEseUJBQWIsRUFBdUM7QUFBQ08sb0JBQWdCLENBQUNOLENBQUQsRUFBRztBQUFDTSxzQkFBZ0IsR0FBQ04sQ0FBakI7QUFBbUI7O0FBQXhDLEdBQXZDLEVBQWlGLENBQWpGO0FBQW9GLE1BQUlPLE1BQUo7QUFBV1osU0FBTyxDQUFDSSxJQUFSLENBQWEsY0FBYixFQUE0QjtBQUFDUSxVQUFNLENBQUNQLENBQUQsRUFBRztBQUFDTyxZQUFNLEdBQUNQLENBQVA7QUFBUzs7QUFBcEIsR0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsTUFBSVEsUUFBSjtBQUFhYixTQUFPLENBQUNJLElBQVIsQ0FBYSxnQkFBYixFQUE4QjtBQUFDUyxZQUFRLENBQUNSLENBQUQsRUFBRztBQUFDUSxjQUFRLEdBQUNSLENBQVQ7QUFBVzs7QUFBeEIsR0FBOUIsRUFBd0QsQ0FBeEQ7QUFrQ3BsQixNQUFJUyxNQUFNLEdBQUcsRUFBYjtBQUVPLFFBQU1aLFFBQVEsR0FBRztBQUV0Qjs7O0FBR0FhLFNBQUssRUFBRSxFQUxlOztBQU90Qjs7O0FBR0FDLFVBQU0sRUFBRUosTUFWYzs7QUFZdEI7Ozs7QUFJQUssMkJBQXVCLENBQUNDLEtBQUQsRUFBUTtBQUM3QixXQUFLQyxTQUFMLEdBQWlCQyxPQUFqQixDQUEwQkwsS0FBRCxJQUFXO0FBQ2xDLGNBQU1NLEtBQUssR0FBR04sS0FBSyxDQUFDTyxhQUFOLEVBQWQsQ0FEa0MsQ0FHbEM7O0FBQ0FELGFBQUssQ0FBQ0UsSUFBTixDQUFXTCxLQUFLLElBQUk7QUFBRU0sY0FBSSxFQUFFO0FBQVIsU0FBcEIsRUFBb0M7QUFBRUMsZ0JBQU0sRUFBRTtBQUFFQyxlQUFHLEVBQUU7QUFBUDtBQUFWLFNBQXBDLEVBQTRETixPQUE1RCxDQUFxRU8sSUFBRCxJQUFVO0FBQzVFTixlQUFLLENBQUNPLE1BQU4sQ0FBYUMsTUFBYixDQUFvQkYsSUFBSSxDQUFDRCxHQUF6QixFQUE4QjtBQUFFSSxnQkFBSSxFQUFFO0FBQUVOLGtCQUFJLEVBQUUsS0FBS08sWUFBTDtBQUFSO0FBQVIsV0FBOUI7QUFDRCxTQUZEO0FBR0QsT0FQRDtBQVFELEtBekJxQjs7QUEyQnRCOzs7OztBQUtBQyxlQUFXLENBQUNDLFNBQUQsRUFBWUMsSUFBWixFQUFrQjtBQUMzQnpCLFVBQUksQ0FBQ3dCLFNBQVMsQ0FBQ0UsV0FBVixFQUFELENBQUosR0FBZ0NELElBQWhDO0FBQ0QsS0FsQ3FCOztBQW9DdEI7Ozs7QUFJQUUsMkJBQXVCLENBQUNsQixLQUFELEVBQVE7QUFDN0IsV0FBS0MsU0FBTCxHQUFpQkMsT0FBakIsQ0FBMEJMLEtBQUQsSUFBVztBQUNsQyxjQUFNTSxLQUFLLEdBQUdOLEtBQUssQ0FBQ08sYUFBTixFQUFkLENBRGtDLENBR2xDOztBQUNBRCxhQUFLLENBQUNFLElBQU4sQ0FBV0wsS0FBSyxJQUFJO0FBQUVtQixjQUFJLEVBQUU7QUFBUixTQUFwQixFQUFvQztBQUFFWixnQkFBTSxFQUFFO0FBQUVDLGVBQUcsRUFBRTtBQUFQO0FBQVYsU0FBcEMsRUFBNEROLE9BQTVELENBQXFFTyxJQUFELElBQVU7QUFDNUVOLGVBQUssQ0FBQ08sTUFBTixDQUFhQyxNQUFiLENBQW9CRixJQUFJLENBQUNELEdBQXpCLEVBQThCO0FBQUVJLGdCQUFJLEVBQUU7QUFBRU8sa0JBQUksRUFBRXRCLEtBQUssQ0FBQ3VCLGtCQUFOLENBQXlCWCxJQUFJLENBQUNELEdBQTlCO0FBQVI7QUFBUixXQUE5QjtBQUNELFNBRkQ7QUFHRCxPQVBEO0FBUUQsS0FqRHFCOztBQW1EdEI7Ozs7QUFJQWEsWUFBUSxDQUFDeEIsS0FBRCxFQUFRO0FBQ2QsVUFBSSxFQUFFQSxLQUFLLFlBQVlMLEtBQW5CLENBQUosRUFBK0I7QUFDN0IsY0FBTSxJQUFJOEIsU0FBSixvREFBTjtBQUNEOztBQUNEMUIsWUFBTSxDQUFDQyxLQUFLLENBQUMwQixPQUFOLEVBQUQsQ0FBTixHQUEwQjFCLEtBQTFCO0FBQ0QsS0E1RHFCOztBQThEdEI7Ozs7QUFJQWdCLGdCQUFZLEdBQUc7QUFDYixhQUFPekIsTUFBTSxDQUFDb0MsRUFBUCxFQUFQO0FBQ0QsS0FwRXFCOztBQXNFdEI7Ozs7O0FBS0FDLGVBQVcsQ0FBQ1YsU0FBRCxFQUFZO0FBQ3JCQSxlQUFTLEdBQUdBLFNBQVMsQ0FBQ0UsV0FBVixFQUFaO0FBQ0EsYUFBTzFCLElBQUksQ0FBQ3dCLFNBQUQsQ0FBWDtBQUNELEtBOUVxQjs7QUFnRnRCOzs7QUFHQVcsZ0JBQVksR0FBRztBQUNiLGFBQU9uQyxJQUFQO0FBQ0QsS0FyRnFCOztBQXVGdEI7Ozs7O0FBS0FvQyxZQUFRLENBQUNDLElBQUQsRUFBTztBQUNiLGFBQU9oQyxNQUFNLENBQUNnQyxJQUFELENBQWI7QUFDRCxLQTlGcUI7O0FBZ0d0Qjs7OztBQUlBM0IsYUFBUyxHQUFHO0FBQ1YsYUFBT0wsTUFBUDtBQUNELEtBdEdxQjs7QUF3R3RCOzs7OztBQUtBaUMsbUJBQWUsQ0FBQ0MsTUFBRCxFQUFTO0FBQ3RCLHVCQUFVLEtBQUtDLE1BQUwsQ0FBWUMsTUFBdEIsY0FBZ0NGLE1BQWhDO0FBQ0QsS0EvR3FCOztBQWlIdEI7Ozs7Ozs7QUFPQUcsaUJBQWEsQ0FBQ0MsR0FBRCxFQUFNekIsSUFBTixFQUFZWixLQUFaLEVBQW1Cc0MsUUFBbkIsRUFBNkI7QUFDeEMsVUFBSSxPQUFPdEMsS0FBUCxLQUFpQixRQUFyQixFQUErQjtBQUM3QlosY0FBTSxDQUFDbUQsSUFBUCxDQUFZLGNBQVosRUFBNEJGLEdBQTVCLEVBQWlDekIsSUFBakMsRUFBdUNaLEtBQXZDLEVBQThDc0MsUUFBOUM7QUFDRCxPQUZELE1BRU8sSUFBSSxPQUFPdEMsS0FBUCxLQUFpQixRQUFyQixFQUErQjtBQUNwQ0EsYUFBSyxDQUFDb0MsYUFBTixDQUFvQkMsR0FBcEIsRUFBeUJ6QixJQUF6QixFQUErQjBCLFFBQS9CO0FBQ0Q7QUFDRixLQTlIcUI7O0FBZ0l0Qjs7Ozs7O0FBTUFFLHFCQUFpQixDQUFDQyxLQUFELEVBQVFILFFBQVIsRUFBa0I7QUFDakNJLGFBQU8sQ0FBQ0MsS0FBUixDQUFjLHdHQUFkO0FBQ0QsS0F4SXFCOztBQTBJdEI7Ozs7QUFJQUMsY0FBVSxDQUFDTixRQUFELEVBQVc7QUFDbkIsWUFBTU8sS0FBSyxHQUFHQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBZDtBQUNBRixXQUFLLENBQUNHLElBQU4sR0FBYSxNQUFiO0FBQ0FILFdBQUssQ0FBQ0ksUUFBTixHQUFpQixLQUFqQjs7QUFDQUosV0FBSyxDQUFDSyxRQUFOLEdBQWtCQyxFQUFELElBQVE7QUFDdkIsWUFBSTdDLEtBQUssR0FBRzZDLEVBQUUsQ0FBQ0MsTUFBSCxDQUFVOUMsS0FBdEI7QUFDQWdDLGdCQUFRLENBQUNDLElBQVQsQ0FBY3BELFFBQWQsRUFBd0JtQixLQUFLLENBQUMsQ0FBRCxDQUE3QjtBQUNELE9BSEQsQ0FKbUIsQ0FRbkI7OztBQUNBLFlBQU0rQyxHQUFHLEdBQUdQLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0FNLFNBQUcsQ0FBQ0MsU0FBSixHQUFnQixtQkFBaEI7QUFDQUQsU0FBRyxDQUFDRSxLQUFKLEdBQVksb0RBQVo7QUFDQUYsU0FBRyxDQUFDRyxXQUFKLENBQWdCWCxLQUFoQjtBQUNBQyxjQUFRLENBQUNXLElBQVQsQ0FBY0QsV0FBZCxDQUEwQkgsR0FBMUIsRUFibUIsQ0FjbkI7O0FBQ0FSLFdBQUssQ0FBQ2EsS0FBTjtBQUNELEtBOUpxQjs7QUFnS3RCOzs7O0FBSUFDLGVBQVcsQ0FBQ3JCLFFBQUQsRUFBVztBQUNwQixZQUFNTyxLQUFLLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixPQUF2QixDQUFkO0FBQ0FGLFdBQUssQ0FBQ0csSUFBTixHQUFhLE1BQWI7QUFDQUgsV0FBSyxDQUFDSSxRQUFOLEdBQWlCLElBQWpCOztBQUNBSixXQUFLLENBQUNLLFFBQU4sR0FBa0JDLEVBQUQsSUFBUTtBQUN2QixjQUFNN0MsS0FBSyxHQUFHNkMsRUFBRSxDQUFDQyxNQUFILENBQVU5QyxLQUF4Qjs7QUFFQSxhQUFLLElBQUlzRCxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHdEQsS0FBSyxDQUFDdUQsTUFBMUIsRUFBa0NELENBQUMsSUFBSSxDQUF2QyxFQUEwQztBQUN4Q3RCLGtCQUFRLENBQUNDLElBQVQsQ0FBY3BELFFBQWQsRUFBd0JtQixLQUFLLENBQUNzRCxDQUFELENBQTdCO0FBQ0Q7QUFDRixPQU5ELENBSm9CLENBV3BCOzs7QUFDQSxZQUFNUCxHQUFHLEdBQUdQLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0FNLFNBQUcsQ0FBQ0MsU0FBSixHQUFnQixtQkFBaEI7QUFDQUQsU0FBRyxDQUFDRSxLQUFKLEdBQVksb0RBQVo7QUFDQUYsU0FBRyxDQUFDRyxXQUFKLENBQWdCWCxLQUFoQjtBQUNBQyxjQUFRLENBQUNXLElBQVQsQ0FBY0QsV0FBZCxDQUEwQkgsR0FBMUIsRUFoQm9CLENBaUJwQjs7QUFDQVIsV0FBSyxDQUFDYSxLQUFOO0FBQ0Q7O0FBdkxxQixHQUFqQjs7QUEwTFAsTUFBSXRFLE1BQU0sQ0FBQzBFLFFBQVgsRUFBcUI7QUFDbkJDLFdBQU8sQ0FBQyxlQUFELENBQVA7O0FBQ0FBLFdBQU8sQ0FBQyxjQUFELENBQVA7QUFDRDtBQUVEOzs7Ozs7QUFJQTVFLFVBQVEsQ0FBQytDLE1BQVQsR0FBa0IsSUFBSTFDLE1BQUosRUFBbEIsQyxDQUVBOztBQUNBTCxVQUFRLENBQUNLLE1BQVQsR0FBa0JBLE1BQWxCO0FBQ0FMLFVBQVEsQ0FBQ00sTUFBVCxHQUFrQkEsTUFBbEI7QUFDQU4sVUFBUSxDQUFDUSxLQUFULEdBQWlCQSxLQUFqQjtBQUNBUixVQUFRLENBQUNTLGdCQUFULEdBQTRCQSxnQkFBNUI7QUFDQVQsVUFBUSxDQUFDVyxRQUFULEdBQW9CQSxRQUFwQjs7QUFFQSxNQUFJVixNQUFNLENBQUMwRSxRQUFYLEVBQXFCO0FBQ25CO0FBQ0EsUUFBSSxPQUFPRSxNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDQSxZQUFNLENBQUMsVUFBRCxDQUFOLEdBQXFCN0UsUUFBckI7QUFDRDtBQUNGLEdBTEQsTUFLTyxJQUFJQyxNQUFNLENBQUM2RSxRQUFYLEVBQXFCO0FBQzFCO0FBQ0EsUUFBSSxPQUFPQyxNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDQSxZQUFNLENBQUMvRSxRQUFQLEdBQWtCQSxRQUFsQjtBQUNEO0FBQ0Y7Ozs7Ozs7Ozs7OztBQzFQRGdGLE1BQU0sQ0FBQ2pGLE1BQVAsQ0FBYztBQUFDTSxRQUFNLEVBQUMsTUFBSUE7QUFBWixDQUFkOztBQUFtQyxJQUFJNEUsQ0FBSjs7QUFBTUQsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUMrRSxHQUFDLENBQUM5RSxDQUFELEVBQUc7QUFBQzhFLEtBQUMsR0FBQzlFLENBQUY7QUFBSTs7QUFBVixDQUFoQyxFQUE0QyxDQUE1QztBQUErQyxJQUFJTSxnQkFBSjtBQUFxQnVFLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSx5QkFBWixFQUFzQztBQUFDTyxrQkFBZ0IsQ0FBQ04sQ0FBRCxFQUFHO0FBQUNNLG9CQUFnQixHQUFDTixDQUFqQjtBQUFtQjs7QUFBeEMsQ0FBdEMsRUFBZ0YsQ0FBaEY7O0FBK0J0RyxNQUFNRSxNQUFOLENBQWE7QUFFbEI2RSxhQUFXLENBQUNDLE9BQUQsRUFBVTtBQUNuQjtBQUNBQSxXQUFPLEdBQUdGLENBQUMsQ0FBQ0csTUFBRixDQUFTO0FBQ2pCQyw2QkFBdUIsRUFBRSxJQURSO0FBRWpCQyxXQUFLLEVBQUUsS0FGVTtBQUdqQkMsdUJBQWlCLEVBQUUsQ0FIRjtBQUlqQkMseUJBQW1CLEVBQUUsQ0FKSjtBQUtqQkMsd0JBQWtCLEVBQUUsQ0FMSDtBQU1qQkMsZ0JBQVUsRUFBRSxLQU5LO0FBT2pCMUMsWUFBTSxFQUFFLFVBUFM7QUFRakIyQyx1QkFBaUIsRUFBRTtBQVJGLEtBQVQsRUFTUFIsT0FUTyxDQUFWLENBRm1CLENBYW5COztBQUNBLFFBQUlBLE9BQU8sQ0FBQ0UsdUJBQVIsSUFBbUMsRUFBRUYsT0FBTyxDQUFDRSx1QkFBUixZQUEyQzVFLGdCQUE3QyxDQUF2QyxFQUF1RztBQUNyRyxZQUFNLElBQUk2QixTQUFKLENBQWMsd0VBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ0csS0FBZixLQUF5QixTQUE3QixFQUF3QztBQUN0QyxZQUFNLElBQUloRCxTQUFKLENBQWMsaUNBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ0ksaUJBQWYsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsWUFBTSxJQUFJakQsU0FBSixDQUFjLDJDQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUNLLG1CQUFmLEtBQXVDLFFBQTNDLEVBQXFEO0FBQ25ELFlBQU0sSUFBSWxELFNBQUosQ0FBYyw2Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDTSxrQkFBZixLQUFzQyxRQUExQyxFQUFvRDtBQUNsRCxZQUFNLElBQUluRCxTQUFKLENBQWMsNENBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ08sVUFBZixLQUE4QixRQUFsQyxFQUE0QztBQUMxQyxZQUFNLElBQUlwRCxTQUFKLENBQWMsb0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ25DLE1BQWYsS0FBMEIsUUFBOUIsRUFBd0M7QUFDdEMsWUFBTSxJQUFJVixTQUFKLENBQWMsZ0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ1EsaUJBQWYsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsWUFBTSxJQUFJckQsU0FBSixDQUFjLDJDQUFkLENBQU47QUFDRDtBQUVEOzs7Ozs7QUFJQSxTQUFLK0MsdUJBQUwsR0FBK0JGLE9BQU8sQ0FBQ0UsdUJBQXZDO0FBQ0E7Ozs7O0FBSUEsU0FBS0MsS0FBTCxHQUFhSCxPQUFPLENBQUNHLEtBQXJCO0FBQ0E7Ozs7O0FBSUEsU0FBS0MsaUJBQUwsR0FBeUJLLFFBQVEsQ0FBQ1QsT0FBTyxDQUFDSSxpQkFBVCxDQUFqQztBQUNBOzs7OztBQUlBLFNBQUtDLG1CQUFMLEdBQTJCSSxRQUFRLENBQUNULE9BQU8sQ0FBQ0ssbUJBQVQsQ0FBbkM7QUFDQTs7Ozs7QUFJQSxTQUFLQyxrQkFBTCxHQUEwQkcsUUFBUSxDQUFDVCxPQUFPLENBQUNNLGtCQUFULENBQWxDO0FBQ0E7Ozs7O0FBSUEsU0FBS0MsVUFBTCxHQUFrQlAsT0FBTyxDQUFDTyxVQUExQjtBQUNBOzs7OztBQUlBLFNBQUsxQyxNQUFMLEdBQWNtQyxPQUFPLENBQUNuQyxNQUF0QjtBQUNBOzs7OztBQUlBLFNBQUsyQyxpQkFBTCxHQUF5QlIsT0FBTyxDQUFDUSxpQkFBakM7QUFDRDs7QUFqRmlCLEM7Ozs7Ozs7Ozs7O0FDL0JwQlgsTUFBTSxDQUFDakYsTUFBUCxDQUFjO0FBQUNPLFFBQU0sRUFBQyxNQUFJQTtBQUFaLENBQWQ7QUFBbUMsSUFBSUwsTUFBSjtBQUFXK0UsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0QsUUFBTSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsVUFBTSxHQUFDRSxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEOztBQUFxRCxJQUFJOEUsQ0FBSjs7QUFBTUQsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUMrRSxHQUFDLENBQUM5RSxDQUFELEVBQUc7QUFBQzhFLEtBQUMsR0FBQzlFLENBQUY7QUFBSTs7QUFBVixDQUFoQyxFQUE0QyxDQUE1Qzs7QUE4QmxHLE1BQU1HLE1BQU4sQ0FBYTtBQUVsQjRFLGFBQVcsQ0FBQ0MsT0FBRCxFQUFVO0FBQ25CLFVBQU1VLElBQUksR0FBRyxJQUFiLENBRG1CLENBR25COztBQUNBVixXQUFPLEdBQUdGLENBQUMsQ0FBQ0csTUFBRixDQUFTO0FBQ2pCVSxrQkFBWSxFQUFFLElBREc7QUFFakJDLGdCQUFVLEVBQUUsSUFGSztBQUdqQkMsYUFBTyxFQUFFLENBSFE7QUFJakJDLGFBQU8sRUFBRSxDQUpRO0FBS2pCQyxzQkFBZ0IsRUFBRSxNQUFNLElBQUlqRyxNQUFNLENBQUNrRyxLQUFYLENBQWlCLGNBQWpCLEVBQWlDLG1CQUFqQyxDQUxQO0FBTWpCQyx1QkFBaUIsRUFBRSxDQUFDQyxRQUFELEVBQVdDLFdBQVgsS0FBMkIsSUFBSXJHLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZ0JBQWpCLDhCQUF3REUsUUFBeEQsbUNBQXlGQyxXQUF6RixPQU43QjtBQU9qQkMsdUJBQWlCLEVBQUUsQ0FBQ0YsUUFBRCxFQUFXRyxXQUFYLEtBQTJCLElBQUl2RyxNQUFNLENBQUNrRyxLQUFYLENBQWlCLGdCQUFqQiw4QkFBd0RFLFFBQXhELG1DQUF5RkcsV0FBekYsT0FQN0I7QUFRakJDLDBCQUFvQixFQUFFLENBQUNDLGFBQUQsRUFBZ0JDLGlCQUFoQixLQUFzQyxJQUFJMUcsTUFBTSxDQUFDa0csS0FBWCxDQUFpQix3QkFBakIsNkJBQThETyxhQUE5RCxpQ0FBaUdDLGlCQUFqRyxPQVIzQztBQVNqQkMscUJBQWUsRUFBRSxDQUFDQyxRQUFELEVBQVdDLG1CQUFYLEtBQW1DLElBQUk3RyxNQUFNLENBQUNrRyxLQUFYLENBQWlCLG1CQUFqQix3QkFBb0RVLFFBQXBELGlDQUFrRkMsbUJBQWxGLE9BVG5DO0FBVWpCQyxhQUFPLEVBQUUsS0FBS0E7QUFWRyxLQUFULEVBV1A1QixPQVhPLENBQVYsQ0FKbUIsQ0FpQm5COztBQUNBLFFBQUlBLE9BQU8sQ0FBQ1csWUFBUixJQUF3QixFQUFFWCxPQUFPLENBQUNXLFlBQVIsWUFBZ0NrQixLQUFsQyxDQUE1QixFQUFzRTtBQUNwRSxZQUFNLElBQUkxRSxTQUFKLENBQWMsc0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUNZLFVBQVIsSUFBc0IsRUFBRVosT0FBTyxDQUFDWSxVQUFSLFlBQThCaUIsS0FBaEMsQ0FBMUIsRUFBa0U7QUFDaEUsWUFBTSxJQUFJMUUsU0FBSixDQUFjLG9DQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUNhLE9BQWYsS0FBMkIsUUFBL0IsRUFBeUM7QUFDdkMsWUFBTSxJQUFJMUQsU0FBSixDQUFjLGlDQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUNjLE9BQWYsS0FBMkIsUUFBL0IsRUFBeUM7QUFDdkMsWUFBTSxJQUFJM0QsU0FBSixDQUFjLGlDQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJNkMsT0FBTyxDQUFDNEIsT0FBUixJQUFtQixPQUFPNUIsT0FBTyxDQUFDNEIsT0FBZixLQUEyQixVQUFsRCxFQUE4RDtBQUM1RCxZQUFNLElBQUl6RSxTQUFKLENBQWMsbUNBQWQsQ0FBTjtBQUNELEtBaENrQixDQWtDbkI7OztBQUNBdUQsUUFBSSxDQUFDVixPQUFMLEdBQWVBLE9BQWY7QUFDQSxLQUFDLFNBQUQsRUFBWWpFLE9BQVosQ0FBcUIrRixNQUFELElBQVk7QUFDOUIsVUFBSSxPQUFPOUIsT0FBTyxDQUFDOEIsTUFBRCxDQUFkLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDcEIsWUFBSSxDQUFDb0IsTUFBRCxDQUFKLEdBQWU5QixPQUFPLENBQUM4QixNQUFELENBQXRCO0FBQ0Q7QUFDRixLQUpEO0FBS0Q7QUFFRDs7Ozs7O0FBSUFDLE9BQUssQ0FBQ3pGLElBQUQsRUFBTztBQUNWLFFBQUkrQixLQUFLLEdBQUcsSUFBWjs7QUFDQSxRQUFJLE9BQU8vQixJQUFQLEtBQWdCLFFBQWhCLElBQTRCLENBQUNBLElBQWpDLEVBQXVDO0FBQ3JDK0IsV0FBSyxHQUFHLEtBQUsyQixPQUFMLENBQWFlLGdCQUFiLEVBQVI7QUFDRCxLQUpTLENBS1Y7OztBQUNBLFFBQUlHLFFBQVEsR0FBRzVFLElBQUksQ0FBQzBGLElBQXBCO0FBQ0EsUUFBSW5CLE9BQU8sR0FBRyxLQUFLb0IsVUFBTCxFQUFkOztBQUNBLFFBQUlmLFFBQVEsSUFBSSxDQUFaLElBQWlCQSxRQUFRLEdBQUdMLE9BQWhDLEVBQXlDO0FBQ3ZDeEMsV0FBSyxHQUFHLEtBQUsyQixPQUFMLENBQWFpQixpQkFBYixDQUErQkMsUUFBL0IsRUFBeUNMLE9BQXpDLENBQVI7QUFDRDs7QUFDRCxRQUFJQyxPQUFPLEdBQUcsS0FBS29CLFVBQUwsRUFBZDs7QUFDQSxRQUFJcEIsT0FBTyxHQUFHLENBQVYsSUFBZUksUUFBUSxHQUFHSixPQUE5QixFQUF1QztBQUNyQ3pDLFdBQUssR0FBRyxLQUFLMkIsT0FBTCxDQUFhb0IsaUJBQWIsQ0FBK0JGLFFBQS9CLEVBQXlDSixPQUF6QyxDQUFSO0FBQ0QsS0FkUyxDQWVWOzs7QUFDQSxRQUFJVSxpQkFBaUIsR0FBRyxLQUFLVyxhQUFMLEVBQXhCO0FBQ0EsUUFBSVosYUFBYSxHQUFHakYsSUFBSSxDQUFDTSxTQUF6Qjs7QUFDQSxRQUFJNEUsaUJBQWlCLElBQUksQ0FBQ0EsaUJBQWlCLENBQUNZLFFBQWxCLENBQTJCYixhQUEzQixDQUExQixFQUFxRTtBQUNuRWxELFdBQUssR0FBRyxLQUFLMkIsT0FBTCxDQUFhc0Isb0JBQWIsQ0FBa0NDLGFBQWxDLEVBQWlEQyxpQkFBakQsQ0FBUjtBQUNELEtBcEJTLENBcUJWOzs7QUFDQSxRQUFJRyxtQkFBbUIsR0FBRyxLQUFLVSxlQUFMLEVBQTFCO0FBQ0EsUUFBSUMsU0FBUyxHQUFHaEcsSUFBSSxDQUFDb0MsSUFBckI7O0FBQ0EsUUFBSWlELG1CQUFtQixJQUFJLENBQUMsS0FBS1ksbUJBQUwsQ0FBeUJELFNBQXpCLEVBQW9DWCxtQkFBcEMsQ0FBNUIsRUFBc0Y7QUFDcEZ0RCxXQUFLLEdBQUcsS0FBSzJCLE9BQUwsQ0FBYXlCLGVBQWIsQ0FBNkJhLFNBQTdCLEVBQXdDWCxtQkFBeEMsQ0FBUjtBQUNELEtBMUJTLENBMkJWOzs7QUFDQSxRQUFJLE9BQU8sS0FBS0MsT0FBWixLQUF3QixVQUF4QixJQUFzQyxDQUFDLEtBQUtBLE9BQUwsQ0FBYXRGLElBQWIsQ0FBM0MsRUFBK0Q7QUFDN0QrQixXQUFLLEdBQUcsSUFBSXZELE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsY0FBakIsRUFBaUMsNEJBQWpDLENBQVI7QUFDRDs7QUFFRCxRQUFJM0MsS0FBSixFQUFXO0FBQ1QsWUFBTUEsS0FBTjtBQUNEO0FBQ0Y7QUFFRDs7Ozs7O0FBSUFnRSxpQkFBZSxHQUFHO0FBQ2hCLFdBQU8sS0FBS3JDLE9BQUwsQ0FBYVcsWUFBcEI7QUFDRDtBQUVEOzs7Ozs7QUFJQXdCLGVBQWEsR0FBRztBQUNkLFdBQU8sS0FBS25DLE9BQUwsQ0FBYVksVUFBcEI7QUFDRDtBQUVEOzs7Ozs7QUFJQXNCLFlBQVUsR0FBRztBQUNYLFdBQU8sS0FBS2xDLE9BQUwsQ0FBYWMsT0FBcEI7QUFDRDtBQUVEOzs7Ozs7QUFJQW1CLFlBQVUsR0FBRztBQUNYLFdBQU8sS0FBS2pDLE9BQUwsQ0FBYWEsT0FBcEI7QUFDRDtBQUVEOzs7Ozs7OztBQU1BMEIscUJBQW1CLENBQUM3RCxJQUFELEVBQU84RCxJQUFQLEVBQWE7QUFDOUIsUUFBSSxPQUFPOUQsSUFBUCxLQUFnQixRQUFoQixJQUE0QjhELElBQUksWUFBWVgsS0FBaEQsRUFBdUQ7QUFDckQsVUFBSVcsSUFBSSxDQUFDSixRQUFMLENBQWMxRCxJQUFkLENBQUosRUFBeUI7QUFDdkIsZUFBTyxJQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSStELFlBQVksR0FBRyxJQUFuQjtBQUNBLFlBQUlDLFNBQVMsR0FBR0YsSUFBSSxDQUFDRyxNQUFMLENBQWFDLElBQUQsSUFBVTtBQUNwQyxpQkFBT0EsSUFBSSxDQUFDQyxPQUFMLENBQWFKLFlBQWIsSUFBNkIsQ0FBcEM7QUFDRCxTQUZlLENBQWhCOztBQUlBLFlBQUlDLFNBQVMsQ0FBQ04sUUFBVixDQUFtQjFELElBQUksQ0FBQ29FLE9BQUwsQ0FBYSxTQUFiLEVBQXdCTCxZQUF4QixDQUFuQixDQUFKLEVBQStEO0FBQzdELGlCQUFPLElBQVA7QUFDRDtBQUNGO0FBQ0Y7O0FBQ0QsV0FBTyxLQUFQO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBTSxTQUFPLENBQUN6RyxJQUFELEVBQU87QUFDWixRQUFJMEcsTUFBTSxHQUFHLElBQWI7O0FBQ0EsUUFBSTtBQUNGLFdBQUtqQixLQUFMLENBQVd6RixJQUFYO0FBQ0QsS0FGRCxDQUVFLE9BQU8yRyxHQUFQLEVBQVk7QUFDWkQsWUFBTSxHQUFHLEtBQVQ7QUFDRDs7QUFDRCxXQUFPQSxNQUFQO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBcEIsU0FBTyxDQUFDdEYsSUFBRCxFQUFPO0FBQ1osV0FBTyxJQUFQO0FBQ0Q7O0FBcEtpQixDOzs7Ozs7Ozs7OztBQzlCcEIsSUFBSXlGLEtBQUo7QUFBVWxDLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNnSCxPQUFLLENBQUMvRyxDQUFELEVBQUc7QUFBQytHLFNBQUssR0FBQy9HLENBQU47QUFBUTs7QUFBbEIsQ0FBM0IsRUFBK0MsQ0FBL0M7QUFBa0QsSUFBSUYsTUFBSjtBQUFXK0UsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0QsUUFBTSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsVUFBTSxHQUFDRSxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEO0FBQXFELElBQUlILFFBQUo7QUFBYWdGLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxPQUFaLEVBQW9CO0FBQUNGLFVBQVEsQ0FBQ0csQ0FBRCxFQUFHO0FBQUNILFlBQVEsR0FBQ0csQ0FBVDtBQUFXOztBQUF4QixDQUFwQixFQUE4QyxDQUE5QztBQUFpRCxJQUFJRyxNQUFKO0FBQVcwRSxNQUFNLENBQUM5RSxJQUFQLENBQVksY0FBWixFQUEyQjtBQUFDSSxRQUFNLENBQUNILENBQUQsRUFBRztBQUFDRyxVQUFNLEdBQUNILENBQVA7QUFBUzs7QUFBcEIsQ0FBM0IsRUFBaUQsQ0FBakQ7QUFBb0QsSUFBSU8sTUFBSjtBQUFXc0UsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ1EsUUFBTSxDQUFDUCxDQUFELEVBQUc7QUFBQ08sVUFBTSxHQUFDUCxDQUFQO0FBQVM7O0FBQXBCLENBQTNCLEVBQWlELENBQWpEOztBQStCcFEsTUFBTWtJLEVBQUUsR0FBR0MsR0FBRyxDQUFDMUQsT0FBSixDQUFZLElBQVosQ0FBWDs7QUFDQSxNQUFNMkQsSUFBSSxHQUFHRCxHQUFHLENBQUMxRCxPQUFKLENBQVksTUFBWixDQUFiOztBQUNBLE1BQU1VLEtBQUssR0FBR2dELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxPQUFaLENBQWQ7O0FBQ0EsTUFBTTRELE1BQU0sR0FBR0YsR0FBRyxDQUFDMUQsT0FBSixDQUFZLGVBQVosQ0FBZjs7QUFFQSxJQUFJM0UsTUFBTSxDQUFDMEUsUUFBWCxFQUFxQjtBQUNuQjFFLFFBQU0sQ0FBQ3dJLE9BQVAsQ0FBZTtBQUViOzs7Ozs7QUFNQUMsZUFBVyxDQUFDNUYsTUFBRCxFQUFTNkYsU0FBVCxFQUFvQkMsS0FBcEIsRUFBMkI7QUFDcEMxQixXQUFLLENBQUNwRSxNQUFELEVBQVMrRixNQUFULENBQUw7QUFDQTNCLFdBQUssQ0FBQ3lCLFNBQUQsRUFBWUUsTUFBWixDQUFMO0FBQ0EzQixXQUFLLENBQUMwQixLQUFELEVBQVFDLE1BQVIsQ0FBTCxDQUhvQyxDQUtwQzs7QUFDQSxVQUFJaEksS0FBSyxHQUFHYixRQUFRLENBQUMyQyxRQUFULENBQWtCZ0csU0FBbEIsQ0FBWjs7QUFDQSxVQUFJLENBQUM5SCxLQUFMLEVBQVk7QUFDVixjQUFNLElBQUlaLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZUFBakIsRUFBa0MsaUJBQWxDLENBQU47QUFDRCxPQVRtQyxDQVVwQzs7O0FBQ0EsVUFBSSxDQUFDdEYsS0FBSyxDQUFDaUksVUFBTixDQUFpQkYsS0FBakIsRUFBd0I5RixNQUF4QixDQUFMLEVBQXNDO0FBQ3BDLGNBQU0sSUFBSTdDLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZUFBakIsRUFBa0Msb0JBQWxDLENBQU47QUFDRDs7QUFFRCxVQUFJNEMsR0FBRyxHQUFHLElBQUlQLE1BQUosRUFBVjtBQUNBLFVBQUlRLE9BQU8sR0FBR2hKLFFBQVEsQ0FBQzZDLGVBQVQsQ0FBeUJDLE1BQXpCLENBQWQ7O0FBRUEsWUFBTW1HLGNBQWMsR0FBRyxZQUFZO0FBQ2pDWixVQUFFLENBQUNhLE1BQUgsQ0FBVUYsT0FBVixFQUFtQixVQUFVWixHQUFWLEVBQWU7QUFDaENBLGFBQUcsSUFBSTdFLE9BQU8sQ0FBQ0MsS0FBUiwwQ0FBK0N3RixPQUEvQyxpQkFBNERaLEdBQUcsQ0FBQ2UsT0FBaEUsT0FBUDtBQUNELFNBRkQ7QUFHRCxPQUpEOztBQU1BLFVBQUk7QUFDRjtBQUVBO0FBQ0EsWUFBSTFILElBQUksR0FBR1osS0FBSyxDQUFDTyxhQUFOLEdBQXNCZ0ksT0FBdEIsQ0FBOEI7QUFBRTVILGFBQUcsRUFBRXNCO0FBQVAsU0FBOUIsQ0FBWCxDQUpFLENBTUY7O0FBQ0FqQyxhQUFLLENBQUN3SSxRQUFOLENBQWU1SCxJQUFmLEVBUEUsQ0FTRjs7QUFDQSxZQUFJNkgsRUFBRSxHQUFHakIsRUFBRSxDQUFDa0IsZ0JBQUgsQ0FBb0JQLE9BQXBCLEVBQTZCO0FBQ3BDUSxlQUFLLEVBQUUsR0FENkI7QUFFcENDLGtCQUFRLEVBQUUsSUFGMEI7QUFHcENDLG1CQUFTLEVBQUU7QUFIeUIsU0FBN0IsQ0FBVCxDQVZFLENBZ0JGOztBQUNBSixVQUFFLENBQUNLLEVBQUgsQ0FBTSxPQUFOLEVBQWUxSixNQUFNLENBQUMySixlQUFQLENBQXVCLFVBQVV4QixHQUFWLEVBQWU7QUFDbkQ3RSxpQkFBTyxDQUFDQyxLQUFSLENBQWM0RSxHQUFkO0FBQ0F2SCxlQUFLLENBQUNPLGFBQU4sR0FBc0J5SSxNQUF0QixDQUE2QjtBQUFFckksZUFBRyxFQUFFc0I7QUFBUCxXQUE3QjtBQUNBaUcsYUFBRyxDQUFDZSxLQUFKLENBQVUxQixHQUFWO0FBQ0QsU0FKYyxDQUFmLEVBakJFLENBdUJGOztBQUNBdkgsYUFBSyxDQUFDa0osS0FBTixDQUFZVCxFQUFaLEVBQWdCeEcsTUFBaEIsRUFBd0I3QyxNQUFNLENBQUMySixlQUFQLENBQXVCLFVBQVV4QixHQUFWLEVBQWUzRyxJQUFmLEVBQXFCO0FBQ2xFd0gsd0JBQWM7O0FBRWQsY0FBSWIsR0FBSixFQUFTO0FBQ1BXLGVBQUcsQ0FBQ2UsS0FBSixDQUFVMUIsR0FBVjtBQUNELFdBRkQsTUFFTztBQUNMO0FBQ0E7QUFDQTtBQUNBMUgsa0JBQU0sQ0FBQ21KLE1BQVAsQ0FBYztBQUFFL0csb0JBQU0sRUFBRUE7QUFBVixhQUFkO0FBQ0FpRyxlQUFHLENBQUNpQixNQUFKLENBQVd2SSxJQUFYO0FBQ0Q7QUFDRixTQVp1QixDQUF4QixFQXhCRSxDQXNDRjs7QUFDQSxlQUFPc0gsR0FBRyxDQUFDa0IsSUFBSixFQUFQO0FBQ0QsT0F4Q0QsQ0F3Q0UsT0FBTzdCLEdBQVAsRUFBWTtBQUNaO0FBQ0F2SCxhQUFLLENBQUNPLGFBQU4sR0FBc0J5SSxNQUF0QixDQUE2QjtBQUFFckksYUFBRyxFQUFFc0I7QUFBUCxTQUE3QixFQUZZLENBR1o7O0FBQ0EsY0FBTSxJQUFJN0MsTUFBTSxDQUFDa0csS0FBWCxDQUFpQix5QkFBakIsRUFBNENpQyxHQUE1QyxDQUFOO0FBQ0Q7QUFDRixLQTlFWTs7QUFnRmI7Ozs7O0FBS0E4QixhQUFTLENBQUN6SSxJQUFELEVBQU87QUFDZHlGLFdBQUssQ0FBQ3pGLElBQUQsRUFBTzBJLE1BQVAsQ0FBTDs7QUFFQSxVQUFJLE9BQU8xSSxJQUFJLENBQUNtQixJQUFaLEtBQXFCLFFBQXJCLElBQWlDLENBQUNuQixJQUFJLENBQUNtQixJQUFMLENBQVU4QixNQUFoRCxFQUF3RDtBQUN0RCxjQUFNLElBQUl6RSxNQUFNLENBQUNrRyxLQUFYLENBQWlCLG1CQUFqQixFQUFzQyx3QkFBdEMsQ0FBTjtBQUNEOztBQUNELFVBQUksT0FBTzFFLElBQUksQ0FBQ1osS0FBWixLQUFzQixRQUF0QixJQUFrQyxDQUFDWSxJQUFJLENBQUNaLEtBQUwsQ0FBVzZELE1BQWxELEVBQTBEO0FBQ3hELGNBQU0sSUFBSXpFLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZUFBakIsRUFBa0Msb0JBQWxDLENBQU47QUFDRCxPQVJhLENBU2Q7OztBQUNBLFVBQUl0RixLQUFLLEdBQUdiLFFBQVEsQ0FBQzJDLFFBQVQsQ0FBa0JsQixJQUFJLENBQUNaLEtBQXZCLENBQVo7O0FBQ0EsVUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDVixjQUFNLElBQUlaLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZUFBakIsRUFBa0MsaUJBQWxDLENBQU47QUFDRCxPQWJhLENBZWQ7OztBQUNBMUUsVUFBSSxDQUFDMkksUUFBTCxHQUFnQixLQUFoQjtBQUNBM0ksVUFBSSxDQUFDNEksU0FBTCxHQUFpQixLQUFqQjtBQUNBNUksVUFBSSxDQUFDTSxTQUFMLEdBQWlCTixJQUFJLENBQUNtQixJQUFMLElBQWFuQixJQUFJLENBQUNtQixJQUFMLENBQVUwSCxNQUFWLENBQWlCLENBQUMsQ0FBQyxDQUFDN0ksSUFBSSxDQUFDbUIsSUFBTCxDQUFVMkgsV0FBVixDQUFzQixHQUF0QixDQUFGLEtBQWlDLENBQWxDLElBQXVDLENBQXhELEVBQTJEdEksV0FBM0QsRUFBOUIsQ0FsQmMsQ0FtQmQ7O0FBQ0EsVUFBSVIsSUFBSSxDQUFDTSxTQUFMLElBQWtCLENBQUNOLElBQUksQ0FBQ29DLElBQTVCLEVBQWtDO0FBQ2hDcEMsWUFBSSxDQUFDb0MsSUFBTCxHQUFZN0QsUUFBUSxDQUFDeUMsV0FBVCxDQUFxQmhCLElBQUksQ0FBQ00sU0FBMUIsS0FBd0MsMEJBQXBEO0FBQ0Q7O0FBQ0ROLFVBQUksQ0FBQytJLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQS9JLFVBQUksQ0FBQzBGLElBQUwsR0FBWXZCLFFBQVEsQ0FBQ25FLElBQUksQ0FBQzBGLElBQU4sQ0FBUixJQUF1QixDQUFuQztBQUNBMUYsVUFBSSxDQUFDZ0osTUFBTCxHQUFjaEosSUFBSSxDQUFDZ0osTUFBTCxJQUFlLEtBQUtBLE1BQWxDLENBekJjLENBMkJkOztBQUNBLFVBQUkzQyxNQUFNLEdBQUdqSCxLQUFLLENBQUM2SixTQUFOLEVBQWI7O0FBQ0EsVUFBSTVDLE1BQU0sWUFBWXhILE1BQXRCLEVBQThCO0FBQzVCd0gsY0FBTSxDQUFDWixLQUFQLENBQWF6RixJQUFiO0FBQ0QsT0EvQmEsQ0FpQ2Q7OztBQUNBLFVBQUlxQixNQUFNLEdBQUdqQyxLQUFLLENBQUM4SixNQUFOLENBQWFsSixJQUFiLENBQWI7QUFDQSxVQUFJbUgsS0FBSyxHQUFHL0gsS0FBSyxDQUFDK0osV0FBTixDQUFrQjlILE1BQWxCLENBQVo7QUFDQSxVQUFJK0gsU0FBUyxHQUFHaEssS0FBSyxDQUFDaUssTUFBTixXQUFnQmhJLE1BQWhCLG9CQUFnQzhGLEtBQWhDLEVBQWhCO0FBRUEsYUFBTztBQUNMOUYsY0FBTSxFQUFFQSxNQURIO0FBRUw4RixhQUFLLEVBQUVBLEtBRkY7QUFHTDFGLFdBQUcsRUFBRTJIO0FBSEEsT0FBUDtBQUtELEtBaElZOztBQWtJYjs7Ozs7OztBQU9BRSxhQUFTLENBQUNqSSxNQUFELEVBQVM2RixTQUFULEVBQW9CQyxLQUFwQixFQUEyQjtBQUNsQzFCLFdBQUssQ0FBQ3BFLE1BQUQsRUFBUytGLE1BQVQsQ0FBTDtBQUNBM0IsV0FBSyxDQUFDeUIsU0FBRCxFQUFZRSxNQUFaLENBQUw7QUFDQTNCLFdBQUssQ0FBQzBCLEtBQUQsRUFBUUMsTUFBUixDQUFMLENBSGtDLENBS2xDOztBQUNBLFVBQUloSSxLQUFLLEdBQUdiLFFBQVEsQ0FBQzJDLFFBQVQsQ0FBa0JnRyxTQUFsQixDQUFaOztBQUNBLFVBQUksQ0FBQzlILEtBQUwsRUFBWTtBQUNWLGNBQU0sSUFBSVosTUFBTSxDQUFDa0csS0FBWCxDQUFpQixlQUFqQixFQUFrQyxpQkFBbEMsQ0FBTjtBQUNELE9BVGlDLENBVWxDOzs7QUFDQSxVQUFJdEYsS0FBSyxDQUFDTyxhQUFOLEdBQXNCQyxJQUF0QixDQUEyQjtBQUFFRyxXQUFHLEVBQUVzQjtBQUFQLE9BQTNCLEVBQTRDa0ksS0FBNUMsT0FBd0QsQ0FBNUQsRUFBK0Q7QUFDN0QsZUFBTyxDQUFQO0FBQ0QsT0FiaUMsQ0FjbEM7OztBQUNBLFVBQUksQ0FBQ25LLEtBQUssQ0FBQ2lJLFVBQU4sQ0FBaUJGLEtBQWpCLEVBQXdCOUYsTUFBeEIsQ0FBTCxFQUFzQztBQUNwQyxjQUFNLElBQUk3QyxNQUFNLENBQUNrRyxLQUFYLENBQWlCLGVBQWpCLEVBQWtDLG9CQUFsQyxDQUFOO0FBQ0Q7O0FBQ0QsYUFBT3RGLEtBQUssQ0FBQ08sYUFBTixHQUFzQnlJLE1BQXRCLENBQTZCO0FBQUVySSxXQUFHLEVBQUVzQjtBQUFQLE9BQTdCLENBQVA7QUFDRCxLQTVKWTs7QUE4SmI7Ozs7Ozs7QUFPQW1JLGdCQUFZLENBQUMvSCxHQUFELEVBQU16QixJQUFOLEVBQVlrSCxTQUFaLEVBQXVCO0FBQ2pDekIsV0FBSyxDQUFDaEUsR0FBRCxFQUFNMkYsTUFBTixDQUFMO0FBQ0EzQixXQUFLLENBQUN6RixJQUFELEVBQU8wSSxNQUFQLENBQUw7QUFDQWpELFdBQUssQ0FBQ3lCLFNBQUQsRUFBWUUsTUFBWixDQUFMLENBSGlDLENBS2pDOztBQUNBLFVBQUksT0FBTzNGLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxHQUFHLENBQUN3QixNQUFKLElBQWMsQ0FBN0MsRUFBZ0Q7QUFDOUMsY0FBTSxJQUFJekUsTUFBTSxDQUFDa0csS0FBWCxDQUFpQixhQUFqQixFQUFnQyxzQkFBaEMsQ0FBTjtBQUNELE9BUmdDLENBU2pDOzs7QUFDQSxVQUFJLE9BQU8xRSxJQUFQLEtBQWdCLFFBQWhCLElBQTRCQSxJQUFJLEtBQUssSUFBekMsRUFBK0M7QUFDN0MsY0FBTSxJQUFJeEIsTUFBTSxDQUFDa0csS0FBWCxDQUFpQixjQUFqQixFQUFpQyx1QkFBakMsQ0FBTjtBQUNELE9BWmdDLENBYWpDOzs7QUFDQSxZQUFNdEYsS0FBSyxHQUFHYixRQUFRLENBQUMyQyxRQUFULENBQWtCZ0csU0FBbEIsQ0FBZDs7QUFDQSxVQUFJLENBQUM5SCxLQUFMLEVBQVk7QUFDVixjQUFNLElBQUlaLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsZUFBakIsRUFBa0MsMEJBQWxDLENBQU47QUFDRCxPQWpCZ0MsQ0FtQmpDOzs7QUFDQSxVQUFJLENBQUMxRSxJQUFJLENBQUNtQixJQUFWLEVBQWdCO0FBQ2RuQixZQUFJLENBQUNtQixJQUFMLEdBQVlNLEdBQUcsQ0FBQytFLE9BQUosQ0FBWSxPQUFaLEVBQXFCLEVBQXJCLEVBQXlCaUQsS0FBekIsQ0FBK0IsR0FBL0IsRUFBb0NDLEdBQXBDLEVBQVo7QUFDRDs7QUFDRCxVQUFJMUosSUFBSSxDQUFDbUIsSUFBTCxJQUFhLENBQUNuQixJQUFJLENBQUNNLFNBQXZCLEVBQWtDO0FBQ2hDTixZQUFJLENBQUNNLFNBQUwsR0FBaUJOLElBQUksQ0FBQ21CLElBQUwsSUFBYW5CLElBQUksQ0FBQ21CLElBQUwsQ0FBVTBILE1BQVYsQ0FBaUIsQ0FBQyxDQUFDLENBQUM3SSxJQUFJLENBQUNtQixJQUFMLENBQVUySCxXQUFWLENBQXNCLEdBQXRCLENBQUYsS0FBaUMsQ0FBbEMsSUFBdUMsQ0FBeEQsRUFBMkR0SSxXQUEzRCxFQUE5QjtBQUNEOztBQUNELFVBQUlSLElBQUksQ0FBQ00sU0FBTCxJQUFrQixDQUFDTixJQUFJLENBQUNvQyxJQUE1QixFQUFrQztBQUNoQztBQUNBcEMsWUFBSSxDQUFDb0MsSUFBTCxHQUFZN0QsUUFBUSxDQUFDeUMsV0FBVCxDQUFxQmhCLElBQUksQ0FBQ00sU0FBMUIsS0FBd0MsMEJBQXBEO0FBQ0QsT0E3QmdDLENBOEJqQzs7O0FBQ0EsVUFBSWxCLEtBQUssQ0FBQzZKLFNBQU4sY0FBNkJwSyxNQUFqQyxFQUF5QztBQUN2Q08sYUFBSyxDQUFDNkosU0FBTixHQUFrQnhELEtBQWxCLENBQXdCekYsSUFBeEI7QUFDRDs7QUFFRCxVQUFJQSxJQUFJLENBQUMySixXQUFULEVBQXNCO0FBQ3BCN0gsZUFBTyxDQUFDOEgsSUFBUjtBQUNELE9BckNnQyxDQXVDakM7OztBQUNBNUosVUFBSSxDQUFDMkosV0FBTCxHQUFtQmxJLEdBQW5CLENBeENpQyxDQTBDakM7O0FBQ0F6QixVQUFJLENBQUMySSxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EzSSxVQUFJLENBQUM0SSxTQUFMLEdBQWlCLElBQWpCO0FBQ0E1SSxVQUFJLENBQUMrSSxRQUFMLEdBQWdCLENBQWhCO0FBQ0EvSSxVQUFJLENBQUNELEdBQUwsR0FBV1gsS0FBSyxDQUFDOEosTUFBTixDQUFhbEosSUFBYixDQUFYO0FBRUEsVUFBSXNILEdBQUcsR0FBRyxJQUFJUCxNQUFKLEVBQVY7QUFDQSxVQUFJOEMsS0FBSixDQWpEaUMsQ0FtRGpDOztBQUNBLFVBQUksYUFBYUMsSUFBYixDQUFrQnJJLEdBQWxCLENBQUosRUFBNEI7QUFDMUJvSSxhQUFLLEdBQUcvQyxJQUFSO0FBQ0QsT0FGRCxNQUVPLElBQUksY0FBY2dELElBQWQsQ0FBbUJySSxHQUFuQixDQUFKLEVBQTZCO0FBQ2xDb0ksYUFBSyxHQUFHaEcsS0FBUjtBQUNEOztBQUVELFdBQUtrRyxPQUFMLEdBMURpQyxDQTREakM7O0FBQ0FGLFdBQUssQ0FBQ0csR0FBTixDQUFVdkksR0FBVixFQUFlakQsTUFBTSxDQUFDMkosZUFBUCxDQUF1QixVQUFVOEIsR0FBVixFQUFlO0FBQ25EO0FBQ0E3SyxhQUFLLENBQUNrSixLQUFOLENBQVkyQixHQUFaLEVBQWlCakssSUFBSSxDQUFDRCxHQUF0QixFQUEyQixVQUFVNEcsR0FBVixFQUFlM0csSUFBZixFQUFxQjtBQUM5QyxjQUFJMkcsR0FBSixFQUFTO0FBQ1BXLGVBQUcsQ0FBQ2UsS0FBSixDQUFVMUIsR0FBVjtBQUNELFdBRkQsTUFFTztBQUNMVyxlQUFHLENBQUNpQixNQUFKLENBQVd2SSxJQUFYO0FBQ0Q7QUFDRixTQU5EO0FBT0QsT0FUYyxDQUFmLEVBU0lrSSxFQVRKLENBU08sT0FUUCxFQVNnQixVQUFVdkIsR0FBVixFQUFlO0FBQzdCVyxXQUFHLENBQUNlLEtBQUosQ0FBVTFCLEdBQVY7QUFDRCxPQVhEO0FBWUEsYUFBT1csR0FBRyxDQUFDa0IsSUFBSixFQUFQO0FBQ0QsS0EvT1k7O0FBaVBiOzs7Ozs7O0FBT0EwQixXQUFPLENBQUM3SSxNQUFELEVBQVM2RixTQUFULEVBQW9CQyxLQUFwQixFQUEyQjtBQUNoQzFCLFdBQUssQ0FBQ3BFLE1BQUQsRUFBUytGLE1BQVQsQ0FBTDtBQUNBM0IsV0FBSyxDQUFDeUIsU0FBRCxFQUFZRSxNQUFaLENBQUw7QUFDQTNCLFdBQUssQ0FBQzBCLEtBQUQsRUFBUUMsTUFBUixDQUFMLENBSGdDLENBS2hDOztBQUNBLFlBQU1oSSxLQUFLLEdBQUdiLFFBQVEsQ0FBQzJDLFFBQVQsQ0FBa0JnRyxTQUFsQixDQUFkOztBQUNBLFVBQUksQ0FBQzlILEtBQUwsRUFBWTtBQUNWLGNBQU0sSUFBSVosTUFBTSxDQUFDa0csS0FBWCxDQUFpQixlQUFqQixFQUFrQyxpQkFBbEMsQ0FBTjtBQUNELE9BVCtCLENBVWhDOzs7QUFDQSxZQUFNMUUsSUFBSSxHQUFHWixLQUFLLENBQUNPLGFBQU4sR0FBc0JDLElBQXRCLENBQTJCO0FBQUVHLFdBQUcsRUFBRXNCO0FBQVAsT0FBM0IsRUFBNEM7QUFBRXZCLGNBQU0sRUFBRTtBQUFFa0osZ0JBQU0sRUFBRTtBQUFWO0FBQVYsT0FBNUMsQ0FBYjs7QUFDQSxVQUFJLENBQUNoSixJQUFMLEVBQVc7QUFDVCxjQUFNLElBQUl4QixNQUFNLENBQUNrRyxLQUFYLENBQWlCLGNBQWpCLEVBQWlDLGdCQUFqQyxDQUFOO0FBQ0QsT0FkK0IsQ0FlaEM7OztBQUNBLFVBQUksQ0FBQ3RGLEtBQUssQ0FBQ2lJLFVBQU4sQ0FBaUJGLEtBQWpCLEVBQXdCOUYsTUFBeEIsQ0FBTCxFQUFzQztBQUNwQyxjQUFNLElBQUk3QyxNQUFNLENBQUNrRyxLQUFYLENBQWlCLGVBQWpCLEVBQWtDLG9CQUFsQyxDQUFOO0FBQ0Q7O0FBRUQsYUFBT3RGLEtBQUssQ0FBQ08sYUFBTixHQUFzQk8sTUFBdEIsQ0FBNkI7QUFBRUgsV0FBRyxFQUFFc0I7QUFBUCxPQUE3QixFQUE4QztBQUNuRGxCLFlBQUksRUFBRTtBQUFFeUksbUJBQVMsRUFBRTtBQUFiO0FBRDZDLE9BQTlDLENBQVA7QUFHRDs7QUEvUVksR0FBZjtBQWlSRCxDOzs7Ozs7Ozs7OztBQ3RURHJGLE1BQU0sQ0FBQ2pGLE1BQVAsQ0FBYztBQUFDUSxNQUFJLEVBQUMsTUFBSUE7QUFBVixDQUFkO0FBNEJPLE1BQU1BLElBQUksR0FBRztBQUVsQjtBQUNBLFFBQU0sNkJBSFk7QUFJbEIsU0FBTywwQkFKVztBQUtsQixRQUFNLHdCQUxZO0FBTWxCLFNBQU8sMEJBTlc7QUFPbEIsUUFBTSxvQkFQWTtBQVFsQixTQUFPLHFCQVJXO0FBU2xCLFNBQU8sd0JBVFc7QUFVbEIsU0FBTywwQkFWVztBQVdsQixRQUFNLG9CQVhZO0FBWWxCLFVBQVEsb0JBWlU7QUFhbEIsUUFBTSx3QkFiWTtBQWNsQixVQUFRLGtCQWRVO0FBZWxCLFNBQU8saUJBZlc7QUFnQmxCLFNBQU8saUJBaEJXO0FBaUJsQixRQUFNLHdCQWpCWTtBQWtCbEIsU0FBTywwQkFsQlc7QUFtQmxCLFNBQU8sOEJBbkJXO0FBb0JsQixTQUFPLDhCQXBCVztBQXFCbEIsU0FBTywrQkFyQlc7QUFzQmxCLFNBQU8sbUJBdEJXO0FBdUJsQixXQUFTLHVCQXZCUztBQXdCbEIsU0FBTyxpQkF4Qlc7QUF5QmxCLFNBQU8saUJBekJXO0FBMkJsQjtBQUNBLFNBQU8sWUE1Qlc7QUE2QmxCLFVBQVEsWUE3QlU7QUE4QmxCLFVBQVEsWUE5QlU7QUErQmxCLFFBQU0sYUEvQlk7QUFnQ2xCLFVBQVEsWUFoQ1U7QUFpQ2xCLFVBQVEsWUFqQ1U7QUFrQ2xCLFNBQU8sWUFsQ1c7QUFtQ2xCLFNBQU8sWUFuQ1c7QUFvQ2xCLFNBQU8sWUFwQ1c7QUFxQ2xCLFNBQU8sV0FyQ1c7QUFzQ2xCLFNBQU8sV0F0Q1c7QUF1Q2xCLFVBQVEsV0F2Q1U7QUF3Q2xCLFFBQU0sd0JBeENZO0FBeUNsQixTQUFPLFdBekNXO0FBMENsQixTQUFPLGFBMUNXO0FBMkNsQixVQUFRLFlBM0NVO0FBNENsQixTQUFPLGdCQTVDVztBQThDbEI7QUFDQSxTQUFPLGlCQS9DVztBQWdEbEIsU0FBTyxxQkFoRFc7QUFpRGxCLFNBQU8sV0FqRFc7QUFrRGxCLFNBQU8sMEJBbERXO0FBbURsQixVQUFRLFlBbkRVO0FBb0RsQixTQUFPLFdBcERXO0FBcURsQixVQUFRLHFCQXJEVTtBQXNEbEIsU0FBTyxXQXREVztBQXVEbEIsU0FBTyxXQXZEVztBQXdEbEIsU0FBTyxlQXhEVztBQXlEbEIsU0FBTyxZQXpEVztBQTBEbEIsVUFBUSxZQTFEVTtBQTREbEI7QUFDQSxTQUFPLFVBN0RXO0FBOERsQixTQUFPLFVBOURXO0FBK0RsQixVQUFRLFdBL0RVO0FBZ0VsQixTQUFPLFlBaEVXO0FBa0VsQjtBQUNBLFNBQU8sV0FuRVc7QUFvRWxCLFFBQU0sWUFwRVk7QUFxRWxCLFNBQU8sYUFyRVc7QUFzRWxCLFNBQU8saUJBdEVXO0FBdUVsQixTQUFPLFdBdkVXO0FBd0VsQixVQUFRLFlBeEVVO0FBeUVsQixTQUFPLFdBekVXO0FBMEVsQixTQUFPLFdBMUVXO0FBMkVsQixTQUFPLFdBM0VXO0FBNEVsQixVQUFRLFlBNUVVO0FBNkVsQixTQUFPLGdCQTdFVztBQStFbEI7QUFDQSxTQUFPLG9CQWhGVztBQWlGbEIsVUFBUSx5RUFqRlU7QUFrRmxCLFNBQU8sNkNBbEZXO0FBbUZsQixTQUFPLDBDQW5GVztBQW9GbEIsU0FBTyw0Q0FwRlc7QUFxRmxCLFNBQU8sNkNBckZXO0FBc0ZsQixTQUFPLDBDQXRGVztBQXVGbEIsU0FBTyxnREF2Rlc7QUF3RmxCLFNBQU8saURBeEZXO0FBeUZsQixTQUFPLGdEQXpGVztBQTBGbEIsU0FBTyx5Q0ExRlc7QUEyRmxCLFNBQU8sc0RBM0ZXO0FBNEZsQixTQUFPLDBEQTVGVztBQTZGbEIsU0FBTyx5REE3Rlc7QUE4RmxCLFNBQU8sa0RBOUZXO0FBK0ZsQixTQUFPLCtCQS9GVztBQWdHbEIsVUFBUSwyRUFoR1U7QUFpR2xCLFNBQU8sMEJBakdXO0FBa0dsQixVQUFRO0FBbEdVLENBQWIsQzs7Ozs7Ozs7Ozs7QUM1QlAsSUFBSU4sTUFBSjtBQUFXK0UsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0QsUUFBTSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsVUFBTSxHQUFDRSxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEO0FBQXFELElBQUl5TCxNQUFKO0FBQVc1RyxNQUFNLENBQUM5RSxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDMEwsUUFBTSxDQUFDekwsQ0FBRCxFQUFHO0FBQUN5TCxVQUFNLEdBQUN6TCxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEO0FBQXFELElBQUkwTCxRQUFKO0FBQWE3RyxNQUFNLENBQUM5RSxJQUFQLENBQVksV0FBWixFQUF3QjtBQUFDNEwsU0FBTyxDQUFDM0wsQ0FBRCxFQUFHO0FBQUMwTCxZQUFRLEdBQUMxTCxDQUFUO0FBQVc7O0FBQXZCLENBQXhCLEVBQWlELENBQWpEO0FBQW9ELElBQUlILFFBQUo7QUFBYWdGLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxPQUFaLEVBQW9CO0FBQUNGLFVBQVEsQ0FBQ0csQ0FBRCxFQUFHO0FBQUNILFlBQVEsR0FBQ0csQ0FBVDtBQUFXOztBQUF4QixDQUFwQixFQUE4QyxDQUE5Qzs7QUE2QjlNLElBQUlGLE1BQU0sQ0FBQzBFLFFBQVgsRUFBcUI7QUFFbkIsUUFBTW9ILE1BQU0sR0FBR3pELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxRQUFaLENBQWY7O0FBQ0EsUUFBTXlELEVBQUUsR0FBR0MsR0FBRyxDQUFDMUQsT0FBSixDQUFZLElBQVosQ0FBWDs7QUFDQSxRQUFNMkQsSUFBSSxHQUFHRCxHQUFHLENBQUMxRCxPQUFKLENBQVksTUFBWixDQUFiOztBQUNBLFFBQU1VLEtBQUssR0FBR2dELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxPQUFaLENBQWQ7O0FBQ0EsUUFBTW9ILE1BQU0sR0FBRzFELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxRQUFaLENBQWY7O0FBQ0EsUUFBTXFILE1BQU0sR0FBRzNELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxRQUFaLENBQWY7O0FBQ0EsUUFBTXNILEdBQUcsR0FBRzVELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxLQUFaLENBQVo7O0FBQ0EsUUFBTXVILElBQUksR0FBRzdELEdBQUcsQ0FBQzFELE9BQUosQ0FBWSxNQUFaLENBQWI7O0FBRUEzRSxRQUFNLENBQUNtTSxPQUFQLENBQWUsTUFBTTtBQUNuQixRQUFJakssSUFBSSxHQUFHbkMsUUFBUSxDQUFDK0MsTUFBVCxDQUFnQkMsTUFBM0I7QUFDQSxRQUFJcUosSUFBSSxHQUFHck0sUUFBUSxDQUFDK0MsTUFBVCxDQUFnQjRDLGlCQUEzQjtBQUVBMEMsTUFBRSxDQUFDaUUsSUFBSCxDQUFRbkssSUFBUixFQUFlaUcsR0FBRCxJQUFTO0FBQ3JCLFVBQUlBLEdBQUosRUFBUztBQUNQO0FBQ0E0RCxjQUFNLENBQUM3SixJQUFELEVBQU87QUFBRWtLLGNBQUksRUFBRUE7QUFBUixTQUFQLEVBQXdCakUsR0FBRCxJQUFTO0FBQ3BDLGNBQUlBLEdBQUosRUFBUztBQUNQN0UsbUJBQU8sQ0FBQ0MsS0FBUixrREFBdURyQixJQUF2RCxpQkFBaUVpRyxHQUFHLENBQUNlLE9BQXJFO0FBQ0QsV0FGRCxNQUVPO0FBQ0w1RixtQkFBTyxDQUFDZ0osR0FBUiw0Q0FBK0NwSyxJQUEvQztBQUNEO0FBQ0YsU0FOSyxDQUFOO0FBT0QsT0FURCxNQVNPO0FBQ0w7QUFDQWtHLFVBQUUsQ0FBQ21FLEtBQUgsQ0FBU3JLLElBQVQsRUFBZWtLLElBQWYsRUFBc0JqRSxHQUFELElBQVM7QUFDNUJBLGFBQUcsSUFBSTdFLE9BQU8sQ0FBQ0MsS0FBUixzREFBNEQ2SSxJQUE1RCxlQUFxRWpFLEdBQUcsQ0FBQ2UsT0FBekUsT0FBUDtBQUNELFNBRkQ7QUFHRDtBQUNGLEtBaEJEO0FBaUJELEdBckJELEVBWG1CLENBa0NuQjtBQUNBOztBQUNBLE1BQUlzRCxDQUFDLEdBQUdWLE1BQU0sQ0FBQ3BCLE1BQVAsRUFBUjtBQUVBOEIsR0FBQyxDQUFDOUMsRUFBRixDQUFLLE9BQUwsRUFBZXZCLEdBQUQsSUFBUztBQUNyQjdFLFdBQU8sQ0FBQ0MsS0FBUixDQUFjLFVBQVU0RSxHQUFHLENBQUNlLE9BQTVCO0FBQ0QsR0FGRCxFQXRDbUIsQ0EwQ25COztBQUNBeUMsUUFBTSxDQUFDYyxlQUFQLENBQXVCQyxHQUF2QixDQUEyQixDQUFDQyxHQUFELEVBQU1sQixHQUFOLEVBQVdtQixJQUFYLEtBQW9CO0FBQzdDO0FBQ0EsUUFBSUQsR0FBRyxDQUFDMUosR0FBSixDQUFROEUsT0FBUixDQUFnQmhJLFFBQVEsQ0FBQytDLE1BQVQsQ0FBZ0IyQyxVQUFoQyxNQUFnRCxDQUFDLENBQXJELEVBQXdEO0FBQ3REbUgsVUFBSTtBQUNKO0FBQ0QsS0FMNEMsQ0FPN0M7OztBQUNBLFFBQUlDLFNBQVMsR0FBR1osR0FBRyxDQUFDYSxLQUFKLENBQVVILEdBQUcsQ0FBQzFKLEdBQWQsQ0FBaEI7QUFDQSxRQUFJZixJQUFJLEdBQUcySyxTQUFTLENBQUNFLFFBQVYsQ0FBbUIxQyxNQUFuQixDQUEwQnRLLFFBQVEsQ0FBQytDLE1BQVQsQ0FBZ0IyQyxVQUFoQixDQUEyQmhCLE1BQTNCLEdBQW9DLENBQTlELENBQVg7O0FBRUEsUUFBSXVJLFNBQVMsR0FBRyxNQUFNO0FBQ3BCO0FBQ0F2QixTQUFHLENBQUN3QixTQUFKLENBQWMsOEJBQWQsRUFBOEMsTUFBOUM7QUFDQXhCLFNBQUcsQ0FBQ3dCLFNBQUosQ0FBYyw2QkFBZCxFQUE2QyxHQUE3QztBQUNBeEIsU0FBRyxDQUFDd0IsU0FBSixDQUFjLDhCQUFkLEVBQThDLGNBQTlDO0FBQ0QsS0FMRDs7QUFPQSxRQUFJTixHQUFHLENBQUMzRixNQUFKLEtBQWUsU0FBbkIsRUFBOEI7QUFDNUIsVUFBSWtHLE1BQU0sR0FBRyxJQUFJQyxNQUFKLENBQVcsNEJBQVgsQ0FBYjtBQUNBLFVBQUlDLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxJQUFQLENBQVluTCxJQUFaLENBQVosQ0FGNEIsQ0FJNUI7O0FBQ0EsVUFBSWtMLEtBQUssS0FBSyxJQUFkLEVBQW9CO0FBQ2xCM0IsV0FBRyxDQUFDNkIsU0FBSixDQUFjLEdBQWQ7QUFDQTdCLFdBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNELE9BVDJCLENBVzVCOzs7QUFDQSxVQUFJM00sS0FBSyxHQUFHYixRQUFRLENBQUMyQyxRQUFULENBQWtCMEssS0FBSyxDQUFDLENBQUQsQ0FBdkIsQ0FBWjs7QUFDQSxVQUFJLENBQUN4TSxLQUFMLEVBQVk7QUFDVjZLLFdBQUcsQ0FBQzZCLFNBQUosQ0FBYyxHQUFkO0FBQ0E3QixXQUFHLENBQUM4QixHQUFKO0FBQ0E7QUFDRCxPQWpCMkIsQ0FtQjVCOzs7QUFDQVAsZUFBUztBQUVUSixVQUFJO0FBQ0wsS0F2QkQsTUF1Qk8sSUFBSUQsR0FBRyxDQUFDM0YsTUFBSixLQUFlLE1BQW5CLEVBQTJCO0FBQ2hDO0FBQ0EsVUFBSWtHLE1BQU0sR0FBRyxJQUFJQyxNQUFKLENBQVcsNEJBQVgsQ0FBYjtBQUNBLFVBQUlDLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxJQUFQLENBQVluTCxJQUFaLENBQVosQ0FIZ0MsQ0FLaEM7O0FBQ0EsVUFBSWtMLEtBQUssS0FBSyxJQUFkLEVBQW9CO0FBQ2xCM0IsV0FBRyxDQUFDNkIsU0FBSixDQUFjLEdBQWQ7QUFDQTdCLFdBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNELE9BVitCLENBWWhDOzs7QUFDQSxVQUFJM00sS0FBSyxHQUFHYixRQUFRLENBQUMyQyxRQUFULENBQWtCMEssS0FBSyxDQUFDLENBQUQsQ0FBdkIsQ0FBWjs7QUFDQSxVQUFJLENBQUN4TSxLQUFMLEVBQVk7QUFDVjZLLFdBQUcsQ0FBQzZCLFNBQUosQ0FBYyxHQUFkO0FBQ0E3QixXQUFHLENBQUM4QixHQUFKO0FBQ0E7QUFDRCxPQWxCK0IsQ0FvQmhDOzs7QUFDQVAsZUFBUyxHQXJCdUIsQ0F1QmhDOztBQUNBLFVBQUluSyxNQUFNLEdBQUd1SyxLQUFLLENBQUMsQ0FBRCxDQUFsQjs7QUFDQSxVQUFJeE0sS0FBSyxDQUFDTyxhQUFOLEdBQXNCQyxJQUF0QixDQUEyQjtBQUFFRyxXQUFHLEVBQUVzQjtBQUFQLE9BQTNCLEVBQTRDa0ksS0FBNUMsT0FBd0QsQ0FBNUQsRUFBK0Q7QUFDN0RVLFdBQUcsQ0FBQzZCLFNBQUosQ0FBYyxHQUFkO0FBQ0E3QixXQUFHLENBQUM4QixHQUFKO0FBQ0E7QUFDRCxPQTdCK0IsQ0ErQmhDOzs7QUFDQSxVQUFJLENBQUMzTSxLQUFLLENBQUNpSSxVQUFOLENBQWlCOEQsR0FBRyxDQUFDYSxLQUFKLENBQVU3RSxLQUEzQixFQUFrQzlGLE1BQWxDLENBQUwsRUFBZ0Q7QUFDOUM0SSxXQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IsV0FBRyxDQUFDOEIsR0FBSjtBQUNBO0FBQ0QsT0FwQytCLENBc0NoQzs7O0FBQ0EsWUFBTUUsTUFBTSxHQUFHLFVBQVVDLElBQVYsRUFBZ0I7QUFDN0IsY0FBTUMsVUFBVSxHQUFHL00sS0FBSyxDQUFDTyxhQUFOLEdBQXNCZ0ksT0FBdEIsQ0FBOEI7QUFBRXVFLGNBQUksRUFBRUEsSUFBUjtBQUFjbk0sYUFBRyxFQUFFO0FBQUVxTSxlQUFHLEVBQUUvSztBQUFQO0FBQW5CLFNBQTlCLENBQW5CO0FBQ0EsZUFBTzhLLFVBQVUsR0FBR0EsVUFBVSxDQUFDcE0sR0FBZCxHQUFvQixLQUFyQztBQUNELE9BSEQ7O0FBS0EsVUFBSXNNLEtBQUssR0FBRyxJQUFJakMsUUFBUSxDQUFDa0MsV0FBYixFQUFaO0FBQ0EsVUFBSS9FLE9BQU8sR0FBR2hKLFFBQVEsQ0FBQzZDLGVBQVQsQ0FBeUJDLE1BQXpCLENBQWQ7QUFDQSxVQUFJa0wsRUFBRSxHQUFHM0YsRUFBRSxDQUFDNEYsaUJBQUgsQ0FBcUJqRixPQUFyQixFQUE4QjtBQUFFUSxhQUFLLEVBQUU7QUFBVCxPQUE5QixDQUFUO0FBQ0EsVUFBSWpJLE1BQU0sR0FBRztBQUFFOEksaUJBQVMsRUFBRTtBQUFiLE9BQWI7QUFDQSxVQUFJRyxRQUFRLEdBQUcwRCxVQUFVLENBQUN0QixHQUFHLENBQUNhLEtBQUosQ0FBVWpELFFBQVgsQ0FBekI7O0FBQ0EsVUFBSSxDQUFDMkQsS0FBSyxDQUFDM0QsUUFBRCxDQUFOLElBQW9CQSxRQUFRLEdBQUcsQ0FBbkMsRUFBc0M7QUFDcENqSixjQUFNLENBQUNpSixRQUFQLEdBQWtCNEQsSUFBSSxDQUFDQyxHQUFMLENBQVM3RCxRQUFULEVBQW1CLENBQW5CLENBQWxCO0FBQ0Q7O0FBRURvQyxTQUFHLENBQUNqRCxFQUFKLENBQU8sTUFBUCxFQUFnQjJFLEtBQUQsSUFBVztBQUN4Qk4sVUFBRSxDQUFDakUsS0FBSCxDQUFTdUUsS0FBVDtBQUNBUixhQUFLLENBQUNTLE1BQU4sQ0FBYUQsS0FBYjtBQUNELE9BSEQ7QUFJQTFCLFNBQUcsQ0FBQ2pELEVBQUosQ0FBTyxPQUFQLEVBQWlCdkIsR0FBRCxJQUFTO0FBQ3ZCc0QsV0FBRyxDQUFDNkIsU0FBSixDQUFjLEdBQWQ7QUFDQTdCLFdBQUcsQ0FBQzhCLEdBQUo7QUFDRCxPQUhEO0FBSUFaLFNBQUcsQ0FBQ2pELEVBQUosQ0FBTyxLQUFQLEVBQWMxSixNQUFNLENBQUMySixlQUFQLENBQXVCLE1BQU07QUFDekM7QUFDQXJJLGNBQU0sQ0FBQ29NLElBQVAsR0FBY0csS0FBSyxDQUFDTixHQUFOLEVBQWQ7QUFDQWpNLGNBQU0sQ0FBQ3FNLFVBQVAsR0FBb0JGLE1BQU0sQ0FBQ25NLE1BQU0sQ0FBQ29NLElBQVIsQ0FBMUI7QUFDQTlNLGFBQUssQ0FBQ08sYUFBTixHQUFzQk0sTUFBdEIsQ0FBNkJDLE1BQTdCLENBQW9DO0FBQUVILGFBQUcsRUFBRXNCO0FBQVAsU0FBcEMsRUFBcUQ7QUFBRWxCLGNBQUksRUFBRUw7QUFBUixTQUFyRDtBQUNBeU0sVUFBRSxDQUFDUixHQUFIO0FBQ0QsT0FOYSxDQUFkO0FBT0FRLFFBQUUsQ0FBQ3JFLEVBQUgsQ0FBTSxPQUFOLEVBQWdCdkIsR0FBRCxJQUFTO0FBQ3RCN0UsZUFBTyxDQUFDQyxLQUFSLDZDQUFrRFYsTUFBbEQsaUJBQThEc0YsR0FBRyxDQUFDZSxPQUFsRTtBQUNBZCxVQUFFLENBQUNhLE1BQUgsQ0FBVUYsT0FBVixFQUFvQlosR0FBRCxJQUFTO0FBQzFCQSxhQUFHLElBQUk3RSxPQUFPLENBQUNDLEtBQVIsMENBQStDd0YsT0FBL0MsaUJBQTREWixHQUFHLENBQUNlLE9BQWhFLE9BQVA7QUFDRCxTQUZEO0FBR0F1QyxXQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IsV0FBRyxDQUFDOEIsR0FBSjtBQUNELE9BUEQ7QUFRQVEsUUFBRSxDQUFDckUsRUFBSCxDQUFNLFFBQU4sRUFBZ0IsTUFBTTtBQUNwQitCLFdBQUcsQ0FBQzZCLFNBQUosQ0FBYyxHQUFkLEVBQW1CO0FBQUUsMEJBQWdCO0FBQWxCLFNBQW5CO0FBQ0E3QixXQUFHLENBQUM4QixHQUFKO0FBQ0QsT0FIRDtBQUlELEtBaEZNLE1BZ0ZBLElBQUlaLEdBQUcsQ0FBQzNGLE1BQUosS0FBZSxLQUFuQixFQUEwQjtBQUMvQjtBQUNBLFVBQUlrRyxNQUFNLEdBQUcsSUFBSUMsTUFBSixDQUFXLDZDQUFYLENBQWI7QUFDQSxVQUFJQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csSUFBUCxDQUFZbkwsSUFBWixDQUFaLENBSCtCLENBSy9CO0FBQ0E7O0FBQ0EsVUFBSWtMLEtBQUssS0FBSyxJQUFkLEVBQW9CO0FBQ2xCUixZQUFJO0FBQ0o7QUFDRCxPQVY4QixDQVkvQjs7O0FBQ0EsWUFBTWxFLFNBQVMsR0FBRzBFLEtBQUssQ0FBQyxDQUFELENBQXZCO0FBQ0EsWUFBTXhNLEtBQUssR0FBR2IsUUFBUSxDQUFDMkMsUUFBVCxDQUFrQmdHLFNBQWxCLENBQWQ7O0FBRUEsVUFBSSxDQUFDOUgsS0FBTCxFQUFZO0FBQ1Y2SyxXQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IsV0FBRyxDQUFDOEIsR0FBSjtBQUNBO0FBQ0Q7O0FBRUQsVUFBSTNNLEtBQUssQ0FBQzJOLE1BQU4sS0FBaUIsSUFBakIsSUFBeUIzTixLQUFLLENBQUMyTixNQUFOLEtBQWlCQyxTQUExQyxJQUF1RCxPQUFPNU4sS0FBSyxDQUFDMk4sTUFBYixLQUF3QixVQUFuRixFQUErRjtBQUM3RmpMLGVBQU8sQ0FBQ0MsS0FBUiwwREFBK0RtRixTQUEvRDtBQUNBK0MsV0FBRyxDQUFDNkIsU0FBSixDQUFjLEdBQWQ7QUFDQTdCLFdBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNELE9BM0I4QixDQTZCL0I7OztBQUNBLFVBQUlrQixLQUFLLEdBQUdyQixLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNyRixPQUFULENBQWlCLEdBQWpCLENBQVo7QUFDQSxVQUFJbEYsTUFBTSxHQUFHNEwsS0FBSyxLQUFLLENBQUMsQ0FBWCxHQUFlckIsS0FBSyxDQUFDLENBQUQsQ0FBTCxDQUFTL0MsTUFBVCxDQUFnQixDQUFoQixFQUFtQm9FLEtBQW5CLENBQWYsR0FBMkNyQixLQUFLLENBQUMsQ0FBRCxDQUE3RCxDQS9CK0IsQ0FpQy9COztBQUNBLFlBQU01TCxJQUFJLEdBQUdaLEtBQUssQ0FBQ08sYUFBTixHQUFzQmdJLE9BQXRCLENBQThCO0FBQUU1SCxXQUFHLEVBQUVzQjtBQUFQLE9BQTlCLENBQWI7O0FBQ0EsVUFBSSxDQUFDckIsSUFBTCxFQUFXO0FBQ1RpSyxXQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IsV0FBRyxDQUFDOEIsR0FBSjtBQUNBO0FBQ0QsT0F2QzhCLENBeUMvQjs7O0FBQ0EsVUFBSXhOLFFBQVEsQ0FBQytDLE1BQVQsQ0FBZ0J3QyxpQkFBcEIsRUFBdUM7QUFDckN0RixjQUFNLENBQUMwTyxXQUFQLENBQW1CM08sUUFBUSxDQUFDK0MsTUFBVCxDQUFnQndDLGlCQUFuQztBQUNEOztBQUVEa0gsT0FBQyxDQUFDbUMsR0FBRixDQUFNLE1BQU07QUFDVjtBQUNBLFlBQUkvTixLQUFLLENBQUMyTixNQUFOLENBQWFwTCxJQUFiLENBQWtCdkMsS0FBbEIsRUFBeUJpQyxNQUF6QixFQUFpQ3JCLElBQWpDLEVBQXVDbUwsR0FBdkMsRUFBNENsQixHQUE1QyxNQUFxRCxLQUF6RCxFQUFnRTtBQUM5RCxjQUFJdkcsT0FBTyxHQUFHLEVBQWQ7QUFDQSxjQUFJMEosTUFBTSxHQUFHLEdBQWIsQ0FGOEQsQ0FJOUQ7O0FBQ0EsY0FBSUMsT0FBTyxHQUFHO0FBQ1osNEJBQWdCck4sSUFBSSxDQUFDb0MsSUFEVDtBQUVaLDhCQUFrQnBDLElBQUksQ0FBQzBGO0FBRlgsV0FBZCxDQUw4RCxDQVU5RDs7QUFDQSxjQUFJLE9BQU8xRixJQUFJLENBQUNILElBQVosS0FBcUIsUUFBekIsRUFBbUM7QUFDakN3TixtQkFBTyxDQUFDLE1BQUQsQ0FBUCxHQUFrQnJOLElBQUksQ0FBQ0gsSUFBdkI7QUFDRCxXQWI2RCxDQWU5RDs7O0FBQ0EsY0FBSUcsSUFBSSxDQUFDc04sVUFBTCxZQUEyQkMsSUFBL0IsRUFBcUM7QUFDbkNGLG1CQUFPLENBQUMsZUFBRCxDQUFQLEdBQTJCck4sSUFBSSxDQUFDc04sVUFBTCxDQUFnQkUsV0FBaEIsRUFBM0I7QUFDRCxXQUZELE1BRU8sSUFBSXhOLElBQUksQ0FBQ3lOLFVBQUwsWUFBMkJGLElBQS9CLEVBQXFDO0FBQzFDRixtQkFBTyxDQUFDLGVBQUQsQ0FBUCxHQUEyQnJOLElBQUksQ0FBQ3lOLFVBQUwsQ0FBZ0JELFdBQWhCLEVBQTNCO0FBQ0QsV0FwQjZELENBc0I5RDs7O0FBQ0EsY0FBSSxPQUFPckMsR0FBRyxDQUFDa0MsT0FBWCxLQUF1QixRQUEzQixFQUFxQztBQUVuQztBQUNBLGdCQUFJbEMsR0FBRyxDQUFDa0MsT0FBSixDQUFZLGVBQVosQ0FBSixFQUFrQztBQUNoQyxrQkFBSXJOLElBQUksQ0FBQ0gsSUFBTCxLQUFjc0wsR0FBRyxDQUFDa0MsT0FBSixDQUFZLGVBQVosQ0FBbEIsRUFBZ0Q7QUFDOUNwRCxtQkFBRyxDQUFDNkIsU0FBSixDQUFjLEdBQWQsRUFEOEMsQ0FDMUI7O0FBQ3BCN0IsbUJBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNEO0FBQ0YsYUFUa0MsQ0FXbkM7OztBQUNBLGdCQUFJWixHQUFHLENBQUNrQyxPQUFKLENBQVksbUJBQVosQ0FBSixFQUFzQztBQUNwQyxvQkFBTUssYUFBYSxHQUFHLElBQUlILElBQUosQ0FBU3BDLEdBQUcsQ0FBQ2tDLE9BQUosQ0FBWSxtQkFBWixDQUFULENBQXRCOztBQUVBLGtCQUFLck4sSUFBSSxDQUFDc04sVUFBTCxZQUEyQkMsSUFBM0IsSUFBbUN2TixJQUFJLENBQUNzTixVQUFMLEdBQWtCSSxhQUF0RCxJQUNDMU4sSUFBSSxDQUFDeU4sVUFBTCxZQUEyQkYsSUFBM0IsSUFBbUN2TixJQUFJLENBQUN5TixVQUFMLEdBQWtCQyxhQUQxRCxFQUN5RTtBQUN2RXpELG1CQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZCxFQUR1RSxDQUNuRDs7QUFDcEI3QixtQkFBRyxDQUFDOEIsR0FBSjtBQUNBO0FBQ0Q7QUFDRixhQXJCa0MsQ0F1Qm5DOzs7QUFDQSxnQkFBSSxPQUFPWixHQUFHLENBQUNrQyxPQUFKLENBQVlNLEtBQW5CLEtBQTZCLFFBQWpDLEVBQTJDO0FBQ3pDLG9CQUFNQSxLQUFLLEdBQUd4QyxHQUFHLENBQUNrQyxPQUFKLENBQVlNLEtBQTFCLENBRHlDLENBR3pDOztBQUNBLGtCQUFJLENBQUNBLEtBQUwsRUFBWTtBQUNWMUQsbUJBQUcsQ0FBQzZCLFNBQUosQ0FBYyxHQUFkO0FBQ0E3QixtQkFBRyxDQUFDOEIsR0FBSjtBQUNBO0FBQ0Q7O0FBRUQsb0JBQU02QixLQUFLLEdBQUc1TixJQUFJLENBQUMwRixJQUFuQjtBQUNBLG9CQUFNbUksSUFBSSxHQUFHRixLQUFLLENBQUM5RSxNQUFOLENBQWEsQ0FBYixFQUFnQjhFLEtBQUssQ0FBQ3BILE9BQU4sQ0FBYyxHQUFkLENBQWhCLENBQWI7O0FBRUEsa0JBQUlzSCxJQUFJLEtBQUssT0FBYixFQUFzQjtBQUNwQjVELG1CQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IsbUJBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNEOztBQUVELG9CQUFNK0IsTUFBTSxHQUFHSCxLQUFLLENBQUM5RSxNQUFOLENBQWFnRixJQUFJLENBQUM1SyxNQUFsQixFQUEwQnVELE9BQTFCLENBQWtDLFdBQWxDLEVBQStDLEVBQS9DLEVBQW1EaUQsS0FBbkQsQ0FBeUQsR0FBekQsQ0FBZjs7QUFFQSxrQkFBSXFFLE1BQU0sQ0FBQzdLLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUIsQ0FDckI7QUFDRCxlQUZELE1BRU87QUFDTCxzQkFBTThLLENBQUMsR0FBR0QsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVckUsS0FBVixDQUFnQixHQUFoQixDQUFWO0FBQ0Esc0JBQU11RSxLQUFLLEdBQUc3SixRQUFRLENBQUM0SixDQUFDLENBQUMsQ0FBRCxDQUFGLEVBQU8sRUFBUCxDQUF0QjtBQUNBLHNCQUFNaEMsR0FBRyxHQUFHZ0MsQ0FBQyxDQUFDLENBQUQsQ0FBRCxHQUFPNUosUUFBUSxDQUFDNEosQ0FBQyxDQUFDLENBQUQsQ0FBRixFQUFPLEVBQVAsQ0FBZixHQUE0QkgsS0FBSyxHQUFHLENBQWhELENBSEssQ0FLTDs7QUFDQSxvQkFBSUksS0FBSyxHQUFHLENBQVIsSUFBYWpDLEdBQUcsSUFBSTZCLEtBQXBCLElBQTZCSSxLQUFLLEdBQUdqQyxHQUF6QyxFQUE4QztBQUM1QzlCLHFCQUFHLENBQUM2QixTQUFKLENBQWMsR0FBZDtBQUNBN0IscUJBQUcsQ0FBQzhCLEdBQUo7QUFDQTtBQUNELGlCQVZJLENBWUw7OztBQUNBc0IsdUJBQU8sQ0FBQyxlQUFELENBQVAsbUJBQW9DVyxLQUFwQyxjQUE2Q2pDLEdBQTdDLGNBQW9ENkIsS0FBcEQ7QUFDQVAsdUJBQU8sQ0FBQyxnQkFBRCxDQUFQLEdBQTRCdEIsR0FBRyxHQUFHaUMsS0FBTixHQUFjLENBQTFDO0FBQ0F0Syx1QkFBTyxDQUFDc0ssS0FBUixHQUFnQkEsS0FBaEI7QUFDQXRLLHVCQUFPLENBQUNxSSxHQUFSLEdBQWNBLEdBQWQ7QUFDRDs7QUFDRHFCLG9CQUFNLEdBQUcsR0FBVCxDQXpDeUMsQ0F5QzNCO0FBQ2Y7QUFDRixXQW5FRCxNQW1FTztBQUNMQyxtQkFBTyxDQUFDLGVBQUQsQ0FBUCxHQUEyQixPQUEzQjtBQUNELFdBNUY2RCxDQThGOUQ7OztBQUNBLGdCQUFNeEYsRUFBRSxHQUFHekksS0FBSyxDQUFDNk8sYUFBTixDQUFvQjVNLE1BQXBCLEVBQTRCckIsSUFBNUIsRUFBa0MwRCxPQUFsQyxDQUFYO0FBQ0EsZ0JBQU02SSxFQUFFLEdBQUcsSUFBSS9CLE1BQU0sQ0FBQzBELFdBQVgsRUFBWDtBQUVBckcsWUFBRSxDQUFDSyxFQUFILENBQU0sT0FBTixFQUFlMUosTUFBTSxDQUFDMkosZUFBUCxDQUF3QnhCLEdBQUQsSUFBUztBQUM3Q3ZILGlCQUFLLENBQUMrTyxXQUFOLENBQWtCeE0sSUFBbEIsQ0FBdUJ2QyxLQUF2QixFQUE4QnVILEdBQTlCLEVBQW1DdEYsTUFBbkMsRUFBMkNyQixJQUEzQztBQUNBaUssZUFBRyxDQUFDOEIsR0FBSjtBQUNELFdBSGMsQ0FBZjtBQUlBUSxZQUFFLENBQUNyRSxFQUFILENBQU0sT0FBTixFQUFlMUosTUFBTSxDQUFDMkosZUFBUCxDQUF3QnhCLEdBQUQsSUFBUztBQUM3Q3ZILGlCQUFLLENBQUMrTyxXQUFOLENBQWtCeE0sSUFBbEIsQ0FBdUJ2QyxLQUF2QixFQUE4QnVILEdBQTlCLEVBQW1DdEYsTUFBbkMsRUFBMkNyQixJQUEzQztBQUNBaUssZUFBRyxDQUFDOEIsR0FBSjtBQUNELFdBSGMsQ0FBZjtBQUlBUSxZQUFFLENBQUNyRSxFQUFILENBQU0sT0FBTixFQUFlLE1BQU07QUFDbkI7QUFDQXFFLGNBQUUsQ0FBQzZCLElBQUgsQ0FBUSxLQUFSO0FBQ0QsV0FIRCxFQTFHOEQsQ0ErRzlEOztBQUNBaFAsZUFBSyxDQUFDaVAsYUFBTixDQUFvQnhHLEVBQXBCLEVBQXdCMEUsRUFBeEIsRUFBNEJsTCxNQUE1QixFQUFvQ3JCLElBQXBDLEVBQTBDbUwsR0FBMUMsRUFBK0NrQyxPQUEvQyxFQWhIOEQsQ0FrSDlEOztBQUNBLGNBQUksT0FBT2xDLEdBQUcsQ0FBQ2tDLE9BQVgsS0FBdUIsUUFBM0IsRUFBcUM7QUFDbkM7QUFDQSxnQkFBSSxPQUFPbEMsR0FBRyxDQUFDa0MsT0FBSixDQUFZLGlCQUFaLENBQVAsS0FBMEMsUUFBMUMsSUFBc0QsQ0FBQyxpQkFBaUJ2RCxJQUFqQixDQUFzQjlKLElBQUksQ0FBQ29DLElBQTNCLENBQTNELEVBQTZGO0FBQzNGLGtCQUFJa00sTUFBTSxHQUFHbkQsR0FBRyxDQUFDa0MsT0FBSixDQUFZLGlCQUFaLENBQWIsQ0FEMkYsQ0FHM0Y7O0FBQ0Esa0JBQUlpQixNQUFNLENBQUMxQyxLQUFQLENBQWEsVUFBYixDQUFKLEVBQThCO0FBQzVCeUIsdUJBQU8sQ0FBQyxrQkFBRCxDQUFQLEdBQThCLE1BQTlCO0FBQ0EsdUJBQU9BLE9BQU8sQ0FBQyxnQkFBRCxDQUFkO0FBQ0FwRCxtQkFBRyxDQUFDNkIsU0FBSixDQUFjc0IsTUFBZCxFQUFzQkMsT0FBdEI7QUFDQWQsa0JBQUUsQ0FBQ2dDLElBQUgsQ0FBUTdELElBQUksQ0FBQzhELFVBQUwsRUFBUixFQUEyQkQsSUFBM0IsQ0FBZ0N0RSxHQUFoQztBQUNBO0FBQ0QsZUFORCxDQU9BO0FBUEEsbUJBUUssSUFBSXFFLE1BQU0sQ0FBQzFDLEtBQVAsQ0FBYSxhQUFiLENBQUosRUFBaUM7QUFDcEN5Qix5QkFBTyxDQUFDLGtCQUFELENBQVAsR0FBOEIsU0FBOUI7QUFDQSx5QkFBT0EsT0FBTyxDQUFDLGdCQUFELENBQWQ7QUFDQXBELHFCQUFHLENBQUM2QixTQUFKLENBQWNzQixNQUFkLEVBQXNCQyxPQUF0QjtBQUNBZCxvQkFBRSxDQUFDZ0MsSUFBSCxDQUFRN0QsSUFBSSxDQUFDK0QsYUFBTCxFQUFSLEVBQThCRixJQUE5QixDQUFtQ3RFLEdBQW5DO0FBQ0E7QUFDRDtBQUNGO0FBQ0YsV0F6STZELENBMkk5RDs7O0FBQ0EsY0FBSSxDQUFDb0QsT0FBTyxDQUFDLGtCQUFELENBQVosRUFBa0M7QUFDaENwRCxlQUFHLENBQUM2QixTQUFKLENBQWNzQixNQUFkLEVBQXNCQyxPQUF0QjtBQUNBZCxjQUFFLENBQUNnQyxJQUFILENBQVF0RSxHQUFSO0FBQ0Q7QUFFRixTQWpKRCxNQWlKTztBQUNMQSxhQUFHLENBQUM4QixHQUFKO0FBQ0Q7QUFDRixPQXRKRDtBQXVKRCxLQXJNTSxNQXFNQTtBQUNMWCxVQUFJO0FBQ0w7QUFDRixHQWpVRDtBQWtVRCxDOzs7Ozs7Ozs7OztBQzFZRDdILE1BQU0sQ0FBQ2pGLE1BQVAsQ0FBYztBQUFDVSxrQkFBZ0IsRUFBQyxNQUFJQTtBQUF0QixDQUFkOztBQUF1RCxJQUFJd0UsQ0FBSjs7QUFBTUQsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUMrRSxHQUFDLENBQUM5RSxDQUFELEVBQUc7QUFBQzhFLEtBQUMsR0FBQzlFLENBQUY7QUFBSTs7QUFBVixDQUFoQyxFQUE0QyxDQUE1Qzs7QUE4QnRELE1BQU1NLGdCQUFOLENBQXVCO0FBRTVCeUUsYUFBVyxDQUFDQyxPQUFELEVBQVU7QUFDbkI7QUFDQUEsV0FBTyxHQUFHRixDQUFDLENBQUNHLE1BQUYsQ0FBUztBQUNqQitLLFlBQU0sRUFBRSxJQURTO0FBRWpCdEcsWUFBTSxFQUFFLElBRlM7QUFHakJsSSxZQUFNLEVBQUU7QUFIUyxLQUFULEVBSVB3RCxPQUpPLENBQVYsQ0FGbUIsQ0FRbkI7O0FBQ0EsUUFBSUEsT0FBTyxDQUFDZ0wsTUFBUixJQUFrQixPQUFPaEwsT0FBTyxDQUFDZ0wsTUFBZixLQUEwQixVQUFoRCxFQUE0RDtBQUMxRCxZQUFNLElBQUk3TixTQUFKLENBQWMsNENBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUMwRSxNQUFSLElBQWtCLE9BQU8xRSxPQUFPLENBQUMwRSxNQUFmLEtBQTBCLFVBQWhELEVBQTREO0FBQzFELFlBQU0sSUFBSXZILFNBQUosQ0FBYyw0Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSTZDLE9BQU8sQ0FBQ3hELE1BQVIsSUFBa0IsT0FBT3dELE9BQU8sQ0FBQ3hELE1BQWYsS0FBMEIsVUFBaEQsRUFBNEQ7QUFDMUQsWUFBTSxJQUFJVyxTQUFKLENBQWMsNENBQWQsQ0FBTjtBQUNELEtBakJrQixDQW1CbkI7OztBQUNBLFNBQUs4TixPQUFMLEdBQWU7QUFDYkQsWUFBTSxFQUFFaEwsT0FBTyxDQUFDZ0wsTUFESDtBQUVidEcsWUFBTSxFQUFFMUUsT0FBTyxDQUFDMEUsTUFGSDtBQUdibEksWUFBTSxFQUFFd0QsT0FBTyxDQUFDeEQ7QUFISCxLQUFmO0FBS0Q7QUFFRDs7Ozs7Ozs7Ozs7QUFTQXVGLE9BQUssQ0FBQ21KLE1BQUQsRUFBUzVGLE1BQVQsRUFBaUJoSixJQUFqQixFQUF1QkYsTUFBdkIsRUFBK0IrTyxTQUEvQixFQUEwQztBQUM3QyxRQUFJLE9BQU8sS0FBS0YsT0FBTCxDQUFhQyxNQUFiLENBQVAsS0FBZ0MsVUFBcEMsRUFBZ0Q7QUFDOUMsYUFBTyxLQUFLRCxPQUFMLENBQWFDLE1BQWIsRUFBcUI1RixNQUFyQixFQUE2QmhKLElBQTdCLEVBQW1DRixNQUFuQyxFQUEyQytPLFNBQTNDLENBQVA7QUFDRDs7QUFDRCxXQUFPLElBQVAsQ0FKNkMsQ0FJaEM7QUFDZDtBQUVEOzs7Ozs7OztBQU1BQyxhQUFXLENBQUM5RixNQUFELEVBQVNoSixJQUFULEVBQWU7QUFDeEIsV0FBTyxLQUFLeUYsS0FBTCxDQUFXLFFBQVgsRUFBcUJ1RCxNQUFyQixFQUE2QmhKLElBQTdCLENBQVA7QUFDRDtBQUVEOzs7Ozs7OztBQU1BK08sYUFBVyxDQUFDL0YsTUFBRCxFQUFTaEosSUFBVCxFQUFlO0FBQ3hCLFdBQU8sS0FBS3lGLEtBQUwsQ0FBVyxRQUFYLEVBQXFCdUQsTUFBckIsRUFBNkJoSixJQUE3QixDQUFQO0FBQ0Q7QUFFRDs7Ozs7Ozs7OztBQVFBZ1AsYUFBVyxDQUFDaEcsTUFBRCxFQUFTaEosSUFBVCxFQUFlRixNQUFmLEVBQXVCK08sU0FBdkIsRUFBa0M7QUFDM0MsV0FBTyxLQUFLcEosS0FBTCxDQUFXLFFBQVgsRUFBcUJ1RCxNQUFyQixFQUE2QmhKLElBQTdCLEVBQW1DRixNQUFuQyxFQUEyQytPLFNBQTNDLENBQVA7QUFDRDs7QUEzRTJCLEM7Ozs7Ozs7Ozs7O0FDOUI5QixJQUFJSSx3QkFBSjs7QUFBNkIxTCxNQUFNLENBQUM5RSxJQUFQLENBQVksZ0RBQVosRUFBNkQ7QUFBQzRMLFNBQU8sQ0FBQzNMLENBQUQsRUFBRztBQUFDdVEsNEJBQXdCLEdBQUN2USxDQUF6QjtBQUEyQjs7QUFBdkMsQ0FBN0QsRUFBc0csQ0FBdEc7QUFBN0I2RSxNQUFNLENBQUNqRixNQUFQLENBQWM7QUFBQ1MsT0FBSyxFQUFDLE1BQUlBO0FBQVgsQ0FBZDtBQUFpQyxJQUFJMEcsS0FBSjtBQUFVbEMsTUFBTSxDQUFDOUUsSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ2dILE9BQUssQ0FBQy9HLENBQUQsRUFBRztBQUFDK0csU0FBSyxHQUFDL0csQ0FBTjtBQUFROztBQUFsQixDQUEzQixFQUErQyxDQUEvQztBQUFrRCxJQUFJRixNQUFKO0FBQVcrRSxNQUFNLENBQUM5RSxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDRCxRQUFNLENBQUNFLENBQUQsRUFBRztBQUFDRixVQUFNLEdBQUNFLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSXdRLEtBQUo7QUFBVTNMLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUN5USxPQUFLLENBQUN4USxDQUFELEVBQUc7QUFBQ3dRLFNBQUssR0FBQ3hRLENBQU47QUFBUTs7QUFBbEIsQ0FBM0IsRUFBK0MsQ0FBL0M7O0FBQWtELElBQUk4RSxDQUFKOztBQUFNRCxNQUFNLENBQUM5RSxJQUFQLENBQVksbUJBQVosRUFBZ0M7QUFBQytFLEdBQUMsQ0FBQzlFLENBQUQsRUFBRztBQUFDOEUsS0FBQyxHQUFDOUUsQ0FBRjtBQUFJOztBQUFWLENBQWhDLEVBQTRDLENBQTVDO0FBQStDLElBQUlILFFBQUo7QUFBYWdGLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxPQUFaLEVBQW9CO0FBQUNGLFVBQVEsQ0FBQ0csQ0FBRCxFQUFHO0FBQUNILFlBQVEsR0FBQ0csQ0FBVDtBQUFXOztBQUF4QixDQUFwQixFQUE4QyxDQUE5QztBQUFpRCxJQUFJRyxNQUFKO0FBQVcwRSxNQUFNLENBQUM5RSxJQUFQLENBQVksY0FBWixFQUEyQjtBQUFDSSxRQUFNLENBQUNILENBQUQsRUFBRztBQUFDRyxVQUFNLEdBQUNILENBQVA7QUFBUzs7QUFBcEIsQ0FBM0IsRUFBaUQsQ0FBakQ7QUFBb0QsSUFBSU0sZ0JBQUo7QUFBcUJ1RSxNQUFNLENBQUM5RSxJQUFQLENBQVkseUJBQVosRUFBc0M7QUFBQ08sa0JBQWdCLENBQUNOLENBQUQsRUFBRztBQUFDTSxvQkFBZ0IsR0FBQ04sQ0FBakI7QUFBbUI7O0FBQXhDLENBQXRDLEVBQWdGLENBQWhGO0FBQW1GLElBQUlPLE1BQUo7QUFBV3NFLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNRLFFBQU0sQ0FBQ1AsQ0FBRCxFQUFHO0FBQUNPLFVBQU0sR0FBQ1AsQ0FBUDtBQUFTOztBQUFwQixDQUEzQixFQUFpRCxDQUFqRDs7QUFvQ3ZmLE1BQU1LLEtBQU4sQ0FBWTtBQUVqQjBFLGFBQVcsQ0FBQ0MsT0FBRCxFQUFVO0FBQ25CLFFBQUlVLElBQUksR0FBRyxJQUFYLENBRG1CLENBR25COztBQUNBVixXQUFPLEdBQUdGLENBQUMsQ0FBQ0csTUFBRixDQUFTO0FBQ2pCd0wsZ0JBQVUsRUFBRSxJQURLO0FBRWpCOUksWUFBTSxFQUFFLElBRlM7QUFHakJsRixVQUFJLEVBQUUsSUFIVztBQUlqQmlPLGlCQUFXLEVBQUUsS0FBS0EsV0FKRDtBQUtqQkMsb0JBQWMsRUFBRSxLQUFLQSxjQUxKO0FBTWpCdEMsWUFBTSxFQUFFLEtBQUtBLE1BTkk7QUFPakJvQixpQkFBVyxFQUFFLEtBQUtBLFdBUEQ7QUFRakJtQixnQkFBVSxFQUFFLEtBQUtBLFVBUkE7QUFTakJDLGtCQUFZLEVBQUUsS0FBS0EsWUFURjtBQVVqQkMsaUJBQVcsRUFBRSxJQVZJO0FBV2pCbkIsbUJBQWEsRUFBRSxJQVhFO0FBWWpCb0Isb0JBQWMsRUFBRTtBQVpDLEtBQVQsRUFhUC9MLE9BYk8sQ0FBVixDQUptQixDQW1CbkI7O0FBQ0EsUUFBSSxFQUFFQSxPQUFPLENBQUN5TCxVQUFSLFlBQThCRCxLQUFLLENBQUNRLFVBQXRDLENBQUosRUFBdUQ7QUFDckQsWUFBTSxJQUFJN08sU0FBSixDQUFjLDZDQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJNkMsT0FBTyxDQUFDMkMsTUFBUixJQUFrQixFQUFFM0MsT0FBTyxDQUFDMkMsTUFBUixZQUEwQnhILE1BQTVCLENBQXRCLEVBQTJEO0FBQ3pELFlBQU0sSUFBSWdDLFNBQUosQ0FBYyx3Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDdkMsSUFBZixLQUF3QixRQUE1QixFQUFzQztBQUNwQyxZQUFNLElBQUlOLFNBQUosQ0FBYyw2QkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSXRDLFFBQVEsQ0FBQzJDLFFBQVQsQ0FBa0J3QyxPQUFPLENBQUN2QyxJQUExQixDQUFKLEVBQXFDO0FBQ25DLFlBQU0sSUFBSU4sU0FBSixDQUFjLDRCQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJNkMsT0FBTyxDQUFDMEwsV0FBUixJQUF1QixPQUFPMUwsT0FBTyxDQUFDMEwsV0FBZixLQUErQixVQUExRCxFQUFzRTtBQUNwRSxZQUFNLElBQUl2TyxTQUFKLENBQWMsc0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUMyTCxjQUFSLElBQTBCLE9BQU8zTCxPQUFPLENBQUMyTCxjQUFmLEtBQWtDLFVBQWhFLEVBQTRFO0FBQzFFLFlBQU0sSUFBSXhPLFNBQUosQ0FBYyx5Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSTZDLE9BQU8sQ0FBQ3FKLE1BQVIsSUFBa0IsT0FBT3JKLE9BQU8sQ0FBQ3FKLE1BQWYsS0FBMEIsVUFBaEQsRUFBNEQ7QUFDMUQsWUFBTSxJQUFJbE0sU0FBSixDQUFjLGlDQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJNkMsT0FBTyxDQUFDeUssV0FBUixJQUF1QixPQUFPekssT0FBTyxDQUFDeUssV0FBZixLQUErQixVQUExRCxFQUFzRTtBQUNwRSxZQUFNLElBQUl0TixTQUFKLENBQWMsc0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUM2TCxZQUFSLElBQXdCLE9BQU83TCxPQUFPLENBQUM2TCxZQUFmLEtBQWdDLFVBQTVELEVBQXdFO0FBQ3RFLFlBQU0sSUFBSTFPLFNBQUosQ0FBYyx1Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSTZDLE9BQU8sQ0FBQzhMLFdBQVIsSUFBdUIsRUFBRTlMLE9BQU8sQ0FBQzhMLFdBQVIsWUFBK0J4USxnQkFBakMsQ0FBM0IsRUFBK0U7QUFDN0UsWUFBTSxJQUFJNkIsU0FBSixDQUFjLHVEQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJNkMsT0FBTyxDQUFDMkssYUFBUixJQUF5QixPQUFPM0ssT0FBTyxDQUFDMkssYUFBZixLQUFpQyxVQUE5RCxFQUEwRTtBQUN4RSxZQUFNLElBQUl4TixTQUFKLENBQWMsd0NBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUMrTCxjQUFSLElBQTBCLE9BQU8vTCxPQUFPLENBQUMrTCxjQUFmLEtBQWtDLFVBQWhFLEVBQTRFO0FBQzFFLFlBQU0sSUFBSTVPLFNBQUosQ0FBYyx5Q0FBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSTZDLE9BQU8sQ0FBQzRMLFVBQVIsSUFBc0IsT0FBTzVMLE9BQU8sQ0FBQzRMLFVBQWYsS0FBOEIsVUFBeEQsRUFBb0U7QUFDbEUsWUFBTSxJQUFJek8sU0FBSixDQUFjLHFDQUFkLENBQU47QUFDRCxLQTFEa0IsQ0E0RG5COzs7QUFDQXVELFFBQUksQ0FBQ1YsT0FBTCxHQUFlQSxPQUFmO0FBQ0FVLFFBQUksQ0FBQ29MLFdBQUwsR0FBbUI5TCxPQUFPLENBQUM4TCxXQUEzQjtBQUNBLEtBQ0UsYUFERixFQUVFLGdCQUZGLEVBR0UsUUFIRixFQUlFLGFBSkYsRUFLRSxjQUxGLEVBTUUsWUFORixFQU9FL1AsT0FQRixDQU9XK0YsTUFBRCxJQUFZO0FBQ3BCLFVBQUksT0FBTzlCLE9BQU8sQ0FBQzhCLE1BQUQsQ0FBZCxLQUEyQixVQUEvQixFQUEyQztBQUN6Q3BCLFlBQUksQ0FBQ29CLE1BQUQsQ0FBSixHQUFlOUIsT0FBTyxDQUFDOEIsTUFBRCxDQUF0QjtBQUNEO0FBQ0YsS0FYRCxFQS9EbUIsQ0E0RW5COztBQUNBakgsWUFBUSxDQUFDcUMsUUFBVCxDQUFrQndELElBQWxCLEVBN0VtQixDQStFbkI7O0FBQ0EsUUFBSSxFQUFFQSxJQUFJLENBQUNvTCxXQUFMLFlBQTRCeFEsZ0JBQTlCLENBQUosRUFBcUQ7QUFDbkQ7QUFDQSxVQUFJVCxRQUFRLENBQUMrQyxNQUFULENBQWdCc0MsdUJBQWhCLFlBQW1ENUUsZ0JBQXZELEVBQXlFO0FBQ3ZFb0YsWUFBSSxDQUFDb0wsV0FBTCxHQUFtQmpSLFFBQVEsQ0FBQytDLE1BQVQsQ0FBZ0JzQyx1QkFBbkM7QUFDRCxPQUZELE1BRU87QUFDTFEsWUFBSSxDQUFDb0wsV0FBTCxHQUFtQixJQUFJeFEsZ0JBQUosRUFBbkI7QUFDQThDLGVBQU8sQ0FBQzhILElBQVIsd0RBQTREbEcsT0FBTyxDQUFDdkMsSUFBcEU7QUFDRDtBQUNGOztBQUVELFFBQUkzQyxNQUFNLENBQUMwRSxRQUFYLEVBQXFCO0FBRW5COzs7Ozs7QUFNQWtCLFVBQUksQ0FBQ2lELFVBQUwsR0FBa0IsVUFBVUYsS0FBVixFQUFpQjlGLE1BQWpCLEVBQXlCO0FBQ3pDb0UsYUFBSyxDQUFDMEIsS0FBRCxFQUFRQyxNQUFSLENBQUw7QUFDQTNCLGFBQUssQ0FBQ3BFLE1BQUQsRUFBUytGLE1BQVQsQ0FBTDtBQUNBLGVBQU9uSSxNQUFNLENBQUNXLElBQVAsQ0FBWTtBQUFFK1AsZUFBSyxFQUFFeEksS0FBVDtBQUFnQjlGLGdCQUFNLEVBQUVBO0FBQXhCLFNBQVosRUFBOENrSSxLQUE5QyxPQUEwRCxDQUFqRTtBQUNELE9BSkQ7QUFNQTs7Ozs7Ozs7QUFNQW5GLFVBQUksQ0FBQ3dMLElBQUwsR0FBWSxVQUFVdk8sTUFBVixFQUFrQmpDLEtBQWxCLEVBQXlCc0MsUUFBekIsRUFBbUM7QUFDN0MrRCxhQUFLLENBQUNwRSxNQUFELEVBQVMrRixNQUFULENBQUw7O0FBRUEsWUFBSSxFQUFFaEksS0FBSyxZQUFZTCxLQUFuQixDQUFKLEVBQStCO0FBQzdCLGdCQUFNLElBQUk4QixTQUFKLENBQWMsNENBQWQsQ0FBTjtBQUNELFNBTDRDLENBTTdDOzs7QUFDQSxZQUFJYixJQUFJLEdBQUdvRSxJQUFJLENBQUN6RSxhQUFMLEdBQXFCZ0ksT0FBckIsQ0FBNkI7QUFBRTVILGFBQUcsRUFBRXNCO0FBQVAsU0FBN0IsQ0FBWDs7QUFDQSxZQUFJLENBQUNyQixJQUFMLEVBQVc7QUFDVCxnQkFBTSxJQUFJeEIsTUFBTSxDQUFDa0csS0FBWCxDQUFpQixnQkFBakIsRUFBbUMsZ0JBQW5DLENBQU47QUFDRCxTQVY0QyxDQVc3Qzs7O0FBQ0EsY0FBTTJCLE1BQU0sR0FBR2pILEtBQUssQ0FBQzZKLFNBQU4sRUFBZjs7QUFDQSxZQUFJNUMsTUFBTSxZQUFZeEgsTUFBbEIsSUFBNEIsQ0FBQ3dILE1BQU0sQ0FBQ0ksT0FBUCxDQUFlekcsSUFBZixDQUFqQyxFQUF1RDtBQUNyRDtBQUNELFNBZjRDLENBaUI3Qzs7O0FBQ0EsWUFBSTtBQUFFRCxhQUFGO0FBQU8wQjtBQUFQLFlBQXdCekIsSUFBNUI7QUFBQSxZQUFtQjRQLElBQW5CLDRCQUE0QjVQLElBQTVCOztBQUNBNFAsWUFBSSxDQUFDQyxhQUFMLEdBQXFCekwsSUFBSSxDQUFDdEQsT0FBTCxFQUFyQjtBQUNBOE8sWUFBSSxDQUFDekQsVUFBTCxHQUFrQjlLLE1BQWxCLENBcEI2QyxDQXNCN0M7O0FBQ0EsWUFBSXlPLE1BQU0sR0FBRzFRLEtBQUssQ0FBQzhKLE1BQU4sQ0FBYTBHLElBQWIsQ0FBYixDQXZCNkMsQ0F5QjdDOztBQUNBLFlBQUkvSCxFQUFFLEdBQUd6RCxJQUFJLENBQUM2SixhQUFMLENBQW1CNU0sTUFBbkIsRUFBMkJyQixJQUEzQixDQUFULENBMUI2QyxDQTRCN0M7O0FBQ0E2SCxVQUFFLENBQUNLLEVBQUgsQ0FBTSxPQUFOLEVBQWUxSixNQUFNLENBQUMySixlQUFQLENBQXVCLFVBQVV4QixHQUFWLEVBQWU7QUFDbkRqRixrQkFBUSxDQUFDQyxJQUFULENBQWN5QyxJQUFkLEVBQW9CdUMsR0FBcEIsRUFBeUIsSUFBekI7QUFDRCxTQUZjLENBQWYsRUE3QjZDLENBaUM3Qzs7QUFDQXZILGFBQUssQ0FBQ2tKLEtBQU4sQ0FBWVQsRUFBWixFQUFnQmlJLE1BQWhCLEVBQXdCdFIsTUFBTSxDQUFDMkosZUFBUCxDQUF1QixVQUFVeEIsR0FBVixFQUFlO0FBQzVELGNBQUlBLEdBQUosRUFBUztBQUNQdkMsZ0JBQUksQ0FBQ3pFLGFBQUwsR0FBcUJ5SSxNQUFyQixDQUE0QjtBQUFFckksaUJBQUcsRUFBRStQO0FBQVAsYUFBNUI7QUFDQTFMLGdCQUFJLENBQUNnTCxXQUFMLENBQWlCek4sSUFBakIsQ0FBc0J5QyxJQUF0QixFQUE0QnVDLEdBQTVCLEVBQWlDdEYsTUFBakMsRUFBeUNyQixJQUF6QztBQUNEOztBQUNELGNBQUksT0FBTzBCLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbENBLG9CQUFRLENBQUNDLElBQVQsQ0FBY3lDLElBQWQsRUFBb0J1QyxHQUFwQixFQUF5Qm1KLE1BQXpCLEVBQWlDRixJQUFqQyxFQUF1Q3hRLEtBQXZDO0FBQ0Q7QUFDRixTQVJ1QixDQUF4QjtBQVNELE9BM0NEO0FBNkNBOzs7Ozs7OztBQU1BZ0YsVUFBSSxDQUFDOEUsTUFBTCxHQUFjLFVBQVVsSixJQUFWLEVBQWdCMEIsUUFBaEIsRUFBMEI7QUFDdEMrRCxhQUFLLENBQUN6RixJQUFELEVBQU8wSSxNQUFQLENBQUw7QUFDQTFJLFlBQUksQ0FBQ1osS0FBTCxHQUFhZ0YsSUFBSSxDQUFDVixPQUFMLENBQWF2QyxJQUExQixDQUZzQyxDQUVOOztBQUNoQyxlQUFPaUQsSUFBSSxDQUFDekUsYUFBTCxHQUFxQitPLE1BQXJCLENBQTRCMU8sSUFBNUIsRUFBa0MwQixRQUFsQyxDQUFQO0FBQ0QsT0FKRDtBQU1BOzs7Ozs7O0FBS0EwQyxVQUFJLENBQUMrRSxXQUFMLEdBQW1CLFVBQVU5SCxNQUFWLEVBQWtCO0FBQ25DLFlBQUk4RixLQUFLLEdBQUcvQyxJQUFJLENBQUMyTCxhQUFMLEVBQVosQ0FEbUMsQ0FHbkM7O0FBQ0EsWUFBSTlRLE1BQU0sQ0FBQ1csSUFBUCxDQUFZO0FBQUV5QixnQkFBTSxFQUFFQTtBQUFWLFNBQVosRUFBZ0NrSSxLQUFoQyxFQUFKLEVBQTZDO0FBQzNDdEssZ0JBQU0sQ0FBQ2lCLE1BQVAsQ0FBYztBQUFFbUIsa0JBQU0sRUFBRUE7QUFBVixXQUFkLEVBQWtDO0FBQ2hDbEIsZ0JBQUksRUFBRTtBQUNKNlAsdUJBQVMsRUFBRSxJQUFJekMsSUFBSixFQURQO0FBRUpvQyxtQkFBSyxFQUFFeEk7QUFGSDtBQUQwQixXQUFsQztBQU1ELFNBUEQsTUFPTztBQUNMbEksZ0JBQU0sQ0FBQ3lQLE1BQVAsQ0FBYztBQUNac0IscUJBQVMsRUFBRSxJQUFJekMsSUFBSixFQURDO0FBRVpsTSxrQkFBTSxFQUFFQSxNQUZJO0FBR1pzTyxpQkFBSyxFQUFFeEk7QUFISyxXQUFkO0FBS0Q7O0FBQ0QsZUFBT0EsS0FBUDtBQUNELE9BbkJEO0FBcUJBOzs7Ozs7OztBQU1BL0MsVUFBSSxDQUFDa0UsS0FBTCxHQUFhLFVBQVVULEVBQVYsRUFBY3hHLE1BQWQsRUFBc0JLLFFBQXRCLEVBQWdDO0FBQzNDLGNBQU0xQixJQUFJLEdBQUdvRSxJQUFJLENBQUN6RSxhQUFMLEdBQXFCZ0ksT0FBckIsQ0FBNkI7QUFBRTVILGFBQUcsRUFBRXNCO0FBQVAsU0FBN0IsQ0FBYjtBQUVBLGNBQU00TyxZQUFZLEdBQUd6UixNQUFNLENBQUMySixlQUFQLENBQXVCLFVBQVV4QixHQUFWLEVBQWU7QUFDekR2QyxjQUFJLENBQUNtTCxZQUFMLENBQWtCNU4sSUFBbEIsQ0FBdUJ5QyxJQUF2QixFQUE2QnVDLEdBQTdCLEVBQWtDdEYsTUFBbEMsRUFBMENyQixJQUExQztBQUNBMEIsa0JBQVEsQ0FBQ0MsSUFBVCxDQUFjeUMsSUFBZCxFQUFvQnVDLEdBQXBCO0FBQ0QsU0FIb0IsQ0FBckI7QUFLQSxjQUFNdUosYUFBYSxHQUFHMVIsTUFBTSxDQUFDMkosZUFBUCxDQUF1QixZQUFZO0FBQ3ZELGNBQUl6QyxJQUFJLEdBQUcsQ0FBWDtBQUNBLGdCQUFNeUssVUFBVSxHQUFHL0wsSUFBSSxDQUFDNkosYUFBTCxDQUFtQjVNLE1BQW5CLEVBQTJCckIsSUFBM0IsQ0FBbkI7QUFFQW1RLG9CQUFVLENBQUNqSSxFQUFYLENBQWMsT0FBZCxFQUF1QjFKLE1BQU0sQ0FBQzJKLGVBQVAsQ0FBdUIsVUFBVXBHLEtBQVYsRUFBaUI7QUFDN0RMLG9CQUFRLENBQUNDLElBQVQsQ0FBY3lDLElBQWQsRUFBb0JyQyxLQUFwQixFQUEyQixJQUEzQjtBQUNELFdBRnNCLENBQXZCO0FBR0FvTyxvQkFBVSxDQUFDakksRUFBWCxDQUFjLE1BQWQsRUFBc0IxSixNQUFNLENBQUMySixlQUFQLENBQXVCLFVBQVVpSSxJQUFWLEVBQWdCO0FBQzNEMUssZ0JBQUksSUFBSTBLLElBQUksQ0FBQ25OLE1BQWI7QUFDRCxXQUZxQixDQUF0QjtBQUdBa04sb0JBQVUsQ0FBQ2pJLEVBQVgsQ0FBYyxLQUFkLEVBQXFCMUosTUFBTSxDQUFDMkosZUFBUCxDQUF1QixZQUFZO0FBQ3REO0FBQ0FuSSxnQkFBSSxDQUFDMkksUUFBTCxHQUFnQixJQUFoQjtBQUNBM0ksZ0JBQUksQ0FBQ0gsSUFBTCxHQUFZdEIsUUFBUSxDQUFDNkIsWUFBVCxFQUFaO0FBQ0FKLGdCQUFJLENBQUNVLElBQUwsR0FBWTBELElBQUksQ0FBQ3pELGtCQUFMLENBQXdCVSxNQUF4QixDQUFaO0FBQ0FyQixnQkFBSSxDQUFDK0ksUUFBTCxHQUFnQixDQUFoQjtBQUNBL0ksZ0JBQUksQ0FBQzBGLElBQUwsR0FBWUEsSUFBWjtBQUNBMUYsZ0JBQUksQ0FBQ21ILEtBQUwsR0FBYS9DLElBQUksQ0FBQzJMLGFBQUwsRUFBYjtBQUNBL1AsZ0JBQUksQ0FBQzRJLFNBQUwsR0FBaUIsS0FBakI7QUFDQTVJLGdCQUFJLENBQUN5TixVQUFMLEdBQWtCLElBQUlGLElBQUosRUFBbEI7QUFDQXZOLGdCQUFJLENBQUN5QixHQUFMLEdBQVcyQyxJQUFJLENBQUNpTSxVQUFMLENBQWdCaFAsTUFBaEIsQ0FBWCxDQVZzRCxDQVl0RDs7QUFDQSxnQkFBSSxPQUFPK0MsSUFBSSxDQUFDaUwsY0FBWixLQUErQixVQUFuQyxFQUErQztBQUM3Q2pMLGtCQUFJLENBQUNpTCxjQUFMLENBQW9CMU4sSUFBcEIsQ0FBeUJ5QyxJQUF6QixFQUErQnBFLElBQS9CO0FBQ0QsYUFmcUQsQ0FpQnREO0FBQ0E7OztBQUNBb0UsZ0JBQUksQ0FBQ3pFLGFBQUwsR0FBcUJNLE1BQXJCLENBQTRCQyxNQUE1QixDQUFtQztBQUFFSCxpQkFBRyxFQUFFc0I7QUFBUCxhQUFuQyxFQUFvRDtBQUNsRGxCLGtCQUFJLEVBQUU7QUFDSndJLHdCQUFRLEVBQUUzSSxJQUFJLENBQUMySSxRQURYO0FBRUo5SSxvQkFBSSxFQUFFRyxJQUFJLENBQUNILElBRlA7QUFHSmEsb0JBQUksRUFBRVYsSUFBSSxDQUFDVSxJQUhQO0FBSUpxSSx3QkFBUSxFQUFFL0ksSUFBSSxDQUFDK0ksUUFKWDtBQUtKckQsb0JBQUksRUFBRTFGLElBQUksQ0FBQzBGLElBTFA7QUFNSnlCLHFCQUFLLEVBQUVuSCxJQUFJLENBQUNtSCxLQU5SO0FBT0p5Qix5QkFBUyxFQUFFNUksSUFBSSxDQUFDNEksU0FQWjtBQVFKNkUsMEJBQVUsRUFBRXpOLElBQUksQ0FBQ3lOLFVBUmI7QUFTSmhNLG1CQUFHLEVBQUV6QixJQUFJLENBQUN5QjtBQVROO0FBRDRDLGFBQXBELEVBbkJzRCxDQWlDdEQ7O0FBQ0FDLG9CQUFRLENBQUNDLElBQVQsQ0FBY3lDLElBQWQsRUFBb0IsSUFBcEIsRUFBMEJwRSxJQUExQixFQWxDc0QsQ0FvQ3REOztBQUNBLGdCQUFJekIsUUFBUSxDQUFDK0MsTUFBVCxDQUFnQjBDLGtCQUFwQixFQUF3QztBQUN0Q3hGLG9CQUFNLENBQUMwTyxXQUFQLENBQW1CM08sUUFBUSxDQUFDK0MsTUFBVCxDQUFnQjBDLGtCQUFuQztBQUNELGFBdkNxRCxDQXlDdEQ7OztBQUNBLGdCQUFJSSxJQUFJLENBQUNWLE9BQUwsQ0FBYTRNLE1BQWIsWUFBK0IvSyxLQUFuQyxFQUEwQztBQUN4QyxtQkFBSyxJQUFJdkMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR29CLElBQUksQ0FBQ1YsT0FBTCxDQUFhNE0sTUFBYixDQUFvQnJOLE1BQXhDLEVBQWdERCxDQUFDLElBQUksQ0FBckQsRUFBd0Q7QUFDdEQsc0JBQU01RCxLQUFLLEdBQUdnRixJQUFJLENBQUNWLE9BQUwsQ0FBYTRNLE1BQWIsQ0FBb0J0TixDQUFwQixDQUFkOztBQUVBLG9CQUFJLENBQUM1RCxLQUFLLENBQUM2SixTQUFOLEVBQUQsSUFBc0I3SixLQUFLLENBQUM2SixTQUFOLEdBQWtCeEMsT0FBbEIsQ0FBMEJ6RyxJQUExQixDQUExQixFQUEyRDtBQUN6RG9FLHNCQUFJLENBQUN3TCxJQUFMLENBQVV2TyxNQUFWLEVBQWtCakMsS0FBbEI7QUFDRDtBQUNGO0FBQ0Y7QUFDRixXQW5Eb0IsQ0FBckI7QUFvREQsU0E5RHFCLENBQXRCO0FBZ0VBLGNBQU1tTixFQUFFLEdBQUduSSxJQUFJLENBQUNtTSxjQUFMLENBQW9CbFAsTUFBcEIsRUFBNEJyQixJQUE1QixDQUFYO0FBQ0F1TSxVQUFFLENBQUNyRSxFQUFILENBQU0sT0FBTixFQUFlK0gsWUFBZjtBQUNBMUQsVUFBRSxDQUFDckUsRUFBSCxDQUFNLFFBQU4sRUFBZ0JnSSxhQUFoQixFQTFFMkMsQ0E0RTNDOztBQUNBOUwsWUFBSSxDQUFDcUwsY0FBTCxDQUFvQjVILEVBQXBCLEVBQXdCMEUsRUFBeEIsRUFBNEJsTCxNQUE1QixFQUFvQ3JCLElBQXBDO0FBQ0QsT0E5RUQ7QUErRUQ7O0FBRUQsUUFBSXhCLE1BQU0sQ0FBQzBFLFFBQVgsRUFBcUI7QUFDbkIsWUFBTTBELEVBQUUsR0FBR0MsR0FBRyxDQUFDMUQsT0FBSixDQUFZLElBQVosQ0FBWDs7QUFDQSxZQUFNZ00sVUFBVSxHQUFHL0ssSUFBSSxDQUFDekUsYUFBTCxFQUFuQixDQUZtQixDQUluQjs7QUFDQXdQLGdCQUFVLENBQUNxQixLQUFYLENBQWlCcEksTUFBakIsQ0FBd0IsVUFBVVksTUFBVixFQUFrQmhKLElBQWxCLEVBQXdCO0FBQzlDO0FBQ0FmLGNBQU0sQ0FBQ21KLE1BQVAsQ0FBYztBQUFFL0csZ0JBQU0sRUFBRXJCLElBQUksQ0FBQ0Q7QUFBZixTQUFkOztBQUVBLFlBQUlxRSxJQUFJLENBQUNWLE9BQUwsQ0FBYTRNLE1BQWIsWUFBK0IvSyxLQUFuQyxFQUEwQztBQUN4QyxlQUFLLElBQUl2QyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHb0IsSUFBSSxDQUFDVixPQUFMLENBQWE0TSxNQUFiLENBQW9Cck4sTUFBeEMsRUFBZ0RELENBQUMsSUFBSSxDQUFyRCxFQUF3RDtBQUN0RDtBQUNBb0IsZ0JBQUksQ0FBQ1YsT0FBTCxDQUFhNE0sTUFBYixDQUFvQnROLENBQXBCLEVBQXVCckQsYUFBdkIsR0FBdUN5SSxNQUF2QyxDQUE4QztBQUFFK0Qsd0JBQVUsRUFBRW5NLElBQUksQ0FBQ0Q7QUFBbkIsYUFBOUM7QUFDRDtBQUNGO0FBQ0YsT0FWRCxFQUxtQixDQWlCbkI7O0FBQ0FvUCxnQkFBVSxDQUFDc0IsTUFBWCxDQUFrQi9CLE1BQWxCLENBQXlCLFVBQVUxRixNQUFWLEVBQWtCaEosSUFBbEIsRUFBd0I7QUFDL0MsWUFBSSxDQUFDb0UsSUFBSSxDQUFDb0wsV0FBTCxDQUFpQlYsV0FBakIsQ0FBNkI5RixNQUE3QixFQUFxQ2hKLElBQXJDLENBQUwsRUFBaUQ7QUFDL0MsZ0JBQU0sSUFBSXhCLE1BQU0sQ0FBQ2tHLEtBQVgsQ0FBaUIsV0FBakIsRUFBOEIsV0FBOUIsQ0FBTjtBQUNEO0FBQ0YsT0FKRCxFQWxCbUIsQ0F3Qm5COztBQUNBeUssZ0JBQVUsQ0FBQ3NCLE1BQVgsQ0FBa0J2USxNQUFsQixDQUF5QixVQUFVOEksTUFBVixFQUFrQmhKLElBQWxCLEVBQXdCRixNQUF4QixFQUFnQytPLFNBQWhDLEVBQTJDO0FBQ2xFLFlBQUksQ0FBQ3pLLElBQUksQ0FBQ29MLFdBQUwsQ0FBaUJSLFdBQWpCLENBQTZCaEcsTUFBN0IsRUFBcUNoSixJQUFyQyxFQUEyQ0YsTUFBM0MsRUFBbUQrTyxTQUFuRCxDQUFMLEVBQW9FO0FBQ2xFLGdCQUFNLElBQUlyUSxNQUFNLENBQUNrRyxLQUFYLENBQWlCLFdBQWpCLEVBQThCLFdBQTlCLENBQU47QUFDRDtBQUNGLE9BSkQsRUF6Qm1CLENBK0JuQjs7QUFDQXlLLGdCQUFVLENBQUNzQixNQUFYLENBQWtCckksTUFBbEIsQ0FBeUIsVUFBVVksTUFBVixFQUFrQmhKLElBQWxCLEVBQXdCO0FBQy9DLFlBQUksQ0FBQ29FLElBQUksQ0FBQ29MLFdBQUwsQ0FBaUJULFdBQWpCLENBQTZCL0YsTUFBN0IsRUFBcUNoSixJQUFyQyxDQUFMLEVBQWlEO0FBQy9DLGdCQUFNLElBQUl4QixNQUFNLENBQUNrRyxLQUFYLENBQWlCLFdBQWpCLEVBQThCLFdBQTlCLENBQU47QUFDRCxTQUg4QyxDQUsvQzs7O0FBQ0FOLFlBQUksQ0FBQ3NNLE1BQUwsQ0FBWTFRLElBQUksQ0FBQ0QsR0FBakI7QUFFQSxZQUFJd0gsT0FBTyxHQUFHaEosUUFBUSxDQUFDNkMsZUFBVCxDQUF5QnBCLElBQUksQ0FBQ0QsR0FBOUIsQ0FBZCxDQVIrQyxDQVUvQzs7QUFDQTZHLFVBQUUsQ0FBQ2lFLElBQUgsQ0FBUXRELE9BQVIsRUFBaUIsVUFBVVosR0FBVixFQUFlO0FBQzlCLFdBQUNBLEdBQUQsSUFBUUMsRUFBRSxDQUFDYSxNQUFILENBQVVGLE9BQVYsRUFBbUIsVUFBVVosR0FBVixFQUFlO0FBQ3hDQSxlQUFHLElBQUk3RSxPQUFPLENBQUNDLEtBQVIsMkNBQWlEd0YsT0FBakQsZUFBNkRaLEdBQUcsQ0FBQ2UsT0FBakUsT0FBUDtBQUNELFdBRk8sQ0FBUjtBQUdELFNBSkQ7QUFLRCxPQWhCRDtBQWlCRDtBQUNGO0FBRUQ7Ozs7Ozs7QUFLQWdKLFFBQU0sQ0FBQ3JQLE1BQUQsRUFBU0ssUUFBVCxFQUFtQjtBQUN2QixVQUFNLElBQUlnRCxLQUFKLENBQVUsMkJBQVYsQ0FBTjtBQUNEO0FBRUQ7Ozs7Ozs7QUFLQXFMLGVBQWEsQ0FBQ1ksT0FBRCxFQUFVO0FBQ3JCLFdBQU8sQ0FBQ0EsT0FBTyxJQUFJLFlBQVosRUFBMEJuSyxPQUExQixDQUFrQyxPQUFsQyxFQUE0Q29LLENBQUQsSUFBTztBQUN2RCxVQUFJN0MsQ0FBQyxHQUFHcEIsSUFBSSxDQUFDa0UsTUFBTCxLQUFnQixFQUFoQixHQUFxQixDQUE3QjtBQUFBLFVBQWdDblMsQ0FBQyxHQUFHa1MsQ0FBQyxLQUFLLEdBQU4sR0FBWTdDLENBQVosR0FBaUJBLENBQUMsR0FBRyxHQUFKLEdBQVUsR0FBL0Q7QUFDQSxVQUFJK0MsQ0FBQyxHQUFHcFMsQ0FBQyxDQUFDcVMsUUFBRixDQUFXLEVBQVgsQ0FBUjtBQUNBLGFBQU9wRSxJQUFJLENBQUNxRSxLQUFMLENBQVdyRSxJQUFJLENBQUNrRSxNQUFMLEVBQVgsSUFBNEJDLENBQUMsQ0FBQ0csV0FBRixFQUE1QixHQUE4Q0gsQ0FBckQ7QUFDRCxLQUpNLENBQVA7QUFLRDtBQUVEOzs7Ozs7QUFJQW5SLGVBQWEsR0FBRztBQUNkLFdBQU8sS0FBSytELE9BQUwsQ0FBYXlMLFVBQXBCO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBeE8sb0JBQWtCLENBQUNVLE1BQUQsRUFBUztBQUN6QixRQUFJckIsSUFBSSxHQUFHLEtBQUtMLGFBQUwsR0FBcUJnSSxPQUFyQixDQUE2QnRHLE1BQTdCLEVBQXFDO0FBQUV2QixZQUFNLEVBQUU7QUFBRXFCLFlBQUksRUFBRTtBQUFSO0FBQVYsS0FBckMsQ0FBWDtBQUNBLFdBQU9uQixJQUFJLEdBQUcsS0FBS2tSLGNBQUwsV0FBdUI3UCxNQUF2QixjQUFpQ3JCLElBQUksQ0FBQ21CLElBQXRDLEVBQUgsR0FBbUQsSUFBOUQ7QUFDRDtBQUVEOzs7Ozs7O0FBS0FrUCxZQUFVLENBQUNoUCxNQUFELEVBQVM7QUFDakIsUUFBSXJCLElBQUksR0FBRyxLQUFLTCxhQUFMLEdBQXFCZ0ksT0FBckIsQ0FBNkJ0RyxNQUE3QixFQUFxQztBQUFFdkIsWUFBTSxFQUFFO0FBQUVxQixZQUFJLEVBQUU7QUFBUjtBQUFWLEtBQXJDLENBQVg7QUFDQSxXQUFPbkIsSUFBSSxHQUFHLEtBQUtxSixNQUFMLFdBQWVoSSxNQUFmLGNBQXlCckIsSUFBSSxDQUFDbUIsSUFBOUIsRUFBSCxHQUEyQyxJQUF0RDtBQUNEO0FBRUQ7Ozs7OztBQUlBOEgsV0FBUyxHQUFHO0FBQ1YsV0FBTyxLQUFLdkYsT0FBTCxDQUFhMkMsTUFBcEI7QUFDRDtBQUVEOzs7Ozs7QUFJQXZGLFNBQU8sR0FBRztBQUNSLFdBQU8sS0FBSzRDLE9BQUwsQ0FBYXZDLElBQXBCO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBOE0sZUFBYSxDQUFDNU0sTUFBRCxFQUFTckIsSUFBVCxFQUFlO0FBQzFCLFVBQU0sSUFBSTBFLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBd00sZ0JBQWMsQ0FBQ3hRLElBQUQsRUFBTztBQUNuQixVQUFNeVEsT0FBTyxHQUFHM1MsTUFBTSxDQUFDNFMsV0FBUCxHQUFxQjVLLE9BQXJCLENBQTZCLE1BQTdCLEVBQXFDLEVBQXJDLENBQWhCO0FBQ0EsVUFBTTZLLFFBQVEsR0FBR0YsT0FBTyxDQUFDM0ssT0FBUixDQUFnQix3QkFBaEIsRUFBMEMsRUFBMUMsQ0FBakI7QUFDQSxVQUFNVSxTQUFTLEdBQUcsS0FBS3BHLE9BQUwsRUFBbEI7QUFDQUosUUFBSSxHQUFHMEcsTUFBTSxDQUFDMUcsSUFBRCxDQUFOLENBQWE4RixPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEVBQTVCLEVBQWdDOEssSUFBaEMsRUFBUDtBQUNBLFdBQU9DLFNBQVMsV0FBSUYsUUFBSixjQUFnQjlTLFFBQVEsQ0FBQytDLE1BQVQsQ0FBZ0IyQyxVQUFoQyxjQUE4Q2lELFNBQTlDLGNBQTJEeEcsSUFBM0QsRUFBaEI7QUFDRDtBQUVEOzs7Ozs7O0FBS0EySSxRQUFNLENBQUMzSSxJQUFELEVBQU87QUFDWCxVQUFNeVEsT0FBTyxHQUFHM1MsTUFBTSxDQUFDNFMsV0FBUCxDQUFtQjtBQUFFSSxZQUFNLEVBQUVqVCxRQUFRLENBQUMrQyxNQUFULENBQWdCdUM7QUFBMUIsS0FBbkIsRUFBc0QyQyxPQUF0RCxDQUE4RCxNQUE5RCxFQUFzRSxFQUF0RSxDQUFoQjtBQUNBLFVBQU1VLFNBQVMsR0FBRyxLQUFLcEcsT0FBTCxFQUFsQjtBQUNBSixRQUFJLEdBQUcwRyxNQUFNLENBQUMxRyxJQUFELENBQU4sQ0FBYThGLE9BQWIsQ0FBcUIsS0FBckIsRUFBNEIsRUFBNUIsRUFBZ0M4SyxJQUFoQyxFQUFQO0FBQ0EsV0FBT0MsU0FBUyxXQUFJSixPQUFKLGNBQWU1UyxRQUFRLENBQUMrQyxNQUFULENBQWdCMkMsVUFBL0IsY0FBNkNpRCxTQUE3QyxjQUEwRHhHLElBQTFELEVBQWhCO0FBQ0Q7QUFFRDs7Ozs7OztBQUtBNlAsZ0JBQWMsQ0FBQ2xQLE1BQUQsRUFBU3JCLElBQVQsRUFBZTtBQUMzQixVQUFNLElBQUkwRSxLQUFKLENBQVUsbUNBQVYsQ0FBTjtBQUNEO0FBRUQ7Ozs7Ozs7O0FBTUFsRCxlQUFhLENBQUNDLEdBQUQsRUFBTXpCLElBQU4sRUFBWTBCLFFBQVosRUFBc0I7QUFDakNsRCxVQUFNLENBQUNtRCxJQUFQLENBQVksY0FBWixFQUE0QkYsR0FBNUIsRUFBaUN6QixJQUFqQyxFQUF1QyxLQUFLYyxPQUFMLEVBQXZDLEVBQXVEWSxRQUF2RDtBQUNEO0FBRUQ7Ozs7Ozs7O0FBTUEwTixhQUFXLENBQUN6SSxHQUFELEVBQU10RixNQUFOLEVBQWNyQixJQUFkLEVBQW9CO0FBQzdCOEIsV0FBTyxDQUFDQyxLQUFSLG1DQUF3Q1YsTUFBeEMsaUJBQW9Ec0YsR0FBRyxDQUFDZSxPQUF4RCxRQUFvRWYsR0FBcEU7QUFDRDtBQUVEOzs7Ozs7QUFJQTBJLGdCQUFjLENBQUNyUCxJQUFELEVBQU8sQ0FDcEI7QUFFRDs7Ozs7Ozs7OztBQVFBK00sUUFBTSxDQUFDMUwsTUFBRCxFQUFTckIsSUFBVCxFQUFleVIsT0FBZixFQUF3QkMsUUFBeEIsRUFBa0M7QUFDdEMsV0FBTyxJQUFQO0FBQ0Q7QUFFRDs7Ozs7Ozs7O0FBT0F2RCxhQUFXLENBQUN4SCxHQUFELEVBQU10RixNQUFOLEVBQWNyQixJQUFkLEVBQW9CO0FBQzdCOEIsV0FBTyxDQUFDQyxLQUFSLG1DQUF3Q1YsTUFBeEMsaUJBQW9Ec0YsR0FBRyxDQUFDZSxPQUF4RCxRQUFvRWYsR0FBcEU7QUFDRDtBQUVEOzs7Ozs7QUFJQTJJLFlBQVUsQ0FBQ3RQLElBQUQsRUFBTyxDQUNoQjtBQUVEOzs7Ozs7Ozs7QUFPQXVQLGNBQVksQ0FBQzVJLEdBQUQsRUFBTXRGLE1BQU4sRUFBY3JCLElBQWQsRUFBb0I7QUFDOUI4QixXQUFPLENBQUNDLEtBQVIsb0NBQXlDVixNQUF6QyxpQkFBcURzRixHQUFHLENBQUNlLE9BQXpELFFBQXFFZixHQUFyRTtBQUNEO0FBRUQ7Ozs7OztBQUlBZ0wsZ0JBQWMsQ0FBQ25DLFdBQUQsRUFBYztBQUMxQixRQUFJLEVBQUVBLFdBQVcsWUFBWXhRLGdCQUF6QixDQUFKLEVBQWdEO0FBQzlDLFlBQU0sSUFBSTZCLFNBQUosQ0FBYyw2REFBZCxDQUFOO0FBQ0Q7O0FBQ0QsU0FBSzJPLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7QUFTQW5CLGVBQWEsQ0FBQzhCLFVBQUQsRUFBYXlCLFdBQWIsRUFBMEJ2USxNQUExQixFQUFrQ3JCLElBQWxDLEVBQXdDeVIsT0FBeEMsRUFBaURwRSxPQUFqRCxFQUEwRDtBQUNyRSxRQUFJLE9BQU8sS0FBSzNKLE9BQUwsQ0FBYTJLLGFBQXBCLEtBQXNDLFVBQTFDLEVBQXNEO0FBQ3BELFdBQUszSyxPQUFMLENBQWEySyxhQUFiLENBQTJCMU0sSUFBM0IsQ0FBZ0MsSUFBaEMsRUFBc0N3TyxVQUF0QyxFQUFrRHlCLFdBQWxELEVBQStEdlEsTUFBL0QsRUFBdUVyQixJQUF2RSxFQUE2RXlSLE9BQTdFLEVBQXNGcEUsT0FBdEY7QUFDRCxLQUZELE1BRU87QUFDTDhDLGdCQUFVLENBQUM1QixJQUFYLENBQWdCcUQsV0FBaEI7QUFDRDtBQUNGO0FBRUQ7Ozs7Ozs7OztBQU9BbkMsZ0JBQWMsQ0FBQ1UsVUFBRCxFQUFheUIsV0FBYixFQUEwQnZRLE1BQTFCLEVBQWtDckIsSUFBbEMsRUFBd0M7QUFDcEQsUUFBSSxPQUFPLEtBQUswRCxPQUFMLENBQWErTCxjQUFwQixLQUF1QyxVQUEzQyxFQUF1RDtBQUNyRCxXQUFLL0wsT0FBTCxDQUFhK0wsY0FBYixDQUE0QjlOLElBQTVCLENBQWlDLElBQWpDLEVBQXVDd08sVUFBdkMsRUFBbUR5QixXQUFuRCxFQUFnRXZRLE1BQWhFLEVBQXdFckIsSUFBeEU7QUFDRCxLQUZELE1BRU87QUFDTG1RLGdCQUFVLENBQUM1QixJQUFYLENBQWdCcUQsV0FBaEI7QUFDRDtBQUNGO0FBRUQ7Ozs7OztBQUlBaEssVUFBUSxDQUFDNUgsSUFBRCxFQUFPO0FBQ2IsUUFBSSxPQUFPLEtBQUtzUCxVQUFaLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDLFdBQUtBLFVBQUwsQ0FBZ0J0UCxJQUFoQjtBQUNEO0FBQ0Y7O0FBbGpCZ0IsQzs7Ozs7Ozs7Ozs7QUNwQ25CdUQsTUFBTSxDQUFDakYsTUFBUCxDQUFjO0FBQUNXLFFBQU0sRUFBQyxNQUFJQTtBQUFaLENBQWQ7QUFBbUMsSUFBSWlRLEtBQUo7QUFBVTNMLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUN5USxPQUFLLENBQUN4USxDQUFELEVBQUc7QUFBQ3dRLFNBQUssR0FBQ3hRLENBQU47QUFBUTs7QUFBbEIsQ0FBM0IsRUFBK0MsQ0FBL0M7QUErQnRDLE1BQU1PLE1BQU0sR0FBRyxJQUFJaVEsS0FBSyxDQUFDUSxVQUFWLENBQXFCLFdBQXJCLENBQWYsQzs7Ozs7Ozs7Ozs7QUMvQlBuTSxNQUFNLENBQUNqRixNQUFQLENBQWM7QUFBQ1ksVUFBUSxFQUFDLE1BQUlBO0FBQWQsQ0FBZDtBQUF1QyxJQUFJVixNQUFKO0FBQVcrRSxNQUFNLENBQUM5RSxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDRCxRQUFNLENBQUNFLENBQUQsRUFBRztBQUFDRixVQUFNLEdBQUNFLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7O0FBQXFELElBQUk4RSxDQUFKOztBQUFNRCxNQUFNLENBQUM5RSxJQUFQLENBQVksbUJBQVosRUFBZ0M7QUFBQytFLEdBQUMsQ0FBQzlFLENBQUQsRUFBRztBQUFDOEUsS0FBQyxHQUFDOUUsQ0FBRjtBQUFJOztBQUFWLENBQWhDLEVBQTRDLENBQTVDO0FBQStDLElBQUlLLEtBQUo7QUFBVXdFLE1BQU0sQ0FBQzlFLElBQVAsQ0FBWSxhQUFaLEVBQTBCO0FBQUNNLE9BQUssQ0FBQ0wsQ0FBRCxFQUFHO0FBQUNLLFNBQUssR0FBQ0wsQ0FBTjtBQUFROztBQUFsQixDQUExQixFQUE4QyxDQUE5Qzs7QUFnQy9KLE1BQU1RLFFBQU4sQ0FBZTtBQUVwQnVFLGFBQVcsQ0FBQ0MsT0FBRCxFQUFVO0FBQ25CLFFBQUlVLElBQUksR0FBRyxJQUFYLENBRG1CLENBR25COztBQUNBVixXQUFPLEdBQUdGLENBQUMsQ0FBQ0csTUFBRixDQUFTO0FBQ2pCa08sY0FBUSxFQUFFLElBRE87QUFFakJDLGNBQVEsRUFBRSxHQUZPO0FBR2pCQyxlQUFTLEVBQUUsS0FBSyxJQUhDO0FBSWpCM0IsVUFBSSxFQUFFLElBSlc7QUFLakJwUSxVQUFJLEVBQUUsSUFMVztBQU1qQmdTLGtCQUFZLEVBQUUsSUFBSSxJQUFKLEdBQVcsSUFOUjtBQU9qQkMsY0FBUSxFQUFFLENBUE87QUFRakJDLGFBQU8sRUFBRSxLQUFLQSxPQVJHO0FBU2pCQyxnQkFBVSxFQUFFLEtBQUtBLFVBVEE7QUFVakJDLGNBQVEsRUFBRSxLQUFLQSxRQVZFO0FBV2pCQyxhQUFPLEVBQUUsS0FBS0EsT0FYRztBQVlqQkMsZ0JBQVUsRUFBRSxLQUFLQSxVQVpBO0FBYWpCQyxhQUFPLEVBQUUsS0FBS0EsT0FiRztBQWNqQkMsWUFBTSxFQUFFLEtBQUtBLE1BZEk7QUFlakJDLGdCQUFVLEVBQUUsSUFmSztBQWdCakJyVCxXQUFLLEVBQUUsSUFoQlU7QUFpQmpCc1QsbUJBQWEsRUFBRTtBQWpCRSxLQUFULEVBa0JQaFAsT0FsQk8sQ0FBVixDQUptQixDQXdCbkI7O0FBQ0EsUUFBSSxPQUFPQSxPQUFPLENBQUNtTyxRQUFmLEtBQTRCLFNBQWhDLEVBQTJDO0FBQ3pDLFlBQU0sSUFBSWhSLFNBQUosQ0FBYywwQkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDb08sUUFBZixLQUE0QixRQUFoQyxFQUEwQztBQUN4QyxZQUFNLElBQUlqUixTQUFKLENBQWMsMEJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUk2QyxPQUFPLENBQUNvTyxRQUFSLElBQW9CLENBQXBCLElBQXlCcE8sT0FBTyxDQUFDb08sUUFBUixHQUFtQixDQUFoRCxFQUFtRDtBQUNqRCxZQUFNLElBQUlhLFVBQUosQ0FBZSw4Q0FBZixDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPalAsT0FBTyxDQUFDcU8sU0FBZixLQUE2QixRQUFqQyxFQUEyQztBQUN6QyxZQUFNLElBQUlsUixTQUFKLENBQWMsMkJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksRUFBRTZDLE9BQU8sQ0FBQzBNLElBQVIsWUFBd0J3QyxJQUExQixLQUFtQyxFQUFFbFAsT0FBTyxDQUFDME0sSUFBUixZQUF3QnlDLElBQTFCLENBQXZDLEVBQXdFO0FBQ3RFLFlBQU0sSUFBSWhTLFNBQUosQ0FBYyw2QkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSTZDLE9BQU8sQ0FBQzFELElBQVIsS0FBaUIsSUFBakIsSUFBeUIsT0FBTzBELE9BQU8sQ0FBQzFELElBQWYsS0FBd0IsUUFBckQsRUFBK0Q7QUFDN0QsWUFBTSxJQUFJYSxTQUFKLENBQWMsdUJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ3NPLFlBQWYsS0FBZ0MsUUFBcEMsRUFBOEM7QUFDNUMsWUFBTSxJQUFJblIsU0FBSixDQUFjLDhCQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUN1TyxRQUFmLEtBQTRCLFFBQWhDLEVBQTBDO0FBQ3hDLFlBQU0sSUFBSXBSLFNBQUosQ0FBYywwQkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDK08sVUFBZixLQUE4QixRQUFsQyxFQUE0QztBQUMxQyxZQUFNLElBQUk1UixTQUFKLENBQWMsNEJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQ2dQLGFBQWYsS0FBaUMsUUFBckMsRUFBK0M7QUFDN0MsWUFBTSxJQUFJN1IsU0FBSixDQUFjLCtCQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUN3TyxPQUFmLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDLFlBQU0sSUFBSXJSLFNBQUosQ0FBYywyQkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDeU8sVUFBZixLQUE4QixVQUFsQyxFQUE4QztBQUM1QyxZQUFNLElBQUl0UixTQUFKLENBQWMsOEJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQzBPLFFBQWYsS0FBNEIsVUFBaEMsRUFBNEM7QUFDMUMsWUFBTSxJQUFJdlIsU0FBSixDQUFjLDRCQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUMyTyxPQUFmLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDLFlBQU0sSUFBSXhSLFNBQUosQ0FBYywyQkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDNE8sVUFBZixLQUE4QixVQUFsQyxFQUE4QztBQUM1QyxZQUFNLElBQUl6UixTQUFKLENBQWMsOEJBQWQsQ0FBTjtBQUNEOztBQUNELFFBQUksT0FBTzZDLE9BQU8sQ0FBQzZPLE9BQWYsS0FBMkIsVUFBL0IsRUFBMkM7QUFDekMsWUFBTSxJQUFJMVIsU0FBSixDQUFjLDJCQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLE9BQU82QyxPQUFPLENBQUM4TyxNQUFmLEtBQTBCLFVBQTlCLEVBQTBDO0FBQ3hDLFlBQU0sSUFBSTNSLFNBQUosQ0FBYywwQkFBZCxDQUFOO0FBQ0Q7O0FBQ0QsUUFBSSxPQUFPNkMsT0FBTyxDQUFDdEUsS0FBZixLQUF5QixRQUF6QixJQUFxQyxFQUFFc0UsT0FBTyxDQUFDdEUsS0FBUixZQUF5QkwsS0FBM0IsQ0FBekMsRUFBNEU7QUFDMUUsWUFBTSxJQUFJOEIsU0FBSixDQUFjLHNFQUFkLENBQU47QUFDRCxLQTlFa0IsQ0FnRm5COzs7QUFDQXVELFFBQUksQ0FBQ3lOLFFBQUwsR0FBZ0JuTyxPQUFPLENBQUNtTyxRQUF4QjtBQUNBek4sUUFBSSxDQUFDME4sUUFBTCxHQUFnQnJGLFVBQVUsQ0FBQy9JLE9BQU8sQ0FBQ29PLFFBQVQsQ0FBMUI7QUFDQTFOLFFBQUksQ0FBQzJOLFNBQUwsR0FBaUI1TixRQUFRLENBQUNULE9BQU8sQ0FBQ3FPLFNBQVQsQ0FBekI7QUFDQTNOLFFBQUksQ0FBQzROLFlBQUwsR0FBb0I3TixRQUFRLENBQUNULE9BQU8sQ0FBQ3NPLFlBQVQsQ0FBNUI7QUFDQTVOLFFBQUksQ0FBQzZOLFFBQUwsR0FBZ0I5TixRQUFRLENBQUNULE9BQU8sQ0FBQ3VPLFFBQVQsQ0FBeEI7QUFDQTdOLFFBQUksQ0FBQ3FPLFVBQUwsR0FBa0J0TyxRQUFRLENBQUNULE9BQU8sQ0FBQytPLFVBQVQsQ0FBMUI7QUFDQXJPLFFBQUksQ0FBQ3NPLGFBQUwsR0FBcUJ2TyxRQUFRLENBQUNULE9BQU8sQ0FBQ2dQLGFBQVQsQ0FBN0I7QUFDQXRPLFFBQUksQ0FBQzhOLE9BQUwsR0FBZXhPLE9BQU8sQ0FBQ3dPLE9BQXZCO0FBQ0E5TixRQUFJLENBQUMrTixVQUFMLEdBQWtCek8sT0FBTyxDQUFDeU8sVUFBMUI7QUFDQS9OLFFBQUksQ0FBQ2dPLFFBQUwsR0FBZ0IxTyxPQUFPLENBQUMwTyxRQUF4QjtBQUNBaE8sUUFBSSxDQUFDaU8sT0FBTCxHQUFlM08sT0FBTyxDQUFDMk8sT0FBdkI7QUFDQWpPLFFBQUksQ0FBQ2tPLFVBQUwsR0FBa0I1TyxPQUFPLENBQUM0TyxVQUExQjtBQUNBbE8sUUFBSSxDQUFDbU8sT0FBTCxHQUFlN08sT0FBTyxDQUFDNk8sT0FBdkI7QUFDQW5PLFFBQUksQ0FBQ29PLE1BQUwsR0FBYzlPLE9BQU8sQ0FBQzhPLE1BQXRCLENBOUZtQixDQWdHbkI7O0FBQ0EsUUFBSXBULEtBQUssR0FBR3NFLE9BQU8sQ0FBQ3RFLEtBQXBCO0FBQ0EsUUFBSWdSLElBQUksR0FBRzFNLE9BQU8sQ0FBQzBNLElBQW5CO0FBQ0EsUUFBSTBDLGNBQWMsR0FBRyxHQUFyQjtBQUNBLFFBQUk5UyxJQUFJLEdBQUcwRCxPQUFPLENBQUMxRCxJQUFuQjtBQUNBLFFBQUlxQixNQUFNLEdBQUcsSUFBYjtBQUNBLFFBQUkwUixNQUFNLEdBQUcsQ0FBYjtBQUNBLFFBQUlDLE1BQU0sR0FBRyxDQUFiO0FBQ0EsUUFBSXBGLEtBQUssR0FBR3dDLElBQUksQ0FBQzFLLElBQWpCO0FBQ0EsUUFBSXVOLEtBQUssR0FBRyxDQUFaO0FBQ0EsUUFBSUMsT0FBTyxHQUFHLElBQWQ7QUFDQSxRQUFJL0wsS0FBSyxHQUFHLElBQVo7QUFDQSxRQUFJd0IsUUFBUSxHQUFHLEtBQWY7QUFDQSxRQUFJQyxTQUFTLEdBQUcsS0FBaEI7QUFFQSxRQUFJdUssS0FBSyxHQUFHLElBQVo7QUFDQSxRQUFJQyxLQUFLLEdBQUcsSUFBWjtBQUVBLFFBQUlDLFdBQVcsR0FBRyxDQUFsQjtBQUNBLFFBQUlDLFNBQVMsR0FBRyxDQUFoQixDQW5IbUIsQ0FxSG5COztBQUNBLFFBQUlsVSxLQUFLLFlBQVlMLEtBQXJCLEVBQTRCO0FBQzFCSyxXQUFLLEdBQUdBLEtBQUssQ0FBQzBCLE9BQU4sRUFBUjtBQUNELEtBeEhrQixDQTBIbkI7OztBQUNBZCxRQUFJLENBQUNaLEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxhQUFTbVUsTUFBVCxHQUFrQjtBQUNoQjtBQUNBL1UsWUFBTSxDQUFDbUQsSUFBUCxDQUFZLGFBQVosRUFBMkJOLE1BQTNCLEVBQW1DakMsS0FBbkMsRUFBMEMrSCxLQUExQyxFQUFpRCxVQUFVUixHQUFWLEVBQWU2TSxZQUFmLEVBQTZCO0FBQzVFLFlBQUk3TSxHQUFKLEVBQVM7QUFDUHZDLGNBQUksQ0FBQ2lPLE9BQUwsQ0FBYTFMLEdBQWIsRUFBa0IzRyxJQUFsQjtBQUNBb0UsY0FBSSxDQUFDcVAsS0FBTDtBQUNELFNBSEQsTUFHTyxJQUFJRCxZQUFKLEVBQWtCO0FBQ3ZCNUssbUJBQVMsR0FBRyxLQUFaO0FBQ0FELGtCQUFRLEdBQUcsSUFBWDtBQUNBM0ksY0FBSSxHQUFHd1QsWUFBUDtBQUNBcFAsY0FBSSxDQUFDK04sVUFBTCxDQUFnQnFCLFlBQWhCO0FBQ0Q7QUFDRixPQVZEO0FBV0Q7QUFFRDs7Ozs7QUFHQXBQLFFBQUksQ0FBQ3FQLEtBQUwsR0FBYSxZQUFZO0FBQ3ZCO0FBQ0FqVixZQUFNLENBQUNtRCxJQUFQLENBQVksV0FBWixFQUF5Qk4sTUFBekIsRUFBaUNqQyxLQUFqQyxFQUF3QytILEtBQXhDLEVBQStDLFVBQVVSLEdBQVYsRUFBZUQsTUFBZixFQUF1QjtBQUNwRSxZQUFJQyxHQUFKLEVBQVM7QUFDUHZDLGNBQUksQ0FBQ2lPLE9BQUwsQ0FBYTFMLEdBQWIsRUFBa0IzRyxJQUFsQjtBQUNEO0FBQ0YsT0FKRCxFQUZ1QixDQVF2Qjs7QUFDQTRJLGVBQVMsR0FBRyxLQUFaO0FBQ0F2SCxZQUFNLEdBQUcsSUFBVDtBQUNBMFIsWUFBTSxHQUFHLENBQVQ7QUFDQUUsV0FBSyxHQUFHLENBQVI7QUFDQUQsWUFBTSxHQUFHLENBQVQ7QUFDQXJLLGNBQVEsR0FBRyxLQUFYO0FBQ0EySyxlQUFTLEdBQUcsSUFBWjtBQUNBbFAsVUFBSSxDQUFDOE4sT0FBTCxDQUFhbFMsSUFBYjtBQUNELEtBakJEO0FBbUJBOzs7Ozs7QUFJQW9FLFFBQUksQ0FBQ3NQLGVBQUwsR0FBdUIsWUFBWTtBQUNqQyxVQUFJQyxPQUFPLEdBQUd2UCxJQUFJLENBQUN3UCxjQUFMLEtBQXdCLElBQXRDO0FBQ0EsYUFBT3hQLElBQUksQ0FBQ3lQLFNBQUwsS0FBbUJGLE9BQTFCO0FBQ0QsS0FIRDtBQUtBOzs7Ozs7QUFJQXZQLFFBQUksQ0FBQ3dQLGNBQUwsR0FBc0IsWUFBWTtBQUNoQyxVQUFJTixTQUFTLElBQUlsUCxJQUFJLENBQUMwUCxXQUFMLEVBQWpCLEVBQXFDO0FBQ25DLGVBQU9ULFdBQVcsSUFBSTlGLElBQUksQ0FBQ3dHLEdBQUwsS0FBYVQsU0FBakIsQ0FBbEI7QUFDRDs7QUFDRCxhQUFPRCxXQUFQO0FBQ0QsS0FMRDtBQU9BOzs7Ozs7QUFJQWpQLFFBQUksQ0FBQzRQLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLGFBQU9oVSxJQUFQO0FBQ0QsS0FGRDtBQUlBOzs7Ozs7QUFJQW9FLFFBQUksQ0FBQ3lQLFNBQUwsR0FBaUIsWUFBWTtBQUMzQixhQUFPYixNQUFQO0FBQ0QsS0FGRDtBQUlBOzs7Ozs7QUFJQTVPLFFBQUksQ0FBQzZQLFdBQUwsR0FBbUIsWUFBWTtBQUM3QixhQUFPdEgsSUFBSSxDQUFDQyxHQUFMLENBQVVvRyxNQUFNLEdBQUdwRixLQUFWLEdBQW1CLEdBQW5CLEdBQXlCLEdBQWxDLEVBQXVDLEdBQXZDLENBQVA7QUFDRCxLQUZEO0FBSUE7Ozs7OztBQUlBeEosUUFBSSxDQUFDOFAsZ0JBQUwsR0FBd0IsWUFBWTtBQUNsQyxVQUFJQyxZQUFZLEdBQUcvUCxJQUFJLENBQUNzUCxlQUFMLEVBQW5CO0FBQ0EsVUFBSVUsY0FBYyxHQUFHeEcsS0FBSyxHQUFHeEosSUFBSSxDQUFDeVAsU0FBTCxFQUE3QjtBQUNBLGFBQU9NLFlBQVksSUFBSUMsY0FBaEIsR0FBaUN6SCxJQUFJLENBQUMwSCxHQUFMLENBQVNELGNBQWMsR0FBR0QsWUFBMUIsRUFBd0MsQ0FBeEMsQ0FBakMsR0FBOEUsQ0FBckY7QUFDRCxLQUpEO0FBTUE7Ozs7OztBQUlBL1AsUUFBSSxDQUFDa1EsUUFBTCxHQUFnQixZQUFZO0FBQzFCLFVBQUluQixLQUFLLElBQUlDLEtBQVQsSUFBa0JoUCxJQUFJLENBQUMwUCxXQUFMLEVBQXRCLEVBQTBDO0FBQ3hDLFlBQUlILE9BQU8sR0FBRyxDQUFDUCxLQUFLLEdBQUdELEtBQVQsSUFBa0IsSUFBaEM7QUFDQSxlQUFPL08sSUFBSSxDQUFDMk4sU0FBTCxHQUFpQjRCLE9BQXhCO0FBQ0Q7O0FBQ0QsYUFBTyxDQUFQO0FBQ0QsS0FORDtBQVFBOzs7Ozs7QUFJQXZQLFFBQUksQ0FBQ21RLFFBQUwsR0FBZ0IsWUFBWTtBQUMxQixhQUFPM0csS0FBUDtBQUNELEtBRkQ7QUFJQTs7Ozs7O0FBSUF4SixRQUFJLENBQUNvUSxVQUFMLEdBQWtCLFlBQVk7QUFDNUIsYUFBTzdMLFFBQVA7QUFDRCxLQUZEO0FBSUE7Ozs7OztBQUlBdkUsUUFBSSxDQUFDMFAsV0FBTCxHQUFtQixZQUFZO0FBQzdCLGFBQU9sTCxTQUFQO0FBQ0QsS0FGRDtBQUlBOzs7Ozs7Ozs7QUFPQXhFLFFBQUksQ0FBQ3FRLFNBQUwsR0FBaUIsVUFBVXpHLEtBQVYsRUFBaUIvSyxNQUFqQixFQUF5QnZCLFFBQXpCLEVBQW1DO0FBQ2xELFVBQUksT0FBT0EsUUFBUCxJQUFtQixVQUF2QixFQUFtQztBQUNqQyxjQUFNLElBQUlnRCxLQUFKLENBQVUsK0JBQVYsQ0FBTjtBQUNEOztBQUNELFVBQUk7QUFDRixZQUFJcUgsR0FBSixDQURFLENBR0Y7O0FBQ0EsWUFBSTlJLE1BQU0sSUFBSStLLEtBQUssR0FBRy9LLE1BQVIsR0FBaUIySyxLQUEvQixFQUFzQztBQUNwQzdCLGFBQUcsR0FBRzZCLEtBQU47QUFDRCxTQUZELE1BRU87QUFDTDdCLGFBQUcsR0FBR2lDLEtBQUssR0FBRy9LLE1BQWQ7QUFDRCxTQVJDLENBU0Y7OztBQUNBLFlBQUk0SixLQUFLLEdBQUd1RCxJQUFJLENBQUNzRSxLQUFMLENBQVcxRyxLQUFYLEVBQWtCakMsR0FBbEIsQ0FBWixDQVZFLENBV0Y7O0FBQ0FySyxnQkFBUSxDQUFDQyxJQUFULENBQWN5QyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCeUksS0FBMUI7QUFFRCxPQWRELENBY0UsT0FBT2xHLEdBQVAsRUFBWTtBQUNaN0UsZUFBTyxDQUFDQyxLQUFSLENBQWMsWUFBZCxFQUE0QjRFLEdBQTVCLEVBRFksQ0FFWjs7QUFDQW5JLGNBQU0sQ0FBQ21XLFVBQVAsQ0FBa0IsWUFBWTtBQUM1QixjQUFJMUIsS0FBSyxHQUFHN08sSUFBSSxDQUFDNk4sUUFBakIsRUFBMkI7QUFDekJnQixpQkFBSyxJQUFJLENBQVQ7QUFDQTdPLGdCQUFJLENBQUNxUSxTQUFMLENBQWV6RyxLQUFmLEVBQXNCL0ssTUFBdEIsRUFBOEJ2QixRQUE5QjtBQUNEO0FBQ0YsU0FMRCxFQUtHMEMsSUFBSSxDQUFDcU8sVUFMUjtBQU1EO0FBQ0YsS0E1QkQ7QUE4QkE7Ozs7O0FBR0FyTyxRQUFJLENBQUN3USxTQUFMLEdBQWlCLFlBQVk7QUFDM0IsVUFBSSxDQUFDak0sUUFBRCxJQUFhMkssU0FBUyxLQUFLLElBQS9CLEVBQXFDO0FBQ25DLFlBQUlQLE1BQU0sR0FBR25GLEtBQWIsRUFBb0I7QUFDbEIsY0FBSW1FLFNBQVMsR0FBRzNOLElBQUksQ0FBQzJOLFNBQXJCLENBRGtCLENBR2xCOztBQUNBLGNBQUkzTixJQUFJLENBQUN5TixRQUFMLElBQWlCc0IsS0FBakIsSUFBMEJDLEtBQTFCLElBQW1DQSxLQUFLLEdBQUdELEtBQS9DLEVBQXNEO0FBQ3BELGdCQUFJMEIsUUFBUSxHQUFHLENBQUN6QixLQUFLLEdBQUdELEtBQVQsSUFBa0IsSUFBakM7QUFDQSxnQkFBSWtCLEdBQUcsR0FBR2pRLElBQUksQ0FBQzBOLFFBQUwsSUFBaUIsSUFBSWdCLGNBQXJCLENBQVY7QUFDQSxnQkFBSWxHLEdBQUcsR0FBR3hJLElBQUksQ0FBQzBOLFFBQUwsSUFBaUIsSUFBSWdCLGNBQXJCLENBQVY7O0FBRUEsZ0JBQUkrQixRQUFRLElBQUlSLEdBQWhCLEVBQXFCO0FBQ25CdEMsdUJBQVMsR0FBR3BGLElBQUksQ0FBQ21JLEdBQUwsQ0FBU25JLElBQUksQ0FBQ3FFLEtBQUwsQ0FBV2UsU0FBUyxJQUFJc0MsR0FBRyxHQUFHUSxRQUFWLENBQXBCLENBQVQsQ0FBWjtBQUVELGFBSEQsTUFHTyxJQUFJQSxRQUFRLEdBQUdqSSxHQUFmLEVBQW9CO0FBQ3pCbUYsdUJBQVMsR0FBR3BGLElBQUksQ0FBQ3FFLEtBQUwsQ0FBV2UsU0FBUyxJQUFJbkYsR0FBRyxHQUFHaUksUUFBVixDQUFwQixDQUFaO0FBQ0QsYUFWbUQsQ0FXcEQ7OztBQUNBLGdCQUFJelEsSUFBSSxDQUFDNE4sWUFBTCxHQUFvQixDQUFwQixJQUF5QkQsU0FBUyxHQUFHM04sSUFBSSxDQUFDNE4sWUFBOUMsRUFBNEQ7QUFDMURELHVCQUFTLEdBQUczTixJQUFJLENBQUM0TixZQUFqQjtBQUNEO0FBQ0YsV0FuQmlCLENBcUJsQjs7O0FBQ0EsY0FBSWUsTUFBTSxHQUFHaEIsU0FBVCxHQUFxQm5FLEtBQXpCLEVBQWdDO0FBQzlCbUUscUJBQVMsR0FBR25FLEtBQUssR0FBR21GLE1BQXBCO0FBQ0QsV0F4QmlCLENBMEJsQjs7O0FBQ0EzTyxjQUFJLENBQUNxUSxTQUFMLENBQWUxQixNQUFmLEVBQXVCaEIsU0FBdkIsRUFBa0MsVUFBVXBMLEdBQVYsRUFBZWtHLEtBQWYsRUFBc0I7QUFDdEQsZ0JBQUlsRyxHQUFKLEVBQVM7QUFDUHZDLGtCQUFJLENBQUNpTyxPQUFMLENBQWExTCxHQUFiLEVBQWtCM0csSUFBbEI7QUFDQTtBQUNEOztBQUVELGdCQUFJK1UsR0FBRyxHQUFHLElBQUlDLGNBQUosRUFBVjs7QUFDQUQsZUFBRyxDQUFDRSxrQkFBSixHQUF5QixZQUFZO0FBQ25DLGtCQUFJRixHQUFHLENBQUNHLFVBQUosS0FBbUIsQ0FBdkIsRUFBMEI7QUFDeEIsb0JBQUksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUJwUCxRQUFyQixDQUE4QmlQLEdBQUcsQ0FBQzNILE1BQWxDLENBQUosRUFBK0M7QUFDN0NnRyx1QkFBSyxHQUFHN0YsSUFBSSxDQUFDd0csR0FBTCxFQUFSO0FBQ0FoQix3QkFBTSxJQUFJaEIsU0FBVjtBQUNBaUIsd0JBQU0sSUFBSWpCLFNBQVYsQ0FINkMsQ0FLN0M7O0FBQ0EzTixzQkFBSSxDQUFDa08sVUFBTCxDQUFnQnRTLElBQWhCLEVBQXNCb0UsSUFBSSxDQUFDNlAsV0FBTCxFQUF0QixFQU42QyxDQVE3Qzs7QUFDQSxzQkFBSWpCLE1BQU0sSUFBSXBGLEtBQWQsRUFBcUI7QUFDbkJ5RiwrQkFBVyxHQUFHOUYsSUFBSSxDQUFDd0csR0FBTCxLQUFhVCxTQUEzQjtBQUNBQywwQkFBTTtBQUNQLG1CQUhELE1BR087QUFDTC9VLDBCQUFNLENBQUNtVyxVQUFQLENBQWtCdlEsSUFBSSxDQUFDd1EsU0FBdkIsRUFBa0N4USxJQUFJLENBQUNzTyxhQUF2QztBQUNEO0FBQ0YsaUJBZkQsTUFlTyxJQUFJLENBQUMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUI1TSxRQUFyQixDQUE4QmlQLEdBQUcsQ0FBQzNILE1BQWxDLENBQUwsRUFBZ0Q7QUFDckQ7QUFDQTtBQUNBLHNCQUFJNkYsS0FBSyxJQUFJN08sSUFBSSxDQUFDNk4sUUFBbEIsRUFBNEI7QUFDMUJnQix5QkFBSyxJQUFJLENBQVQsQ0FEMEIsQ0FFMUI7O0FBQ0F6VSwwQkFBTSxDQUFDbVcsVUFBUCxDQUFrQnZRLElBQUksQ0FBQ3dRLFNBQXZCLEVBQWtDeFEsSUFBSSxDQUFDcU8sVUFBdkM7QUFDRCxtQkFKRCxNQUlPO0FBQ0xyTyx3QkFBSSxDQUFDcVAsS0FBTDtBQUNEO0FBQ0YsaUJBVk0sTUFVQTtBQUNMclAsc0JBQUksQ0FBQ3FQLEtBQUw7QUFDRDtBQUNGO0FBQ0YsYUEvQkQsQ0FQc0QsQ0F3Q3REOzs7QUFDQSxnQkFBSTFLLFFBQVEsR0FBRyxDQUFDZ0ssTUFBTSxHQUFHaEIsU0FBVixJQUF1Qm5FLEtBQXRDLENBekNzRCxDQTBDdEQ7QUFDQTtBQUNBOztBQUNBLGdCQUFJbk0sR0FBRyxhQUFNeVIsT0FBTix1QkFBMEJuSyxRQUExQixDQUFQO0FBRUFvSyxpQkFBSyxHQUFHNUYsSUFBSSxDQUFDd0csR0FBTCxFQUFSO0FBQ0FYLGlCQUFLLEdBQUcsSUFBUjtBQUNBeEsscUJBQVMsR0FBRyxJQUFaLENBakRzRCxDQW1EdEQ7O0FBQ0FtTSxlQUFHLENBQUNJLElBQUosQ0FBUyxNQUFULEVBQWlCMVQsR0FBakIsRUFBc0IsSUFBdEI7QUFDQXNULGVBQUcsQ0FBQ0ssSUFBSixDQUFTdkksS0FBVDtBQUNELFdBdEREO0FBdUREO0FBQ0Y7QUFDRixLQXRGRDtBQXdGQTs7Ozs7QUFHQXpJLFFBQUksQ0FBQzRKLEtBQUwsR0FBYSxZQUFZO0FBQ3ZCLFVBQUksQ0FBQzNNLE1BQUwsRUFBYTtBQUNYO0FBQ0E7QUFDQTdDLGNBQU0sQ0FBQ21ELElBQVAsQ0FBWSxXQUFaLEVBQXlCNkIsQ0FBQyxDQUFDRyxNQUFGLENBQVMsRUFBVCxFQUFhM0QsSUFBYixDQUF6QixFQUE2QyxVQUFVMkcsR0FBVixFQUFlRCxNQUFmLEVBQXVCO0FBQ2xFLGNBQUlDLEdBQUosRUFBUztBQUNQdkMsZ0JBQUksQ0FBQ2lPLE9BQUwsQ0FBYTFMLEdBQWIsRUFBa0IzRyxJQUFsQjtBQUNELFdBRkQsTUFFTyxJQUFJMEcsTUFBSixFQUFZO0FBQ2pCUyxpQkFBSyxHQUFHVCxNQUFNLENBQUNTLEtBQWY7QUFDQStMLG1CQUFPLEdBQUd4TSxNQUFNLENBQUNqRixHQUFqQjtBQUNBSixrQkFBTSxHQUFHcUYsTUFBTSxDQUFDckYsTUFBaEI7QUFDQXJCLGdCQUFJLENBQUNELEdBQUwsR0FBVzJHLE1BQU0sQ0FBQ3JGLE1BQWxCO0FBQ0ErQyxnQkFBSSxDQUFDZ08sUUFBTCxDQUFjcFMsSUFBZDtBQUNBaVQsaUJBQUssR0FBRyxDQUFSO0FBQ0FLLHFCQUFTLEdBQUcvRixJQUFJLENBQUN3RyxHQUFMLEVBQVo7QUFDQTNQLGdCQUFJLENBQUNtTyxPQUFMLENBQWF2UyxJQUFiO0FBQ0FvRSxnQkFBSSxDQUFDd1EsU0FBTDtBQUNEO0FBQ0YsU0FkRDtBQWVELE9BbEJELE1Ba0JPLElBQUksQ0FBQ2hNLFNBQUQsSUFBYyxDQUFDRCxRQUFuQixFQUE2QjtBQUNsQztBQUNBc0ssYUFBSyxHQUFHLENBQVI7QUFDQUssaUJBQVMsR0FBRy9GLElBQUksQ0FBQ3dHLEdBQUwsRUFBWjtBQUNBM1AsWUFBSSxDQUFDbU8sT0FBTCxDQUFhdlMsSUFBYjtBQUNBb0UsWUFBSSxDQUFDd1EsU0FBTDtBQUNEO0FBQ0YsS0ExQkQ7QUE0QkE7Ozs7O0FBR0F4USxRQUFJLENBQUNpUixJQUFMLEdBQVksWUFBWTtBQUN0QixVQUFJek0sU0FBSixFQUFlO0FBQ2I7QUFDQXlLLG1CQUFXLEdBQUc5RixJQUFJLENBQUN3RyxHQUFMLEtBQWFULFNBQTNCO0FBQ0FBLGlCQUFTLEdBQUcsSUFBWjtBQUNBMUssaUJBQVMsR0FBRyxLQUFaO0FBQ0F4RSxZQUFJLENBQUNvTyxNQUFMLENBQVl4UyxJQUFaO0FBRUF4QixjQUFNLENBQUNtRCxJQUFQLENBQVksU0FBWixFQUF1Qk4sTUFBdkIsRUFBK0JqQyxLQUEvQixFQUFzQytILEtBQXRDLEVBQTZDLFVBQVVSLEdBQVYsRUFBZUQsTUFBZixFQUF1QjtBQUNsRSxjQUFJQyxHQUFKLEVBQVM7QUFDUHZDLGdCQUFJLENBQUNpTyxPQUFMLENBQWExTCxHQUFiLEVBQWtCM0csSUFBbEI7QUFDRDtBQUNGLFNBSkQ7QUFLRDtBQUNGLEtBZEQ7QUFlRDtBQUVEOzs7Ozs7QUFJQWtTLFNBQU8sQ0FBQ2xTLElBQUQsRUFBTyxDQUNiO0FBRUQ7Ozs7OztBQUlBbVMsWUFBVSxDQUFDblMsSUFBRCxFQUFPLENBQ2hCO0FBRUQ7Ozs7OztBQUlBb1MsVUFBUSxDQUFDcFMsSUFBRCxFQUFPLENBQ2Q7QUFFRDs7Ozs7OztBQUtBcVMsU0FBTyxDQUFDMUwsR0FBRCxFQUFNM0csSUFBTixFQUFZO0FBQ2pCOEIsV0FBTyxDQUFDQyxLQUFSLGdCQUFzQjRFLEdBQUcsQ0FBQ2UsT0FBMUI7QUFDRDtBQUVEOzs7Ozs7O0FBS0E0SyxZQUFVLENBQUN0UyxJQUFELEVBQU8rSSxRQUFQLEVBQWlCLENBQzFCO0FBRUQ7Ozs7OztBQUlBd0osU0FBTyxDQUFDdlMsSUFBRCxFQUFPLENBQ2I7QUFFRDs7Ozs7O0FBSUF3UyxRQUFNLENBQUN4UyxJQUFELEVBQU8sQ0FDWjs7QUFuZW1CLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2phbGlrX3Vmcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgUmFuZG9tIH0gZnJvbSAnbWV0ZW9yL3JhbmRvbSc7XHJcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4vdWZzLWNvbmZpZyc7XHJcbmltcG9ydCB7IEZpbHRlciB9IGZyb20gJy4vdWZzLWZpbHRlcic7XHJcbmltcG9ydCB7IE1JTUUgfSBmcm9tICcuL3Vmcy1taW1lJztcclxuaW1wb3J0IHsgU3RvcmUgfSBmcm9tICcuL3Vmcy1zdG9yZSc7XHJcbmltcG9ydCB7IFN0b3JlUGVybWlzc2lvbnMgfSBmcm9tICcuL3Vmcy1zdG9yZS1wZXJtaXNzaW9ucyc7XHJcbmltcG9ydCB7IFRva2VucyB9IGZyb20gJy4vdWZzLXRva2Vucyc7XHJcbmltcG9ydCB7IFVwbG9hZGVyIH0gZnJvbSAnLi91ZnMtdXBsb2FkZXInO1xyXG5cclxubGV0IHN0b3JlcyA9IHt9O1xyXG5cclxuZXhwb3J0IGNvbnN0IFVwbG9hZEZTID0ge1xyXG5cclxuICAvKipcclxuICAgKiBDb250YWlucyBhbGwgc3RvcmVzXHJcbiAgICovXHJcbiAgc3RvcmU6IHt9LFxyXG5cclxuICAvKipcclxuICAgKiBDb2xsZWN0aW9uIG9mIHRva2Vuc1xyXG4gICAqL1xyXG4gIHRva2VuczogVG9rZW5zLFxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHRoZSBcImV0YWdcIiBhdHRyaWJ1dGUgdG8gZmlsZXNcclxuICAgKiBAcGFyYW0gd2hlcmVcclxuICAgKi9cclxuICBhZGRFVGFnQXR0cmlidXRlVG9GaWxlcyh3aGVyZSkge1xyXG4gICAgdGhpcy5nZXRTdG9yZXMoKS5mb3JFYWNoKChzdG9yZSkgPT4ge1xyXG4gICAgICBjb25zdCBmaWxlcyA9IHN0b3JlLmdldENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICAgIC8vIEJ5IGRlZmF1bHQgdXBkYXRlIG9ubHkgZmlsZXMgd2l0aCBubyBwYXRoIHNldFxyXG4gICAgICBmaWxlcy5maW5kKHdoZXJlIHx8IHsgZXRhZzogbnVsbCB9LCB7IGZpZWxkczogeyBfaWQ6IDEgfSB9KS5mb3JFYWNoKChmaWxlKSA9PiB7XHJcbiAgICAgICAgZmlsZXMuZGlyZWN0LnVwZGF0ZShmaWxlLl9pZCwgeyAkc2V0OiB7IGV0YWc6IHRoaXMuZ2VuZXJhdGVFdGFnKCkgfSB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHRoZSBNSU1FIHR5cGUgZm9yIGFuIGV4dGVuc2lvblxyXG4gICAqIEBwYXJhbSBleHRlbnNpb25cclxuICAgKiBAcGFyYW0gbWltZVxyXG4gICAqL1xyXG4gIGFkZE1pbWVUeXBlKGV4dGVuc2lvbiwgbWltZSkge1xyXG4gICAgTUlNRVtleHRlbnNpb24udG9Mb3dlckNhc2UoKV0gPSBtaW1lO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgdGhlIFwicGF0aFwiIGF0dHJpYnV0ZSB0byBmaWxlc1xyXG4gICAqIEBwYXJhbSB3aGVyZVxyXG4gICAqL1xyXG4gIGFkZFBhdGhBdHRyaWJ1dGVUb0ZpbGVzKHdoZXJlKSB7XHJcbiAgICB0aGlzLmdldFN0b3JlcygpLmZvckVhY2goKHN0b3JlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gc3RvcmUuZ2V0Q29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgLy8gQnkgZGVmYXVsdCB1cGRhdGUgb25seSBmaWxlcyB3aXRoIG5vIHBhdGggc2V0XHJcbiAgICAgIGZpbGVzLmZpbmQod2hlcmUgfHwgeyBwYXRoOiBudWxsIH0sIHsgZmllbGRzOiB7IF9pZDogMSB9IH0pLmZvckVhY2goKGZpbGUpID0+IHtcclxuICAgICAgICBmaWxlcy5kaXJlY3QudXBkYXRlKGZpbGUuX2lkLCB7ICRzZXQ6IHsgcGF0aDogc3RvcmUuZ2V0RmlsZVJlbGF0aXZlVVJMKGZpbGUuX2lkKSB9IH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVycyB0aGUgc3RvcmVcclxuICAgKiBAcGFyYW0gc3RvcmVcclxuICAgKi9cclxuICBhZGRTdG9yZShzdG9yZSkge1xyXG4gICAgaWYgKCEoc3RvcmUgaW5zdGFuY2VvZiBTdG9yZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdWZzOiBzdG9yZSBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgVXBsb2FkRlMuU3RvcmUuYCk7XHJcbiAgICB9XHJcbiAgICBzdG9yZXNbc3RvcmUuZ2V0TmFtZSgpXSA9IHN0b3JlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBFVGFnXHJcbiAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdlbmVyYXRlRXRhZygpIHtcclxuICAgIHJldHVybiBSYW5kb20uaWQoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBNSU1FIHR5cGUgb2YgdGhlIGV4dGVuc2lvblxyXG4gICAqIEBwYXJhbSBleHRlbnNpb25cclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRNaW1lVHlwZShleHRlbnNpb24pIHtcclxuICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIE1JTUVbZXh0ZW5zaW9uXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBNSU1FIHR5cGVzXHJcbiAgICovXHJcbiAgZ2V0TWltZVR5cGVzKCkge1xyXG4gICAgcmV0dXJuIE1JTUU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RvcmUgYnkgaXRzIG5hbWVcclxuICAgKiBAcGFyYW0gbmFtZVxyXG4gICAqIEByZXR1cm4ge1VwbG9hZEZTLlN0b3JlfVxyXG4gICAqL1xyXG4gIGdldFN0b3JlKG5hbWUpIHtcclxuICAgIHJldHVybiBzdG9yZXNbbmFtZV07XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgc3RvcmVzXHJcbiAgICogQHJldHVybiB7b2JqZWN0fVxyXG4gICAqL1xyXG4gIGdldFN0b3JlcygpIHtcclxuICAgIHJldHVybiBzdG9yZXM7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdGVtcG9yYXJ5IGZpbGUgcGF0aFxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCkge1xyXG4gICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLnRtcERpcn0vJHtmaWxlSWR9YDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJbXBvcnRzIGEgZmlsZSBmcm9tIGEgVVJMXHJcbiAgICogQHBhcmFtIHVybFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICogQHBhcmFtIHN0b3JlXHJcbiAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICovXHJcbiAgaW1wb3J0RnJvbVVSTCh1cmwsIGZpbGUsIHN0b3JlLCBjYWxsYmFjaykge1xyXG4gICAgaWYgKHR5cGVvZiBzdG9yZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0ltcG9ydFVSTCcsIHVybCwgZmlsZSwgc3RvcmUsIGNhbGxiYWNrKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0b3JlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBzdG9yZS5pbXBvcnRGcm9tVVJMKHVybCwgZmlsZSwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgZmlsZSBhbmQgZGF0YSBhcyBBcnJheUJ1ZmZlciBmb3IgZWFjaCBmaWxlcyBpbiB0aGUgZXZlbnRcclxuICAgKiBAZGVwcmVjYXRlZFxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAqL1xyXG4gIHJlYWRBc0FycmF5QnVmZmVyKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgY29uc29sZS5lcnJvcignVXBsb2FkRlMucmVhZEFzQXJyYXlCdWZmZXIgaXMgZGVwcmVjYXRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYWxpay9qYWxpay11ZnMjdXBsb2FkaW5nLWZyb20tYS1maWxlJyk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogT3BlbnMgYSBkaWFsb2cgdG8gc2VsZWN0IGEgc2luZ2xlIGZpbGVcclxuICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgKi9cclxuICBzZWxlY3RGaWxlKGNhbGxiYWNrKSB7XHJcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBpbnB1dC50eXBlID0gJ2ZpbGUnO1xyXG4gICAgaW5wdXQubXVsdGlwbGUgPSBmYWxzZTtcclxuICAgIGlucHV0Lm9uY2hhbmdlID0gKGV2KSA9PiB7XHJcbiAgICAgIGxldCBmaWxlcyA9IGV2LnRhcmdldC5maWxlcztcclxuICAgICAgY2FsbGJhY2suY2FsbChVcGxvYWRGUywgZmlsZXNbMF0pO1xyXG4gICAgfTtcclxuICAgIC8vIEZpeCBmb3IgaU9TL1NhZmFyaVxyXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ3Vmcy1maWxlLXNlbGVjdG9yJztcclxuICAgIGRpdi5zdHlsZSA9ICdkaXNwbGF5Om5vbmU7IGhlaWdodDowOyB3aWR0aDowOyBvdmVyZmxvdzogaGlkZGVuOyc7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgLy8gVHJpZ2dlciBmaWxlIHNlbGVjdGlvblxyXG4gICAgaW5wdXQuY2xpY2soKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBPcGVucyBhIGRpYWxvZyB0byBzZWxlY3QgbXVsdGlwbGUgZmlsZXNcclxuICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgKi9cclxuICBzZWxlY3RGaWxlcyhjYWxsYmFjaykge1xyXG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgaW5wdXQudHlwZSA9ICdmaWxlJztcclxuICAgIGlucHV0Lm11bHRpcGxlID0gdHJ1ZTtcclxuICAgIGlucHV0Lm9uY2hhbmdlID0gKGV2KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gZXYudGFyZ2V0LmZpbGVzO1xyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoVXBsb2FkRlMsIGZpbGVzW2ldKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8vIEZpeCBmb3IgaU9TL1NhZmFyaVxyXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ3Vmcy1maWxlLXNlbGVjdG9yJztcclxuICAgIGRpdi5zdHlsZSA9ICdkaXNwbGF5Om5vbmU7IGhlaWdodDowOyB3aWR0aDowOyBvdmVyZmxvdzogaGlkZGVuOyc7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgLy8gVHJpZ2dlciBmaWxlIHNlbGVjdGlvblxyXG4gICAgaW5wdXQuY2xpY2soKTtcclxuICB9LFxyXG59O1xyXG5cclxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gIHJlcXVpcmUoJy4vdWZzLW1ldGhvZHMnKTtcclxuICByZXF1aXJlKCcuL3Vmcy1zZXJ2ZXInKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwbG9hZEZTIENvbmZpZ3VyYXRpb25cclxuICogQHR5cGUge0NvbmZpZ31cclxuICovXHJcblVwbG9hZEZTLmNvbmZpZyA9IG5ldyBDb25maWcoKTtcclxuXHJcbi8vIEFkZCBjbGFzc2VzIHRvIGdsb2JhbCBuYW1lc3BhY2VcclxuVXBsb2FkRlMuQ29uZmlnID0gQ29uZmlnO1xyXG5VcGxvYWRGUy5GaWx0ZXIgPSBGaWx0ZXI7XHJcblVwbG9hZEZTLlN0b3JlID0gU3RvcmU7XHJcblVwbG9hZEZTLlN0b3JlUGVybWlzc2lvbnMgPSBTdG9yZVBlcm1pc3Npb25zO1xyXG5VcGxvYWRGUy5VcGxvYWRlciA9IFVwbG9hZGVyO1xyXG5cclxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gIC8vIEV4cG9zZSB0aGUgbW9kdWxlIGdsb2JhbGx5XHJcbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBnbG9iYWxbJ1VwbG9hZEZTJ10gPSBVcGxvYWRGUztcclxuICB9XHJcbn0gZWxzZSBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XHJcbiAgLy8gRXhwb3NlIHRoZSBtb2R1bGUgZ2xvYmFsbHlcclxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHdpbmRvdy5VcGxvYWRGUyA9IFVwbG9hZEZTO1xyXG4gIH1cclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcbmltcG9ydCB7IFN0b3JlUGVybWlzc2lvbnMgfSBmcm9tICcuL3Vmcy1zdG9yZS1wZXJtaXNzaW9ucyc7XHJcblxyXG4vKipcclxuICogVXBsb2FkRlMgY29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbmZpZyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgZGVmYXVsdFN0b3JlUGVybWlzc2lvbnM6IG51bGwsXHJcbiAgICAgIGh0dHBzOiBmYWxzZSxcclxuICAgICAgc2ltdWxhdGVSZWFkRGVsYXk6IDAsXHJcbiAgICAgIHNpbXVsYXRlVXBsb2FkU3BlZWQ6IDAsXHJcbiAgICAgIHNpbXVsYXRlV3JpdGVEZWxheTogMCxcclxuICAgICAgc3RvcmVzUGF0aDogJ3VmcycsXHJcbiAgICAgIHRtcERpcjogJy90bXAvdWZzJyxcclxuICAgICAgdG1wRGlyUGVybWlzc2lvbnM6ICcwNzAwJyxcclxuICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgIGlmIChvcHRpb25zLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zICYmICEob3B0aW9ucy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMgaXMgbm90IGFuIGluc3RhbmNlIG9mIFN0b3JlUGVybWlzc2lvbnMnKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5odHRwcyAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogaHR0cHMgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaW11bGF0ZVJlYWREZWxheSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiBzaW11bGF0ZVJlYWREZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaW11bGF0ZVVwbG9hZFNwZWVkICE9PSAnbnVtYmVyJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHNpbXVsYXRlVXBsb2FkU3BlZWQgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2ltdWxhdGVXcml0ZURlbGF5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHNpbXVsYXRlV3JpdGVEZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zdG9yZXNQYXRoICE9PSAnc3RyaW5nJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHN0b3Jlc1BhdGggaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMudG1wRGlyICE9PSAnc3RyaW5nJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHRtcERpciBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50bXBEaXJQZXJtaXNzaW9ucyAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiB0bXBEaXJQZXJtaXNzaW9ucyBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmF1bHQgc3RvcmUgcGVybWlzc2lvbnNcclxuICAgICAqIEB0eXBlIHtVcGxvYWRGUy5TdG9yZVBlcm1pc3Npb25zfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zID0gb3B0aW9ucy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucztcclxuICAgIC8qKlxyXG4gICAgICogVXNlIG9yIG5vdCBzZWN1cmVkIHByb3RvY29sIGluIFVSTFNcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICB0aGlzLmh0dHBzID0gb3B0aW9ucy5odHRwcztcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNpbXVsYXRpb24gcmVhZCBkZWxheVxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5zaW11bGF0ZVJlYWREZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuc2ltdWxhdGVSZWFkRGVsYXkpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2ltdWxhdGlvbiB1cGxvYWQgc3BlZWRcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuc2ltdWxhdGVVcGxvYWRTcGVlZCA9IHBhcnNlSW50KG9wdGlvbnMuc2ltdWxhdGVVcGxvYWRTcGVlZCk7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzaW11bGF0aW9uIHdyaXRlIGRlbGF5XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNpbXVsYXRlV3JpdGVEZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuc2ltdWxhdGVXcml0ZURlbGF5KTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFVSTCByb290IHBhdGggb2Ygc3RvcmVzXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnN0b3Jlc1BhdGggPSBvcHRpb25zLnN0b3Jlc1BhdGg7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IG9mIHVwbG9hZGluZyBmaWxlc1xyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgdGhpcy50bXBEaXIgPSBvcHRpb25zLnRtcERpcjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHBlcm1pc3Npb25zIG9mIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnRtcERpclBlcm1pc3Npb25zID0gb3B0aW9ucy50bXBEaXJQZXJtaXNzaW9ucztcclxuICB9XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEZpbGUgZmlsdGVyXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRmlsdGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICBjb250ZW50VHlwZXM6IG51bGwsXHJcbiAgICAgIGV4dGVuc2lvbnM6IG51bGwsXHJcbiAgICAgIG1pblNpemU6IDEsXHJcbiAgICAgIG1heFNpemU6IDAsXHJcbiAgICAgIGludmFsaWRGaWxlRXJyb3I6ICgpID0+IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZScsICdGaWxlIGlzIG5vdCB2YWxpZCcpLFxyXG4gICAgICBmaWxlVG9vU21hbGxFcnJvcjogKGZpbGVTaXplLCBtaW5GaWxlU2l6ZSkgPT4gbmV3IE1ldGVvci5FcnJvcignZmlsZS10b28tc21hbGwnLCBgRmlsZSBzaXplIChzaXplID0gJHtmaWxlU2l6ZX0pIGlzIHRvbyBzbWFsbCAobWluID0gJHttaW5GaWxlU2l6ZX0pYCksXHJcbiAgICAgIGZpbGVUb29MYXJnZUVycm9yOiAoZmlsZVNpemUsIG1heEZpbGVTaXplKSA9PiBuZXcgTWV0ZW9yLkVycm9yKCdmaWxlLXRvby1sYXJnZScsIGBGaWxlIHNpemUgKHNpemUgPSAke2ZpbGVTaXplfSkgaXMgdG9vIGxhcmdlIChtYXggPSAke21heEZpbGVTaXplfSlgKSxcclxuICAgICAgaW52YWxpZEZpbGVFeHRlbnNpb246IChmaWxlRXh0ZW5zaW9uLCBhbGxvd2VkRXh0ZW5zaW9ucykgPT4gbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlLWV4dGVuc2lvbicsIGBGaWxlIGV4dGVuc2lvbiBcIiR7ZmlsZUV4dGVuc2lvbn1cIiBpcyBub3QgYWNjZXB0ZWQgKCR7YWxsb3dlZEV4dGVuc2lvbnN9KWApLFxyXG4gICAgICBpbnZhbGlkRmlsZVR5cGU6IChmaWxlVHlwZSwgYWxsb3dlZENvbnRlbnRUeXBlcykgPT4gbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlLXR5cGUnLCBgRmlsZSB0eXBlIFwiJHtmaWxlVHlwZX1cIiBpcyBub3QgYWNjZXB0ZWQgKCR7YWxsb3dlZENvbnRlbnRUeXBlc30pYCksXHJcbiAgICAgIG9uQ2hlY2s6IHRoaXMub25DaGVjayxcclxuICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgIGlmIChvcHRpb25zLmNvbnRlbnRUeXBlcyAmJiAhKG9wdGlvbnMuY29udGVudFR5cGVzIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpbHRlcjogY29udGVudFR5cGVzIGlzIG5vdCBhbiBBcnJheScpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhKG9wdGlvbnMuZXh0ZW5zaW9ucyBpbnN0YW5jZW9mIEFycmF5KSkge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaWx0ZXI6IGV4dGVuc2lvbnMgaXMgbm90IGFuIEFycmF5Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMubWluU2l6ZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlsdGVyOiBtaW5TaXplIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLm1heFNpemUgIT09ICdudW1iZXInKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpbHRlcjogbWF4U2l6ZSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLm9uQ2hlY2sgJiYgdHlwZW9mIG9wdGlvbnMub25DaGVjayAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaWx0ZXI6IG9uQ2hlY2sgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQdWJsaWMgYXR0cmlidXRlc1xyXG4gICAgc2VsZi5vcHRpb25zID0gb3B0aW9ucztcclxuICAgIFsnb25DaGVjayddLmZvckVhY2goKG1ldGhvZCkgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnNbbWV0aG9kXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHNlbGZbbWV0aG9kXSA9IG9wdGlvbnNbbWV0aG9kXTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgdGhlIGZpbGVcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIGNoZWNrKGZpbGUpIHtcclxuICAgIGxldCBlcnJvciA9IG51bGw7XHJcbiAgICBpZiAodHlwZW9mIGZpbGUgIT09ICdvYmplY3QnIHx8ICFmaWxlKSB7XHJcbiAgICAgIGVycm9yID0gdGhpcy5vcHRpb25zLmludmFsaWRGaWxlRXJyb3IoKTtcclxuICAgIH1cclxuICAgIC8vIENoZWNrIHNpemVcclxuICAgIGxldCBmaWxlU2l6ZSA9IGZpbGUuc2l6ZTtcclxuICAgIGxldCBtaW5TaXplID0gdGhpcy5nZXRNaW5TaXplKCk7XHJcbiAgICBpZiAoZmlsZVNpemUgPD0gMCB8fCBmaWxlU2l6ZSA8IG1pblNpemUpIHtcclxuICAgICAgZXJyb3IgPSB0aGlzLm9wdGlvbnMuZmlsZVRvb1NtYWxsRXJyb3IoZmlsZVNpemUsIG1pblNpemUpO1xyXG4gICAgfVxyXG4gICAgbGV0IG1heFNpemUgPSB0aGlzLmdldE1heFNpemUoKTtcclxuICAgIGlmIChtYXhTaXplID4gMCAmJiBmaWxlU2l6ZSA+IG1heFNpemUpIHtcclxuICAgICAgZXJyb3IgPSB0aGlzLm9wdGlvbnMuZmlsZVRvb0xhcmdlRXJyb3IoZmlsZVNpemUsIG1heFNpemUpO1xyXG4gICAgfVxyXG4gICAgLy8gQ2hlY2sgZXh0ZW5zaW9uXHJcbiAgICBsZXQgYWxsb3dlZEV4dGVuc2lvbnMgPSB0aGlzLmdldEV4dGVuc2lvbnMoKTtcclxuICAgIGxldCBmaWxlRXh0ZW5zaW9uID0gZmlsZS5leHRlbnNpb247XHJcbiAgICBpZiAoYWxsb3dlZEV4dGVuc2lvbnMgJiYgIWFsbG93ZWRFeHRlbnNpb25zLmluY2x1ZGVzKGZpbGVFeHRlbnNpb24pKSB7XHJcbiAgICAgIGVycm9yID0gdGhpcy5vcHRpb25zLmludmFsaWRGaWxlRXh0ZW5zaW9uKGZpbGVFeHRlbnNpb24sIGFsbG93ZWRFeHRlbnNpb25zKTtcclxuICAgIH1cclxuICAgIC8vIENoZWNrIGNvbnRlbnQgdHlwZVxyXG4gICAgbGV0IGFsbG93ZWRDb250ZW50VHlwZXMgPSB0aGlzLmdldENvbnRlbnRUeXBlcygpO1xyXG4gICAgbGV0IGZpbGVUeXBlcyA9IGZpbGUudHlwZTtcclxuICAgIGlmIChhbGxvd2VkQ29udGVudFR5cGVzICYmICF0aGlzLmlzQ29udGVudFR5cGVJbkxpc3QoZmlsZVR5cGVzLCBhbGxvd2VkQ29udGVudFR5cGVzKSkge1xyXG4gICAgICBlcnJvciA9IHRoaXMub3B0aW9ucy5pbnZhbGlkRmlsZVR5cGUoZmlsZVR5cGVzLCBhbGxvd2VkQ29udGVudFR5cGVzKTtcclxuICAgIH1cclxuICAgIC8vIEFwcGx5IGN1c3RvbSBjaGVja1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQ2hlY2sgPT09ICdmdW5jdGlvbicgJiYgIXRoaXMub25DaGVjayhmaWxlKSkge1xyXG4gICAgICBlcnJvciA9IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZScsICdGaWxlIGRvZXMgbm90IG1hdGNoIGZpbHRlcicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGFsbG93ZWQgY29udGVudCB0eXBlc1xyXG4gICAqIEByZXR1cm4ge0FycmF5fVxyXG4gICAqL1xyXG4gIGdldENvbnRlbnRUeXBlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29udGVudFR5cGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYWxsb3dlZCBleHRlbnNpb25zXHJcbiAgICogQHJldHVybiB7QXJyYXl9XHJcbiAgICovXHJcbiAgZ2V0RXh0ZW5zaW9ucygpIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG1heGltdW0gZmlsZSBzaXplXHJcbiAgICogQHJldHVybiB7TnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE1heFNpemUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLm1heFNpemU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIGZpbGUgc2l6ZVxyXG4gICAqIEByZXR1cm4ge051bWJlcn1cclxuICAgKi9cclxuICBnZXRNaW5TaXplKCkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5taW5TaXplO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIGNvbnRlbnQgdHlwZSBpcyBpbiB0aGUgZ2l2ZW4gbGlzdFxyXG4gICAqIEBwYXJhbSB0eXBlXHJcbiAgICogQHBhcmFtIGxpc3RcclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQ29udGVudFR5cGVJbkxpc3QodHlwZSwgbGlzdCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiBsaXN0IGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgaWYgKGxpc3QuaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgd2lsZENhcmRHbG9iID0gJy8qJztcclxuICAgICAgICBsZXQgd2lsZGNhcmRzID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IHtcclxuICAgICAgICAgIHJldHVybiBpdGVtLmluZGV4T2Yod2lsZENhcmRHbG9iKSA+IDA7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh3aWxkY2FyZHMuaW5jbHVkZXModHlwZS5yZXBsYWNlKC8oXFwvLiopJC8sIHdpbGRDYXJkR2xvYikpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgZmlsZSBtYXRjaGVzIGZpbHRlclxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1ZhbGlkKGZpbGUpIHtcclxuICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5jaGVjayhmaWxlKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeGVjdXRlcyBjdXN0b20gY2hlY2tzXHJcbiAgICogQHBhcmFtIGZpbGVcclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAqL1xyXG4gIG9uQ2hlY2soZmlsZSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xyXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgVXBsb2FkRlMgfSBmcm9tICcuL3Vmcyc7XHJcbmltcG9ydCB7IEZpbHRlciB9IGZyb20gJy4vdWZzLWZpbHRlcic7XHJcbmltcG9ydCB7IFRva2VucyB9IGZyb20gJy4vdWZzLXRva2Vucyc7XHJcblxyXG5jb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG5jb25zdCBodHRwID0gTnBtLnJlcXVpcmUoJ2h0dHAnKTtcclxuY29uc3QgaHR0cHMgPSBOcG0ucmVxdWlyZSgnaHR0cHMnKTtcclxuY29uc3QgRnV0dXJlID0gTnBtLnJlcXVpcmUoJ2ZpYmVycy9mdXR1cmUnKTtcclxuXHJcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICBNZXRlb3IubWV0aG9kcyh7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wbGV0ZXMgdGhlIGZpbGUgdHJhbnNmZXJcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBzdG9yZU5hbWVcclxuICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICovXHJcbiAgICB1ZnNDb21wbGV0ZShmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgIGxldCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKHN0b3JlTmFtZSk7XHJcbiAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXN0b3JlJywgJ1N0b3JlIG5vdCBmb3VuZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIENoZWNrIHRva2VuXHJcbiAgICAgIGlmICghc3RvcmUuY2hlY2tUb2tlbih0b2tlbiwgZmlsZUlkKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdG9rZW4nLCAnVG9rZW4gaXMgbm90IHZhbGlkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBmdXQgPSBuZXcgRnV0dXJlKCk7XHJcbiAgICAgIGxldCB0bXBGaWxlID0gVXBsb2FkRlMuZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCk7XHJcblxyXG4gICAgICBjb25zdCByZW1vdmVUZW1wRmlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmcy51bmxpbmsodG1wRmlsZSwgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IGRlbGV0ZSB0ZW1wIGZpbGUgXCIke3RtcEZpbGV9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyB0b2RvIGNoZWNrIGlmIHRlbXAgZmlsZSBleGlzdHNcclxuXHJcbiAgICAgICAgLy8gR2V0IGZpbGVcclxuICAgICAgICBsZXQgZmlsZSA9IHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kT25lKHsgX2lkOiBmaWxlSWQgfSk7XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRlIGZpbGUgYmVmb3JlIG1vdmluZyB0byB0aGUgc3RvcmVcclxuICAgICAgICBzdG9yZS52YWxpZGF0ZShmaWxlKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSB0ZW1wIGZpbGVcclxuICAgICAgICBsZXQgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEZpbGUsIHtcclxuICAgICAgICAgIGZsYWdzOiAncicsXHJcbiAgICAgICAgICBlbmNvZGluZzogbnVsbCxcclxuICAgICAgICAgIGF1dG9DbG9zZTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYW4gdXBsb2FkIGlmIGVycm9yIG9jY3Vyc1xyXG4gICAgICAgIHJzLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7IF9pZDogZmlsZUlkIH0pO1xyXG4gICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAvLyBTYXZlIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgc3RvcmUud3JpdGUocnMsIGZpbGVJZCwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XHJcbiAgICAgICAgICByZW1vdmVUZW1wRmlsZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBGaWxlIGhhcyBiZWVuIGZ1bGx5IHVwbG9hZGVkXHJcbiAgICAgICAgICAgIC8vIHNvIHdlIGRvbid0IG5lZWQgdG8ga2VlcCB0aGUgdG9rZW4gYW55bW9yZS5cclxuICAgICAgICAgICAgLy8gQWxzbyB0aGlzIGVuc3VyZSB0aGF0IHRoZSBmaWxlIGNhbm5vdCBiZSBtb2RpZmllZCB3aXRoIGV4dHJhIGNodW5rcyBsYXRlci5cclxuICAgICAgICAgICAgVG9rZW5zLnJlbW92ZSh7IGZpbGVJZDogZmlsZUlkIH0pO1xyXG4gICAgICAgICAgICBmdXQucmV0dXJuKGZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgLy8gY2F0Y2ggd2lsbCBub3Qgd29yayBpZiBmdXQud2FpdCgpIGlzIG91dHNpZGUgdHJ5L2NhdGNoXHJcbiAgICAgICAgcmV0dXJuIGZ1dC53YWl0KCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIC8vIElmIHdyaXRlIGZhaWxlZCwgcmVtb3ZlIHRoZSBmaWxlXHJcbiAgICAgICAgc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7IF9pZDogZmlsZUlkIH0pO1xyXG4gICAgICAgIC8vIHJlbW92ZVRlbXBGaWxlKCk7IC8vIHRvZG8gcmVtb3ZlIHRlbXAgZmlsZSBvbiBlcnJvciBvciB0cnkgYWdhaW4gP1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ3VmczogY2Fubm90IHVwbG9hZCBmaWxlJywgZXJyKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgdGhlIGZpbGUgYW5kIHJldHVybnMgdGhlIGZpbGUgdXBsb2FkIHRva2VuXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHJldHVybiB7e2ZpbGVJZDogc3RyaW5nLCB0b2tlbjogKiwgdXJsOiAqfX1cclxuICAgICAqL1xyXG4gICAgdWZzQ3JlYXRlKGZpbGUpIHtcclxuICAgICAgY2hlY2soZmlsZSwgT2JqZWN0KTtcclxuXHJcbiAgICAgIGlmICh0eXBlb2YgZmlsZS5uYW1lICE9PSAnc3RyaW5nJyB8fCAhZmlsZS5uYW1lLmxlbmd0aCkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZS1uYW1lJywgJ2ZpbGUgbmFtZSBpcyBub3QgdmFsaWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIGZpbGUuc3RvcmUgIT09ICdzdHJpbmcnIHx8ICFmaWxlLnN0b3JlLmxlbmd0aCkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCAnc3RvcmUgaXMgbm90IHZhbGlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgIGxldCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKGZpbGUuc3RvcmUpO1xyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsICdTdG9yZSBub3QgZm91bmQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IGRlZmF1bHQgaW5mb1xyXG4gICAgICBmaWxlLmNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICAgIGZpbGUudXBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgIGZpbGUuZXh0ZW5zaW9uID0gZmlsZS5uYW1lICYmIGZpbGUubmFtZS5zdWJzdHIoKH4tZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJykgPj4+IDApICsgMikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgLy8gQXNzaWduIGZpbGUgTUlNRSB0eXBlIGJhc2VkIG9uIHRoZSBleHRlbnNpb25cclxuICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uICYmICFmaWxlLnR5cGUpIHtcclxuICAgICAgICBmaWxlLnR5cGUgPSBVcGxvYWRGUy5nZXRNaW1lVHlwZShmaWxlLmV4dGVuc2lvbikgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XHJcbiAgICAgIH1cclxuICAgICAgZmlsZS5wcm9ncmVzcyA9IDA7XHJcbiAgICAgIGZpbGUuc2l6ZSA9IHBhcnNlSW50KGZpbGUuc2l6ZSkgfHwgMDtcclxuICAgICAgZmlsZS51c2VySWQgPSBmaWxlLnVzZXJJZCB8fCB0aGlzLnVzZXJJZDtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBmaWxlIG1hdGNoZXMgc3RvcmUgZmlsdGVyXHJcbiAgICAgIGxldCBmaWx0ZXIgPSBzdG9yZS5nZXRGaWx0ZXIoKTtcclxuICAgICAgaWYgKGZpbHRlciBpbnN0YW5jZW9mIEZpbHRlcikge1xyXG4gICAgICAgIGZpbHRlci5jaGVjayhmaWxlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBmaWxlXHJcbiAgICAgIGxldCBmaWxlSWQgPSBzdG9yZS5jcmVhdGUoZmlsZSk7XHJcbiAgICAgIGxldCB0b2tlbiA9IHN0b3JlLmNyZWF0ZVRva2VuKGZpbGVJZCk7XHJcbiAgICAgIGxldCB1cGxvYWRVcmwgPSBzdG9yZS5nZXRVUkwoYCR7ZmlsZUlkfT90b2tlbj0ke3Rva2VufWApO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICB0b2tlbjogdG9rZW4sXHJcbiAgICAgICAgdXJsOiB1cGxvYWRVcmwsXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVsZXRlcyBhIGZpbGVcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBzdG9yZU5hbWVcclxuICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIHVmc0RlbGV0ZShmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgc3RvcmVcclxuICAgICAgbGV0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoc3RvcmVOYW1lKTtcclxuICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCAnU3RvcmUgbm90IGZvdW5kJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gSWdub3JlIGZpbGVzIHRoYXQgZG9lcyBub3QgZXhpc3RcclxuICAgICAgaWYgKHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kKHsgX2lkOiBmaWxlSWQgfSkuY291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIENoZWNrIHRva2VuXHJcbiAgICAgIGlmICghc3RvcmUuY2hlY2tUb2tlbih0b2tlbiwgZmlsZUlkKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdG9rZW4nLCAnVG9rZW4gaXMgbm90IHZhbGlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0b3JlLmdldENvbGxlY3Rpb24oKS5yZW1vdmUoeyBfaWQ6IGZpbGVJZCB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBvcnRzIGEgZmlsZSBmcm9tIHRoZSBVUkxcclxuICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gc3RvcmVOYW1lXHJcbiAgICAgKiBAcmV0dXJuIHsqfVxyXG4gICAgICovXHJcbiAgICB1ZnNJbXBvcnRVUkwodXJsLCBmaWxlLCBzdG9yZU5hbWUpIHtcclxuICAgICAgY2hlY2sodXJsLCBTdHJpbmcpO1xyXG4gICAgICBjaGVjayhmaWxlLCBPYmplY3QpO1xyXG4gICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcblxyXG4gICAgICAvLyBDaGVjayBVUkxcclxuICAgICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHVybC5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdXJsJywgJ1RoZSB1cmwgaXMgbm90IHZhbGlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQ2hlY2sgZmlsZVxyXG4gICAgICBpZiAodHlwZW9mIGZpbGUgIT09ICdvYmplY3QnIHx8IGZpbGUgPT09IG51bGwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUnLCAnVGhlIGZpbGUgaXMgbm90IHZhbGlkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQ2hlY2sgc3RvcmVcclxuICAgICAgY29uc3Qgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsICdUaGUgc3RvcmUgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRXh0cmFjdCBmaWxlIGluZm9cclxuICAgICAgaWYgKCFmaWxlLm5hbWUpIHtcclxuICAgICAgICBmaWxlLm5hbWUgPSB1cmwucmVwbGFjZSgvXFw/LiokLywgJycpLnNwbGl0KCcvJykucG9wKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGZpbGUubmFtZSAmJiAhZmlsZS5leHRlbnNpb24pIHtcclxuICAgICAgICBmaWxlLmV4dGVuc2lvbiA9IGZpbGUubmFtZSAmJiBmaWxlLm5hbWUuc3Vic3RyKCh+LWZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpID4+PiAwKSArIDIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uICYmICFmaWxlLnR5cGUpIHtcclxuICAgICAgICAvLyBBc3NpZ24gZmlsZSBNSU1FIHR5cGUgYmFzZWQgb24gdGhlIGV4dGVuc2lvblxyXG4gICAgICAgIGZpbGUudHlwZSA9IFVwbG9hZEZTLmdldE1pbWVUeXBlKGZpbGUuZXh0ZW5zaW9uKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcclxuICAgICAgfVxyXG4gICAgICAvLyBDaGVjayBpZiBmaWxlIGlzIHZhbGlkXHJcbiAgICAgIGlmIChzdG9yZS5nZXRGaWx0ZXIoKSBpbnN0YW5jZW9mIEZpbHRlcikge1xyXG4gICAgICAgIHN0b3JlLmdldEZpbHRlcigpLmNoZWNrKGZpbGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZmlsZS5vcmlnaW5hbFVybCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgdWZzOiBUaGUgXCJvcmlnaW5hbFVybFwiIGF0dHJpYnV0ZSBpcyBhdXRvbWF0aWNhbGx5IHNldCB3aGVuIGltcG9ydGluZyBhIGZpbGUgZnJvbSBhIFVSTGApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgb3JpZ2luYWwgVVJMXHJcbiAgICAgIGZpbGUub3JpZ2luYWxVcmwgPSB1cmw7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlIGZpbGVcclxuICAgICAgZmlsZS5jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICBmaWxlLnVwbG9hZGluZyA9IHRydWU7XHJcbiAgICAgIGZpbGUucHJvZ3Jlc3MgPSAwO1xyXG4gICAgICBmaWxlLl9pZCA9IHN0b3JlLmNyZWF0ZShmaWxlKTtcclxuXHJcbiAgICAgIGxldCBmdXQgPSBuZXcgRnV0dXJlKCk7XHJcbiAgICAgIGxldCBwcm90bztcclxuXHJcbiAgICAgIC8vIERldGVjdCBwcm90b2NvbCB0byB1c2VcclxuICAgICAgaWYgKC9odHRwOlxcL1xcLy9pLnRlc3QodXJsKSkge1xyXG4gICAgICAgIHByb3RvID0gaHR0cDtcclxuICAgICAgfSBlbHNlIGlmICgvaHR0cHM6XFwvXFwvL2kudGVzdCh1cmwpKSB7XHJcbiAgICAgICAgcHJvdG8gPSBodHRwcztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51bmJsb2NrKCk7XHJcblxyXG4gICAgICAvLyBEb3dubG9hZCBmaWxlXHJcbiAgICAgIHByb3RvLmdldCh1cmwsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgIC8vIFNhdmUgdGhlIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgc3RvcmUud3JpdGUocmVzLCBmaWxlLl9pZCwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBmdXQudGhyb3coZXJyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1dC5yZXR1cm4oZmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pKS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZnV0LndhaXQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyB0aGUgZmlsZSB1cGxvYWRpbmcgYXMgc3RvcHBlZFxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIHN0b3JlTmFtZVxyXG4gICAgICogQHBhcmFtIHRva2VuXHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgdWZzU3RvcChmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgc3RvcmVcclxuICAgICAgY29uc3Qgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsICdTdG9yZSBub3QgZm91bmQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBDaGVjayBmaWxlXHJcbiAgICAgIGNvbnN0IGZpbGUgPSBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZCh7IF9pZDogZmlsZUlkIH0sIHsgZmllbGRzOiB7IHVzZXJJZDogMSB9IH0pO1xyXG4gICAgICBpZiAoIWZpbGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUnLCAnRmlsZSBub3QgZm91bmQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBDaGVjayB0b2tlblxyXG4gICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4odG9rZW4sIGZpbGVJZCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXRva2VuJywgJ1Rva2VuIGlzIG5vdCB2YWxpZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnVwZGF0ZSh7IF9pZDogZmlsZUlkIH0sIHtcclxuICAgICAgICAkc2V0OiB7IHVwbG9hZGluZzogZmFsc2UgfSxcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIE1JTUUgdHlwZXMgYW5kIGV4dGVuc2lvbnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBNSU1FID0ge1xyXG5cclxuICAvLyBhcHBsaWNhdGlvblxyXG4gICc3eic6ICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnLFxyXG4gICdhcmMnOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICAnYWknOiAnYXBwbGljYXRpb24vcG9zdHNjcmlwdCcsXHJcbiAgJ2Jpbic6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxyXG4gICdieic6ICdhcHBsaWNhdGlvbi94LWJ6aXAnLFxyXG4gICdiejInOiAnYXBwbGljYXRpb24veC1iemlwMicsXHJcbiAgJ2Vwcyc6ICdhcHBsaWNhdGlvbi9wb3N0c2NyaXB0JyxcclxuICAnZXhlJzogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXHJcbiAgJ2d6JzogJ2FwcGxpY2F0aW9uL3gtZ3ppcCcsXHJcbiAgJ2d6aXAnOiAnYXBwbGljYXRpb24veC1nemlwJyxcclxuICAnanMnOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcsXHJcbiAgJ2pzb24nOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgJ29neCc6ICdhcHBsaWNhdGlvbi9vZ2cnLFxyXG4gICdwZGYnOiAnYXBwbGljYXRpb24vcGRmJyxcclxuICAncHMnOiAnYXBwbGljYXRpb24vcG9zdHNjcmlwdCcsXHJcbiAgJ3BzZCc6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxyXG4gICdyYXInOiAnYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZCcsXHJcbiAgJ3Jldic6ICdhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkJyxcclxuICAnc3dmJzogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyxcclxuICAndGFyJzogJ2FwcGxpY2F0aW9uL3gtdGFyJyxcclxuICAneGh0bWwnOiAnYXBwbGljYXRpb24veGh0bWwreG1sJyxcclxuICAneG1sJzogJ2FwcGxpY2F0aW9uL3htbCcsXHJcbiAgJ3ppcCc6ICdhcHBsaWNhdGlvbi96aXAnLFxyXG5cclxuICAvLyBhdWRpb1xyXG4gICdhaWYnOiAnYXVkaW8vYWlmZicsXHJcbiAgJ2FpZmMnOiAnYXVkaW8vYWlmZicsXHJcbiAgJ2FpZmYnOiAnYXVkaW8vYWlmZicsXHJcbiAgJ2F1JzogJ2F1ZGlvL2Jhc2ljJyxcclxuICAnZmxhYyc6ICdhdWRpby9mbGFjJyxcclxuICAnbWlkaSc6ICdhdWRpby9taWRpJyxcclxuICAnbXAyJzogJ2F1ZGlvL21wZWcnLFxyXG4gICdtcDMnOiAnYXVkaW8vbXBlZycsXHJcbiAgJ21wYSc6ICdhdWRpby9tcGVnJyxcclxuICAnb2dhJzogJ2F1ZGlvL29nZycsXHJcbiAgJ29nZyc6ICdhdWRpby9vZ2cnLFxyXG4gICdvcHVzJzogJ2F1ZGlvL29nZycsXHJcbiAgJ3JhJzogJ2F1ZGlvL3ZuZC5ybi1yZWFsYXVkaW8nLFxyXG4gICdzcHgnOiAnYXVkaW8vb2dnJyxcclxuICAnd2F2JzogJ2F1ZGlvL3gtd2F2JyxcclxuICAnd2ViYSc6ICdhdWRpby93ZWJtJyxcclxuICAnd21hJzogJ2F1ZGlvL3gtbXMtd21hJyxcclxuXHJcbiAgLy8gaW1hZ2VcclxuICAnYXZzJzogJ2ltYWdlL2F2cy12aWRlbycsXHJcbiAgJ2JtcCc6ICdpbWFnZS94LXdpbmRvd3MtYm1wJyxcclxuICAnZ2lmJzogJ2ltYWdlL2dpZicsXHJcbiAgJ2ljbyc6ICdpbWFnZS92bmQubWljcm9zb2Z0Lmljb24nLFxyXG4gICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICdqcGcnOiAnaW1hZ2UvanBnJyxcclxuICAnbWpwZyc6ICdpbWFnZS94LW1vdGlvbi1qcGVnJyxcclxuICAncGljJzogJ2ltYWdlL3BpYycsXHJcbiAgJ3BuZyc6ICdpbWFnZS9wbmcnLFxyXG4gICdzdmcnOiAnaW1hZ2Uvc3ZnK3htbCcsXHJcbiAgJ3RpZic6ICdpbWFnZS90aWZmJyxcclxuICAndGlmZic6ICdpbWFnZS90aWZmJyxcclxuXHJcbiAgLy8gdGV4dFxyXG4gICdjc3MnOiAndGV4dC9jc3MnLFxyXG4gICdjc3YnOiAndGV4dC9jc3YnLFxyXG4gICdodG1sJzogJ3RleHQvaHRtbCcsXHJcbiAgJ3R4dCc6ICd0ZXh0L3BsYWluJyxcclxuXHJcbiAgLy8gdmlkZW9cclxuICAnYXZpJzogJ3ZpZGVvL2F2aScsXHJcbiAgJ2R2JzogJ3ZpZGVvL3gtZHYnLFxyXG4gICdmbHYnOiAndmlkZW8veC1mbHYnLFxyXG4gICdtb3YnOiAndmlkZW8vcXVpY2t0aW1lJyxcclxuICAnbXA0JzogJ3ZpZGVvL21wNCcsXHJcbiAgJ21wZWcnOiAndmlkZW8vbXBlZycsXHJcbiAgJ21wZyc6ICd2aWRlby9tcGcnLFxyXG4gICdvZ3YnOiAndmlkZW8vb2dnJyxcclxuICAndmRvJzogJ3ZpZGVvL3ZkbycsXHJcbiAgJ3dlYm0nOiAndmlkZW8vd2VibScsXHJcbiAgJ3dtdic6ICd2aWRlby94LW1zLXdtdicsXHJcblxyXG4gIC8vIHNwZWNpZmljIHRvIHZlbmRvcnNcclxuICAnZG9jJzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXHJcbiAgJ2RvY3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxyXG4gICdvZGInOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5kYXRhYmFzZScsXHJcbiAgJ29kYyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0JyxcclxuICAnb2RmJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYScsXHJcbiAgJ29kZyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzJyxcclxuICAnb2RpJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UnLFxyXG4gICdvZG0nOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LW1hc3RlcicsXHJcbiAgJ29kcCc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbicsXHJcbiAgJ29kcyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0JyxcclxuICAnb2R0JzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dCcsXHJcbiAgJ290Zyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlJyxcclxuICAnb3RwJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlJyxcclxuICAnb3RzJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGUnLFxyXG4gICdvdHQnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlJyxcclxuICAncHB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50JyxcclxuICAncHB0eCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uJyxcclxuICAneGxzJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXHJcbiAgJ3hsc3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnLFxyXG59O1xyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IFdlYkFwcCB9IGZyb20gJ21ldGVvci93ZWJhcHAnO1xyXG5pbXBvcnQgU3BhcmtNRDUgZnJvbSAnc3BhcmstbWQ1JztcclxuaW1wb3J0IHsgVXBsb2FkRlMgfSBmcm9tICcuL3Vmcyc7XHJcblxyXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcblxyXG4gIGNvbnN0IGRvbWFpbiA9IE5wbS5yZXF1aXJlKCdkb21haW4nKTtcclxuICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG4gIGNvbnN0IGh0dHAgPSBOcG0ucmVxdWlyZSgnaHR0cCcpO1xyXG4gIGNvbnN0IGh0dHBzID0gTnBtLnJlcXVpcmUoJ2h0dHBzJyk7XHJcbiAgY29uc3QgbWtkaXJwID0gTnBtLnJlcXVpcmUoJ21rZGlycCcpO1xyXG4gIGNvbnN0IHN0cmVhbSA9IE5wbS5yZXF1aXJlKCdzdHJlYW0nKTtcclxuICBjb25zdCBVUkwgPSBOcG0ucmVxdWlyZSgndXJsJyk7XHJcbiAgY29uc3QgemxpYiA9IE5wbS5yZXF1aXJlKCd6bGliJyk7XHJcblxyXG4gIE1ldGVvci5zdGFydHVwKCgpID0+IHtcclxuICAgIGxldCBwYXRoID0gVXBsb2FkRlMuY29uZmlnLnRtcERpcjtcclxuICAgIGxldCBtb2RlID0gVXBsb2FkRlMuY29uZmlnLnRtcERpclBlcm1pc3Npb25zO1xyXG5cclxuICAgIGZzLnN0YXQocGF0aCwgKGVycikgPT4ge1xyXG4gICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB0ZW1wIGRpcmVjdG9yeVxyXG4gICAgICAgIG1rZGlycChwYXRoLCB7IG1vZGU6IG1vZGUgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBjcmVhdGUgdGVtcCBkaXJlY3RvcnkgYXQgXCIke3BhdGh9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHVmczogdGVtcCBkaXJlY3RvcnkgY3JlYXRlZCBhdCBcIiR7cGF0aH1cImApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFNldCBkaXJlY3RvcnkgcGVybWlzc2lvbnNcclxuICAgICAgICBmcy5jaG1vZChwYXRoLCBtb2RlLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3Qgc2V0IHRlbXAgZGlyZWN0b3J5IHBlcm1pc3Npb25zICR7bW9kZX0gKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ3JlYXRlIGRvbWFpbiB0byBoYW5kbGUgZXJyb3JzXHJcbiAgLy8gYW5kIHBvc3NpYmx5IGF2b2lkIHNlcnZlciBjcmFzaGVzLlxyXG4gIGxldCBkID0gZG9tYWluLmNyZWF0ZSgpO1xyXG5cclxuICBkLm9uKCdlcnJvcicsIChlcnIpID0+IHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ3VmczogJyArIGVyci5tZXNzYWdlKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTGlzdGVuIEhUVFAgcmVxdWVzdHMgdG8gc2VydmUgZmlsZXNcclxuICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgIC8vIFF1aWNrIGNoZWNrIHRvIHNlZSBpZiByZXF1ZXN0IHNob3VsZCBiZSBjYXRjaFxyXG4gICAgaWYgKHJlcS51cmwuaW5kZXhPZihVcGxvYWRGUy5jb25maWcuc3RvcmVzUGF0aCkgPT09IC0xKSB7XHJcbiAgICAgIG5leHQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBzdG9yZSBwYXRoXHJcbiAgICBsZXQgcGFyc2VkVXJsID0gVVJMLnBhcnNlKHJlcS51cmwpO1xyXG4gICAgbGV0IHBhdGggPSBwYXJzZWRVcmwucGF0aG5hbWUuc3Vic3RyKFVwbG9hZEZTLmNvbmZpZy5zdG9yZXNQYXRoLmxlbmd0aCArIDEpO1xyXG5cclxuICAgIGxldCBhbGxvd0NPUlMgPSAoKSA9PiB7XHJcbiAgICAgIC8vIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIHJlcS5oZWFkZXJzLm9yaWdpbik7XHJcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnUE9TVCcpO1xyXG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xyXG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XHJcbiAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKCdeXFwvKFteXFwvXFw/XSspXFwvKFteXFwvXFw/XSspJCcpO1xyXG4gICAgICBsZXQgbWF0Y2ggPSByZWdFeHAuZXhlYyhwYXRoKTtcclxuXHJcbiAgICAgIC8vIFJlcXVlc3QgaXMgbm90IHZhbGlkXHJcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTtcclxuICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgc3RvcmVcclxuICAgICAgbGV0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUobWF0Y2hbMV0pO1xyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIGEgc3RvcmUgaXMgZm91bmQsIGdvIGFoZWFkIGFuZCBhbGxvdyB0aGUgb3JpZ2luXHJcbiAgICAgIGFsbG93Q09SUygpO1xyXG5cclxuICAgICAgbmV4dCgpO1xyXG4gICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcclxuICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKCdeXFwvKFteXFwvXFw/XSspXFwvKFteXFwvXFw/XSspJCcpO1xyXG4gICAgICBsZXQgbWF0Y2ggPSByZWdFeHAuZXhlYyhwYXRoKTtcclxuXHJcbiAgICAgIC8vIFJlcXVlc3QgaXMgbm90IHZhbGlkXHJcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTtcclxuICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgc3RvcmVcclxuICAgICAgbGV0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUobWF0Y2hbMV0pO1xyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIGEgc3RvcmUgaXMgZm91bmQsIGdvIGFoZWFkIGFuZCBhbGxvdyB0aGUgb3JpZ2luXHJcbiAgICAgIGFsbG93Q09SUygpO1xyXG5cclxuICAgICAgLy8gR2V0IGZpbGVcclxuICAgICAgbGV0IGZpbGVJZCA9IG1hdGNoWzJdO1xyXG4gICAgICBpZiAoc3RvcmUuZ2V0Q29sbGVjdGlvbigpLmZpbmQoeyBfaWQ6IGZpbGVJZCB9KS5jb3VudCgpID09PSAwKSB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIHVwbG9hZCB0b2tlblxyXG4gICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4ocmVxLnF1ZXJ5LnRva2VuLCBmaWxlSWQpKSB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDMpO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vQ2hlY2sgaWYgZHVwbGljYXRlXHJcbiAgICAgIGNvbnN0IHVuaXF1ZSA9IGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxJZCA9IHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kT25lKHsgaGFzaDogaGFzaCwgX2lkOiB7ICRuZTogZmlsZUlkIH0gfSk7XHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsSWQgPyBvcmlnaW5hbElkLl9pZCA6IGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGV0IHNwYXJrID0gbmV3IFNwYXJrTUQ1LkFycmF5QnVmZmVyKCk7XHJcbiAgICAgIGxldCB0bXBGaWxlID0gVXBsb2FkRlMuZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCk7XHJcbiAgICAgIGxldCB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRtcEZpbGUsIHsgZmxhZ3M6ICdhJyB9KTtcclxuICAgICAgbGV0IGZpZWxkcyA9IHsgdXBsb2FkaW5nOiB0cnVlIH07XHJcbiAgICAgIGxldCBwcm9ncmVzcyA9IHBhcnNlRmxvYXQocmVxLnF1ZXJ5LnByb2dyZXNzKTtcclxuICAgICAgaWYgKCFpc05hTihwcm9ncmVzcykgJiYgcHJvZ3Jlc3MgPiAwKSB7XHJcbiAgICAgICAgZmllbGRzLnByb2dyZXNzID0gTWF0aC5taW4ocHJvZ3Jlc3MsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXEub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcclxuICAgICAgICB3cy53cml0ZShjaHVuayk7XHJcbiAgICAgICAgc3BhcmsuYXBwZW5kKGNodW5rKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJlcS5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJlcS5vbignZW5kJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCgoKSA9PiB7XHJcbiAgICAgICAgLy8gVXBkYXRlIGNvbXBsZXRlZCBzdGF0ZSB3aXRob3V0IHRyaWdnZXJpbmcgaG9va3NcclxuICAgICAgICBmaWVsZHMuaGFzaCA9IHNwYXJrLmVuZCgpO1xyXG4gICAgICAgIGZpZWxkcy5vcmlnaW5hbElkID0gdW5pcXVlKGZpZWxkcy5oYXNoKTtcclxuICAgICAgICBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZGlyZWN0LnVwZGF0ZSh7IF9pZDogZmlsZUlkIH0sIHsgJHNldDogZmllbGRzIH0pO1xyXG4gICAgICAgIHdzLmVuZCgpO1xyXG4gICAgICB9KSk7XHJcbiAgICAgIHdzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCB3cml0ZSBjaHVuayBvZiBmaWxlIFwiJHtmaWxlSWR9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgIGZzLnVubGluayh0bXBGaWxlLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3QgZGVsZXRlIHRlbXAgZmlsZSBcIiR7dG1wRmlsZX1cIiAoJHtlcnIubWVzc2FnZX0pYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHdzLm9uKCdmaW5pc2gnLCAoKSA9PiB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDQsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyB9KTtcclxuICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xyXG4gICAgICAvLyBHZXQgc3RvcmUsIGZpbGUgSWQgYW5kIGZpbGUgbmFtZVxyXG4gICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXlxcLyhbXlxcL1xcP10rKVxcLyhbXlxcL1xcP10rKSg/OlxcLyhbXlxcL1xcP10rKSk/JCcpO1xyXG4gICAgICBsZXQgbWF0Y2ggPSByZWdFeHAuZXhlYyhwYXRoKTtcclxuXHJcbiAgICAgIC8vIEF2b2lkIDUwNCBHYXRld2F5IHRpbWVvdXQgZXJyb3JcclxuICAgICAgLy8gaWYgZmlsZSBpcyBub3QgaGFuZGxlZCBieSBVcGxvYWRGUy5cclxuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XHJcbiAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgIGNvbnN0IHN0b3JlTmFtZSA9IG1hdGNoWzFdO1xyXG4gICAgICBjb25zdCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKHN0b3JlTmFtZSk7XHJcblxyXG4gICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzdG9yZS5vblJlYWQgIT09IG51bGwgJiYgc3RvcmUub25SZWFkICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHN0b3JlLm9uUmVhZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHVmczogU3RvcmUub25SZWFkIGlzIG5vdCBhIGZ1bmN0aW9uIGluIHN0b3JlIFwiJHtzdG9yZU5hbWV9XCJgKTtcclxuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XHJcbiAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIGZpbGUgZXh0ZW5zaW9uIGZyb20gZmlsZSBJZFxyXG4gICAgICBsZXQgaW5kZXggPSBtYXRjaFsyXS5pbmRleE9mKCcuJyk7XHJcbiAgICAgIGxldCBmaWxlSWQgPSBpbmRleCAhPT0gLTEgPyBtYXRjaFsyXS5zdWJzdHIoMCwgaW5kZXgpIDogbWF0Y2hbMl07XHJcblxyXG4gICAgICAvLyBHZXQgZmlsZSBmcm9tIGRhdGFiYXNlXHJcbiAgICAgIGNvbnN0IGZpbGUgPSBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZSh7IF9pZDogZmlsZUlkIH0pO1xyXG4gICAgICBpZiAoIWZpbGUpIHtcclxuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XHJcbiAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2ltdWxhdGUgcmVhZCBzcGVlZFxyXG4gICAgICBpZiAoVXBsb2FkRlMuY29uZmlnLnNpbXVsYXRlUmVhZERlbGF5KSB7XHJcbiAgICAgICAgTWV0ZW9yLl9zbGVlcEZvck1zKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVJlYWREZWxheSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGQucnVuKCgpID0+IHtcclxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlsZSBjYW4gYmUgYWNjZXNzZWRcclxuICAgICAgICBpZiAoc3RvcmUub25SZWFkLmNhbGwoc3RvcmUsIGZpbGVJZCwgZmlsZSwgcmVxLCByZXMpICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgbGV0IG9wdGlvbnMgPSB7fTtcclxuICAgICAgICAgIGxldCBzdGF0dXMgPSAyMDA7XHJcblxyXG4gICAgICAgICAgLy8gUHJlcGFyZSByZXNwb25zZSBoZWFkZXJzXHJcbiAgICAgICAgICBsZXQgaGVhZGVycyA9IHtcclxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGZpbGUudHlwZSxcclxuICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogZmlsZS5zaXplLFxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgRVRhZyBoZWFkZXJcclxuICAgICAgICAgIGlmICh0eXBlb2YgZmlsZS5ldGFnID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBoZWFkZXJzWydFVGFnJ10gPSBmaWxlLmV0YWc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQWRkIExhc3QtTW9kaWZpZWQgaGVhZGVyXHJcbiAgICAgICAgICBpZiAoZmlsZS5tb2RpZmllZEF0IGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICBoZWFkZXJzWydMYXN0LU1vZGlmaWVkJ10gPSBmaWxlLm1vZGlmaWVkQXQudG9VVENTdHJpbmcoKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZS51cGxvYWRlZEF0IGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICBoZWFkZXJzWydMYXN0LU1vZGlmaWVkJ10gPSBmaWxlLnVwbG9hZGVkQXQudG9VVENTdHJpbmcoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBQYXJzZSByZXF1ZXN0IGhlYWRlcnNcclxuICAgICAgICAgIGlmICh0eXBlb2YgcmVxLmhlYWRlcnMgPT09ICdvYmplY3QnKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBDb21wYXJlIEVUYWdcclxuICAgICAgICAgICAgaWYgKHJlcS5oZWFkZXJzWydpZi1ub25lLW1hdGNoJ10pIHtcclxuICAgICAgICAgICAgICBpZiAoZmlsZS5ldGFnID09PSByZXEuaGVhZGVyc1snaWYtbm9uZS1tYXRjaCddKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDMwNCk7IC8vIE5vdCBNb2RpZmllZFxyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29tcGFyZSBmaWxlIG1vZGlmaWNhdGlvbiBkYXRlXHJcbiAgICAgICAgICAgIGlmIChyZXEuaGVhZGVyc1snaWYtbW9kaWZpZWQtc2luY2UnXSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkU2luY2UgPSBuZXcgRGF0ZShyZXEuaGVhZGVyc1snaWYtbW9kaWZpZWQtc2luY2UnXSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICgoZmlsZS5tb2RpZmllZEF0IGluc3RhbmNlb2YgRGF0ZSAmJiBmaWxlLm1vZGlmaWVkQXQgPiBtb2RpZmllZFNpbmNlKVxyXG4gICAgICAgICAgICAgICAgfHwgZmlsZS51cGxvYWRlZEF0IGluc3RhbmNlb2YgRGF0ZSAmJiBmaWxlLnVwbG9hZGVkQXQgPiBtb2RpZmllZFNpbmNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDMwNCk7IC8vIE5vdCBNb2RpZmllZFxyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3VwcG9ydCByYW5nZSByZXF1ZXN0XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVxLmhlYWRlcnMucmFuZ2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSByZXEuaGVhZGVycy5yYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gUmFuZ2UgaXMgbm90IHZhbGlkXHJcbiAgICAgICAgICAgICAgaWYgKCFyYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MTYpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgdG90YWwgPSBmaWxlLnNpemU7XHJcbiAgICAgICAgICAgICAgY29uc3QgdW5pdCA9IHJhbmdlLnN1YnN0cigwLCByYW5nZS5pbmRleE9mKCc9JykpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodW5pdCAhPT0gJ2J5dGVzJykge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MTYpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgcmFuZ2VzID0gcmFuZ2Uuc3Vic3RyKHVuaXQubGVuZ3RoKS5yZXBsYWNlKC9bXjAtOVxcLSxdLywgJycpLnNwbGl0KCcsJyk7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChyYW5nZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvOiBzdXBwb3J0IG11bHRpcGFydCByYW5nZXM6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUVFAvUmFuZ2VfcmVxdWVzdHNcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHJhbmdlc1swXS5zcGxpdCgnLScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBwYXJzZUludChyWzBdLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSByWzFdID8gcGFyc2VJbnQoclsxXSwgMTApIDogdG90YWwgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJhbmdlIGlzIG5vdCB2YWxpZFxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPj0gdG90YWwgfHwgc3RhcnQgPiBlbmQpIHtcclxuICAgICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MTYpO1xyXG4gICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgaGVhZGVyc1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1SYW5nZSddID0gYGJ5dGVzICR7c3RhcnR9LSR7ZW5kfS8ke3RvdGFsfWA7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LUxlbmd0aCddID0gZW5kIC0gc3RhcnQgKyAxO1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lbmQgPSBlbmQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHN0YXR1cyA9IDIwNjsgLy8gcGFydGlhbCBjb250ZW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhlYWRlcnNbJ0FjY2VwdC1SYW5nZXMnXSA9ICdieXRlcyc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gT3BlbiB0aGUgZmlsZSBzdHJlYW1cclxuICAgICAgICAgIGNvbnN0IHJzID0gc3RvcmUuZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgY29uc3Qgd3MgPSBuZXcgc3RyZWFtLlBhc3NUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgICAgcnMub24oJ2Vycm9yJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIHN0b3JlLm9uUmVhZEVycm9yLmNhbGwoc3RvcmUsIGVyciwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgd3Mub24oJ2Vycm9yJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIHN0b3JlLm9uUmVhZEVycm9yLmNhbGwoc3RvcmUsIGVyciwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDbG9zZSBvdXRwdXQgc3RyZWFtIGF0IHRoZSBlbmRcclxuICAgICAgICAgICAgd3MuZW1pdCgnZW5kJyk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyBUcmFuc2Zvcm0gc3RyZWFtXHJcbiAgICAgICAgICBzdG9yZS50cmFuc2Zvcm1SZWFkKHJzLCB3cywgZmlsZUlkLCBmaWxlLCByZXEsIGhlYWRlcnMpO1xyXG5cclxuICAgICAgICAgIC8vIFBhcnNlIHJlcXVlc3QgaGVhZGVyc1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiByZXEuaGVhZGVycyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgLy8gQ29tcHJlc3MgZGF0YSB1c2luZyBpZiBuZWVkZWQgKGlnbm9yZSBhdWRpby92aWRlbyBhcyB0aGV5IGFyZSBhbHJlYWR5IGNvbXByZXNzZWQpXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVxLmhlYWRlcnNbJ2FjY2VwdC1lbmNvZGluZyddID09PSAnc3RyaW5nJyAmJiAhL14oYXVkaW98dmlkZW8pLy50ZXN0KGZpbGUudHlwZSkpIHtcclxuICAgICAgICAgICAgICBsZXQgYWNjZXB0ID0gcmVxLmhlYWRlcnNbJ2FjY2VwdC1lbmNvZGluZyddO1xyXG5cclxuICAgICAgICAgICAgICAvLyBDb21wcmVzcyB3aXRoIGd6aXBcclxuICAgICAgICAgICAgICBpZiAoYWNjZXB0Lm1hdGNoKC9cXGJnemlwXFxiLykpIHtcclxuICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtRW5jb2RpbmcnXSA9ICdnemlwJztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBoZWFkZXJzWydDb250ZW50LUxlbmd0aCddO1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXMsIGhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgd3MucGlwZSh6bGliLmNyZWF0ZUd6aXAoKSkucGlwZShyZXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBDb21wcmVzcyB3aXRoIGRlZmxhdGVcclxuICAgICAgICAgICAgICBlbHNlIGlmIChhY2NlcHQubWF0Y2goL1xcYmRlZmxhdGVcXGIvKSkge1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1FbmNvZGluZyddID0gJ2RlZmxhdGUnO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGhlYWRlcnNbJ0NvbnRlbnQtTGVuZ3RoJ107XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywgaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICB3cy5waXBlKHpsaWIuY3JlYXRlRGVmbGF0ZSgpKS5waXBlKHJlcyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gU2VuZCByYXcgZGF0YVxyXG4gICAgICAgICAgaWYgKCFoZWFkZXJzWydDb250ZW50LUVuY29kaW5nJ10pIHtcclxuICAgICAgICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXMsIGhlYWRlcnMpO1xyXG4gICAgICAgICAgICB3cy5waXBlKHJlcyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5leHQoKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcblxyXG4vKipcclxuICogU3RvcmUgcGVybWlzc2lvbnNcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdG9yZVBlcm1pc3Npb25zIHtcclxuXHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICBpbnNlcnQ6IG51bGwsXHJcbiAgICAgIHJlbW92ZTogbnVsbCxcclxuICAgICAgdXBkYXRlOiBudWxsLFxyXG4gICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgLy8gQ2hlY2sgb3B0aW9uc1xyXG4gICAgaWYgKG9wdGlvbnMuaW5zZXJ0ICYmIHR5cGVvZiBvcHRpb25zLmluc2VydCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZVBlcm1pc3Npb25zOiBpbnNlcnQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLnJlbW92ZSAmJiB0eXBlb2Ygb3B0aW9ucy5yZW1vdmUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmVQZXJtaXNzaW9uczogcmVtb3ZlIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy51cGRhdGUgJiYgdHlwZW9mIG9wdGlvbnMudXBkYXRlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlUGVybWlzc2lvbnM6IHVwZGF0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFB1YmxpYyBhdHRyaWJ1dGVzXHJcbiAgICB0aGlzLmFjdGlvbnMgPSB7XHJcbiAgICAgIGluc2VydDogb3B0aW9ucy5pbnNlcnQsXHJcbiAgICAgIHJlbW92ZTogb3B0aW9ucy5yZW1vdmUsXHJcbiAgICAgIHVwZGF0ZTogb3B0aW9ucy51cGRhdGUsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRoZSBwZXJtaXNzaW9uIGZvciB0aGUgYWN0aW9uXHJcbiAgICogQHBhcmFtIGFjdGlvblxyXG4gICAqIEBwYXJhbSB1c2VySWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqIEBwYXJhbSBmaWVsZHNcclxuICAgKiBAcGFyYW0gbW9kaWZpZXJzXHJcbiAgICogQHJldHVybiB7Kn1cclxuICAgKi9cclxuICBjaGVjayhhY3Rpb24sIHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uc1thY3Rpb25dKHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7IC8vIGJ5IGRlZmF1bHQgYWxsb3cgYWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgdGhlIGluc2VydCBwZXJtaXNzaW9uXHJcbiAgICogQHBhcmFtIHVzZXJJZFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgY2hlY2tJbnNlcnQodXNlcklkLCBmaWxlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGVjaygnaW5zZXJ0JywgdXNlcklkLCBmaWxlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0aGUgcmVtb3ZlIHBlcm1pc3Npb25cclxuICAgKiBAcGFyYW0gdXNlcklkXHJcbiAgICogQHBhcmFtIGZpbGVcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBjaGVja1JlbW92ZSh1c2VySWQsIGZpbGUpIHtcclxuICAgIHJldHVybiB0aGlzLmNoZWNrKCdyZW1vdmUnLCB1c2VySWQsIGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRoZSB1cGRhdGUgcGVybWlzc2lvblxyXG4gICAqIEBwYXJhbSB1c2VySWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqIEBwYXJhbSBmaWVsZHNcclxuICAgKiBAcGFyYW0gbW9kaWZpZXJzXHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgY2hlY2tVcGRhdGUodXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hlY2soJ3VwZGF0ZScsIHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpO1xyXG4gIH1cclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xyXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5pbXBvcnQgeyBVcGxvYWRGUyB9IGZyb20gJy4vdWZzJztcclxuaW1wb3J0IHsgRmlsdGVyIH0gZnJvbSAnLi91ZnMtZmlsdGVyJztcclxuaW1wb3J0IHsgU3RvcmVQZXJtaXNzaW9ucyB9IGZyb20gJy4vdWZzLXN0b3JlLXBlcm1pc3Npb25zJztcclxuaW1wb3J0IHsgVG9rZW5zIH0gZnJvbSAnLi91ZnMtdG9rZW5zJztcclxuXHJcbi8qKlxyXG4gKiBGaWxlIHN0b3JlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3RvcmUge1xyXG5cclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICBjb2xsZWN0aW9uOiBudWxsLFxyXG4gICAgICBmaWx0ZXI6IG51bGwsXHJcbiAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgIG9uQ29weUVycm9yOiB0aGlzLm9uQ29weUVycm9yLFxyXG4gICAgICBvbkZpbmlzaFVwbG9hZDogdGhpcy5vbkZpbmlzaFVwbG9hZCxcclxuICAgICAgb25SZWFkOiB0aGlzLm9uUmVhZCxcclxuICAgICAgb25SZWFkRXJyb3I6IHRoaXMub25SZWFkRXJyb3IsXHJcbiAgICAgIG9uVmFsaWRhdGU6IHRoaXMub25WYWxpZGF0ZSxcclxuICAgICAgb25Xcml0ZUVycm9yOiB0aGlzLm9uV3JpdGVFcnJvcixcclxuICAgICAgcGVybWlzc2lvbnM6IG51bGwsXHJcbiAgICAgIHRyYW5zZm9ybVJlYWQ6IG51bGwsXHJcbiAgICAgIHRyYW5zZm9ybVdyaXRlOiBudWxsLFxyXG4gICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgLy8gQ2hlY2sgb3B0aW9uc1xyXG4gICAgaWYgKCEob3B0aW9ucy5jb2xsZWN0aW9uIGluc3RhbmNlb2YgTW9uZ28uQ29sbGVjdGlvbikpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IGNvbGxlY3Rpb24gaXMgbm90IGEgTW9uZ28uQ29sbGVjdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuZmlsdGVyICYmICEob3B0aW9ucy5maWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXIpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBmaWx0ZXIgaXMgbm90IGEgVXBsb2FkRlMuRmlsdGVyJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMubmFtZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG5hbWUgaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoVXBsb2FkRlMuZ2V0U3RvcmUob3B0aW9ucy5uYW1lKSkge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogbmFtZSBhbHJlYWR5IGV4aXN0cycpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMub25Db3B5RXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25Db3B5RXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uQ29weUVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5vbkZpbmlzaFVwbG9hZCAmJiB0eXBlb2Ygb3B0aW9ucy5vbkZpbmlzaFVwbG9hZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogb25GaW5pc2hVcGxvYWQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLm9uUmVhZCAmJiB0eXBlb2Ygb3B0aW9ucy5vblJlYWQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uUmVhZCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMub25SZWFkRXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25SZWFkRXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uUmVhZEVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5vbldyaXRlRXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25Xcml0ZUVycm9yICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvbldyaXRlRXJyb3IgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLnBlcm1pc3Npb25zICYmICEob3B0aW9ucy5wZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBwZXJtaXNzaW9ucyBpcyBub3QgYSBVcGxvYWRGUy5TdG9yZVBlcm1pc3Npb25zJyk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy50cmFuc2Zvcm1SZWFkICYmIHR5cGVvZiBvcHRpb25zLnRyYW5zZm9ybVJlYWQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IHRyYW5zZm9ybVJlYWQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybVdyaXRlICYmIHR5cGVvZiBvcHRpb25zLnRyYW5zZm9ybVdyaXRlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiB0cmFuc2Zvcm1Xcml0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMub25WYWxpZGF0ZSAmJiB0eXBlb2Ygb3B0aW9ucy5vblZhbGlkYXRlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvblZhbGlkYXRlIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHVibGljIGF0dHJpYnV0ZXNcclxuICAgIHNlbGYub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICBzZWxmLnBlcm1pc3Npb25zID0gb3B0aW9ucy5wZXJtaXNzaW9ucztcclxuICAgIFtcclxuICAgICAgJ29uQ29weUVycm9yJyxcclxuICAgICAgJ29uRmluaXNoVXBsb2FkJyxcclxuICAgICAgJ29uUmVhZCcsXHJcbiAgICAgICdvblJlYWRFcnJvcicsXHJcbiAgICAgICdvbldyaXRlRXJyb3InLFxyXG4gICAgICAnb25WYWxpZGF0ZScsXHJcbiAgICBdLmZvckVhY2goKG1ldGhvZCkgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnNbbWV0aG9kXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHNlbGZbbWV0aG9kXSA9IG9wdGlvbnNbbWV0aG9kXTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBzdG9yZSB0byB0aGUgbGlzdFxyXG4gICAgVXBsb2FkRlMuYWRkU3RvcmUoc2VsZik7XHJcblxyXG4gICAgLy8gU2V0IGRlZmF1bHQgcGVybWlzc2lvbnNcclxuICAgIGlmICghKHNlbGYucGVybWlzc2lvbnMgaW5zdGFuY2VvZiBTdG9yZVBlcm1pc3Npb25zKSkge1xyXG4gICAgICAvLyBVc2VzIGN1c3RvbSBkZWZhdWx0IHBlcm1pc3Npb25zIG9yIFVGUyBkZWZhdWx0IHBlcm1pc3Npb25zXHJcbiAgICAgIGlmIChVcGxvYWRGUy5jb25maWcuZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMgaW5zdGFuY2VvZiBTdG9yZVBlcm1pc3Npb25zKSB7XHJcbiAgICAgICAgc2VsZi5wZXJtaXNzaW9ucyA9IFVwbG9hZEZTLmNvbmZpZy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLnBlcm1pc3Npb25zID0gbmV3IFN0b3JlUGVybWlzc2lvbnMoKTtcclxuICAgICAgICBjb25zb2xlLndhcm4oYHVmczogcGVybWlzc2lvbnMgYXJlIG5vdCBkZWZpbmVkIGZvciBzdG9yZSBcIiR7b3B0aW9ucy5uYW1lfVwiYCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2hlY2tzIHRva2VuIHZhbGlkaXR5XHJcbiAgICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgc2VsZi5jaGVja1Rva2VuID0gZnVuY3Rpb24gKHRva2VuLCBmaWxlSWQpIHtcclxuICAgICAgICBjaGVjayh0b2tlbiwgU3RyaW5nKTtcclxuICAgICAgICBjaGVjayhmaWxlSWQsIFN0cmluZyk7XHJcbiAgICAgICAgcmV0dXJuIFRva2Vucy5maW5kKHsgdmFsdWU6IHRva2VuLCBmaWxlSWQ6IGZpbGVJZCB9KS5jb3VudCgpID09PSAxO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENvcGllcyB0aGUgZmlsZSB0byBhIHN0b3JlXHJcbiAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICogQHBhcmFtIHN0b3JlXHJcbiAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICAgKi9cclxuICAgICAgc2VsZi5jb3B5ID0gZnVuY3Rpb24gKGZpbGVJZCwgc3RvcmUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG5cclxuICAgICAgICBpZiAoIShzdG9yZSBpbnN0YW5jZW9mIFN0b3JlKSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RvcmUgaXMgbm90IGFuIGluc3RhbmNlIG9mIFVwbG9hZEZTLlN0b3JlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEdldCBvcmlnaW5hbCBmaWxlXHJcbiAgICAgICAgbGV0IGZpbGUgPSBzZWxmLmdldENvbGxlY3Rpb24oKS5maW5kT25lKHsgX2lkOiBmaWxlSWQgfSk7XHJcbiAgICAgICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdmaWxlLW5vdC1mb3VuZCcsICdGaWxlIG5vdCBmb3VuZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTaWxlbnRseSBpZ25vcmUgdGhlIGZpbGUgaWYgaXQgZG9lcyBub3QgbWF0Y2ggZmlsdGVyXHJcbiAgICAgICAgY29uc3QgZmlsdGVyID0gc3RvcmUuZ2V0RmlsdGVyKCk7XHJcbiAgICAgICAgaWYgKGZpbHRlciBpbnN0YW5jZW9mIEZpbHRlciAmJiAhZmlsdGVyLmlzVmFsaWQoZmlsZSkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByZXBhcmUgY29weVxyXG4gICAgICAgIGxldCB7IF9pZCwgdXJsLCAuLi5jb3B5IH0gPSBmaWxlO1xyXG4gICAgICAgIGNvcHkub3JpZ2luYWxTdG9yZSA9IHNlbGYuZ2V0TmFtZSgpO1xyXG4gICAgICAgIGNvcHkub3JpZ2luYWxJZCA9IGZpbGVJZDtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb3B5XHJcbiAgICAgICAgbGV0IGNvcHlJZCA9IHN0b3JlLmNyZWF0ZShjb3B5KTtcclxuXHJcbiAgICAgICAgLy8gR2V0IG9yaWdpbmFsIHN0cmVhbVxyXG4gICAgICAgIGxldCBycyA9IHNlbGYuZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUpO1xyXG5cclxuICAgICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gYXZvaWQgYXBwIGNyYXNoaW5nXHJcbiAgICAgICAgcnMub24oJ2Vycm9yJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGVyciwgbnVsbCk7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAvLyBDb3B5IGZpbGUgZGF0YVxyXG4gICAgICAgIHN0b3JlLndyaXRlKHJzLCBjb3B5SWQsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBzZWxmLmdldENvbGxlY3Rpb24oKS5yZW1vdmUoeyBfaWQ6IGNvcHlJZCB9KTtcclxuICAgICAgICAgICAgc2VsZi5vbkNvcHlFcnJvci5jYWxsKHNlbGYsIGVyciwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBlcnIsIGNvcHlJZCwgY29weSwgc3RvcmUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDcmVhdGVzIHRoZSBmaWxlIGluIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgICAqL1xyXG4gICAgICBzZWxmLmNyZWF0ZSA9IGZ1bmN0aW9uIChmaWxlLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNoZWNrKGZpbGUsIE9iamVjdCk7XHJcbiAgICAgICAgZmlsZS5zdG9yZSA9IHNlbGYub3B0aW9ucy5uYW1lOyAvLyBhc3NpZ24gc3RvcmUgdG8gZmlsZVxyXG4gICAgICAgIHJldHVybiBzZWxmLmdldENvbGxlY3Rpb24oKS5pbnNlcnQoZmlsZSwgY2FsbGJhY2spO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENyZWF0ZXMgYSB0b2tlbiBmb3IgdGhlIGZpbGUgKG9ubHkgbmVlZGVkIGZvciBjbGllbnQgc2lkZSB1cGxvYWQpXHJcbiAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAqL1xyXG4gICAgICBzZWxmLmNyZWF0ZVRva2VuID0gZnVuY3Rpb24gKGZpbGVJZCkge1xyXG4gICAgICAgIGxldCB0b2tlbiA9IHNlbGYuZ2VuZXJhdGVUb2tlbigpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiB0b2tlbiBleGlzdHNcclxuICAgICAgICBpZiAoVG9rZW5zLmZpbmQoeyBmaWxlSWQ6IGZpbGVJZCB9KS5jb3VudCgpKSB7XHJcbiAgICAgICAgICBUb2tlbnMudXBkYXRlKHsgZmlsZUlkOiBmaWxlSWQgfSwge1xyXG4gICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB0b2tlbixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBUb2tlbnMuaW5zZXJ0KHtcclxuICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgdmFsdWU6IHRva2VuLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBXcml0ZXMgdGhlIGZpbGUgdG8gdGhlIHN0b3JlXHJcbiAgICAgICAqIEBwYXJhbSByc1xyXG4gICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICAgKi9cclxuICAgICAgc2VsZi53cml0ZSA9IGZ1bmN0aW9uIChycywgZmlsZUlkLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBzZWxmLmdldENvbGxlY3Rpb24oKS5maW5kT25lKHsgX2lkOiBmaWxlSWQgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgc2VsZi5vbldyaXRlRXJyb3IuY2FsbChzZWxmLCBlcnIsIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGVycik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbmlzaEhhbmRsZXIgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGxldCBzaXplID0gMDtcclxuICAgICAgICAgIGNvbnN0IHJlYWRTdHJlYW0gPSBzZWxmLmdldFJlYWRTdHJlYW0oZmlsZUlkLCBmaWxlKTtcclxuXHJcbiAgICAgICAgICByZWFkU3RyZWFtLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgZXJyb3IsIG51bGwpO1xyXG4gICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgcmVhZFN0cmVhbS5vbignZGF0YScsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgc2l6ZSArPSBkYXRhLmxlbmd0aDtcclxuICAgICAgICAgIH0pKTtcclxuICAgICAgICAgIHJlYWRTdHJlYW0ub24oJ2VuZCcsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgZmlsZSBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgZmlsZS5jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGZpbGUuZXRhZyA9IFVwbG9hZEZTLmdlbmVyYXRlRXRhZygpO1xyXG4gICAgICAgICAgICBmaWxlLnBhdGggPSBzZWxmLmdldEZpbGVSZWxhdGl2ZVVSTChmaWxlSWQpO1xyXG4gICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTtcclxuICAgICAgICAgICAgZmlsZS5zaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgZmlsZS50b2tlbiA9IHNlbGYuZ2VuZXJhdGVUb2tlbigpO1xyXG4gICAgICAgICAgICBmaWxlLnVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmaWxlLnVwbG9hZGVkQXQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBmaWxlLnVybCA9IHNlbGYuZ2V0RmlsZVVSTChmaWxlSWQpO1xyXG5cclxuICAgICAgICAgICAgLy8gRXhlY3V0ZSBjYWxsYmFja1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYub25GaW5pc2hVcGxvYWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICBzZWxmLm9uRmluaXNoVXBsb2FkLmNhbGwoc2VsZiwgZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNldHMgdGhlIGZpbGUgVVJMIHdoZW4gZmlsZSB0cmFuc2ZlciBpcyBjb21wbGV0ZSxcclxuICAgICAgICAgICAgLy8gdGhpcyB3YXksIHRoZSBpbWFnZSB3aWxsIGxvYWRzIGVudGlyZWx5LlxyXG4gICAgICAgICAgICBzZWxmLmdldENvbGxlY3Rpb24oKS5kaXJlY3QudXBkYXRlKHsgX2lkOiBmaWxlSWQgfSwge1xyXG4gICAgICAgICAgICAgICRzZXQ6IHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmaWxlLmNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgZXRhZzogZmlsZS5ldGFnLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IGZpbGUucHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgICAgICBzaXplOiBmaWxlLnNpemUsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogZmlsZS50b2tlbixcclxuICAgICAgICAgICAgICAgIHVwbG9hZGluZzogZmlsZS51cGxvYWRpbmcsXHJcbiAgICAgICAgICAgICAgICB1cGxvYWRlZEF0OiBmaWxlLnVwbG9hZGVkQXQsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGZpbGUudXJsLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGZpbGUgaW5mb1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIG51bGwsIGZpbGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2ltdWxhdGUgd3JpdGUgc3BlZWRcclxuICAgICAgICAgICAgaWYgKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVdyaXRlRGVsYXkpIHtcclxuICAgICAgICAgICAgICBNZXRlb3IuX3NsZWVwRm9yTXMoVXBsb2FkRlMuY29uZmlnLnNpbXVsYXRlV3JpdGVEZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvcHkgZmlsZSB0byBvdGhlciBzdG9yZXNcclxuICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5jb3B5VG8gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5vcHRpb25zLmNvcHlUby5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBzZWxmLm9wdGlvbnMuY29weVRvW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc3RvcmUuZ2V0RmlsdGVyKCkgfHwgc3RvcmUuZ2V0RmlsdGVyKCkuaXNWYWxpZChmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICBzZWxmLmNvcHkoZmlsZUlkLCBzdG9yZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHdzID0gc2VsZi5nZXRXcml0ZVN0cmVhbShmaWxlSWQsIGZpbGUpO1xyXG4gICAgICAgIHdzLm9uKCdlcnJvcicsIGVycm9ySGFuZGxlcik7XHJcbiAgICAgICAgd3Mub24oJ2ZpbmlzaCcsIGZpbmlzaEhhbmRsZXIpO1xyXG5cclxuICAgICAgICAvLyBFeGVjdXRlIHRyYW5zZm9ybWF0aW9uXHJcbiAgICAgICAgc2VsZi50cmFuc2Zvcm1Xcml0ZShycywgd3MsIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gc2VsZi5nZXRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgICAvLyBDb2RlIGV4ZWN1dGVkIGFmdGVyIHJlbW92aW5nIGZpbGVcclxuICAgICAgY29sbGVjdGlvbi5hZnRlci5yZW1vdmUoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgIC8vIFJlbW92ZSBhc3NvY2lhdGVkIHRva2Vuc1xyXG4gICAgICAgIFRva2Vucy5yZW1vdmUoeyBmaWxlSWQ6IGZpbGUuX2lkIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmNvcHlUbyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGYub3B0aW9ucy5jb3B5VG8ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGNvcGllcyBpbiBzdG9yZXNcclxuICAgICAgICAgICAgc2VsZi5vcHRpb25zLmNvcHlUb1tpXS5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHsgb3JpZ2luYWxJZDogZmlsZS5faWQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENvZGUgZXhlY3V0ZWQgYmVmb3JlIGluc2VydGluZyBmaWxlXHJcbiAgICAgIGNvbGxlY3Rpb24uYmVmb3JlLmluc2VydChmdW5jdGlvbiAodXNlcklkLCBmaWxlKSB7XHJcbiAgICAgICAgaWYgKCFzZWxmLnBlcm1pc3Npb25zLmNoZWNrSW5zZXJ0KHVzZXJJZCwgZmlsZSkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZvcmJpZGRlbicsICdGb3JiaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ29kZSBleGVjdXRlZCBiZWZvcmUgdXBkYXRpbmcgZmlsZVxyXG4gICAgICBjb2xsZWN0aW9uLmJlZm9yZS51cGRhdGUoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpIHtcclxuICAgICAgICBpZiAoIXNlbGYucGVybWlzc2lvbnMuY2hlY2tVcGRhdGUodXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZvcmJpZGRlbicsICdGb3JiaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ29kZSBleGVjdXRlZCBiZWZvcmUgcmVtb3ZpbmcgZmlsZVxyXG4gICAgICBjb2xsZWN0aW9uLmJlZm9yZS5yZW1vdmUoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgIGlmICghc2VsZi5wZXJtaXNzaW9ucy5jaGVja1JlbW92ZSh1c2VySWQsIGZpbGUpKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdmb3JiaWRkZW4nLCAnRm9yYmlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZWxldGUgdGhlIHBoeXNpY2FsIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgc2VsZi5kZWxldGUoZmlsZS5faWQpO1xyXG5cclxuICAgICAgICBsZXQgdG1wRmlsZSA9IFVwbG9hZEZTLmdldFRlbXBGaWxlUGF0aChmaWxlLl9pZCk7XHJcblxyXG4gICAgICAgIC8vIERlbGV0ZSB0aGUgdGVtcCBmaWxlXHJcbiAgICAgICAgZnMuc3RhdCh0bXBGaWxlLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAhZXJyICYmIGZzLnVubGluayh0bXBGaWxlLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgIGVyciAmJiBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBkZWxldGUgdGVtcCBmaWxlIGF0ICR7dG1wRmlsZX0gKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVsZXRlcyBhIGZpbGUgYXN5bmNcclxuICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICovXHJcbiAgZGVsZXRlKGZpbGVJZCwgY2FsbGJhY2spIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignZGVsZXRlIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGVzIGEgcmFuZG9tIHRva2VuXHJcbiAgICogQHBhcmFtIHBhdHRlcm5cclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2VuZXJhdGVUb2tlbihwYXR0ZXJuKSB7XHJcbiAgICByZXR1cm4gKHBhdHRlcm4gfHwgJ3h5eHl4eXh5eHknKS5yZXBsYWNlKC9beHldL2csIChjKSA9PiB7XHJcbiAgICAgIGxldCByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgdiA9IGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCk7XHJcbiAgICAgIGxldCBzID0gdi50b1N0cmluZygxNik7XHJcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpID8gcy50b1VwcGVyQ2FzZSgpIDogcztcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29sbGVjdGlvblxyXG4gICAqIEByZXR1cm4ge01vbmdvLkNvbGxlY3Rpb259XHJcbiAgICovXHJcbiAgZ2V0Q29sbGVjdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGUgVVJMXHJcbiAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAqIEByZXR1cm4ge3N0cmluZ3xudWxsfVxyXG4gICAqL1xyXG4gIGdldEZpbGVSZWxhdGl2ZVVSTChmaWxlSWQpIHtcclxuICAgIGxldCBmaWxlID0gdGhpcy5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZShmaWxlSWQsIHsgZmllbGRzOiB7IG5hbWU6IDEgfSB9KTtcclxuICAgIHJldHVybiBmaWxlID8gdGhpcy5nZXRSZWxhdGl2ZVVSTChgJHtmaWxlSWR9LyR7ZmlsZS5uYW1lfWApIDogbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGUgVVJMXHJcbiAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAqIEByZXR1cm4ge3N0cmluZ3xudWxsfVxyXG4gICAqL1xyXG4gIGdldEZpbGVVUkwoZmlsZUlkKSB7XHJcbiAgICBsZXQgZmlsZSA9IHRoaXMuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoZmlsZUlkLCB7IGZpZWxkczogeyBuYW1lOiAxIH0gfSk7XHJcbiAgICByZXR1cm4gZmlsZSA/IHRoaXMuZ2V0VVJMKGAke2ZpbGVJZH0vJHtmaWxlLm5hbWV9YCkgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmlsZSBmaWx0ZXJcclxuICAgKiBAcmV0dXJuIHtVcGxvYWRGUy5GaWx0ZXJ9XHJcbiAgICovXHJcbiAgZ2V0RmlsdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdG9yZSBuYW1lXHJcbiAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE5hbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLm5hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaWxlIHJlYWQgc3RyZWFtXHJcbiAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignU3RvcmUuZ2V0UmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0b3JlIHJlbGF0aXZlIFVSTFxyXG4gICAqIEBwYXJhbSBwYXRoXHJcbiAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFJlbGF0aXZlVVJMKHBhdGgpIHtcclxuICAgIGNvbnN0IHJvb3RVcmwgPSBNZXRlb3IuYWJzb2x1dGVVcmwoKS5yZXBsYWNlKC9cXC8rJC8sICcnKTtcclxuICAgIGNvbnN0IHJvb3RQYXRoID0gcm9vdFVybC5yZXBsYWNlKC9eW2Etel0rOlxcL1xcL1teL10rXFwvKi9naSwgJycpO1xyXG4gICAgY29uc3Qgc3RvcmVOYW1lID0gdGhpcy5nZXROYW1lKCk7XHJcbiAgICBwYXRoID0gU3RyaW5nKHBhdGgpLnJlcGxhY2UoL1xcLyQvLCAnJykudHJpbSgpO1xyXG4gICAgcmV0dXJuIGVuY29kZVVSSShgJHtyb290UGF0aH0vJHtVcGxvYWRGUy5jb25maWcuc3RvcmVzUGF0aH0vJHtzdG9yZU5hbWV9LyR7cGF0aH1gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0b3JlIGFic29sdXRlIFVSTFxyXG4gICAqIEBwYXJhbSBwYXRoXHJcbiAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFVSTChwYXRoKSB7XHJcbiAgICBjb25zdCByb290VXJsID0gTWV0ZW9yLmFic29sdXRlVXJsKHsgc2VjdXJlOiBVcGxvYWRGUy5jb25maWcuaHR0cHMgfSkucmVwbGFjZSgvXFwvKyQvLCAnJyk7XHJcbiAgICBjb25zdCBzdG9yZU5hbWUgPSB0aGlzLmdldE5hbWUoKTtcclxuICAgIHBhdGggPSBTdHJpbmcocGF0aCkucmVwbGFjZSgvXFwvJC8sICcnKS50cmltKCk7XHJcbiAgICByZXR1cm4gZW5jb2RlVVJJKGAke3Jvb3RVcmx9LyR7VXBsb2FkRlMuY29uZmlnLnN0b3Jlc1BhdGh9LyR7c3RvcmVOYW1lfS8ke3BhdGh9YCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaWxlIHdyaXRlIHN0cmVhbVxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIGdldFdyaXRlU3RyZWFtKGZpbGVJZCwgZmlsZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdnZXRXcml0ZVN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXBsZXRlcyB0aGUgZmlsZSB1cGxvYWRcclxuICAgKiBAcGFyYW0gdXJsXHJcbiAgICogQHBhcmFtIGZpbGVcclxuICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgKi9cclxuICBpbXBvcnRGcm9tVVJMKHVybCwgZmlsZSwgY2FsbGJhY2spIHtcclxuICAgIE1ldGVvci5jYWxsKCd1ZnNJbXBvcnRVUkwnLCB1cmwsIGZpbGUsIHRoaXMuZ2V0TmFtZSgpLCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvcHkgZXJyb3IgaGFwcGVuZWRcclxuICAgKiBAcGFyYW0gZXJyXHJcbiAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgb25Db3B5RXJyb3IoZXJyLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IGNvcHkgZmlsZSBcIiR7ZmlsZUlkfVwiICgke2Vyci5tZXNzYWdlfSlgLCBlcnIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBmaWxlIGhhcyBiZWVuIHVwbG9hZGVkXHJcbiAgICogQHBhcmFtIGZpbGVcclxuICAgKi9cclxuICBvbkZpbmlzaFVwbG9hZChmaWxlKSB7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGZpbGUgaXMgcmVhZCBmcm9tIHRoZSBzdG9yZVxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqIEBwYXJhbSByZXF1ZXN0XHJcbiAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICogQHJldHVybiBib29sZWFuXHJcbiAgICovXHJcbiAgb25SZWFkKGZpbGVJZCwgZmlsZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSByZWFkIGVycm9yIGhhcHBlbmVkXHJcbiAgICogQHBhcmFtIGVyclxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqIEByZXR1cm4gYm9vbGVhblxyXG4gICAqL1xyXG4gIG9uUmVhZEVycm9yKGVyciwgZmlsZUlkLCBmaWxlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCByZWFkIGZpbGUgXCIke2ZpbGVJZH1cIiAoJHtlcnIubWVzc2FnZX0pYCwgZXJyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGZpbGUgaXMgYmVpbmcgdmFsaWRhdGVkXHJcbiAgICogQHBhcmFtIGZpbGVcclxuICAgKi9cclxuICBvblZhbGlkYXRlKGZpbGUpIHtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgd3JpdGUgZXJyb3IgaGFwcGVuZWRcclxuICAgKiBAcGFyYW0gZXJyXHJcbiAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICogQHJldHVybiBib29sZWFuXHJcbiAgICovXHJcbiAgb25Xcml0ZUVycm9yKGVyciwgZmlsZUlkLCBmaWxlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCB3cml0ZSBmaWxlIFwiJHtmaWxlSWR9XCIgKCR7ZXJyLm1lc3NhZ2V9KWAsIGVycik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzdG9yZSBwZXJtaXNzaW9uc1xyXG4gICAqIEBwYXJhbSBwZXJtaXNzaW9uc1xyXG4gICAqL1xyXG4gIHNldFBlcm1pc3Npb25zKHBlcm1pc3Npb25zKSB7XHJcbiAgICBpZiAoIShwZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Blcm1pc3Npb25zIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBVcGxvYWRGUy5TdG9yZVBlcm1pc3Npb25zJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBlcm1pc3Npb25zID0gcGVybWlzc2lvbnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIHRoZSBmaWxlIG9uIHJlYWRpbmdcclxuICAgKiBAcGFyYW0gcmVhZFN0cmVhbVxyXG4gICAqIEBwYXJhbSB3cml0ZVN0cmVhbVxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqIEBwYXJhbSByZXF1ZXN0XHJcbiAgICogQHBhcmFtIGhlYWRlcnNcclxuICAgKi9cclxuICB0cmFuc2Zvcm1SZWFkKHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUsIHJlcXVlc3QsIGhlYWRlcnMpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnRyYW5zZm9ybVJlYWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zZm9ybVJlYWQuY2FsbCh0aGlzLCByZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgZmlsZUlkLCBmaWxlLCByZXF1ZXN0LCBoZWFkZXJzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlYWRTdHJlYW0ucGlwZSh3cml0ZVN0cmVhbSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIHRoZSBmaWxlIG9uIHdyaXRpbmdcclxuICAgKiBAcGFyYW0gcmVhZFN0cmVhbVxyXG4gICAqIEBwYXJhbSB3cml0ZVN0cmVhbVxyXG4gICAqIEBwYXJhbSBmaWxlSWRcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIHRyYW5zZm9ybVdyaXRlKHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnRyYW5zZm9ybVdyaXRlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Xcml0ZS5jYWxsKHRoaXMsIHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlcyB0aGUgZmlsZVxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgdmFsaWRhdGUoZmlsZSkge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uVmFsaWRhdGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vblZhbGlkYXRlKGZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcclxuXHJcbi8qKlxyXG4gKiBDb2xsZWN0aW9uIG9mIHVwbG9hZCB0b2tlbnNcclxuICogQHR5cGUge01vbmdvLkNvbGxlY3Rpb259XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVG9rZW5zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3Vmc1Rva2VucycpO1xyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5pbXBvcnQgeyBTdG9yZSB9IGZyb20gJy4vdWZzLXN0b3JlJztcclxuXHJcbi8qKlxyXG4gKiBGaWxlIHVwbG9hZGVyXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVXBsb2FkZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gU2V0IGRlZmF1bHQgb3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgYWRhcHRpdmU6IHRydWUsXHJcbiAgICAgIGNhcGFjaXR5OiAwLjksXHJcbiAgICAgIGNodW5rU2l6ZTogMTYgKiAxMDI0LFxyXG4gICAgICBkYXRhOiBudWxsLFxyXG4gICAgICBmaWxlOiBudWxsLFxyXG4gICAgICBtYXhDaHVua1NpemU6IDQgKiAxMDI0ICogMTAwMCxcclxuICAgICAgbWF4VHJpZXM6IDUsXHJcbiAgICAgIG9uQWJvcnQ6IHRoaXMub25BYm9ydCxcclxuICAgICAgb25Db21wbGV0ZTogdGhpcy5vbkNvbXBsZXRlLFxyXG4gICAgICBvbkNyZWF0ZTogdGhpcy5vbkNyZWF0ZSxcclxuICAgICAgb25FcnJvcjogdGhpcy5vbkVycm9yLFxyXG4gICAgICBvblByb2dyZXNzOiB0aGlzLm9uUHJvZ3Jlc3MsXHJcbiAgICAgIG9uU3RhcnQ6IHRoaXMub25TdGFydCxcclxuICAgICAgb25TdG9wOiB0aGlzLm9uU3RvcCxcclxuICAgICAgcmV0cnlEZWxheTogMjAwMCxcclxuICAgICAgc3RvcmU6IG51bGwsXHJcbiAgICAgIHRyYW5zZmVyRGVsYXk6IDEwMCxcclxuICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5hZGFwdGl2ZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FkYXB0aXZlIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmNhcGFjaXR5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYXBhY2l0eSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmNhcGFjaXR5IDw9IDAgfHwgb3B0aW9ucy5jYXBhY2l0eSA+IDEpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2NhcGFjaXR5IG11c3QgYmUgYSBmbG9hdCBiZXR3ZWVuIDAuMSBhbmQgMS4wJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuY2h1bmtTaXplICE9PSAnbnVtYmVyJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjaHVua1NpemUgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIShvcHRpb25zLmRhdGEgaW5zdGFuY2VvZiBCbG9iKSAmJiAhKG9wdGlvbnMuZGF0YSBpbnN0YW5jZW9mIEZpbGUpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RhdGEgaXMgbm90IGFuIEJsb2Igb3IgRmlsZScpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuZmlsZSA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5maWxlICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdmaWxlIGlzIG5vdCBhbiBvYmplY3QnKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhDaHVua1NpemUgIT09ICdudW1iZXInKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21heENodW5rU2l6ZSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhUcmllcyAhPT0gJ251bWJlcicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4VHJpZXMgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMucmV0cnlEZWxheSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmV0cnlEZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50cmFuc2ZlckRlbGF5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0cmFuc2ZlckRlbGF5IGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uQWJvcnQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25BYm9ydCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uQ29tcGxldGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25Db21wbGV0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uQ3JlYXRlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQ3JlYXRlIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMub25FcnJvciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvbkVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMub25Qcm9ncmVzcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvblByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMub25TdGFydCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvblN0YXJ0IGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMub25TdG9wICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uU3RvcCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnN0b3JlICE9PSAnc3RyaW5nJyAmJiAhKG9wdGlvbnMuc3RvcmUgaW5zdGFuY2VvZiBTdG9yZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RvcmUgbXVzdCBiZSB0aGUgbmFtZSBvZiB0aGUgc3RvcmUgb3IgYW4gaW5zdGFuY2Ugb2YgVXBsb2FkRlMuU3RvcmUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQdWJsaWMgYXR0cmlidXRlc1xyXG4gICAgc2VsZi5hZGFwdGl2ZSA9IG9wdGlvbnMuYWRhcHRpdmU7XHJcbiAgICBzZWxmLmNhcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLmNhcGFjaXR5KTtcclxuICAgIHNlbGYuY2h1bmtTaXplID0gcGFyc2VJbnQob3B0aW9ucy5jaHVua1NpemUpO1xyXG4gICAgc2VsZi5tYXhDaHVua1NpemUgPSBwYXJzZUludChvcHRpb25zLm1heENodW5rU2l6ZSk7XHJcbiAgICBzZWxmLm1heFRyaWVzID0gcGFyc2VJbnQob3B0aW9ucy5tYXhUcmllcyk7XHJcbiAgICBzZWxmLnJldHJ5RGVsYXkgPSBwYXJzZUludChvcHRpb25zLnJldHJ5RGVsYXkpO1xyXG4gICAgc2VsZi50cmFuc2ZlckRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy50cmFuc2ZlckRlbGF5KTtcclxuICAgIHNlbGYub25BYm9ydCA9IG9wdGlvbnMub25BYm9ydDtcclxuICAgIHNlbGYub25Db21wbGV0ZSA9IG9wdGlvbnMub25Db21wbGV0ZTtcclxuICAgIHNlbGYub25DcmVhdGUgPSBvcHRpb25zLm9uQ3JlYXRlO1xyXG4gICAgc2VsZi5vbkVycm9yID0gb3B0aW9ucy5vbkVycm9yO1xyXG4gICAgc2VsZi5vblByb2dyZXNzID0gb3B0aW9ucy5vblByb2dyZXNzO1xyXG4gICAgc2VsZi5vblN0YXJ0ID0gb3B0aW9ucy5vblN0YXJ0O1xyXG4gICAgc2VsZi5vblN0b3AgPSBvcHRpb25zLm9uU3RvcDtcclxuXHJcbiAgICAvLyBQcml2YXRlIGF0dHJpYnV0ZXNcclxuICAgIGxldCBzdG9yZSA9IG9wdGlvbnMuc3RvcmU7XHJcbiAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcclxuICAgIGxldCBjYXBhY2l0eU1hcmdpbiA9IDAuMTtcclxuICAgIGxldCBmaWxlID0gb3B0aW9ucy5maWxlO1xyXG4gICAgbGV0IGZpbGVJZCA9IG51bGw7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIGxldCBsb2FkZWQgPSAwO1xyXG4gICAgbGV0IHRvdGFsID0gZGF0YS5zaXplO1xyXG4gICAgbGV0IHRyaWVzID0gMDtcclxuICAgIGxldCBwb3N0VXJsID0gbnVsbDtcclxuICAgIGxldCB0b2tlbiA9IG51bGw7XHJcbiAgICBsZXQgY29tcGxldGUgPSBmYWxzZTtcclxuICAgIGxldCB1cGxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgdGltZUEgPSBudWxsO1xyXG4gICAgbGV0IHRpbWVCID0gbnVsbDtcclxuXHJcbiAgICBsZXQgZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgbGV0IHN0YXJ0VGltZSA9IDA7XHJcblxyXG4gICAgLy8gS2VlcCBvbmx5IHRoZSBuYW1lIG9mIHRoZSBzdG9yZVxyXG4gICAgaWYgKHN0b3JlIGluc3RhbmNlb2YgU3RvcmUpIHtcclxuICAgICAgc3RvcmUgPSBzdG9yZS5nZXROYW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXNzaWduIGZpbGUgdG8gc3RvcmVcclxuICAgIGZpbGUuc3RvcmUgPSBzdG9yZTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgIC8vIEZpbmlzaCB0aGUgdXBsb2FkIGJ5IHRlbGxpbmcgdGhlIHN0b3JlIHRoZSB1cGxvYWQgaXMgY29tcGxldGVcclxuICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0NvbXBsZXRlJywgZmlsZUlkLCBzdG9yZSwgdG9rZW4sIGZ1bmN0aW9uIChlcnIsIHVwbG9hZGVkRmlsZSkge1xyXG4gICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgIHNlbGYub25FcnJvcihlcnIsIGZpbGUpO1xyXG4gICAgICAgICAgc2VsZi5hYm9ydCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodXBsb2FkZWRGaWxlKSB7XHJcbiAgICAgICAgICB1cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgICAgIGZpbGUgPSB1cGxvYWRlZEZpbGU7XHJcbiAgICAgICAgICBzZWxmLm9uQ29tcGxldGUodXBsb2FkZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWJvcnRzIHRoZSBjdXJyZW50IHRyYW5zZmVyXHJcbiAgICAgKi9cclxuICAgIHNlbGYuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIFJlbW92ZSB0aGUgZmlsZSBmcm9tIGRhdGFiYXNlXHJcbiAgICAgIE1ldGVvci5jYWxsKCd1ZnNEZWxldGUnLCBmaWxlSWQsIHN0b3JlLCB0b2tlbiwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFJlc2V0IHVwbG9hZGVyIHN0YXR1c1xyXG4gICAgICB1cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgZmlsZUlkID0gbnVsbDtcclxuICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgdHJpZXMgPSAwO1xyXG4gICAgICBsb2FkZWQgPSAwO1xyXG4gICAgICBjb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICBzdGFydFRpbWUgPSBudWxsO1xyXG4gICAgICBzZWxmLm9uQWJvcnQoZmlsZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYXZlcmFnZSBzcGVlZCBpbiBieXRlcyBwZXIgc2Vjb25kXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzZWxmLmdldEF2ZXJhZ2VTcGVlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IHNlY29uZHMgPSBzZWxmLmdldEVsYXBzZWRUaW1lKCkgLyAxMDAwO1xyXG4gICAgICByZXR1cm4gc2VsZi5nZXRMb2FkZWQoKSAvIHNlY29uZHM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZWxhcHNlZCB0aW1lIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRFbGFwc2VkVGltZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHN0YXJ0VGltZSAmJiBzZWxmLmlzVXBsb2FkaW5nKCkpIHtcclxuICAgICAgICByZXR1cm4gZWxhcHNlZFRpbWUgKyAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGVsYXBzZWRUaW1lO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpbGVcclxuICAgICAqIEByZXR1cm4ge29iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRGaWxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gZmlsZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBsb2FkZWQgYnl0ZXNcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRMb2FkZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBsb2FkZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBjdXJyZW50IHByb2dyZXNzXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0UHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLm1pbigobG9hZGVkIC8gdG90YWwpICogMTAwIC8gMTAwLCAxLjApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJlbWFpbmluZyB0aW1lIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRSZW1haW5pbmdUaW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBsZXQgYXZlcmFnZVNwZWVkID0gc2VsZi5nZXRBdmVyYWdlU3BlZWQoKTtcclxuICAgICAgbGV0IHJlbWFpbmluZ0J5dGVzID0gdG90YWwgLSBzZWxmLmdldExvYWRlZCgpO1xyXG4gICAgICByZXR1cm4gYXZlcmFnZVNwZWVkICYmIHJlbWFpbmluZ0J5dGVzID8gTWF0aC5tYXgocmVtYWluaW5nQnl0ZXMgLyBhdmVyYWdlU3BlZWQsIDApIDogMDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB1cGxvYWQgc3BlZWQgaW4gYnl0ZXMgcGVyIHNlY29uZFxyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgc2VsZi5nZXRTcGVlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHRpbWVBICYmIHRpbWVCICYmIHNlbGYuaXNVcGxvYWRpbmcoKSkge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gKHRpbWVCIC0gdGltZUEpIC8gMTAwMDtcclxuICAgICAgICByZXR1cm4gc2VsZi5jaHVua1NpemUgLyBzZWNvbmRzO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIGJ5dGVzXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHNlbGYuZ2V0VG90YWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0b3RhbDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zZmVyIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBzZWxmLmlzQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBjb21wbGV0ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zZmVyIGlzIGFjdGl2ZVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgc2VsZi5pc1VwbG9hZGluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHVwbG9hZGluZztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkcyBhIHBvcnRpb24gb2YgZmlsZVxyXG4gICAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqIEByZXR1cm5zIHtCbG9ifVxyXG4gICAgICovXHJcbiAgICBzZWxmLnJlYWRDaHVuayA9IGZ1bmN0aW9uIChzdGFydCwgbGVuZ3RoLCBjYWxsYmFjaykge1xyXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlYWRDaHVuayBpcyBtaXNzaW5nIGNhbGxiYWNrJyk7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBsZXQgZW5kO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNodW5rIHNpemVcclxuICAgICAgICBpZiAobGVuZ3RoICYmIHN0YXJ0ICsgbGVuZ3RoID4gdG90YWwpIHtcclxuICAgICAgICAgIGVuZCA9IHRvdGFsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBlbmQgPSBzdGFydCArIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gR2V0IGNodW5rXHJcbiAgICAgICAgbGV0IGNodW5rID0gZGF0YS5zbGljZShzdGFydCwgZW5kKTtcclxuICAgICAgICAvLyBQYXNzIGNodW5rIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBudWxsLCBjaHVuayk7XHJcblxyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdyZWFkIGVycm9yJywgZXJyKTtcclxuICAgICAgICAvLyBSZXRyeSB0byByZWFkIGNodW5rXHJcbiAgICAgICAgTWV0ZW9yLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKHRyaWVzIDwgc2VsZi5tYXhUcmllcykge1xyXG4gICAgICAgICAgICB0cmllcyArPSAxO1xyXG4gICAgICAgICAgICBzZWxmLnJlYWRDaHVuayhzdGFydCwgbGVuZ3RoLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgc2VsZi5yZXRyeURlbGF5KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbmRzIGEgZmlsZSBjaHVuayB0byB0aGUgc3RvcmVcclxuICAgICAqL1xyXG4gICAgc2VsZi5zZW5kQ2h1bmsgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICghY29tcGxldGUgJiYgc3RhcnRUaW1lICE9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKG9mZnNldCA8IHRvdGFsKSB7XHJcbiAgICAgICAgICBsZXQgY2h1bmtTaXplID0gc2VsZi5jaHVua1NpemU7XHJcblxyXG4gICAgICAgICAgLy8gVXNlIGFkYXB0aXZlIGxlbmd0aFxyXG4gICAgICAgICAgaWYgKHNlbGYuYWRhcHRpdmUgJiYgdGltZUEgJiYgdGltZUIgJiYgdGltZUIgPiB0aW1lQSkge1xyXG4gICAgICAgICAgICBsZXQgZHVyYXRpb24gPSAodGltZUIgLSB0aW1lQSkgLyAxMDAwO1xyXG4gICAgICAgICAgICBsZXQgbWF4ID0gc2VsZi5jYXBhY2l0eSAqICgxICsgY2FwYWNpdHlNYXJnaW4pO1xyXG4gICAgICAgICAgICBsZXQgbWluID0gc2VsZi5jYXBhY2l0eSAqICgxIC0gY2FwYWNpdHlNYXJnaW4pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID49IG1heCkge1xyXG4gICAgICAgICAgICAgIGNodW5rU2l6ZSA9IE1hdGguYWJzKE1hdGgucm91bmQoY2h1bmtTaXplICogKG1heCAtIGR1cmF0aW9uKSkpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkdXJhdGlvbiA8IG1pbikge1xyXG4gICAgICAgICAgICAgIGNodW5rU2l6ZSA9IE1hdGgucm91bmQoY2h1bmtTaXplICogKG1pbiAvIGR1cmF0aW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTGltaXQgdG8gbWF4IGNodW5rIHNpemVcclxuICAgICAgICAgICAgaWYgKHNlbGYubWF4Q2h1bmtTaXplID4gMCAmJiBjaHVua1NpemUgPiBzZWxmLm1heENodW5rU2l6ZSkge1xyXG4gICAgICAgICAgICAgIGNodW5rU2l6ZSA9IHNlbGYubWF4Q2h1bmtTaXplO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmVkdWNlIGNodW5rIHNpemUgdG8gZml0IHRvdGFsXHJcbiAgICAgICAgICBpZiAob2Zmc2V0ICsgY2h1bmtTaXplID4gdG90YWwpIHtcclxuICAgICAgICAgICAgY2h1bmtTaXplID0gdG90YWwgLSBvZmZzZXQ7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUHJlcGFyZSB0aGUgY2h1bmtcclxuICAgICAgICAgIHNlbGYucmVhZENodW5rKG9mZnNldCwgY2h1bmtTaXplLCBmdW5jdGlvbiAoZXJyLCBjaHVuaykge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoWzIwMCwgMjAxLCAyMDIsIDIwNF0uaW5jbHVkZXMoeGhyLnN0YXR1cykpIHtcclxuICAgICAgICAgICAgICAgICAgdGltZUIgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gY2h1bmtTaXplO1xyXG4gICAgICAgICAgICAgICAgICBsb2FkZWQgKz0gY2h1bmtTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gU2VuZCBuZXh0IGNodW5rXHJcbiAgICAgICAgICAgICAgICAgIHNlbGYub25Qcm9ncmVzcyhmaWxlLCBzZWxmLmdldFByb2dyZXNzKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gRmluaXNoIHVwbG9hZFxyXG4gICAgICAgICAgICAgICAgICBpZiAobG9hZGVkID49IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxhcHNlZFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIE1ldGVvci5zZXRUaW1lb3V0KHNlbGYuc2VuZENodW5rLCBzZWxmLnRyYW5zZmVyRGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFbNDAyLCA0MDMsIDQwNCwgNTAwXS5pbmNsdWRlcyh4aHIuc3RhdHVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAvLyBSZXRyeSB1bnRpbCBtYXggdHJpZXMgaXMgcmVhY2hcclxuICAgICAgICAgICAgICAgICAgLy8gQnV0IGRvbid0IHJldHJ5IGlmIHRoZXNlIGVycm9ycyBvY2N1clxyXG4gICAgICAgICAgICAgICAgICBpZiAodHJpZXMgPD0gc2VsZi5tYXhUcmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyaWVzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2FpdCBiZWZvcmUgcmV0cnlpbmdcclxuICAgICAgICAgICAgICAgICAgICBNZXRlb3Iuc2V0VGltZW91dChzZWxmLnNlbmRDaHVuaywgc2VsZi5yZXRyeURlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdXBsb2FkIHByb2dyZXNzXHJcbiAgICAgICAgICAgIGxldCBwcm9ncmVzcyA9IChvZmZzZXQgKyBjaHVua1NpemUpIC8gdG90YWw7XHJcbiAgICAgICAgICAgIC8vIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAvLyBmb3JtRGF0YS5hcHBlbmQoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xyXG4gICAgICAgICAgICAvLyBmb3JtRGF0YS5hcHBlbmQoJ2NodW5rJywgY2h1bmspO1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gYCR7cG9zdFVybH0mcHJvZ3Jlc3M9JHtwcm9ncmVzc31gO1xyXG5cclxuICAgICAgICAgICAgdGltZUEgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICB0aW1lQiA9IG51bGw7XHJcbiAgICAgICAgICAgIHVwbG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBTZW5kIGNodW5rIHRvIHRoZSBzdG9yZVxyXG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhoci5zZW5kKGNodW5rKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBvciByZXN1bWVzIHRoZSB0cmFuc2ZlclxyXG4gICAgICovXHJcbiAgICBzZWxmLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoIWZpbGVJZCkge1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZmlsZSBkb2N1bWVudCBhbmQgZ2V0IHRoZSB0b2tlblxyXG4gICAgICAgIC8vIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbmQgY2h1bmtzIHRvIHRoZSBzdG9yZS5cclxuICAgICAgICBNZXRlb3IuY2FsbCgndWZzQ3JlYXRlJywgXy5leHRlbmQoe30sIGZpbGUpLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcclxuICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICB0b2tlbiA9IHJlc3VsdC50b2tlbjtcclxuICAgICAgICAgICAgcG9zdFVybCA9IHJlc3VsdC51cmw7XHJcbiAgICAgICAgICAgIGZpbGVJZCA9IHJlc3VsdC5maWxlSWQ7XHJcbiAgICAgICAgICAgIGZpbGUuX2lkID0gcmVzdWx0LmZpbGVJZDtcclxuICAgICAgICAgICAgc2VsZi5vbkNyZWF0ZShmaWxlKTtcclxuICAgICAgICAgICAgdHJpZXMgPSAwO1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICBzZWxmLm9uU3RhcnQoZmlsZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2VuZENodW5rKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoIXVwbG9hZGluZyAmJiAhY29tcGxldGUpIHtcclxuICAgICAgICAvLyBSZXN1bWUgdXBsb2FkaW5nXHJcbiAgICAgICAgdHJpZXMgPSAwO1xyXG4gICAgICAgIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgc2VsZi5vblN0YXJ0KGZpbGUpO1xyXG4gICAgICAgIHNlbGYuc2VuZENodW5rKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wcyB0aGUgdHJhbnNmZXJcclxuICAgICAqL1xyXG4gICAgc2VsZi5zdG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodXBsb2FkaW5nKSB7XHJcbiAgICAgICAgLy8gVXBkYXRlIGVsYXBzZWQgdGltZVxyXG4gICAgICAgIGVsYXBzZWRUaW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcclxuICAgICAgICBzdGFydFRpbWUgPSBudWxsO1xyXG4gICAgICAgIHVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGYub25TdG9wKGZpbGUpO1xyXG5cclxuICAgICAgICBNZXRlb3IuY2FsbCgndWZzU3RvcCcsIGZpbGVJZCwgc3RvcmUsIHRva2VuLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcclxuICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgaXMgYWJvcnRlZFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgb25BYm9ydChmaWxlKSB7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgaXMgY29tcGxldGVcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIG9uQ29tcGxldGUoZmlsZSkge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZpbGUgaXMgY3JlYXRlZCBpbiB0aGUgY29sbGVjdGlvblxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgb25DcmVhdGUoZmlsZSkge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYW4gZXJyb3Igb2NjdXJzIGR1cmluZyBmaWxlIHVwbG9hZFxyXG4gICAqIEBwYXJhbSBlcnJcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIG9uRXJyb3IoZXJyLCBmaWxlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGB1ZnM6ICR7ZXJyLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGZpbGUgY2h1bmsgaGFzIGJlZW4gc2VudFxyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICogQHBhcmFtIHByb2dyZXNzIGlzIGEgZmxvYXQgZnJvbSAwLjAgdG8gMS4wXHJcbiAgICovXHJcbiAgb25Qcm9ncmVzcyhmaWxlLCBwcm9ncmVzcykge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZpbGUgdXBsb2FkIHN0YXJ0c1xyXG4gICAqIEBwYXJhbSBmaWxlXHJcbiAgICovXHJcbiAgb25TdGFydChmaWxlKSB7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgc3RvcHNcclxuICAgKiBAcGFyYW0gZmlsZVxyXG4gICAqL1xyXG4gIG9uU3RvcChmaWxlKSB7XHJcbiAgfVxyXG59XHJcbiJdfQ==
