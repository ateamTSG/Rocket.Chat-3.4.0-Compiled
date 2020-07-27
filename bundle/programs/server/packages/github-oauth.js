(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Github;

var require = meteorInstall({"node_modules":{"meteor":{"github-oauth":{"github_server.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/github-oauth/github_server.js                                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Github = {};
OAuth.registerService('github', 2, null, query => {
  const accessToken = getAccessToken(query);
  const identity = getIdentity(accessToken);
  const emails = getEmails(accessToken);
  const primaryEmail = emails.find(email => email.primary);
  return {
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email || primaryEmail && primaryEmail.email || '',
      username: identity.login,
      emails
    },
    options: {
      profile: {
        name: identity.name
      }
    }
  };
}); // http://developer.github.com/v3/#user-agent-required

let userAgent = "Meteor";
if (Meteor.release) userAgent += "/".concat(Meteor.release);

const getAccessToken = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'github'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let response;

  try {
    response = HTTP.post("https://github.com/login/oauth/access_token", {
      headers: {
        Accept: 'application/json',
        "User-Agent": userAgent
      },
      params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('github', config),
        state: query.state
      }
    });
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Github. ".concat(err.message)), {
      response: err.response
    });
  }

  if (response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with GitHub. ".concat(response.data.error));
  } else {
    return response.data.access_token;
  }
};

const getIdentity = accessToken => {
  try {
    return HTTP.get("https://api.github.com/user", {
      headers: {
        "User-Agent": userAgent,
        "Authorization": "token ".concat(accessToken)
      } // http://developer.github.com/v3/#user-agent-required

    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Github. ".concat(err.message)), {
      response: err.response
    });
  }
};

const getEmails = accessToken => {
  try {
    return HTTP.get("https://api.github.com/user/emails", {
      headers: {
        "User-Agent": userAgent,
        "Authorization": "token ".concat(accessToken)
      } // http://developer.github.com/v3/#user-agent-required

    }).data;
  } catch (err) {
    return [];
  }
};

Github.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/github-oauth/github_server.js");

/* Exports */
Package._define("github-oauth", {
  Github: Github
});

})();

//# sourceURL=meteor://💻app/packages/github-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZ2l0aHViLW9hdXRoL2dpdGh1Yl9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiR2l0aHViIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsImFjY2Vzc1Rva2VuIiwiZ2V0QWNjZXNzVG9rZW4iLCJpZGVudGl0eSIsImdldElkZW50aXR5IiwiZW1haWxzIiwiZ2V0RW1haWxzIiwicHJpbWFyeUVtYWlsIiwiZmluZCIsImVtYWlsIiwicHJpbWFyeSIsInNlcnZpY2VEYXRhIiwiaWQiLCJzZWFsU2VjcmV0IiwidXNlcm5hbWUiLCJsb2dpbiIsIm9wdGlvbnMiLCJwcm9maWxlIiwibmFtZSIsInVzZXJBZ2VudCIsIk1ldGVvciIsInJlbGVhc2UiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZSIsInNlcnZpY2UiLCJDb25maWdFcnJvciIsInJlc3BvbnNlIiwiSFRUUCIsInBvc3QiLCJoZWFkZXJzIiwiQWNjZXB0IiwicGFyYW1zIiwiY29kZSIsImNsaWVudF9pZCIsImNsaWVudElkIiwiY2xpZW50X3NlY3JldCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJyZWRpcmVjdF91cmkiLCJfcmVkaXJlY3RVcmkiLCJzdGF0ZSIsImVyciIsIk9iamVjdCIsImFzc2lnbiIsIkVycm9yIiwibWVzc2FnZSIsImRhdGEiLCJlcnJvciIsImFjY2Vzc190b2tlbiIsImdldCIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sR0FBRyxFQUFUO0FBRUFDLEtBQUssQ0FBQ0MsZUFBTixDQUFzQixRQUF0QixFQUFnQyxDQUFoQyxFQUFtQyxJQUFuQyxFQUF5Q0MsS0FBSyxJQUFJO0FBRWhELFFBQU1DLFdBQVcsR0FBR0MsY0FB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TUFBTSxDQUFDQyxNQUFQLENBQ0osSUFBSUMsS0FBSixpREFBbURILEdBQUcsQ0FBQ0ksT0FBdkQsRUFESSxFQUVKO0FBQUVuQixjQUFRLEVBQUVlLEdBQUcsQ0FBQ2Y7QUFBaEIsS0FGSSxDQUFOO0FBSUQ7QUFDRixDQVpEOztBQWNBLE1BQU10QixTQUFTLEdBQUdMLFdBQVcsSUFBSTtBQUMvQixNQUFJO0FBQ0YsV0FBTzRCLElBQUksQ0FBQ3NCLEdBQUwsQ0FDTCxvQ0FESyxFQUNpQztBQUNwQ3BCLGFBQU8sRUFBRTtBQUFDLHNCQUFjWixTQUFmO0FBQTBCLHlDQUEwQmxCLFdBQTFCO0FBQTFCLE9BRDJCLENBQ3lDOztBQUR6QyxLQURqQyxFQUdGK0MsSUFITDtBQUlELEdBTEQsQ0FLRSxPQUFPTCxHQUFQLEVBQVk7QUFDWixXQUFPLEVBQVA7QUFDRDtBQUNGLENBVEQ7O0FBV0E5QyxNQUFNLENBQUN1RCxrQkFBUCxHQUE0QixDQUFDQyxlQUFELEVBQWtCQyxnQkFBbEIsS0FDMUJ4RCxLQUFLLENBQUNzRCxrQkFBTixDQUF5QkMsZUFBekIsRUFBMENDLGdCQUExQyxDQURGLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2dpdGh1Yi1vYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIkdpdGh1YiA9IHt9O1xuXG5PQXV0aC5yZWdpc3RlclNlcnZpY2UoJ2dpdGh1YicsIDIsIG51bGwsIHF1ZXJ5ID0+IHtcblxuICBjb25zdCBhY2Nlc3NUb2tlbiA9IGdldEFjY2Vzc1Rva2VuKHF1ZXJ5KTtcbiAgY29uc3QgaWRlbnRpdHkgPSBnZXRJZGVudGl0eShhY2Nlc3NUb2tlbik7XG4gIGNvbnN0IGVtYWlscyA9IGdldEVtYWlscyhhY2Nlc3NUb2tlbik7XG4gIGNvbnN0IHByaW1hcnlFbWFpbCA9IGVtYWlscy5maW5kKGVtYWlsID0+IGVtYWlsLnByaW1hcnkpO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGE6IHtcbiAgICAgIGlkOiBpZGVudGl0eS5pZCxcbiAgICAgIGFjY2Vzc1Rva2VuOiBPQXV0aC5zZWFsU2VjcmV0KGFjY2Vzc1Rva2VuKSxcbiAgICAgIGVtYWlsOiBpZGVudGl0eS5lbWFpbCB8fCAocHJpbWFyeUVtYWlsICYmIHByaW1hcnlFbWFpbC5lbWFpbCkgfHwgJycsXG4gICAgICB1c2VybmFtZTogaWRlbnRpdHkubG9naW4sXG4gICAgICBlbWFpbHMsXG4gICAgfSxcbiAgICBvcHRpb25zOiB7cHJvZmlsZToge25hbWU6IGlkZW50aXR5Lm5hbWV9fVxuICB9O1xufSk7XG5cbi8vIGh0dHA6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My8jdXNlci1hZ2VudC1yZXF1aXJlZFxubGV0IHVzZXJBZ2VudCA9IFwiTWV0ZW9yXCI7XG5pZiAoTWV0ZW9yLnJlbGVhc2UpXG4gIHVzZXJBZ2VudCArPSBgLyR7TWV0ZW9yLnJlbGVhc2V9YDtcblxuY29uc3QgZ2V0QWNjZXNzVG9rZW4gPSBxdWVyeSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmRPbmUoe3NlcnZpY2U6ICdnaXRodWInfSk7XG4gIGlmICghY29uZmlnKVxuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIGxldCByZXNwb25zZTtcbiAgdHJ5IHtcbiAgICByZXNwb25zZSA9IEhUVFAucG9zdChcbiAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL2xvZ2luL29hdXRoL2FjY2Vzc190b2tlblwiLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBcIlVzZXItQWdlbnRcIjogdXNlckFnZW50XG4gICAgICAgIH0sXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGNvZGU6IHF1ZXJ5LmNvZGUsXG4gICAgICAgICAgY2xpZW50X2lkOiBjb25maWcuY2xpZW50SWQsXG4gICAgICAgICAgY2xpZW50X3NlY3JldDogT0F1dGgub3BlblNlY3JldChjb25maWcuc2VjcmV0KSxcbiAgICAgICAgICByZWRpcmVjdF91cmk6IE9BdXRoLl9yZWRpcmVjdFVyaSgnZ2l0aHViJywgY29uZmlnKSxcbiAgICAgICAgICBzdGF0ZTogcXVlcnkuc3RhdGVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBHaXRodWIuICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfSxcbiAgICApO1xuICB9XG4gIGlmIChyZXNwb25zZS5kYXRhLmVycm9yKSB7IC8vIGlmIHRoZSBodHRwIHJlc3BvbnNlIHdhcyBhIGpzb24gb2JqZWN0IHdpdGggYW4gZXJyb3IgYXR0cmlidXRlXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggR2l0SHViLiAke3Jlc3BvbnNlLmRhdGEuZXJyb3J9YCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuYWNjZXNzX3Rva2VuO1xuICB9XG59O1xuXG5jb25zdCBnZXRJZGVudGl0eSA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSFRUUC5nZXQoXG4gICAgICBcImh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlclwiLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcIlVzZXItQWdlbnRcIjogdXNlckFnZW50LCBcIkF1dGhvcml6YXRpb25cIjogYHRva2VuICR7YWNjZXNzVG9rZW59YH0sIC8vIGh0dHA6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My8jdXNlci1hZ2VudC1yZXF1aXJlZFxuICAgICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGlkZW50aXR5IGZyb20gR2l0aHViLiAke2Vyci5tZXNzYWdlfWApLFxuICAgICAgeyByZXNwb25zZTogZXJyLnJlc3BvbnNlIH0sXG4gICAgKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RW1haWxzID0gYWNjZXNzVG9rZW4gPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBIVFRQLmdldChcbiAgICAgIFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyL2VtYWlsc1wiLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcIlVzZXItQWdlbnRcIjogdXNlckFnZW50LCBcIkF1dGhvcml6YXRpb25cIjogYHRva2VuICR7YWNjZXNzVG9rZW59YH0sIC8vIGh0dHA6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My8jdXNlci1hZ2VudC1yZXF1aXJlZFxuICAgICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG5HaXRodWIucmV0cmlldmVDcmVkZW50aWFsID0gKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCkgPT5cbiAgT0F1dGgucmV0cmlldmVDcmVkZW50aWFsKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCk7XG4iXX0=
