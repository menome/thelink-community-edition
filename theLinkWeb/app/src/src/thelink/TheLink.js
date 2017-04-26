(function () {
  'use strict';

  // Prepare the 'theLink' module for subsequent registration of controllers and delegates
  angular.module('theLink', ['ngMaterial', 'theLinkWebService', 'ngCookies', 'dndLists', 'infinite-scroll', 'ngMap', 'chart.js', 'hc.marked', 'ngVis'])
    .config(theLinkConfigFunction);

})();