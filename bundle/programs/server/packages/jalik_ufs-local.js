(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, file;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-local":{"ufs-local.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/jalik_ufs-local/ufs-local.js                                                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  LocalStore: () => LocalStore
});
let UploadFS;
module.link("meteor/jalik:ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);

class LocalStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = Object.assign({
      mode: '0744',
      path: 'ufs/uploads',
      writeMode: '0744'
    }, options); // Check options

    if (typeof options.mode !== 'string') {
      throw new TypeError('LocalStore: mode is not a string');
    }

    if (typeof options.path !== 'string') {
      throw new TypeError('LocalStore: path is not a string');
    }

    if (typeof options.writeMode !== 'string') {
      throw new TypeError('LocalStore: writeMode is not a string');
    }

    super(options);
    let self = this; // Private attributes

    let mode = options.mode;
    let path = options.path;
    let writeMode = options.writeMode;

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      fs.stat(path, function (err) {
        if (err) {
          const mkdirp = Npm.require('mkdirp'); // Create the directory


          mkdirp(path, {
            mode: mode
          }, function (err) {
            if (err) {
              console.error("LocalStore: cannot create store at ".concat(path, " (").concat(err.message, ")"));
            } else {
              console.info("LocalStore: store created at ".concat(path));
            }
          });
        } else {
          // Set directory permissions
          fs.chmod(path, mode, function (err) {
            err && console.error("LocalStore: cannot set store permissions ".concat(mode, " (").concat(err.message, ")"));
          });
        }
      });
    }
    /**
     * Returns the path or sub path
     * @param file
     * @return {string}
     */


    this.getPath = function (file) {
      return path + (file ? "/".concat(file) : '');
    };

    if (Meteor.isServer) {
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */
      this.delete = function (fileId, callback) {
        let path = this.getFilePath(fileId);

        if (typeof callback !== 'function') {
          callback = function (err) {
            err && console.error("LocalStore: cannot delete file \"".concat(fileId, "\" at ").concat(path, " (").concat(err.message, ")"));
          };
        }

        const fs = Npm.require('fs');

        fs.stat(path, Meteor.bindEnvironment(function (err, stat) {
          if (!err && stat && stat.isFile()) {
            fs.unlink(path, Meteor.bindEnvironment(function () {
              self.getCollection().remove(fileId);
              callback.call(self);
            }));
          }
        }));
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        const fs = Npm.require('fs');

        options = Object.assign({}, options);
        return fs.createReadStream(self.getFilePath(fileId, file), {
          flags: 'r',
          encoding: null,
          autoClose: true,
          start: options.start,
          end: options.end
        });
      };
      /**
       * Returns the file write stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getWriteStream = function (fileId, file, options) {
        const fs = Npm.require('fs');

        options = Object.assign({}, options);
        return fs.createWriteStream(self.getFilePath(fileId, file), {
          flags: 'a',
          encoding: null,
          mode: writeMode,
          start: options.start
        });
      };
    }
  }
  /**
   * Returns the file path
   * @param fileId
   * @param file
   * @return {string}
   */


  getFilePath(fileId, file) {
    file = file || this.getCollection().findOne(fileId, {
      fields: {
        extension: 1
      }
    });
    return file && this.getPath(fileId + (file.extension ? ".".concat(file.extension) : ''));
  }

}

// Add store to UFS namespace
UploadFS.store.Local = LocalStore;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-local/ufs-local.js");

/* Exports */
Package._define("jalik:ufs-local", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-local.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWxvY2FsL3Vmcy1sb2NhbC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJMb2NhbFN0b3JlIiwiVXBsb2FkRlMiLCJsaW5rIiwidiIsIk1ldGVvciIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwibW9kZSIsInBhdGgiLCJ3cml0ZU1vZGUiLCJUeXBlRXJyb3IiLCJzZWxmIiwiaXNTZXJ2ZXIiLCJmcyIsIk5wbSIsInJlcXVpcmUiLCJzdGF0IiwiZXJyIiwibWtkaXJwIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSIsImluZm8iLCJjaG1vZCIsImdldFBhdGgiLCJmaWxlIiwiZGVsZXRlIiwiZmlsZUlkIiwiY2FsbGJhY2siLCJnZXRGaWxlUGF0aCIsImJpbmRFbnZpcm9ubWVudCIsImlzRmlsZSIsInVubGluayIsImdldENvbGxlY3Rpb24iLCJyZW1vdmUiLCJjYWxsIiwiZ2V0UmVhZFN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmbGFncyIsImVuY29kaW5nIiwiYXV0b0Nsb3NlIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZmluZE9uZSIsImZpZWxkcyIsImV4dGVuc2lvbiIsInN0b3JlIiwiTG9jYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLFlBQVUsRUFBQyxNQUFJQTtBQUFoQixDQUFkO0FBQTJDLElBQUlDLFFBQUo7QUFBYUgsTUFBTSxDQUFDSSxJQUFQLENBQVksa0JBQVosRUFBK0I7QUFBQ0QsVUFBUSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsWUFBUSxHQUFDRSxDQUFUO0FBQVc7O0FBQXhCLENBQS9CLEVBQXlELENBQXpEO0FBQTRELElBQUlDLE1BQUo7QUFBV04sTUFBTSxDQUFD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Y2VzQ29udGVudCI6WyIvKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqL1xuXG5pbXBvcnQgeyBVcGxvYWRGUyB9IGZyb20gJ21ldGVvci9qYWxpazp1ZnMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogRmlsZSBzeXN0ZW0gc3RvcmVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU3RvcmUgZXh0ZW5kcyBVcGxvYWRGUy5TdG9yZSB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIG1vZGU6ICcwNzQ0JyxcbiAgICAgIHBhdGg6ICd1ZnMvdXBsb2FkcycsXG4gICAgICB3cml0ZU1vZGU6ICcwNzQ0JyxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIENoZWNrIG9wdGlvbnNcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMubW9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0xvY2FsU3RvcmU6IG1vZGUgaXMgbm90IGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5wYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTG9jYWxTdG9yZTogcGF0aCBpcyBub3QgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLndyaXRlTW9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0xvY2FsU3RvcmU6IHdyaXRlTW9kZSBpcyBub3QgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBQcml2YXRlIGF0dHJpYnV0ZXNcbiAgICBsZXQgbW9kZSA9IG9wdGlvbnMubW9kZTtcbiAgICBsZXQgcGF0aCA9IG9wdGlvbnMucGF0aDtcbiAgICBsZXQgd3JpdGVNb2RlID0gb3B0aW9ucy53cml0ZU1vZGU7XG5cbiAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xuXG4gICAgICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnN0IG1rZGlycCA9IE5wbS5yZXF1aXJlKCdta2RpcnAnKTtcblxuICAgICAgICAgIC8vIENyZWF0ZSB0aGUgZGlyZWN0b3J5XG4gICAgICAgICAgbWtkaXJwKHBhdGgsIHsgbW9kZTogbW9kZSB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYExvY2FsU3RvcmU6IGNhbm5vdCBjcmVhdGUgc3RvcmUgYXQgJHtwYXRofSAoJHtlcnIubWVzc2FnZX0pYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYExvY2FsU3RvcmU6IHN0b3JlIGNyZWF0ZWQgYXQgJHtwYXRofWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNldCBkaXJlY3RvcnkgcGVybWlzc2lvbnNcbiAgICAgICAgICBmcy5jaG1vZChwYXRoLCBtb2RlLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgTG9jYWxTdG9yZTogY2Fubm90IHNldCBzdG9yZSBwZXJtaXNzaW9ucyAke21vZGV9ICgke2Vyci5tZXNzYWdlfSlgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGF0aCBvciBzdWIgcGF0aFxuICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuZ2V0UGF0aCA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gcGF0aCArIChmaWxlID8gYC8ke2ZpbGV9YCA6ICcnKTtcbiAgICB9O1xuXG4gICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIHRoZSBmaWxlXG4gICAgICAgKiBAcGFyYW0gZmlsZUlkXG4gICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgICAqL1xuICAgICAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbiAoZmlsZUlkLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgcGF0aCA9IHRoaXMuZ2V0RmlsZVBhdGgoZmlsZUlkKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgTG9jYWxTdG9yZTogY2Fubm90IGRlbGV0ZSBmaWxlIFwiJHtmaWxlSWR9XCIgYXQgJHtwYXRofSAoJHtlcnIubWVzc2FnZX0pYCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xuICAgICAgICBmcy5zdGF0KHBhdGgsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVyciwgc3RhdCkge1xuICAgICAgICAgIGlmICghZXJyICYmIHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgZnMudW5saW5rKHBhdGgsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBzZWxmLmdldENvbGxlY3Rpb24oKS5yZW1vdmUoZmlsZUlkKTtcbiAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgZmlsZSByZWFkIHN0cmVhbVxuICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICovXG4gICAgICB0aGlzLmdldFJlYWRTdHJlYW0gPSBmdW5jdGlvbiAoZmlsZUlkLCBmaWxlLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGZzLmNyZWF0ZVJlYWRTdHJlYW0oc2VsZi5nZXRGaWxlUGF0aChmaWxlSWQsIGZpbGUpLCB7XG4gICAgICAgICAgZmxhZ3M6ICdyJyxcbiAgICAgICAgICBlbmNvZGluZzogbnVsbCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IHRydWUsXG4gICAgICAgICAgc3RhcnQ6IG9wdGlvbnMuc3RhcnQsXG4gICAgICAgICAgZW5kOiBvcHRpb25zLmVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGZpbGUgd3JpdGUgc3RyZWFtXG4gICAgICAgKiBAcGFyYW0gZmlsZUlkXG4gICAgICAgKiBAcGFyYW0gZmlsZVxuICAgICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgICAqIEByZXR1cm4geyp9XG4gICAgICAgKi9cbiAgICAgIHRoaXMuZ2V0V3JpdGVTdHJlYW0gPSBmdW5jdGlvbiAoZmlsZUlkLCBmaWxlLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHNlbGYuZ2V0RmlsZVBhdGgoZmlsZUlkLCBmaWxlKSwge1xuICAgICAgICAgIGZsYWdzOiAnYScsXG4gICAgICAgICAgZW5jb2Rpbmc6IG51bGwsXG4gICAgICAgICAgbW9kZTogd3JpdGVNb2RlLFxuICAgICAgICAgIHN0YXJ0OiBvcHRpb25zLnN0YXJ0LFxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpbGUgcGF0aFxuICAgKiBAcGFyYW0gZmlsZUlkXG4gICAqIEBwYXJhbSBmaWxlXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEZpbGVQYXRoKGZpbGVJZCwgZmlsZSkge1xuICAgIGZpbGUgPSBmaWxlIHx8IHRoaXMuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoZmlsZUlkLCB7IGZpZWxkczogeyBleHRlbnNpb246IDEgfSB9KTtcbiAgICByZXR1cm4gZmlsZSAmJiB0aGlzLmdldFBhdGgoZmlsZUlkICsgKGZpbGUuZXh0ZW5zaW9uID8gYC4ke2ZpbGUuZXh0ZW5zaW9ufWAgOiAnJykpO1xuICB9XG59XG5cbi8vIEFkZCBzdG9yZSB0byBVRlMgbmFtZXNwYWNlXG5VcGxvYWRGUy5zdG9yZS5Mb2NhbCA9IExvY2FsU3RvcmU7XG4iXX0=
