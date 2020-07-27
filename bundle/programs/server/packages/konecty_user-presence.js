(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var UsersSessions, UserPresence, UserPresenceEvents, UserPresenceMonitor;

var require = meteorInstall({"node_modules":{"meteor":{"konecty:user-presence":{"common":{"common.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/konecty_user-presence/common/common.js                                                   //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
/* globals UsersSessions */

/* exported UsersSessions */
UsersSessions = new Meteor.Collection('usersSessions');
///////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/konecty_user-presence/server/server.js                                                   //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.link("colors");

UsersSessions._ensureIndex({
  'connections.instanceId': 1
}, {
  sparse: 1,
  name: 'connections.instanceId'
});

UsersSessions._ensureIndex({
  'connections.id': 1
}, {
  sparse: 1,
  name: 'connections.id'
});

var allowedStatus = ['online', 'away', 'busy', 'offline'];
var logEnable = process.env.ENABLE_PRESENCE_LOGS === 'true';

var log = function (msg, color) {
  if (logEnable) {
    if (color) {
      console.log(msg[color]);
    } else {
      console.log(msg);
    }
  }
};

var logRed = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'red');
};

var logGrey = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'grey');
};

var logGreen = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'green');
};

var logYellow = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'yellow');
};

var checkUser = function (id, userId) {
  if (!id || !userId || id === userId) {
    return true;
  }

  var user = Meteor.users.findOne(id, {
    fields: {
      _id: 1
    }
  });

  if (user) {
    throw new Meteor.Error('cannot-change-other-users-status');
  }

  return true;
};

UserPresence = {
  activeLogs: function () {
    logEnable = true;
  },
  removeConnectionsByInstanceId: function (instanceId) {
    logRed('[user-presence] removeConnectionsByInstanceId', instanceId);
    var update = {
      $pull: {
        connections: {
          instanceId: instanceId
        }
      }
    };
    UsersSessions.update({}, update, {
      multi: true
    });
  },
  removeAllConnections: function () {
    logRed('[user-presence] removeAllConnections');
    UsersSessions.remove({});
  },

  getConnectionHandle(connectionId) {
    const internalConnection = Meteor.server.sessions.get(connectionId);

    if (!internalConnection) {
      return;
    }

    return internalConnection.connectionHandle;
  },

  createConnection: function (userId, connection, status, metadata) {
    // if connections is invalid, does not have an userId or is already closed, don't save it on db
    if (!userId || !connection.id) {
      return;
    }

    const connectionHandle = UserPresence.getConnectionHandle(connection.id);

    if (!connectionHandle || connectionHandle.closed) {
      return;
    }

    connectionHandle.UserPresenceUserId = userId;
    status = status || 'online';
    logGreen('[user-presence] createConnection', userId, connection.id, status, metadata);
    var query = {
      _id: userId
    };
    var now = new Date();
    var instanceId = undefined;

    if (Package['konecty:multiple-instances-status']) {
      instanceId = InstanceStatus.id();
    }

    var update = {
      $push: {
        connections: {
          id: connection.id,
          instanceId: instanceId,
          status: status,
          _createdAt: now,
          _updatedAt: now
        }
      }
    };

    if (metadata) {
      update.$set = {
        metadata: metadata
      };
      connection.metadata = metadata;
    } // make sure closed connections are being created


    if (!connectionHandle.closed) {
      UsersSessions.upsert(query, update);
    }
  },
  setConnection: function (userId, connection, status) {
    if (!userId) {
      return;
    }

    logGrey('[user-presence] setConnection', userId, connection.id, status);
    var query = {
      _id: userId,
      'connections.id': connection.id
    };
    var now = new Date();
    var update = {
      $set: {
        'connections.$.status': status,
        'connections.$._updatedAt': now
      }
    };

    if (connection.metadata) {
      update.$set.metadata = connection.metadata;
    }

    var count = UsersSessions.update(query, update);

    if (count === 0) {
      return UserPresence.createConnection(userId, connection, status, connection.metadata);
    }

    if (status === 'online') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'online'
        }
      }, {
        $set: {
          status: 'online'
        }
      });
    } else if (status === 'away') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'away'
        }
      }, {
        $set: {
          status: 'away'
        }
      });
    }
  },
  setDefaultStatus: function (userId, status) {
    if (!userId) {
      return;
    }

    if (allowedStatus.indexOf(status) === -1) {
      return;
    }

    logYellow('[user-presence] setDefaultStatus', userId, status);
    var update = Meteor.users.update({
      _id: userId,
      statusDefault: {
        $ne: status
      }
    }, {
      $set: {
        statusDefault: status
      }
    });

    if (update > 0) {
      UserPresenceMonitor.processUser(userId, {
        statusDefault: status
      });
    }
  },
  removeConnection: function (connectionId) {
    logRed('[user-presence] removeConnection', connectionId);
    var query = {
      'connections.id': connectionId
    };
    var update = {
      $pull: {
        connections: {
          id: connectionId
        }
      }
    };
    return UsersSessions.update(query, update);
  },
  start: function () {
    Meteor.onConnection(function (connection) {
      const session = Meteor.server.sessions.get(connection.id);
      connection.onClose(function () {
        if (!session) {
          return;
        }

        const connectionHandle = session.connectionHandle; // mark connection as closed so if it drops in the middle of the process it doesn't even is created

        if (!connectionHandle) {
          return;
        }

        connectionHandle.closed = true;

        if (connectionHandle.UserPresenceUserId != null) {
          UserPresence.removeConnection(connection.id);
        }
      });
    });
    process.on('exit', Meteor.bindEnvironment(function () {
      if (Package['konecty:multiple-instances-status']) {
        UserPresence.removeConnectionsByInstanceId(InstanceStatus.id());
      } else {
        UserPresence.removeAllConnections();
      }
    }));

    if (Package['accounts-base']) {
      Accounts.onLogin(function (login) {
        UserPresence.createConnection(login.user._id, login.connection);
      });
      Accounts.onLogout(function (login) {
        UserPresence.removeConnection(login.connection.id);
      });
    }

    Meteor.publish(null, function () {
      if (this.userId == null && this.connection && this.connection.id) {
        const connectionHandle = UserPresence.getConnectionHandle(this.connection.id);

        if (connectionHandle && connectionHandle.UserPresenceUserId != null) {
          UserPresence.removeConnection(this.connection.id);
        }
      }

      this.ready();
    });
    UserPresenceEvents.on('setStatus', function (userId, status) {
      var user = Meteor.users.findOne(userId);
      var statusConnection = status;

      if (!user) {
        return;
      }

      if (user.statusDefault != null && status !== 'offline' && user.statusDefault !== 'online') {
        status = user.statusDefault;
      }

      var query = {
        _id: userId,
        $or: [{
          status: {
            $ne: status
          }
        }, {
          statusConnection: {
            $ne: statusConnection
          }
        }]
      };
      var update = {
        $set: {
          status: status,
          statusConnection: statusConnection
        }
      };
      const result = Meteor.users.update(query, update); // if nothing updated, do not emit anything

      if (result) {
        UserPresenceEvents.emit('setUserStatus', user, status, statusConnection);
      }
    });
    Meteor.methods({
      'UserPresence:connect': function (id, metadata) {
        check(id, Match.Maybe(String));
        check(metadata, Match.Maybe(Object));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.createConnection(id || this.userId, this.connection, 'online', metadata);
      },
      'UserPresence:away': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'away');
      },
      'UserPresence:online': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'online');
      },
      'UserPresence:setDefaultStatus': function (id, status) {
        check(id, Match.Maybe(String));
        check(status, Match.Maybe(String));
        this.unblock(); // backward compatible (receives status as first argument)

        if (arguments.length === 1) {
          UserPresence.setDefaultStatus(this.userId, id);
          return;
        }

        checkUser(id, this.userId);
        UserPresence.setDefaultStatus(id || this.userId, status);
      }
    });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"monitor.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/konecty_user-presence/server/monitor.js                                                  //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
/* globals UserPresenceMonitor, UsersSessions, InstanceStatus */
var EventEmitter = Npm.require('events');

UserPresenceEvents = new EventEmitter();

function monitorUsersSessions() {
  UsersSessions.find({}).observe({
    added: function (record) {
      UserPresenceMonitor.processUserSession(record, 'added');
    },
    changed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'changed');
    },
    removed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'removed');
    }
  });
}

function monitorDeletedServers() {
  InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).observeChanges({
    removed: function (id) {
      UserPresence.removeConnectionsByInstanceId(id);
    }
  });
}

function removeLostConnections() {
  if (!Package['konecty:multiple-instances-status']) {
    return UsersSessions.remove({});
  }

  var ids = InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).fetch().map(function (id) {
    return id._id;
  });
  var update = {
    $pull: {
      connections: {
        instanceId: {
          $nin: ids
        }
      }
    }
  };
  UsersSessions.update({}, update, {
    multi: true
  });
}

UserPresenceMonitor = {
  /**
   * The callback will receive the following parameters: user, status, statusConnection
   */
  onSetUserStatus: function (callback) {
    UserPresenceEvents.on('setUserStatus', callback);
  },
  // following actions/observers will run only when presence monitor turned on
  start: function () {
    monitorUsersSessions();
    removeLostConnections();

    if (Package['konecty:multiple-instances-status']) {
      monitorDeletedServers();
    }
  },
  processUserSession: function (record, action) {
    if (action === 'removed' && (record.connections == null || record.connections.length === 0)) {
      return;
    }

    if (record.connections == null || record.connections.length === 0 || action === 'removed') {
      UserPresenceMonitor.setStatus(record._id, 'offline', record.metadata);

      if (action !== 'removed') {
        UsersSessions.remove({
          _id: record._id,
          'connections.0': {
            $exists: false
          }
        });
      }

      return;
    }

    var connectionStatus = 'offline';
    record.connections.forEach(function (connection) {
      if (connection.status === 'online') {
        connectionStatus = 'online';
      } else if (connection.status === 'away' && connectionStatus === 'offline') {
        connectionStatus = 'away';
      }
    });
    UserPresenceMonitor.setStatus(record._id, connectionStatus, record.metadata);
  },
  processUser: function (id, fields) {
    if (fields.statusDefault == null) {
      return;
    }

    var userSession = UsersSessions.findOne({
      _id: id
    });

    if (userSession) {
      UserPresenceMonitor.processUserSession(userSession, 'changed');
    }
  },
  setStatus: function (id, status, metadata) {
    UserPresenceEvents.emit('setStatus', id, status, metadata);
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"colors":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// node_modules/meteor/konecty_user-presence/node_modules/colors/package.json                        //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.exports = {
  "name": "colors",
  "version": "1.3.2",
  "main": "lib/index.js"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// node_modules/meteor/konecty_user-presence/node_modules/colors/lib/index.js                        //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/konecty:user-presence/common/common.js");
require("/node_modules/meteor/konecty:user-presence/server/server.js");
require("/node_modules/meteor/konecty:user-presence/server/monitor.js");

/* Exports */
Package._define("konecty:user-presence", {
  UserPresence: UserPresence,
  UsersSessions: UsersSessions,
  UserPresenceMonitor: UserPresenceMonitor,
  UserPresenceEvents: UserPresenceEvents
});

})();

//# sourceURL=meteor://💻app/packages/konecty_user-presence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMva29uZWN0eTp1c2VyLXByZXNlbmNlL2NvbW1vbi9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2tvbmVjdHk6dXNlci1wcmVzZW5jZS9zZXJ2ZXIvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9rb25lY3R5OnVzZXItcHJlc2VuY2Uvc2VydmVyL21vbml0b3IuanMiXSwibmFtZXMiOlsiVXNlcnNTZXNzaW9ucyIsIk1ldGVvciIsIkNvbGxlY3Rpb24iLCJtb2R1bGUiLCJsaW5rIiwiX2Vuc3VyZUluZGV4Iiwic3BhcnNlIiwibmFtZSIsImFsbG93ZWRTdGF0dXMiLCJsb2dFbmFibGUiLCJwcm9jZXNzIiwiZW52IiwiRU5BQkxFX1BSRVNFTkNFX0xPR1MiLCJsb2ciLCJtc2ciLCJjb2xvciIsImNvbnNvbGUiLCJsb2dSZWQiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImpvaW4iLCJsb2dHcmV5IiwibG9nR3JlZW4iLCJsb2dZZWxsb3ciLCJjaGVja1VzZXIiLCJpZCIsInVzZXJJZCIsInVzZXIiLCJ1c2VycyIsImZpbmRPbmUiLCJmaWVsZHMiLCJfaWQiLCJFcnJvciIsIlVzZXJQcmVzZW5jZSIsImFjdGl2ZUxvZ3MiLCJyZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZCIsImluc3RhbmNlSWQiLCJ1cGRhdGUiLCIkcHVsbCIsImNvbm5lY3Rpb25zIiwibXVsdGkiLCJyZW1vdmVBbGxDb25uZWN0aW9ucyIsInJlbW92ZSIsImdldENvbm5lY3Rpb25IYW5kbGUiLCJjb25uZWN0aW9uSWQiLCJpbnRlcm5hbENvbm5lY3Rpb24iLCJzZXJ2ZXIiLCJzZXNzaW9ucyIsImdldCIsImNvbm5lY3Rpb25IYW5kbGUiLCJjcmVhdGVDb25uZWN0aW9uIiwiY29ubmVjdGlvbiIsInN0YXR1cyIsIm1ldGFkYXRhIiwiY2xvc2VkIiwiVXNlclByZXNlbmNlVXNlcklkIiwicXVlcnkiLCJub3ciLCJEYXRlIiwidW5kZWZpbmVkIiwiUGFja2FnZSIsIkluc3RhbmNlU3RhdHVzIiwiJHB1c2giLCJfY3JlYXRlZEF0IiwiX3VwZGF0ZWRBdCIsIiRzZXQiLCJ1cHNlcnQiLCJzZXRDb25uZWN0aW9uIiwiY291bnQiLCJzdGF0dXNEZWZhdWx0IiwiJG5lIiwic2V0RGVmYXVsdFN0YXR1cyIsImluZGV4T2YiLCJVc2VyUHJlc2VuY2VNb25pdG9yIiwicHJvY2Vzc1VzZXIiLCJyZW1vdmVDb25uZWN0aW9uIiwic3RhcnQiLCJvbkNvbm5lY3Rpb24iLCJzZXNzaW9uIiwib25DbG9zZSIsIm9uIiwiYmluZEVudmlyb25tZW50IiwiQWNjb3VudHMiLCJvbkxvZ2luIiwibG9naW4iLCJvbkxvZ291dCIsInB1Ymxpc2giLCJyZWFkeSIsIlVzZXJQcmVzZW5jZUV2ZW50cyIsInN0YXR1c0Nvbm5lY3Rpb24iLCIkb3IiLCJyZXN1bHQiLCJlbWl0IiwibWV0aG9kcyIsImNoZWNrIiwiTWF0Y2giLCJNYXliZSIsIlN0cmluZyIsIk9iamVjdCIsInVuYmxvY2siLCJsZW5ndGgiLCJFdmVudEVtaXR0ZXIiLCJOcG0iLCJyZXF1aXJlIiwibW9uaXRvclVzZXJzU2Vzc2lvbnMiLCJmaW5kIiwib2JzZXJ2ZSIsImFkZGVkIiwicmVjb3JkIiwicHJvY2Vzc1VzZXJTZXNzaW9uIiwiY2hhbmdlZCIsInJlbW92ZWQiLCJtb25pdG9yRGVsZXRlZFNlcnZlcnMiLCJnZXRDb2xsZWN0aW9uIiwib2JzZXJ2ZUNoYW5nZXMiLCJyZW1vdmVMb3N0Q29ubmVjdGlvbnMiLCJpZHMiLCJmZXRjaCIsIm1hcCIsIiRuaW4iLCJvblNldFVzZXJTdGF0dXMiLCJjYWxsYmFjayIsImFjdGlvbiIsInNldFN0YXR1cyIsIiRleGlzdHMiLCJjb25uZWN0aW9uU3RhdHVzIiwiZm9yRWFjaCIsInVzZXJTZXNzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FB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QUdsSSxhQUFhLENBQUNnQyxPQUFkLENBQXNCO0FBQUNFLFNBQUcsRUFBRU47QUFBTixLQUF0QixDQUFsQjs7QUFFQSxRQUFJc0csV0FBSixFQUFpQjtBQUNoQnRELHlCQUFtQixDQUFDb0Msa0JBQXBCLENBQXVDa0IsV0FBdkMsRUFBb0QsU0FBcEQ7QUFDQTtBQUNELEdBdERvQjtBQXdEckJKLFdBQVMsRUFBRSxVQUFTbEcsRUFBVCxFQUFhMkIsTUFBYixFQUFxQkMsUUFBckIsRUFBK0I7QUFDekNtQyxzQkFBa0IsQ0FBQ0ksSUFBbkIsQ0FBd0IsV0FBeEIsRUFBcUNuRSxFQUFyQyxFQUF5QzJCLE1BQXpDLEVBQWlEQyxRQUFqRDtBQUNBO0FBMURvQixDQUF0QixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9rb25lY3R5X3VzZXItcHJlc2VuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIFVzZXJzU2Vzc2lvbnMgKi9cbi8qIGV4cG9ydGVkIFVzZXJzU2Vzc2lvbnMgKi9cblxuVXNlcnNTZXNzaW9ucyA9IG5ldyBNZXRlb3IuQ29sbGVjdGlvbigndXNlcnNTZXNzaW9ucycpO1xuIiwiLyogZ2xvYmFscyBJbnN0YW5jZVN0YXR1cywgVXNlcnNTZXNzaW9ucywgVXNlclByZXNlbmNlTW9uaXRvciwgVXNlclByZXNlbmNlICovXG5pbXBvcnQgJ2NvbG9ycyc7XG5cblVzZXJzU2Vzc2lvbnMuX2Vuc3VyZUluZGV4KHsnY29ubmVjdGlvbnMuaW5zdGFuY2VJZCc6IDF9LCB7c3BhcnNlOiAxLCBuYW1lOiAnY29ubmVjdGlvbnMuaW5zdGFuY2VJZCd9KTtcblVzZXJzU2Vzc2lvbnMuX2Vuc3VyZUluZGV4KHsnY29ubmVjdGlvbnMuaWQnOiAxfSwge3NwYXJzZTogMSwgbmFtZTogJ2Nvbm5lY3Rpb25zLmlkJ30pO1xuXG52YXIgYWxsb3dlZFN0YXR1cyA9IFsnb25saW5lJywgJ2F3YXknLCAnYnVzeScsICdvZmZsaW5lJ107XG5cbnZhciBsb2dFbmFibGUgPSBwcm9jZXNzLmVudi5FTkFCTEVfUFJFU0VOQ0VfTE9HUyA9PT0gJ3RydWUnO1xuXG52YXIgbG9nID0gZnVuY3Rpb24obXNnLCBjb2xvcikge1xuXHRpZiAobG9nRW5hYmxlKSB7XG5cdFx0aWYgKGNvbG9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2dbY29sb3JdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsb2dSZWQgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAncmVkJyk7XG59O1xudmFyIGxvZ0dyZXkgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAnZ3JleScpO1xufTtcbnZhciBsb2dHcmVlbiA9IGZ1bmN0aW9uKCkge1xuXHRsb2coQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJyksICdncmVlbicpO1xufTtcbnZhciBsb2dZZWxsb3cgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAneWVsbG93Jyk7XG59O1xuXG52YXIgY2hlY2tVc2VyID0gZnVuY3Rpb24oaWQsIHVzZXJJZCkge1xuXHRpZiAoIWlkIHx8ICF1c2VySWQgfHwgaWQgPT09IHVzZXJJZCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHZhciB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoaWQsIHsgZmllbGRzOiB7IF9pZDogMSB9IH0pO1xuXHRpZiAodXNlcikge1xuXHRcdHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2Nhbm5vdC1jaGFuZ2Utb3RoZXItdXNlcnMtc3RhdHVzJyk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuVXNlclByZXNlbmNlID0ge1xuXHRhY3RpdmVMb2dzOiBmdW5jdGlvbigpIHtcblx0XHRsb2dFbmFibGUgPSB0cnVlO1xuXHR9LFxuXG5cdHJlbW92ZUNvbm5lY3Rpb25zQnlJbnN0YW5jZUlkOiBmdW5jdGlvbihpbnN0YW5jZUlkKSB7XG5cdFx0bG9nUmVkKCdbdXNlci1wcmVzZW5jZV0gcmVtb3ZlQ29ubmVjdGlvbnNCeUluc3RhbmNlSWQnLCBpbnN0YW5jZUlkKTtcblx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0JHB1bGw6IHtcblx0XHRcdFx0Y29ubmVjdGlvbnM6IHtcblx0XHRcdFx0XHRpbnN0YW5jZUlkOiBpbnN0YW5jZUlkXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0VXNlcnNTZXNzaW9ucy51cGRhdGUoe30sIHVwZGF0ZSwge211bHRpOiB0cnVlfSk7XG5cdH0sXG5cblx0cmVtb3ZlQWxsQ29ubmVjdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdGxvZ1JlZCgnW3VzZXItcHJlc2VuY2VdIHJlbW92ZUFsbENvbm5lY3Rpb25zJyk7XG5cdFx0VXNlcnNTZXNzaW9ucy5yZW1vdmUoe30pO1xuXHR9LFxuXG5cdGdldENvbm5lY3Rpb25IYW5kbGUoY29ubmVjdGlvbklkKSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxDb25uZWN0aW9uID0gTWV0ZW9yLnNlcnZlci5zZXNzaW9ucy5nZXQoY29ubmVjdGlvbklkKTtcblxuXHRcdGlmICghaW50ZXJuYWxDb25uZWN0aW9uKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGludGVybmFsQ29ubmVjdGlvbi5jb25uZWN0aW9uSGFuZGxlO1xuXHR9LFxuXG5cdGNyZWF0ZUNvbm5lY3Rpb246IGZ1bmN0aW9uKHVzZXJJZCwgY29ubmVjdGlvbiwgc3RhdHVzLCBtZXRhZGF0YSkge1xuXHRcdC8vIGlmIGNvbm5lY3Rpb25zIGlzIGludmFsaWQsIGRvZXMgbm90IGhhdmUgYW4gdXNlcklkIG9yIGlzIGFscmVhZHkgY2xvc2VkLCBkb24ndCBzYXZlIGl0IG9uIGRiXG5cdFx0aWYgKCF1c2VySWQgfHwgIWNvbm5lY3Rpb24uaWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBjb25uZWN0aW9uSGFuZGxlID0gVXNlclByZXNlbmNlLmdldENvbm5lY3Rpb25IYW5kbGUoY29ubmVjdGlvbi5pZCk7XG5cblx0XHRpZiAoIWNvbm5lY3Rpb25IYW5kbGUgfHwgY29ubmVjdGlvbkhhbmRsZS5jbG9zZWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25uZWN0aW9uSGFuZGxlLlVzZXJQcmVzZW5jZVVzZXJJZCA9IHVzZXJJZDtcblxuXHRcdHN0YXR1cyA9IHN0YXR1cyB8fCAnb25saW5lJztcblxuXHRcdGxvZ0dyZWVuKCdbdXNlci1wcmVzZW5jZV0gY3JlYXRlQ29ubmVjdGlvbicsIHVzZXJJZCwgY29ubmVjdGlvbi5pZCwgc3RhdHVzLCBtZXRhZGF0YSk7XG5cblx0XHR2YXIgcXVlcnkgPSB7XG5cdFx0XHRfaWQ6IHVzZXJJZFxuXHRcdH07XG5cblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKTtcblxuXHRcdHZhciBpbnN0YW5jZUlkID0gdW5kZWZpbmVkO1xuXHRcdGlmIChQYWNrYWdlWydrb25lY3R5Om11bHRpcGxlLWluc3RhbmNlcy1zdGF0dXMnXSkge1xuXHRcdFx0aW5zdGFuY2VJZCA9IEluc3RhbmNlU3RhdHVzLmlkKCk7XG5cdFx0fVxuXG5cdFx0dmFyIHVwZGF0ZSA9IHtcblx0XHRcdCRwdXNoOiB7XG5cdFx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdFx0aWQ6IGNvbm5lY3Rpb24uaWQsXG5cdFx0XHRcdFx0aW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcblx0XHRcdFx0XHRzdGF0dXM6IHN0YXR1cyxcblx0XHRcdFx0XHRfY3JlYXRlZEF0OiBub3csXG5cdFx0XHRcdFx0X3VwZGF0ZWRBdDogbm93XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKG1ldGFkYXRhKSB7XG5cdFx0XHR1cGRhdGUuJHNldCA9IHtcblx0XHRcdFx0bWV0YWRhdGE6IG1ldGFkYXRhXG5cdFx0XHR9O1xuXHRcdFx0Y29ubmVjdGlvbi5tZXRhZGF0YSA9IG1ldGFkYXRhO1xuXHRcdH1cblxuXHRcdC8vIG1ha2Ugc3VyZSBjbG9zZWQgY29ubmVjdGlvbnMgYXJlIGJlaW5nIGNyZWF0ZWRcblx0XHRpZiAoIWNvbm5lY3Rpb25IYW5kbGUuY2xvc2VkKSB7XG5cdFx0XHRVc2Vyc1Nlc3Npb25zLnVwc2VydChxdWVyeSwgdXBkYXRlKTtcblx0XHR9XG5cdH0sXG5cblx0c2V0Q29ubmVjdGlvbjogZnVuY3Rpb24odXNlcklkLCBjb25uZWN0aW9uLCBzdGF0dXMpIHtcblx0XHRpZiAoIXVzZXJJZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxvZ0dyZXkoJ1t1c2VyLXByZXNlbmNlXSBzZXRDb25uZWN0aW9uJywgdXNlcklkLCBjb25uZWN0aW9uLmlkLCBzdGF0dXMpO1xuXG5cdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0X2lkOiB1c2VySWQsXG5cdFx0XHQnY29ubmVjdGlvbnMuaWQnOiBjb25uZWN0aW9uLmlkXG5cdFx0fTtcblxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0dmFyIHVwZGF0ZSA9IHtcblx0XHRcdCRzZXQ6IHtcblx0XHRcdFx0J2Nvbm5lY3Rpb25zLiQuc3RhdHVzJzogc3RhdHVzLFxuXHRcdFx0XHQnY29ubmVjdGlvbnMuJC5fdXBkYXRlZEF0Jzogbm93XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChjb25uZWN0aW9uLm1ldGFkYXRhKSB7XG5cdFx0XHR1cGRhdGUuJHNldC5tZXRhZGF0YSA9IGNvbm5lY3Rpb24ubWV0YWRhdGE7XG5cdFx0fVxuXG5cdFx0dmFyIGNvdW50ID0gVXNlcnNTZXNzaW9ucy51cGRhdGUocXVlcnksIHVwZGF0ZSk7XG5cblx0XHRpZiAoY291bnQgPT09IDApIHtcblx0XHRcdHJldHVybiBVc2VyUHJlc2VuY2UuY3JlYXRlQ29ubmVjdGlvbih1c2VySWQsIGNvbm5lY3Rpb24sIHN0YXR1cywgY29ubmVjdGlvbi5tZXRhZGF0YSk7XG5cdFx0fVxuXG5cdFx0aWYgKHN0YXR1cyA9PT0gJ29ubGluZScpIHtcblx0XHRcdE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlcklkLCBzdGF0dXNEZWZhdWx0OiAnb25saW5lJywgc3RhdHVzOiB7JG5lOiAnb25saW5lJ319LCB7JHNldDoge3N0YXR1czogJ29ubGluZSd9fSk7XG5cdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09ICdhd2F5Jykge1xuXHRcdFx0TWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VySWQsIHN0YXR1c0RlZmF1bHQ6ICdvbmxpbmUnLCBzdGF0dXM6IHskbmU6ICdhd2F5J319LCB7JHNldDoge3N0YXR1czogJ2F3YXknfX0pO1xuXHRcdH1cblx0fSxcblxuXHRzZXREZWZhdWx0U3RhdHVzOiBmdW5jdGlvbih1c2VySWQsIHN0YXR1cykge1xuXHRcdGlmICghdXNlcklkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGFsbG93ZWRTdGF0dXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxvZ1llbGxvdygnW3VzZXItcHJlc2VuY2VdIHNldERlZmF1bHRTdGF0dXMnLCB1c2VySWQsIHN0YXR1cyk7XG5cblx0XHR2YXIgdXBkYXRlID0gTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VySWQsIHN0YXR1c0RlZmF1bHQ6IHskbmU6IHN0YXR1c319LCB7JHNldDoge3N0YXR1c0RlZmF1bHQ6IHN0YXR1c319KTtcblxuXHRcdGlmICh1cGRhdGUgPiAwKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnByb2Nlc3NVc2VyKHVzZXJJZCwgeyBzdGF0dXNEZWZhdWx0OiBzdGF0dXMgfSk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbW92ZUNvbm5lY3Rpb246IGZ1bmN0aW9uKGNvbm5lY3Rpb25JZCkge1xuXHRcdGxvZ1JlZCgnW3VzZXItcHJlc2VuY2VdIHJlbW92ZUNvbm5lY3Rpb24nLCBjb25uZWN0aW9uSWQpO1xuXG5cdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0J2Nvbm5lY3Rpb25zLmlkJzogY29ubmVjdGlvbklkXG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGUgPSB7XG5cdFx0XHQkcHVsbDoge1xuXHRcdFx0XHRjb25uZWN0aW9uczoge1xuXHRcdFx0XHRcdGlkOiBjb25uZWN0aW9uSWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gVXNlcnNTZXNzaW9ucy51cGRhdGUocXVlcnksIHVwZGF0ZSk7XG5cdH0sXG5cblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdE1ldGVvci5vbkNvbm5lY3Rpb24oZnVuY3Rpb24oY29ubmVjdGlvbikge1xuXHRcdFx0Y29uc3Qgc2Vzc2lvbiA9IE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMuZ2V0KGNvbm5lY3Rpb24uaWQpO1xuXG5cdFx0XHRjb25uZWN0aW9uLm9uQ2xvc2UoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICghc2Vzc2lvbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGNvbm5lY3Rpb25IYW5kbGUgPSBzZXNzaW9uLmNvbm5lY3Rpb25IYW5kbGU7XG5cblx0XHRcdFx0Ly8gbWFyayBjb25uZWN0aW9uIGFzIGNsb3NlZCBzbyBpZiBpdCBkcm9wcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBwcm9jZXNzIGl0IGRvZXNuJ3QgZXZlbiBpcyBjcmVhdGVkXG5cdFx0XHRcdGlmICghY29ubmVjdGlvbkhhbmRsZSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25uZWN0aW9uSGFuZGxlLmNsb3NlZCA9IHRydWU7XG5cblx0XHRcdFx0aWYgKGNvbm5lY3Rpb25IYW5kbGUuVXNlclByZXNlbmNlVXNlcklkICE9IG51bGwpIHtcblx0XHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRwcm9jZXNzLm9uKCdleGl0JywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbigpIHtcblx0XHRcdGlmIChQYWNrYWdlWydrb25lY3R5Om11bHRpcGxlLWluc3RhbmNlcy1zdGF0dXMnXSkge1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbnNCeUluc3RhbmNlSWQoSW5zdGFuY2VTdGF0dXMuaWQoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQWxsQ29ubmVjdGlvbnMoKTtcblx0XHRcdH1cblx0XHR9KSk7XG5cblx0XHRpZiAoUGFja2FnZVsnYWNjb3VudHMtYmFzZSddKSB7XG5cdFx0XHRBY2NvdW50cy5vbkxvZ2luKGZ1bmN0aW9uKGxvZ2luKSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5jcmVhdGVDb25uZWN0aW9uKGxvZ2luLnVzZXIuX2lkLCBsb2dpbi5jb25uZWN0aW9uKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRBY2NvdW50cy5vbkxvZ291dChmdW5jdGlvbihsb2dpbikge1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbihsb2dpbi5jb25uZWN0aW9uLmlkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdE1ldGVvci5wdWJsaXNoKG51bGwsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHRoaXMudXNlcklkID09IG51bGwgJiYgdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pZCkge1xuXHRcdFx0XHRjb25zdCBjb25uZWN0aW9uSGFuZGxlID0gVXNlclByZXNlbmNlLmdldENvbm5lY3Rpb25IYW5kbGUodGhpcy5jb25uZWN0aW9uLmlkKTtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb25IYW5kbGUgJiYgY29ubmVjdGlvbkhhbmRsZS5Vc2VyUHJlc2VuY2VVc2VySWQgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uKHRoaXMuY29ubmVjdGlvbi5pZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5yZWFkeSgpO1xuXHRcdH0pO1xuXG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRTdGF0dXMnLCBmdW5jdGlvbih1c2VySWQsIHN0YXR1cykge1xuXHRcdFx0dmFyIHVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZSh1c2VySWQpO1xuXHRcdFx0dmFyIHN0YXR1c0Nvbm5lY3Rpb24gPSBzdGF0dXM7XG5cblx0XHRcdGlmICghdXNlcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VyLnN0YXR1c0RlZmF1bHQgIT0gbnVsbCAmJiBzdGF0dXMgIT09ICdvZmZsaW5lJyAmJiB1c2VyLnN0YXR1c0RlZmF1bHQgIT09ICdvbmxpbmUnKSB7XG5cdFx0XHRcdHN0YXR1cyA9IHVzZXIuc3RhdHVzRGVmYXVsdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRfaWQ6IHVzZXJJZCxcblx0XHRcdFx0JG9yOiBbXG5cdFx0XHRcdFx0e3N0YXR1czogeyRuZTogc3RhdHVzfX0sXG5cdFx0XHRcdFx0e3N0YXR1c0Nvbm5lY3Rpb246IHskbmU6IHN0YXR1c0Nvbm5lY3Rpb259fVxuXHRcdFx0XHRdXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0XHQkc2V0OiB7XG5cdFx0XHRcdFx0c3RhdHVzOiBzdGF0dXMsXG5cdFx0XHRcdFx0c3RhdHVzQ29ubmVjdGlvbjogc3RhdHVzQ29ubmVjdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBNZXRlb3IudXNlcnMudXBkYXRlKHF1ZXJ5LCB1cGRhdGUpO1xuXG5cdFx0XHQvLyBpZiBub3RoaW5nIHVwZGF0ZWQsIGRvIG5vdCBlbWl0IGFueXRoaW5nXG5cdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZUV2ZW50cy5lbWl0KCdzZXRVc2VyU3RhdHVzJywgdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE1ldGVvci5tZXRob2RzKHtcblx0XHRcdCdVc2VyUHJlc2VuY2U6Y29ubmVjdCc6IGZ1bmN0aW9uKGlkLCBtZXRhZGF0YSkge1xuXHRcdFx0XHRjaGVjayhpZCwgTWF0Y2guTWF5YmUoU3RyaW5nKSk7XG5cdFx0XHRcdGNoZWNrKG1ldGFkYXRhLCBNYXRjaC5NYXliZShPYmplY3QpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UuY3JlYXRlQ29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJywgbWV0YWRhdGEpO1xuXHRcdFx0fSxcblxuXHRcdFx0J1VzZXJQcmVzZW5jZTphd2F5JzogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFx0Y2hlY2soaWQsIE1hdGNoLk1heWJlKFN0cmluZykpO1xuXHRcdFx0XHR0aGlzLnVuYmxvY2soKTtcblx0XHRcdFx0Y2hlY2tVc2VyKGlkLCB0aGlzLnVzZXJJZCk7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXRDb25uZWN0aW9uKGlkIHx8IHRoaXMudXNlcklkLCB0aGlzLmNvbm5lY3Rpb24sICdhd2F5Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOm9ubGluZSc6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0Q29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOnNldERlZmF1bHRTdGF0dXMnOiBmdW5jdGlvbihpZCwgc3RhdHVzKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0Y2hlY2soc3RhdHVzLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cblx0XHRcdFx0Ly8gYmFja3dhcmQgY29tcGF0aWJsZSAocmVjZWl2ZXMgc3RhdHVzIGFzIGZpcnN0IGFyZ3VtZW50KVxuXHRcdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXREZWZhdWx0U3RhdHVzKHRoaXMudXNlcklkLCBpZCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0RGVmYXVsdFN0YXR1cyhpZCB8fCB0aGlzLnVzZXJJZCwgc3RhdHVzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTtcbiIsIi8qIGdsb2JhbHMgVXNlclByZXNlbmNlTW9uaXRvciwgVXNlcnNTZXNzaW9ucywgSW5zdGFuY2VTdGF0dXMgKi9cbnZhciBFdmVudEVtaXR0ZXIgPSBOcG0ucmVxdWlyZSgnZXZlbnRzJyk7XG5cblVzZXJQcmVzZW5jZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuZnVuY3Rpb24gbW9uaXRvclVzZXJzU2Vzc2lvbnMoKSB7XG5cdFVzZXJzU2Vzc2lvbnMuZmluZCh7fSkub2JzZXJ2ZSh7XG5cdFx0YWRkZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnYWRkZWQnKTtcblx0XHR9LFxuXHRcdGNoYW5nZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnY2hhbmdlZCcpO1xuXHRcdH0sXG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24ocmVjb3JkKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnByb2Nlc3NVc2VyU2Vzc2lvbihyZWNvcmQsICdyZW1vdmVkJyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gbW9uaXRvckRlbGV0ZWRTZXJ2ZXJzKCkge1xuXHRJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5vYnNlcnZlQ2hhbmdlcyh7XG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZChpZCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTG9zdENvbm5lY3Rpb25zKCkge1xuXHRpZiAoIVBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0cmV0dXJuIFVzZXJzU2Vzc2lvbnMucmVtb3ZlKHt9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5mZXRjaCgpLm1hcChmdW5jdGlvbihpZCkge1xuXHRcdHJldHVybiBpZC5faWQ7XG5cdH0pO1xuXG5cdHZhciB1cGRhdGUgPSB7XG5cdFx0JHB1bGw6IHtcblx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdGluc3RhbmNlSWQ6IHtcblx0XHRcdFx0XHQkbmluOiBpZHNcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0VXNlcnNTZXNzaW9ucy51cGRhdGUoe30sIHVwZGF0ZSwge211bHRpOiB0cnVlfSk7XG59XG5cblVzZXJQcmVzZW5jZU1vbml0b3IgPSB7XG5cdC8qKlxuXHQgKiBUaGUgY2FsbGJhY2sgd2lsbCByZWNlaXZlIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczogdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uXG5cdCAqL1xuXHRvblNldFVzZXJTdGF0dXM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRVc2VyU3RhdHVzJywgY2FsbGJhY2spO1xuXHR9LFxuXG5cdC8vIGZvbGxvd2luZyBhY3Rpb25zL29ic2VydmVycyB3aWxsIHJ1biBvbmx5IHdoZW4gcHJlc2VuY2UgbW9uaXRvciB0dXJuZWQgb25cblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdG1vbml0b3JVc2Vyc1Nlc3Npb25zKCk7XG5cdFx0cmVtb3ZlTG9zdENvbm5lY3Rpb25zKCk7XG5cblx0XHRpZiAoUGFja2FnZVsna29uZWN0eTptdWx0aXBsZS1pbnN0YW5jZXMtc3RhdHVzJ10pIHtcblx0XHRcdG1vbml0b3JEZWxldGVkU2VydmVycygpO1xuXHRcdH1cblx0fSxcblxuXHRwcm9jZXNzVXNlclNlc3Npb246IGZ1bmN0aW9uKHJlY29yZCwgYWN0aW9uKSB7XG5cdFx0aWYgKGFjdGlvbiA9PT0gJ3JlbW92ZWQnICYmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwIHx8IGFjdGlvbiA9PT0gJ3JlbW92ZWQnKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCAnb2ZmbGluZScsIHJlY29yZC5tZXRhZGF0YSk7XG5cblx0XHRcdGlmIChhY3Rpb24gIT09ICdyZW1vdmVkJykge1xuXHRcdFx0XHRVc2Vyc1Nlc3Npb25zLnJlbW92ZSh7X2lkOiByZWNvcmQuX2lkLCAnY29ubmVjdGlvbnMuMCc6IHskZXhpc3RzOiBmYWxzZX0gfSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGNvbm5lY3Rpb25TdGF0dXMgPSAnb2ZmbGluZSc7XG5cdFx0cmVjb3JkLmNvbm5lY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGlvbikge1xuXHRcdFx0aWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnb25saW5lJykge1xuXHRcdFx0XHRjb25uZWN0aW9uU3RhdHVzID0gJ29ubGluZSc7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnYXdheScgJiYgY29ubmVjdGlvblN0YXR1cyA9PT0gJ29mZmxpbmUnKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb25TdGF0dXMgPSAnYXdheSc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCBjb25uZWN0aW9uU3RhdHVzLCByZWNvcmQubWV0YWRhdGEpO1xuXHR9LFxuXG5cdHByb2Nlc3NVc2VyOiBmdW5jdGlvbihpZCwgZmllbGRzKSB7XG5cdFx0aWYgKGZpZWxkcy5zdGF0dXNEZWZhdWx0ID09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdXNlclNlc3Npb24gPSBVc2Vyc1Nlc3Npb25zLmZpbmRPbmUoe19pZDogaWR9KTtcblxuXHRcdGlmICh1c2VyU2Vzc2lvbikge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24odXNlclNlc3Npb24sICdjaGFuZ2VkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldFN0YXR1czogZnVuY3Rpb24oaWQsIHN0YXR1cywgbWV0YWRhdGEpIHtcblx0XHRVc2VyUHJlc2VuY2VFdmVudHMuZW1pdCgnc2V0U3RhdHVzJywgaWQsIHN0YXR1cywgbWV0YWRhdGEpO1xuXHR9XG59O1xuIl19
