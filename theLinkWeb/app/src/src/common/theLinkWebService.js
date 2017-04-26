(function () {
  'use strict';

  angular.module('theLinkWebService', [])
    .factory('WebService', ['$http', '$log', '$cookies', WebService]);

  //The Webservice
  function WebService($http, $log, $cookies) {
    return {
      // Base URL for theLink API calls should now just be our current domain URL. (ie. Blank for a Relative address)
      baseUrl: '',
      getUserDetails: function () {
        var self = this;
        return $http({
            method: 'GET',
            url: this.baseUrl + '/user'
          })
          .then(function (result) {
            self.user = result.data;
            self.tutorialCookie = $cookies.get('tutorial');
            return result;
          }, function (err) {
            $log.debug('Failed to get user details');
            return err;
          });
      },
      setTutorialCookie: function () {
        $cookies.put('tutorial', 'done');
      },
      returnResult: function (result) {
        if (result.status < 200 || result.status > 399)
          console.log(result);

        return result;
      },
      basicGet: function (url, par) {
        par = (typeof par === 'undefined') ? {} : par;

        return $http({
            method: 'GET',
            url: this.baseUrl + url,
            params: par
          })
          .then(this.returnResult, this.returnResult);
      },
      basicPost: function (url, data, par) {
        data = (typeof data === 'undefined') ? "" : data;
        par = (typeof par === 'undefined') ? {} : par;

        return $http({
          method: 'POST',
          url: this.baseUrl + url,
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: par,
        }).then(this.returnResult, this.returnResult);
      },
      basicDelete: function (url, data) {
        return $http({
          method: 'DELETE',
          url: this.baseUrl + url
        }).then(this.returnResult, this.returnResult);
      },
      //Log in the current user.
      //Returns the http status code that the service gives us.
      //login: function(user) {
      //var basicAuth = b64encode(user.username + ':' + user.password);

      //return $http({
      //method: 'GET',
      //url: this.baseUrl + '/user/gettoken',
      //headers: {'Authorization': 'Basic ' + basicAuth}})
      //.then(function(result) {
      //return result.status;
      //},function(err) {
      //return err.status;
      //});
      //},
      //isLoggedIn: function() {
      //return true;
      //},

      /* Serializes JSON data for form encoding.
       * Taken from http://www.bennadel.com/blog/2615-posting-form-data-with-http-in-angularjs.htm
       */
      serializeData: function (data) {
        // If this is not an object, defer to native stringification.
        if (!angular.isObject(data)) {
          return ((data === null) ? "" : data.toString());
        }
        var buffer = [];
        // Serialize each key in the object.
        for (var name in data) {
          if (!data.hasOwnProperty(name)) {
            continue;
          }
          var value = data[name];
          buffer.push(
            encodeURIComponent(name) +
            "=" +
            encodeURIComponent((value === null) ? "" : value)
          );
        }

        // Serialize the buffer and clean it up for transportation.
        var source = buffer
          .join("&")
          .replace(/%20/g, "+");

        return (source);
      }

    };
  }

  /*
  /////////////////////////////////////////////////////////////////////////////
  // Base64 Encoder/Decoder
  // Taken from https://github.com/cornflourblue/angular-authentication-example
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  function b64encode(input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
  }

  function b64decode(input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
  }
  */


})();