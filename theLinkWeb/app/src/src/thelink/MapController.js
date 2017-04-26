(function () {
  angular
    .module('theLink')
    .controller('MapController', ['MapService', 'WebService', 'theLinkSelectionService', '$mdMedia', '$mdSidenav', '$log', '$scope', 'NgMap', 'StreetView', MapController])

  function MapController(mapService, webService, selectionService, $mdMedia, $mdSidenav, $log, $scope, NgMap, StreetView) {

    var self = this;
    self.loading = true;
    self.pendingLoads = 0;
    self.googleMapKey = 'YOUR_KEY_HERE'; // API key variable TODO: use GRUNT to replace 


    ///////////////////
    // Internal Methods

    // Called whenever a REST call finishes loading.
    self.finishLoad = function () {
      self.pendingLoads -= 1;
      if (self.pendingLoads < 1)
        self.loading = false;
    };
  }
})();