(function () {
  angular
    .module('theLink')
    .controller('RightPanelController', ['WebService', 'theLinkSelectionService', '$log', '$scope', '$mdSidenav', RightPanelController]);

  function RightPanelController(webService, selectionService, $log, $scope, $mdSidenav) {
    var self = this;

    self.loading = false; // True if the main view is being populated by a query.
    self.selectedCard = null;
    self.navMode = 'pivot';

    // We need a list of node types, display names, and icons.
    // A good one is provided in the selectionService.
    self.pivotItems = selectionService.nodeTypes;

    // Listener for when our selection changes.
    // TODO: Maybe speed this up. Only get pivot info if we've got the pivot info tab open?
    $scope.$watch(function () {
      return selectionService.selectedCard;
    }, function (selection) {
      getPivotInfo(selection);
      getQuestionInfo(selection);
      self.selectedCard = selection;
      self.navMode = 'pivot'; // Default the navigation mode to 'pivot' with each new card.
    }, true);

    self.deselect = function () {
      selectionService.selectedCard = null;
    };

    ///////////////////
    // Internal Methods

    // Gets all the node types that this node can pivot to.
    // Called when the user selects a new node.
    function getPivotInfo(node) {
      if (!node) return;

      if (node.pivotInfo) //If we've already done it, don't do it again
        return;

      self.loading = true;
      webService.basicGet('/api/pivot/info/' + node.Uuid).then(function (response) {
        var result = response.data.data;
        if (typeof result != 'object')
          $log.debug("Error. API call did not return recognized Javascript object.");
        else
          node.pivotInfo = result;

        self.loading = false;
      });
    }

    function getQuestionInfo(node) {
      if (!node) {
        self.cardDigest = {};
        return;
      }

      if (node.questionInfo) //If we've already done it, don't do it again
        return;

      self.loading = true;
      webService.basicGet('/api/questions', {
        nodetype: node.NodeType
      }).then(function (response) {
        var result = response.data.data;
        if (typeof result != 'object')
          $log.debug("Error. API call did not return recognized Javascript object.");
        else
          node.questionInfo = result;

        self.loading = false;
      });
    }

  }
})();