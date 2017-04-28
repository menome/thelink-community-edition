(function (angular) {
  angular
    .module('theLink')
    .controller('TheLinkController', [
      'WebService', 'theLinkSelectionService',
      'theLinkDialogueService', '$scope',
      '$log', '$window', '$mdSidenav', '$mdMedia', 'NgMap', 'StreetView', 'MapService',
      TheLinkController
    ])

    //Check if we're logged in.
    .run(['WebService', '$window',
      function (WebService, $window) {
        WebService.getUserDetails().then(function (resp) {
          if (resp.status == 401)
            $window.location.href = '/';
        });
      }
    ]);


  function TheLinkController(webService, selectionService, dialogueService, $scope, $log, $window, $mdSidenav, $mdMedia, NgMap, StreetView, mapService) {
    var self = this;

    selectionService.subscribe($scope, 'search-event', function search(event, data) {
      if (data.searchType == 'pivot')
        self.pivot(data.node, data.mode, data.nodeType);
      else if (data.searchType == 'card')
        self.cardSearch(data.fields);
      else
        console.log("Unable to handle search event: " + data.searchType);
    });

    // Opens a mailto link in another window for the user to provide feeback.
    // feedbackInfo is provided by client-conf.js, our clientside config file.
    self.feedbackFunc = function () {
      var url = 'mailto:' + feedbackInfo.email + '?subject=' + feedbackInfo.subject;
      window.open(url, 'emailWindow');
    };

    // enum to define search states
    self.searchModes = {
      LIST: "search-list",
      TEXT: "search-text",
      FULLTEXT: "search-fulltext",
      MAP: "search-map",
      HOME: "home",
      HELP: "help",
    };

    self.leftPanelMenuTypes = {
      LIST: "search-list",
      MENU: "leftpanel-menu",
      TEXT: "search-text",

    };

    self.items = [];
    self.$mdMedia = $mdMedia;
    self.creationDialogues = dialogueService.creationDialogues;
    self.createMenuOpen = false;
    self.resultsCount = 0;

    // setup map
    // window.onresize = google.maps.event.trigger(NgMap,'resize');
    self.mapZoomMarkerThrehold = 12; // threshold to display markers at
    var timeout;

    mapService.boundsChangeTimer = 500; //time in ms, that will reset if next 'bounds_changed' call is send, otherwise code will be executed after that time is up
    mapService.firstTimeMapOpened = true;
    mapService.defaultZoom = 14,
      mapService.defaultMapCenterLat = 50.67448797148436,
      mapService.defaultMapCenterLong = -114.28356170654297,

      // Map initizalziation function : TODO : See if this can be refactored/moved to services
      self.initializeMap = function () {

        mapService.map = NgMap.initMap('map-control');
        mapService.map.setMapTypeId( 'hybrid');

        // setup resize event - handles resizing map to window
        google.maps.event.addListener(mapService.map, 'bounds_changed', function () {
          google.maps.event.trigger(mapService.map, 'resize');

        });

        // setup map zoom handler
        google.maps.event.addListener(mapService.map, 'zoom_changed', function () {
          window.clearTimeout(timeout);
          timeout = window.setTimeout(function () {
            if(mapService.map.getZoom() >=  self.mapZoomMarkerThrehold)
                self.mapSearch(mapService.map.getBounds(), mapService.map.getCenter(), true);
              else
              {
                mapService.clearMarkers();
                if(mapService.markerClusterer != null)
                  mapService.markerClusterer.clearMarkers();
              }
          }, mapService.boundsChangeTimer);
        });

        // listener for pan
        google.maps.event.addListener(mapService.map, 'dragend', function () {
          window.clearTimeout(timeout);
          timeout = window.setTimeout(function () {
             if(mapService.map.getZoom() >=  self.mapZoomMarkerThrehold)
                self.mapSearch(mapService.map.getBounds(), mapService.map.getCenter(), true);
          });
        }, mapService.boundsChangeTimer);

        // zoom map to center
        mapService.setMapCenter(mapService.defaultMapCenterLat, mapService.defaultMapCenterLong, mapService.defaultZoom);

        mapService.firstTimeMapOpened = false;
      };

    // handler for setting selected marker
    $scope.setSelectedMarker = function (marker) {
      var icon = marker.icon;
      icon.fillColor = mapService.selectedMarkerColor;
      marker.setIcon(icon);

      // reset old icon color
      if (mapService.selectedMarker !== null) {
        var oldIcon = mapService.selectedMarker.icon;
        oldIcon.fillColor = mapService.markerColor;
        mapService.selectedMarker.setIcon(oldIcon);
      }
      mapService.selectedMarker = marker;
    };

    // hanlder for dashboard click event
    $scope.dashboardClick = function (question, label) {
      self.askQuestion(question, label);
    }

    // Used for filtering our search results
    self.searchFilter = "";
    self.includeInactive = false;
    self.lsdFilter = "";
    self.searchFilterFunc = function (val, idx, arr) {
   
      if ((self.lsdFilter.length < 1) && (self.searchFilter.length < 1)) return true;
      if (val.displayInfo.Summary) {
        if (val.displayInfo.Summary.toUpperCase().indexOf(self.lsdFilter.toUpperCase()) > 0) return true;
      }
  
      if (val.displayInfo.Name) {
        if (val.displayInfo.Name.toUpperCase().indexOf(self.searchFilter.toUpperCase()) > 0) return true;
      }

      // return no filter hits
      return false;

    };

    // View state handling : TODO : Refactor using UI Route/State
    self.searchMode = self.searchModes.LIST; // sets the current search mode. Valid states are
    self.appMode = "info"; //If we're browsing, or editing links.
    self.user = {
      Roles: []
    }; //User object.
    self.canContribute = false; //Can we go into Link mode?

    self.lefPanelOpen = true;
    self.rightPanelOpen = false; //We use this to lock the right panel open in desktop mode.
    self.loading = false; // True if the main view is being populated by a query.
    self.searchFinished = false; //True if we've just performed a search, and should have results.
    self.home = true; // True if we are just starting, or if home has been pushed
    self.showMap = false; // controls display of map control
    self.showDashboard = true; // controls display of dashboard component
    self.showSearchResultsArea = false; // controls display of search results area
    self.showFullTextSearch = false; // controls display of full text search area
    self.leftPanelMenuType = self.leftPanelMenuTypes.LIST; // sets the type of search on the left panel. Valid types are LIST, TEXT and MENU

    self.getCardSummary = selectionService.cardSummary;

    $scope.rightSidenavOpen = function () {
      $mdSidenav('right').open();
    }

    $scope.rightSidenavClose = function () {
      $mdSidenav('right').close();
    }


    // *********************************
    // Breadcrumb/Search State Stuff
    // *********************************
    self.breadCrumb = []; //We keep track of our last searches in a breadcrumb trail.
    self.breadCrumbIdx = -1; //The current search we've done.
    self.lastPivotId = null; //the UUID of the last thing we pivoted on.
    self.resultsCount = null; // count of results

    // Back and forward buttons for the search breadcrumb.
    self.canPrevSearch = function () {
      return (self.breadCrumbIdx > 0 && self.breadCrumbIdx <= self.breadCrumb.length);
    };
    self.canNextSearch = function () {
      return (self.breadCrumbIdx >= -1 && self.breadCrumbIdx < self.breadCrumb.length - 1);
    };

    self.prevSearch = function () {
      if (!self.canPrevSearch()) return;
      self.breadCrumbIdx -= 1;
      self.reloadQuery();
    };

    self.nextSearch = function () {
      if (!self.canNextSearch()) return;
      self.breadCrumbIdx += 1;
      self.reloadQuery();
    };

    // Adds to the bread crumb trail where the index is.
    self.addSearch = function (search, id) {
      var lastId = typeof id !== 'undefined' ? id : null;

      if (lastId && self.lastPivotId === lastId && self.breadCrumbIdx === self.breadCrumb.length - 1) { //If we're doing another pivot on the same node, replace the last crumb.
        self.breadCrumb[self.breadCrumbIdx] = search;
      } else {
        self.lastPivotId = lastId;
        self.breadCrumb = self.breadCrumb.slice(0, self.breadCrumbIdx + 1);
        self.breadCrumb.push(search);
        self.breadCrumbIdx += 1;
      }
    };

    self.clearTrail = function () {
      self.breadCrumb = [];
      self.breadCrumbIdx = -1;
      self.lastPivotId = null;
    };

    self.loadIndex = function (idx) {
      if (idx < 0 || idx >= self.breadCrumb.length) return;
      self.breadCrumbIdx = idx;
      self.reloadQuery();
    };

    // *********************************
    // API/Communication Methods
    // *********************************
    //
    // The optional argument pushToBreadCrumb defaults to true. It will push the search to the breadcrumb trail.
    // The function for backtracking along the trail prevents them from pushing themselves to the trail again.

    // triggers a search designed to return Help Content Cards
    self.getHelp = function () {
      var helpQuestion = "getTrail";
      var helpNode = "db4bfe80-d7ad-11e6-bf26-cec0c932ce01";

      self.loading = true;
      webService.basicGet('/api/questions/ask', {
        questionstr: helpQuestion,
        id: helpNode
      }).then(loadSearchResults);

      // set the app state to display help results
      self.setSearchMode(self.searchModes.HELP);
    }

    // Generic Card Search. Searches index and content cards.
    self.cardSearch = function (fields, pushToBreadcrumb) {
      if (!fields) fields = {
        extended: true
      };
      var shouldClearBreadcrumb = typeof pushToBreadcrumb === 'undefined';
      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;
      if ($mdSidenav('left').isOpen()) $mdSidenav('left').close();

      self.loading = true;
      self.showSearchResultsArea = true;
      self.showDashboard = false;
      fields.extended = true;

      webService.basicGet('/api/card', fields).then(loadSearchResults);

      //Reset our breadcrumb trail
      if (push) {
        if (shouldClearBreadcrumb) self.clearTrail();

        self.addSearch({
          func: self.cardSearch,
          args: [fields],
          text: "Search for " + fields.nodeType
        });
      }
    };

    // Full Text Search
    self.fullTextSearch = function (fields, index) {
      var searchString = fields;

      if (!fields) fields = {
        extended: true
      };
      var shouldClearBreadcrumb = typeof pushToBreadcrumb === 'undefined';
      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;
      if ($mdSidenav('left').isOpen()) $mdSidenav('left').close();

      self.loading = true;
      self.showSearchResultsArea = true;
      self.showDashboard = false;

      webService.basicGet('/api/fulltextsearch?index=' + index + '&name=' + searchString).then(loadSearchResults);

      nodeType = searchString;

      //Reset our breadcrumb trail
      if (push) {
        if (shouldClearBreadcrumb) self.clearTrail();

        self.addSearch({
          func: self.fullTextSearch,
          args: [fields, index],
          text: "Search for " + nodeType
        });
      }
    };

    // map search - called on pan/zoom
    self.mapSearch = function (mapBounds, mapCenter, pushToBreadcrumb) {
      var fields = {
        extended: true
      };

      // setup spatial bits
      var latitude = mapCenter.lat();
      var longitude = mapCenter.lng();

      // compute distance from bounds - divide by 2 to get radius, and then reduce by a factor to bring inside bounds
      var distance = (mapService.distance(mapBounds.getNorthEast(), mapBounds.getSouthWest()));// / 2 * 0.8;

      var shouldClearBreadcrumb = typeof pushToBreadcrumb === 'undefined';
      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;

      self.loading = true;
      self.showSearchResultsArea = true;
      self.showDashboard = false;

      webService.basicGet('/api/mapsearch?latitude=' + latitude + '&longitude=' + longitude + '&distance=' + distance).then(loadSearchResults);

      //Reset our breadcrumb trail
      if (push) {
        if (shouldClearBreadcrumb) self.clearTrail();
      }
    };

    // Pivot Search Control
    self.pivot = function (node, mode, nodeType, labelName, pushToBreadcrumb) {
      self.loading = true;
      self.showSearchResultsArea = true;
      self.showDashboard = false;
      self.includeInactive = true; //Always show inactive results after a pivot.

      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;
      var fields = {
        extended: true
      };

      if (mode == 'all')
        webService.basicGet('/api/pivot/' + node.Uuid, fields).then(loadSearchResults);
      else if (mode == 'type')
        webService.basicGet('/api/pivot/bytype/' + node.Uuid + '/' + nodeType, fields).then(loadSearchResults);
      else if (mode == 'rel') {
        fields.nodeType = nodeType;
        webService.basicGet('/api/pivot/byrel/' + node.Uuid + '/' + labelName, fields).then(loadSearchResults);
      }

      if (push) {
        self.addSearch({
          func: self.pivot,
          args: [node, mode, nodeType, labelName],
          text: "Pivot on " + node.NodeType
        }, node.Uuid);
      }
    };

    // Question Search Control
    self.askQuestion = function (question, node, pushToBreadcrumb) {
      self.loading = true;
      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;

      webService.basicGet('/api/questions/ask', {
        questionstr: question.Name,
        id: node.Uuid
      }).then(loadSearchResults);

      if (push) {
        self.addSearch({
          func: self.askQuestion,
          args: [question, node],
          text: "Ask Question"
        }, node.Uuid);
      }
    };

    // Question Search Control
    self.dashboardQuestion = function (question, label) {

      self.loading = true;
      self.showSearchResultsArea = true;
      self.showDashboard = false;

      var push = typeof pushToBreadcrumb !== 'undefined' ? pushToBreadcrumb : true;
      webService.basicGet('/api/questions/dashboard', {
        questionstr: question,
        label: label
      }).then(loadSearchResults);
    };


    self.deleteNode = function (nodeType, nodeId) {
      var apiEnd = selectionService.nodeTypes[nodeType].api;
      webService.basicDelete('/api/' + apiEnd + '/' + nodeId).then(function (response) {
        if (response.status != 200)
          $log.debug("Delete Failed.");
        else
          $log.debug("Delete Successful");

        self.reloadQuery();
      });
    };

    // Performs the last query again. Used to update the view.
    self.reloadQuery = function () {
      if (self.breadCrumb.length < 1) return;
      var args = self.breadCrumb[self.breadCrumbIdx].args;
      if (args.length < 5) args.push(false); //Super hacky way of making sure we don't push to breadcrumb.

      self.breadCrumb[self.breadCrumbIdx].func.apply(this, args);
    };

    self.canDelete = function (card) {
      return selectionService.nodeTypes[card.NodeType].canDelete;
    };

    // *********************************
    // App State Stuff
    // *********************************
    // Main Search Mode State Management
    self.setSearchMode = function (requestedSearchType) {
      // If they're clicking the same button as their current mode, treat it like they're clicking home and clear a bunch of stuff.
      if (requestedSearchType === self.searchMode) {
        self.items = [];
        self.clearTrail();
        self.loading = false;
        self.searchFinished = false;
        self.deselectCard();
        mapService.clearMarkers();
        if (mapService.markerClusterer)
          mapService.markerCluster.clearMarkers();
      }

      self.searchMode = requestedSearchType;

      switch (requestedSearchType) {
        case self.searchModes.MAP:
          // close the left panel
          self.leftPanelOpen = false;
          self.showDashboard = false;
          self.showSearchResultsArea = true;
          self.showMap = true;
          self.showFullTextSearch = false;

          // only set center on first open
          if (mapService.firstTimeMapOpened)
            self.initializeMap();
          else
            google.maps.event.trigger(mapService.map, 'resize');

          break;
        case self.searchModes.HELP:
          self.includeInactive = false;
          self.leftPanelOpen = true;
          self.showMap = false;
          self.showDashboard = false;
          self.showSearchResultsArea = true;
          self.showFullTextSearch = false;
          self.leftPanelMenuType = self.leftPanelMenuTypes.LIST;
          break;
        case self.searchModes.LIST:
          self.includeInactive = false;
          self.leftPanelOpen = true;
          self.showMap = false;
          self.showDashboard = false;
          self.showSearchResultsArea = true;
          self.showFullTextSearch = false;
          self.leftPanelMenuType = self.leftPanelMenuTypes.LIST;
          break;
        case self.searchModes.TEXT:
          self.includeInactive = false;
          self.leftPanelOpen = true;
          self.leftPanelOpen = true;
          self.showMap = false;
          self.showDashboard = false;
          self.showSearchResultsArea = true;
          self.showFullTextSearch = true;
          self.leftPanelMenuType = self.leftPanelMenuTypes.TEXT;
          break;
        default: // home
          self.includeInactive = false;
          self.leftPanelOpen = true;
          self.showMap = false;
          self.showDashboard = true;
          self.showSearchResultsArea = false;
          self.showFullTextSearch = false;

          self.items = [];
          self.clearTrail();
          self.loading = false;
          self.searchFinished = false; //True if we've just performed a search, and should have results.
          self.deselectCard();
          self.searchFilter = "";
          self.fullText = "";
          self.helpText = "";
          self.home = true;
          self.searchMode = self.searchModes.HOME;
          self.leftPanelMenuType = self.leftPanelMenuTypes.LIST;
          break;
      }

    };
    // changes display on main panel when mobile menu is up
    self.changeLeftPanel = function (type) {
      if (mapService.map !== null)
        google.maps.event.trigger(mapService.map, 'resize');

      if (self.leftPanelMenuType == "search-map") {
        NgMap.center = "41,-87";
        self.leftPanelOpen = false;
        self.leftPanelMenuType = type;
      } else if (self.leftPanelMenuType != type || self.leftPanelOpen === false) {
        self.leftPanelOpen = true;
        self.leftPanelMenuType = type;
      } else {
        self.leftPanelOpen = false;
      }
    }

    // To select a letter from an alphabet group,
    // Just repeat the last query, without the group option, and with the firstletter option.
    // Should work for almost all queries.
    self.selectGroup = function (groupType, queryStr) {
      if (self.breadCrumb.length < 1) return;
      if (self.breadCrumb[self.breadCrumbIdx].func !== self.cardSearch) return;
      var oldSearch = self.breadCrumb[self.breadCrumbIdx];

      //Copy the old args. Change it so it's searching by letter, not group.
      var newArgs = JSON.parse(JSON.stringify(oldSearch.args));
      newArgs[0].group = false;
      newArgs.push(false); //Don't push to search history. We'll do that here.

      newArgs[0][groupType] = queryStr;

      self.addSearch({
        func: self.cardSearch,
        args: newArgs,
        text: "By " + groupType + ": " + queryStr,
      });

      self.reloadQuery();
    };

    // Wrapper for selectGroup function that converts an object of {year: int, month: int, day: int}
    // to input for selectGroup
    self.selectDate = function (date) {
      var pad = function (s) {
        return s.length < 2 ? "0" + s : s;
      };

      var dateStr = "";
      dateStr += date.year.toString();
      dateStr += date.month ? pad(date.month.toString()) : "";
      dateStr += date.day ? pad(date.day.toString()) : "";
      self.selectGroup('date', dateStr);
    };

    // Wrapper for selectGroup function that searches by location.
    self.selectLocation = function (location) {
      //TODO: This doesn't really work for cities as of yet. Should be changed to include country and region in the query.
      if (location.city) return self.selectGroup('city', location.city);
      if (location.region) return self.selectGroup('region', location.region);
      if (location.country) return self.selectGroup('country', location.country);
    };

    // Useful on mobile
    self.toggleLeftPanel = function () {
      self.leftPanelMenuType = self.leftPanelMenuTypes.MENU; //'leftpanel-menu';
      $mdSidenav('left').toggle();
    };

    //Make sure we default the sidepanel back when our screen size changes.
    $scope.$watch(function () {
      return $mdMedia('gt-sm');
    }, function (isLarge) {
      self.leftPanelType = self.leftPanelMenuTypes.LIST;
    });


    // Open an angular material menu. Used for the user menu.
    self.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    self.logout = function () {
      $window.location.href = '/user/logout';
    };

    // Change the mode of the app. (info/link).
    // This will probably expand later.
    self.switchMode = function (mode) {
      if (mode === 'link' || mode === 'info')
        self.appMode = mode;
    };

    // When our selection changes, we want to open or close the right sidebar.
    $scope.$watch(function () {
      return selectionService.selectedCard;
    }, function (selection) {
      if (mapService.map !== null) {
        google.maps.event.trigger(mapService.map, 'resize');
      }
      if (selection !== null) {
        self.rightPanelOpen = true;
        if (!$mdMedia('gt-md')) $mdSidenav('right').open();
      } else {
        self.rightPanelOpen = false;
        if (!$mdMedia('gt-md')) $mdSidenav('right').close();
      }
    });

    $scope.$watch(function () {
      return webService.user;
    }, function (user) {
      if (!user) return;
      self.user = user;
      self.canContribute = user.Roles.indexOf('contributor') != -1;

      if (!user.CompletedTutorial && webService.tutorialCookie !== 'done') {
        startIntro(function () {
          webService.basicGet('/user/completetutorial');
          webService.setTutorialCookie();
        });
      }
    });

    // handle dashboard click event by triggering search
    $scope.$on('dashboardClick', function (event, data) {
      self.dashboardQuestion(data[0], data[1]);
    });


    // card handlers
    self.selectCard = function (card) {
      if (!$mdMedia('gt-md') && card == selectionService.selectedCard)
        $mdSidenav('right').open();

      selectionService.selectedCard = card;
    };

    self.deselectCard = function () {
      if (!$mdMedia('gt-md')) $mdSidenav('right').close();
      selectionService.selectedCard = null;
    };

    self.confirmAction = function (ev, desc, func, args) {
      dialogueService.confirmDialog(ev, desc).then(function () {
        func.apply(this, args);
      });
    };

    self.showContentCard = function (ev, card) {
      dialogueService.displayContent(ev, card);
    };

    self.loadScroll = function () {
      self.displayCount += 10;
    };

    // *********************************
    // Internal methods
    // *********************************
    var loadSearchResults = function (response) {
      var result = response.data.data;

      self.home = false;

      if (response.status == 401)
        dialogueService.notifyDialog(null, "Permission Violation", "We're getting errors with your account's authorization! Try refreshing the page, your session probably expired.");
      else if (typeof result != 'object')
        $log.debug("Error. API call did not return recognized Javascript object.");
      else {
        self.items = result;
        self.itemsType = response.data.type;
        self.displayCount = 20;
      }

      if (self.items.length < 1) {
        self.searchFinished = true;
        self.resultsCount = 0;
      } else
        self.resultsCount = self.items.length;

      //Get display info for the card.
      if (self.itemsType === "ResultSet") {
        self.items.forEach(function (val, idx, obj) {
          val.displayInfo = selectionService.cardSummary(val);

          // if map is active, lets make some dots : TODO: Refactor to seperate controller
          if (self.searchMode == self.searchModes.MAP) {
            if (val.Latitude) {
              mapService.addMarker(val, $scope);
            }
          }
        });
      }
      // if done loading and mapping, and if is map mode cluster the markers (can't cluster before marker generation is complete)
      if (self.searchMode == self.searchModes.MAP) {
       
       // cluster the markers
      // if(mapService.markerClusterer == null){
          mapService.markerClusterer = new MarkerClusterer(
            mapService.map,
            mapService.markers, {
              maxZoom: mapService.mapZoomMarkerThrehold,
              imagePath: './bower_components/googlemaps-js-marker-clusterer/images/m'
            });
      // }
      
      }
      self.loading = false;
    };
  }
})(window.angular);