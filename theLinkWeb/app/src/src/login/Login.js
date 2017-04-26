(function () {
  'use strict';

  // Prepare the 'users' module for subsequent registration of controllers and delegates
  angular.module('login', ['ngMaterial', 'ngMessages', 'ngCookies', 'theLinkWebService'])
    .config(theLinkConfigFunction);


})();