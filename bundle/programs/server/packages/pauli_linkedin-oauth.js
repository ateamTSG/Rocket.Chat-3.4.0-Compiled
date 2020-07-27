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
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Linkedin;

var require = meteorInstall({"node_modules":{"meteor":{"pauli:linkedin-oauth":{"linkedin-server.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/pauli_linkedin-oauth/linkedin-server.js                                                          //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Linkedin = {};

const getImage = profilePicture => {
  const image = [];

  if (profilePicture !== undefined) {
    for (const element of profilePicture['displayImage~'].elements) {
      for (const identifier of element.identifiers) {
        image.push(identifier.identifier);
      }
    }
  }

  return {
    displayImage: profilePicture ? profilePicture.displayImage : null,
    identifiersUrl: image
  };
}; // Request for email, returns array


const getEmails = function (accessToken) {
  const url = encodeURI("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))&oauth2_access_token=".concat(accessToken));
  const response = HTTP.get(url).data;
  const emails = [];

  for (const element of response.elements) {
    emails.push(element['handle~'].emailAddress);
  }

  return emails;
}; // checks whether a string parses as JSON


const isJSON = function (str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}; // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds


const getTokenResponse = function (query) {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'linkedin'
  });
  if (!config) throw new ServiceConfiguration.ConfigError('Service not configured');
  let responseContent;

  try {
    // Request an access token
    responseContent = HTTP.post('https://api.linkedin.com/uas/oauth2/accessToken', {
      params: {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        code: query.code,
        redirect_uri: OAuth._redirectUri('linkedin', config)
      }
    }).content;
  } catch (err) {
    throw new Error("Failed to complete OAuth handshake with Linkedin. ".concat(err.message));
  } // If 'responseContent' does not parse as JSON, it is an error.


  if (!isJSON(responseContent)) {
    throw new Error("Failed to complete OAuth handshake with Linkedin. ".concat(responseContent));
  } // Success! Extract access token and expiration


  const parsedResponse = JSON.parse(responseContent);
  const accessToken = parsedResponse.access_token;
  const expiresIn = parsedResponse.expires_in;

  if (!accessToken) {
    throw new Error('Failed to complete OAuth handshake with Linkedin ' + "-- can't find access token in HTTP response. ".concat(responseContent));
  }

  return {
    accessToken,
    expiresIn
  };
}; // Request available fields from r_liteprofile


const getIdentity = function (accessToken) {
  try {
    const url = encodeURI("https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))&oauth2_access_token=".concat(accessToken));
    return HTTP.get(url).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from Linkedin. ".concat(err.message));
  }
};

OAuth.registerService('linkedin', 2, null, query => {
  const response = getTokenResponse(query);
  const accessToken = response.accessToken;
  const identity = getIdentity(accessToken);
  const {
    id,
    firstName,
    lastName,
    profilePicture
  } = identity;

  if (!id) {
    throw new Error('Linkedin did not provide an id');
  }

  const serviceData = {
    id,
    accessToken,
    expiresAt: +new Date() + 1000 * response.expiresIn
  };
  const emails = getEmails(accessToken);
  const fields = {
    linkedinId: id,
    firstName,
    lastName,
    profilePicture: getImage(profilePicture),
    emails
  };

  if (emails.length) {
    const primaryEmail = emails[0];
    fields.emailAddress = primaryEmail; // for backward compatibility with previous versions of this package

    fields.email = primaryEmail;
  }

  _.extend(serviceData, fields);

  return {
    serviceData,
    options: {
      profile: fields
    }
  };
});

Linkedin.retrieveCredential = function (credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/pauli:linkedin-oauth/linkedin-server.js");

/* Exports */
Package._define("pauli:linkedin-oauth", {
  Linkedin: Linkedin
});

})();

//# sourceURL=meteor://💻app/packages/pauli_linkedin-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcGF1bGk6bGlua2VkaW4tb2F1dGgvbGlua2VkaW4tc2VydmVyLmpzIl0sIm5hbWVzIjpbIkxpbmtlZGluIiwiZ2V0SW1hZ2UiLCJwcm9maWxlUGljdHVyZSIsImltYWdlIiwidW5kZWZpbmVkIiwiZWxlbWVudCIsImVsZW1lbnRzIiwiaWRlbnRpZmllciIsImlkZW50aWZpZXJzIiwicHVzaCIsImRpc3BsYXlJbWFnZSIsImlkZW50aWZpZXJzVXJsIiwiZ2V0RW1haWxzIiwiYWNjZXNzVG9rZW4iLCJ1cmwiLCJlbmNvZGVVUkkiLCJyZXNwb25zZSIsIkhUVFAiLCJnZXQiLCJkYXRhIiwiZW1haWxzIiwiZW1haWxBZGRyZXNzIiwiaXNKU09OIiwic3RyIiwiSlNPTiIsInBhcnNlIiwiZSIsImdldFRva2VuUmVzcG9uc2UiLCJxdWVyeSIsImNvbmZpZyIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwicmVzcG9uc2VDb250ZW50IiwicG9zdCIsInBhcmFtcyIsImdyYW50X3R5cGUiLCJjbGllbnRfaWQiLCJjbGllbnRJZCIsImNsaWVudF9zZWNyZXQiLCJPQXV0aCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJjb2RlIiwicmVkaXJlY3RfdXJpIiwiX3JlZGlyZWN0VXJpIiwiY29udGVudCIsImVyciIsIkVycm9yIiwibWVzc2FnZSIsInBhcnNlZFJlc3BvbnNlIiwiYWNjZXNzX3Rva2VuIiwiZXhwaXJlc0luIiwiZXhwaXJlc19pbiIsImdldElkZW50aXR5IiwicmVnaXN0ZXJTZXJ2aWNlIiwiaWRlbnRpdHkiLCJpZCIsImZpcnN0TmFtZSIsImxhc3ROYW1lIiwic2VydmljZURhdGEiLCJleHBpcmVzQXQiLCJEYXRlIiwiZmllbGRzIiwibGlua2VkaW5JZCIsImxlbmd0aCIsInByaW1hcnlFbWFpbCIsImVtYWlsIiwiXyIsImV4dGVuZCIsIm9wdGlvbnMiLCJwcm9maWxlIiwicmV0cmlldmVDcmVkZW50aWFsIiwiY3JlZGVudGlhbFRva2VuIiwiY3JlZGVudGlhbFNlY3JldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLFFBQVEsR0FBRyxFQUFYOztBQUVBLE1BQU1DLFFBQVEsR0FBR0MsY0FBYyxJQUFJO0FBQ2pDLFFBQU1DLEtBQUssR0FBRyxFQUFkOztBQUNBLE1BQUlELGNBQWMsS0FBS0UsU0FBdkIsRUFBaUM7QUFDL0IsU0FBSyxNQUFNQyxPQUFYLElBQXNCSCxjQUFjLENBQUMsZUFBRCxDQUFkLENBQWdDSSxRQUF0RCxFQUFnRTtBQUM5RCxXQUFLLE1BQU1DLFVBQVgsSUFBeUJGLE9BQU8sQ0FBQ0csV0FBakMsRUFBOEM7QUFDNUNMLGFBQUssQ0FBQ00sSUFBTixDQUFXRixVQUFVLENBQUNBLFVBQXRCO0FBQ0Q7QUFDRjtBQUNGOztBQUNELFNBQU87QUFDTEcsZ0JBQVksRUFBRVIsY0FBYyxHQUFHQSxjQUFjLENBQUNRLFlBQWxCLEdBQWlDLElBRHhEO0FBRUxDLGtCQUFjLEVBQUVSO0FBRlgsR0FBUDtBQUlELENBYkQsQyxDQWVBOzs7QUFDQSxNQUFNUyxTQUFTLEdBQUcsVUFBU0MsV0FBVCxFQUFzQjtBQUN0QyxRQUFNQyxHQUFHLEdBQUdDLFNBQVMsa0hBQ3VGRixXQUR2RixFQUFyQjtBQUdBLFFBQU1HLFFBQVEsR0FBR0MsSUFBSSxDQUFDQyxHQUFMLENBQVNKLEdBQVQsRUFBY0ssSUFBL0I7QUFDQSxRQUFNQyxNQUFNLEdBQUcsRUFBZjs7QUFDQSxPQUFLLE1BQU1mLE9BQVgsSUFBc0JXLFFBQVEsQ0FBQ1YsUUFBL0IsRUFBeUM7QUFDdkNjLFVBQU0sQ0FBQ1gsSUFBUCxDQUFZSixPQUFPLENBQUMsU0FBRCxDQUFQLENBQW1CZ0IsWUFBL0I7QUFDRDs7QUFDRCxTQUFPRCxNQUFQO0FBQ0QsQ0FWRCxDLENBWUE7OztBQUNBLE1BQU1FLE1BQU0sR0FBRyxVQUFTQyxHQUFULEVB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QURrQjtBQUVsQjlDLGVBRmtCO0FBR2xCa0QsYUFBUyxFQUFFLENBQUMsSUFBSUMsSUFBSixFQUFELEdBQWMsT0FBT2hELFFBQVEsQ0FBQ3NDO0FBSHZCLEdBQXBCO0FBTUEsUUFBTWxDLE1BQU0sR0FBR1IsU0FBUyxDQUFDQyxXQUFELENBQXhCO0FBRUEsUUFBTW9ELE1BQU0sR0FBRztBQUNiQyxjQUFVLEVBQUVQLEVBREM7QUFFYkMsYUFGYTtBQUdiQyxZQUhhO0FBSWIzRCxrQkFBYyxFQUFFRCxRQUFRLENBQUNDLGNBQUQsQ0FKWDtBQUtia0I7QUFMYSxHQUFmOztBQVFBLE1BQUlBLE1BQU0sQ0FBQytDLE1BQVgsRUFBbUI7QUFDakIsVUFBTUMsWUFBWSxHQUFHaEQsTUFBTSxDQUFDLENBQUQsQ0FBM0I7QUFDQTZDLFVBQU0sQ0FBQzVDLFlBQVAsR0FBc0IrQyxZQUF0QixDQUZpQixDQUVrQjs7QUFDbkNILFVBQU0sQ0FBQ0ksS0FBUCxHQUFlRCxZQUFmO0FBQ0Q7O0FBRURFLEdBQUMsQ0FBQ0MsTUFBRixDQUFTVCxXQUFULEVBQXNCRyxNQUF0Qjs7QUFFQSxTQUFPO0FBQ0xILGVBREs7QUFFTFUsV0FBTyxFQUFFO0FBQ1BDLGFBQU8sRUFBRVI7QUFERjtBQUZKLEdBQVA7QUFNRCxDQTdDRDs7QUErQ0FqRSxRQUFRLENBQUMwRSxrQkFBVCxHQUE4QixVQUM1QkMsZUFENEIsRUFFNUJDLGdCQUY0QixFQUc1QjtBQUNBLFNBQU9sQyxLQUFLLENBQUNnQyxrQkFBTixDQUNMQyxlQURLLEVBRUxDLGdCQUZLLENBQVA7QUFJRCxDQVJELEMiLCJmaWxlIjoiL3BhY2thZ2VzL3BhdWxpX2xpbmtlZGluLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiTGlua2VkaW4gPSB7fVxuXG5jb25zdCBnZXRJbWFnZSA9IHByb2ZpbGVQaWN0dXJlID0+IHtcbiAgY29uc3QgaW1hZ2UgPSBbXVxuICBpZiAocHJvZmlsZVBpY3R1cmUgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHByb2ZpbGVQaWN0dXJlWydkaXNwbGF5SW1hZ2V+J10uZWxlbWVudHMpIHtcbiAgICAgIGZvciAoY29uc3QgaWRlbnRpZmllciBvZiBlbGVtZW50LmlkZW50aWZpZXJzKSB7XG4gICAgICAgIGltYWdlLnB1c2goaWRlbnRpZmllci5pZGVudGlmaWVyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIGRpc3BsYXlJbWFnZTogcHJvZmlsZVBpY3R1cmUgPyBwcm9maWxlUGljdHVyZS5kaXNwbGF5SW1hZ2UgOiBudWxsLFxuICAgIGlkZW50aWZpZXJzVXJsOiBpbWFnZVxuICB9XG59XG5cbi8vIFJlcXVlc3QgZm9yIGVtYWlsLCByZXR1cm5zIGFycmF5XG5jb25zdCBnZXRFbWFpbHMgPSBmdW5jdGlvbihhY2Nlc3NUb2tlbikge1xuICBjb25zdCB1cmwgPSBlbmNvZGVVUkkoXG4gICAgYGh0dHBzOi8vYXBpLmxpbmtlZGluLmNvbS92Mi9lbWFpbEFkZHJlc3M/cT1tZW1iZXJzJnByb2plY3Rpb249KGVsZW1lbnRzKihoYW5kbGV+KSkmb2F1dGgyX2FjY2Vzc190b2tlbj0ke2FjY2Vzc1Rva2VufWAsXG4gIClcbiAgY29uc3QgcmVzcG9uc2UgPSBIVFRQLmdldCh1cmwpLmRhdGFcbiAgY29uc3QgZW1haWxzID0gW11cbiAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlLmVsZW1lbnRzKSB7XG4gICAgZW1haWxzLnB1c2goZWxlbWVudFsnaGFuZGxlfiddLmVtYWlsQWRkcmVzcylcbiAgfVxuICByZXR1cm4gZW1haWxzXG59XG5cbi8vIGNoZWNrcyB3aGV0aGVyIGEgc3RyaW5nIHBhcnNlcyBhcyBKU09OXG5jb25zdCBpc0pTT04gPSBmdW5jdGlvbihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cilcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLy8gcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZzpcbi8vIC0gYWNjZXNzVG9rZW5cbi8vIC0gZXhwaXJlc0luOiBsaWZldGltZSBvZiB0b2tlbiBpbiBzZWNvbmRzXG5jb25zdCBnZXRUb2tlblJlc3BvbnNlID0gZnVuY3Rpb24ocXVlcnkpIHtcbiAgY29uc3QgY29uZmlnID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZShcbiAgICB7IHNlcnZpY2U6ICdsaW5rZWRpbicgfSxcbiAgKVxuICBpZiAoIWNvbmZpZylcbiAgICB0aHJvdyBuZXcgU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IoXG4gICAgICAnU2VydmljZSBub3QgY29uZmlndXJlZCcsXG4gICAgKVxuXG4gIGxldCByZXNwb25zZUNvbnRlbnRcbiAgdHJ5IHtcbiAgICAvLyBSZXF1ZXN0IGFuIGFjY2VzcyB0b2tlblxuICAgIHJlc3BvbnNlQ29udGVudCA9IEhUVFAucG9zdChcbiAgICAgICdodHRwczovL2FwaS5saW5rZWRpbi5jb20vdWFzL29hdXRoMi9hY2Nlc3NUb2tlbicsXG4gICAgICB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGdyYW50X3R5cGU6ICdhdXRob3JpemF0aW9uX2NvZGUnLFxuICAgICAgICAgIGNsaWVudF9pZDogY29uZmlnLmNsaWVudElkLFxuICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IE9BdXRoLm9wZW5TZWNyZXQoY29uZmlnLnNlY3JldCksXG4gICAgICAgICAgY29kZTogcXVlcnkuY29kZSxcbiAgICAgICAgICByZWRpcmVjdF91cmk6IE9BdXRoLl9yZWRpcmVjdFVyaShcbiAgICAgICAgICAgICdsaW5rZWRpbicsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKS5jb250ZW50XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggTGlua2VkaW4uICR7XG4gICAgICAgIGVyci5tZXNzYWdlXG4gICAgICB9YCxcbiAgICApXG4gIH1cblxuICAvLyBJZiAncmVzcG9uc2VDb250ZW50JyBkb2VzIG5vdCBwYXJzZSBhcyBKU09OLCBpdCBpcyBhbiBlcnJvci5cbiAgaWYgKCFpc0pTT04ocmVzcG9uc2VDb250ZW50KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggTGlua2VkaW4uICR7cmVzcG9uc2VDb250ZW50fWAsXG4gICAgKVxuICB9XG5cbiAgLy8gU3VjY2VzcyEgRXh0cmFjdCBhY2Nlc3MgdG9rZW4gYW5kIGV4cGlyYXRpb25cbiAgY29uc3QgcGFyc2VkUmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlQ29udGVudClcbiAgY29uc3QgYWNjZXNzVG9rZW4gPSBwYXJzZWRSZXNwb25zZS5hY2Nlc3NfdG9rZW5cbiAgY29uc3QgZXhwaXJlc0luID0gcGFyc2VkUmVzcG9uc2UuZXhwaXJlc19pblxuXG4gIGlmICghYWNjZXNzVG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIExpbmtlZGluICcgK1xuICAgICAgICBgLS0gY2FuJ3QgZmluZCBhY2Nlc3MgdG9rZW4gaW4gSFRUUCByZXNwb25zZS4gJHtyZXNwb25zZUNvbnRlbnR9YCxcbiAgICApXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFjY2Vzc1Rva2VuLFxuICAgIGV4cGlyZXNJbixcbiAgfVxufVxuXG4vLyBSZXF1ZXN0IGF2YWlsYWJsZSBmaWVsZHMgZnJvbSByX2xpdGVwcm9maWxlXG5jb25zdCBnZXRJZGVudGl0eSA9IGZ1bmN0aW9uKGFjY2Vzc1Rva2VuKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdXJsID0gZW5jb2RlVVJJKFxuICAgICAgYGh0dHBzOi8vYXBpLmxpbmtlZGluLmNvbS92Mi9tZT9wcm9qZWN0aW9uPShpZCxmaXJzdE5hbWUsbGFzdE5hbWUscHJvZmlsZVBpY3R1cmUoZGlzcGxheUltYWdlfjpwbGF5YWJsZVN0cmVhbXMpKSZvYXV0aDJfYWNjZXNzX3Rva2VuPSR7YWNjZXNzVG9rZW59YCxcbiAgICApXG4gICAgcmV0dXJuIEhUVFAuZ2V0KHVybCkuZGF0YVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGZldGNoIGlkZW50aXR5IGZyb20gTGlua2VkaW4uICR7XG4gICAgICAgIGVyci5tZXNzYWdlXG4gICAgICB9YCxcbiAgICApXG4gIH1cbn1cblxuT0F1dGgucmVnaXN0ZXJTZXJ2aWNlKCdsaW5rZWRpbicsIDIsIG51bGwsIHF1ZXJ5ID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBnZXRUb2tlblJlc3BvbnNlKHF1ZXJ5KVxuICBjb25zdCBhY2Nlc3NUb2tlbiA9IHJlc3BvbnNlLmFjY2Vzc1Rva2VuXG4gIGNvbnN0IGlkZW50aXR5ID0gZ2V0SWRlbnRpdHkoYWNjZXNzVG9rZW4pXG5cbiAgY29uc3Qge1xuICAgIGlkLFxuICAgIGZpcnN0TmFtZSxcbiAgICBsYXN0TmFtZSxcbiAgICBwcm9maWxlUGljdHVyZSxcbiAgfSA9IGlkZW50aXR5XG5cbiAgaWYgKCFpZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTGlua2VkaW4gZGlkIG5vdCBwcm92aWRlIGFuIGlkJylcbiAgfVxuICBjb25zdCBzZXJ2aWNlRGF0YSA9IHtcbiAgICBpZCxcbiAgICBhY2Nlc3NUb2tlbixcbiAgICBleHBpcmVzQXQ6ICtuZXcgRGF0ZSgpICsgMTAwMCAqIHJlc3BvbnNlLmV4cGlyZXNJbixcbiAgfVxuXG4gIGNvbnN0IGVtYWlscyA9IGdldEVtYWlscyhhY2Nlc3NUb2tlbilcblxuICBjb25zdCBmaWVsZHMgPSB7XG4gICAgbGlua2VkaW5JZDogaWQsXG4gICAgZmlyc3ROYW1lLFxuICAgIGxhc3ROYW1lLFxuICAgIHByb2ZpbGVQaWN0dXJlOiBnZXRJbWFnZShwcm9maWxlUGljdHVyZSksXG4gICAgZW1haWxzLFxuICB9XG5cbiAgaWYgKGVtYWlscy5sZW5ndGgpIHtcbiAgICBjb25zdCBwcmltYXJ5RW1haWwgPSBlbWFpbHNbMF1cbiAgICBmaWVsZHMuZW1haWxBZGRyZXNzID0gcHJpbWFyeUVtYWlsIC8vIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggcHJldmlvdXMgdmVyc2lvbnMgb2YgdGhpcyBwYWNrYWdlXG4gICAgZmllbGRzLmVtYWlsID0gcHJpbWFyeUVtYWlsXG4gIH1cblxuICBfLmV4dGVuZChzZXJ2aWNlRGF0YSwgZmllbGRzKVxuXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uczoge1xuICAgICAgcHJvZmlsZTogZmllbGRzLFxuICAgIH0sXG4gIH1cbn0pXG5cbkxpbmtlZGluLnJldHJpZXZlQ3JlZGVudGlhbCA9IGZ1bmN0aW9uKFxuICBjcmVkZW50aWFsVG9rZW4sXG4gIGNyZWRlbnRpYWxTZWNyZXQsXG4pIHtcbiAgcmV0dXJuIE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChcbiAgICBjcmVkZW50aWFsVG9rZW4sXG4gICAgY3JlZGVudGlhbFNlY3JldCxcbiAgKVxufVxuIl19
