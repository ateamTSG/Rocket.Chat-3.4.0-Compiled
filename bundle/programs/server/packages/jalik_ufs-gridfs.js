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
var options;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-gridfs":{"ufs-gridfs.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/jalik_ufs-gridfs/ufs-gridfs.js                                            //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
module.export({
  GridFSStore: () => GridFSStore
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

class GridFSStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = Object.assign({
      chunkSize: 1024 * 255,
      collectionName: 'uploadfs'
    }, options); // Check options

    if (typeof options.chunkSize !== 'number') {
      throw new TypeError('GridFSStore: chunkSize is not a number');
    }

    if (typeof options.collectionName !== 'string') {
      throw new TypeError('GridFSStore: collectionName is not a string');
    }

    super(options);
    this.chunkSize = parseInt(options.chunkSize);
    this.collectionName = options.collectionName;

    if (Meteor.isServer) {
      let mongo = Package.mongo.MongoInternals.NpmModule;
      let db = Package.mongo.MongoInternals.defaultRemoteCollectionDriver().mongo.db;
      let mongoStore = new mongo.GridFSBucket(db, {
        bucketName: options.collectionName,
        chunkSizeBytes: this.chunkSize
      });
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */

      this.delete = function (fileId, callback) {
        if (typeof callback !== 'function') {
          callback = function (err) {
            if (err) {
              console.log('error');
            }
          };
        }

        const collectionName = options.collectionName + '.files';
        db.collection(collectionName).findOne({
          '_id': fileId
        }).then(file => {
          if (file) {
            mongoStore.delete(fileId, callback);
          }
        });
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        options = Object.assign({}, options);
        return mongoStore.openDownloadStream(fileId, {
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
        let writeStream = mongoStore.openUploadStreamWithId(fileId, fileId, {
          chunkSizeBytes: this.chunkSize,
          contentType: file.type
        });
        writeStream.on('close', function () {
          writeStream.emit('finish');
        });
        return writeStream;
      };
    }
  }

}

// Add store to UFS namespace
UploadFS.store.GridFS = GridFSStore;
////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-gridfs/ufs-gridfs.js");

/* Exports */
Package._define("jalik:ufs-gridfs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-gridfs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWdyaWRmcy91ZnMtZ3JpZGZzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkdyaWRGU1N0b3JlIiwiVXBsb2FkRlMiLCJsaW5rIiwidiIsIk1ldGVvciIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiY2h1bmtTaXplIiwiY29sbGVjdGlvbk5hbWUiLCJUeXBlRXJyb3IiLCJwYXJzZUludCIsImlzU2VydmVyIiwibW9uZ28iLCJQYWNrYWdlIiwiTW9uZ29JbnRlcm5hbHMiLCJOcG1Nb2R1bGUiLCJkYiIsImRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIiwibW9uZ29TdG9yZSIsIkdyaWRGU0J1Y2tldCIsImJ1Y2tldE5hbWUiLCJjaHVua1NpemVCeXRlcyIsImRlbGV0ZSIsImZpbGVJZCIsImNhbGxiYWNrIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImNvbGxlY3Rpb24iLCJmaW5kT25lIiwidGhlbiIsImZpbGUiLCJnZXRSZWFkU3RyZWFtIiwib3BlbkRvd25sb2FkU3RyZWFtIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsIndyaXRlU3RyZWFtIiwib3BlblVwbG9hZFN0cmVhbVdpdGhJZCIsImNvbnRlbnRUeXBlIiwidHlwZSIsIm9uIiwiZW1pdCIsInN0b3JlIiwiR3JpZEZTIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxhQUFXLEVBQUMsTUFBSUE7QUFBakIsQ0FBZDtBQUE2QyxJQUFJQyxRQUFKO0FBQWFILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGtCQUFaLEVBQStCO0FBQUNELFVBQVEsQ0FBQ0UsQ0FBRCxFQUFHO0FBQUNGLFlBQVEsR0FBQ0UsQ0FBVDtBQUFXOztBQUF4QixDQUEvQixFQUF5RCxDQUF6RDtBQUE0RCxJQUFJQyxN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R0FBR25CLFVBQVUsQ0FBQ29CLHNCQUFYLENBQWtDZixNQUFsQyxFQUEwQ0EsTUFBMUMsRUFBa0Q7QUFDbEVGLHdCQUFjLEVBQUUsS0FBS2QsU0FENkM7QUFFbEVnQyxxQkFBVyxFQUFFUixJQUFJLENBQUNTO0FBRmdELFNBQWxELENBQWxCO0FBSUFILG1CQUFXLENBQUNJLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFlBQVk7QUFDbENKLHFCQUFXLENBQUNLLElBQVosQ0FBaUIsUUFBakI7QUFDRCxTQUZEO0FBR0EsZUFBT0wsV0FBUDtBQUNELE9BVEQ7QUFVRDtBQUNGOztBQXJGNkM7O0FBd0ZoRDtBQUNBdkMsUUFBUSxDQUFDNkMsS0FBVCxDQUFlQyxNQUFmLEdBQXdCL0MsV0FBeEIsQyIsImZpbGUiOiIvcGFja2FnZXMvamFsaWtfdWZzLWdyaWRmcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICovXG5pbXBvcnQgeyBVcGxvYWRGUyB9IGZyb20gJ21ldGVvci9qYWxpazp1ZnMnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qKlxuICogR3JpZEZTIHN0b3JlXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBHcmlkRlNTdG9yZSBleHRlbmRzIFVwbG9hZEZTLlN0b3JlIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgY2h1bmtTaXplOiAxMDI0ICogMjU1LFxuICAgICAgY29sbGVjdGlvbk5hbWU6ICd1cGxvYWRmcycsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBDaGVjayBvcHRpb25zXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmNodW5rU2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dyaWRGU1N0b3JlOiBjaHVua1NpemUgaXMgbm90IGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dyaWRGU1N0b3JlOiBjb2xsZWN0aW9uTmFtZSBpcyBub3QgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIHRoaXMuY2h1bmtTaXplID0gcGFyc2VJbnQob3B0aW9ucy5jaHVua1NpemUpO1xuICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBvcHRpb25zLmNvbGxlY3Rpb25OYW1lO1xuXG4gICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgbGV0IG1vbmdvID0gUGFja2FnZS5tb25nby5Nb25nb0ludGVybmFscy5OcG1Nb2R1bGU7XG4gICAgICBsZXQgZGIgPSBQYWNrYWdlLm1vbmdvLk1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKCkubW9uZ28uZGI7XG4gICAgICBsZXQgbW9uZ29TdG9yZSA9IG5ldyBtb25nby5HcmlkRlNCdWNrZXQoZGIsIHtcbiAgICAgICAgYnVja2V0TmFtZTogb3B0aW9ucy5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgY2h1bmtTaXplQnl0ZXM6IHRoaXMuY2h1bmtTaXplLFxuICAgICAgfSk7XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyB0aGUgZmlsZVxuICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICAgKi9cbiAgICAgIHRoaXMuZGVsZXRlID0gZnVuY3Rpb24gKGZpbGVJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29sbGVjdGlvbk5hbWUgPSBvcHRpb25zLmNvbGxlY3Rpb25OYW1lICsgJy5maWxlcyc7XG4gICAgICAgIGRiLmNvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpLmZpbmRPbmUoeyAnX2lkJzogZmlsZUlkIH0pLnRoZW4oKGZpbGUpID0+IHtcbiAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgbW9uZ29TdG9yZS5kZWxldGUoZmlsZUlkLCBjYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgZmlsZSByZWFkIHN0cmVhbVxuICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICovXG4gICAgICB0aGlzLmdldFJlYWRTdHJlYW0gPSBmdW5jdGlvbiAoZmlsZUlkLCBmaWxlLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIG1vbmdvU3RvcmUub3BlbkRvd25sb2FkU3RyZWFtKGZpbGVJZCwge1xuICAgICAgICAgIHN0YXJ0OiBvcHRpb25zLnN0YXJ0LFxuICAgICAgICAgIGVuZDogb3B0aW9ucy5lbmQsXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIHdyaXRlIHN0cmVhbVxuICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICovXG4gICAgICB0aGlzLmdldFdyaXRlU3RyZWFtID0gZnVuY3Rpb24gKGZpbGVJZCwgZmlsZSwgb3B0aW9ucykge1xuICAgICAgICBsZXQgd3JpdGVTdHJlYW0gPSBtb25nb1N0b3JlLm9wZW5VcGxvYWRTdHJlYW1XaXRoSWQoZmlsZUlkLCBmaWxlSWQsIHtcbiAgICAgICAgICBjaHVua1NpemVCeXRlczogdGhpcy5jaHVua1NpemUsXG4gICAgICAgICAgY29udGVudFR5cGU6IGZpbGUudHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHdyaXRlU3RyZWFtLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB3cml0ZVN0cmVhbS5lbWl0KCdmaW5pc2gnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB3cml0ZVN0cmVhbTtcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG5cbi8vIEFkZCBzdG9yZSB0byBVRlMgbmFtZXNwYWNlXG5VcGxvYWRGUy5zdG9yZS5HcmlkRlMgPSBHcmlkRlNTdG9yZTtcbiJdfQ==
