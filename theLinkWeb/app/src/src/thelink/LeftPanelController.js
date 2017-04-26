(function () {
  angular
    .module('theLink')
    .controller('LeftPanelController', ['WebService', 'theLinkSelectionService', 'theLinkDialogueService', '$mdSidenav', LeftPanelController]);

  function LeftPanelController(webService, selectionService, dialogueService, $mdSidenav) {
    var self = this;
    self.loading = true;
    self.pendingLoads = 0;

    // Contains all fields used when a user makes a text search
    self.textSearchFields = {};

    self.topLevelClick = function (item) {
      if (item.simpleSearch)
        return selectionService.notify('search-event', {
          searchType: 'card',
          fields: {
            nodeType: item.nodeType,
            group: 'alphabet',
          }
        });

      item.listExpanded = !item.listExpanded;
    };



    // Helper function.
    self.genFields = function (fields, nodeType) {
      var ret = {};
      ret.nodeType = nodeType;
      ret.query = "";

      // Turn out fields into a query string.
      if (fields) {
        var keys = Object.keys(fields);
        for (var key in keys) {
          ret.query += keys[key] + ':' + fields[keys[key]].replace(/[,:]/g, ''); // Remove characters , and :
          if (key < keys.length - 1)
            ret.query += ',';
        }
      }

      return ret;
    };

    // **************************************
    // Load all the major parts of the search.
    // **************************************
    self.simpleSearchMenu = [];
    self.searchMenu = [];
    self.cachedSubitems = {}; //If multiple things are searchable by discipline, no sense in querying for disciplines to search by twice.
    self.pendingLoads += 1;
    webService.basicGet('/api/meta/searchinfo').then(function (result) {

      if (result.status == 401) {
        dialogueService.notifyDialog(null, "Permission Violation", "It seems you don't have permission to search on theLink. Please contact support.");
        return;
      }

      // Set up the simple one-click search menus on the sidepanel.
      result.data.data.simpleSearches.forEach(function (val, idx, obj) {
        var simpleSearch = selectionService.nodeTypes[val];
        simpleSearch.nodeType = val;
        self.simpleSearchMenu.push(simpleSearch);
      });

      // Set up the main search menu
      self.searchMenu = result.data.data.mainSearches;

      // Populate the sub items of the list search
      // TODO: Maybe this should be done lazily. It would speed up page loads.
      self.searchMenu.forEach(function (val, idx, obj) {
        val.icon = selectionService.nodeTypes[val.nodeType].icon;

        //Get the subitems for each search.
        val.listChildren.forEach(function (subitem, idx, obj) {
          self.pendingLoads += 1;
          if (self.cachedSubitems[subitem.NodeType]) //If we already have a list of these items, don't search for them again.
            subitem.listChildren = self.cachedSubitems[subitem.NodeType];
          else { //Otherwise get the full list of those items.
            if (!(subitem.NodeType in selectionService.nodeTypes)) {
              console.log("Node information missing for node type: " + subitem.NodeType);
              self.finishLoad();
              return;
            }

            webService.basicGet('/api/card', {
              nodeType: subitem.NodeType
            }).then(function (result) {
              subitem.listChildren = result.data.data;
              self.finishLoad();
            });
          }
        });
      });
      self.finishLoad();
    });

    // *********************************
    // Internal methods
    // *********************************

    self.clearSearchFields = function () {
      self.textSearchFields = {};
    };

    // Called whenever a REST call finishes loading.
    self.finishLoad = function () {
      self.pendingLoads -= 1;
      if (self.pendingLoads < 1)
        self.loading = false;
    };
  }
})();