(function () {
  angular
    .module('theLink')
    .controller('DashboardController', ['WebService', 'theLinkSelectionService', '$log', '$scope', 'VisDataSet', DashboardController])
    .config(function ($mdThemingProvider, ChartJsProvider) {
      $mdThemingProvider.definePalette('light', {
        '50': '#e1f5fe',
        '100': '#b3e5fc',
        '200': '#81d4fa',
        '300': '#4fc3f7',
        '400': '#29b6f6',
        '500': '#03a9f4',
        '600': '#039be5',
        '700': '#0288d1',
        '800': '#0277bd',
        '900': '#01579b',
        'A100': '#80d8ff',
        'A200': '#40c4ff',
        'A400': '#00b0ff',
        'A700': '#0091ea',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
      });

      $mdThemingProvider.theme('dashboard').primaryPalette('light');

      // Set the colors for angular-chart.js
      Chart.defaults.global.colors = ['#E1F5FE', '#D7EEF9', '#CEE7F5', '#C5E1F1', '#BBDAED', '#B2D4E9', '#A9CDE5', '#9FC6E1', '#96C0DD', '#8DB9D8', '#83B3D4', '#7AACD0', '#71A6CC', '#679FC8', '#5E98C4', '#5592C0', '#4B8BBC', '#4285B7', '#397EB3', '#2F77AF', '#2671AB', '#1D6AA7', '#1364A3', '#0A5D9F', '#01579B'];
    });
  // red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, grey, blue-grey

  function DashboardController(webService, selectionService, $log, $scope, VisDataSet) {
    var self = this;
    self.graphTiles = [];
    self.metrics = {};
    self.loading = true;
    self.pendingLoads = 0;

    // column parameters - controls grid columns for various sizes
    self.mdColsLg = 3;
    self.mdColsMd = 2;
    self.mdColsSm = 1;

    self.userPivot = {
      data: {},
      options: {
        autoResize: true,
        //height: '800',
        height: '100%',
        width: '100%',
        //nodes: { //Default node style.
        //size: 10,
        //color: "#93D276",
        //shape: "circle",
        //}
      },
      events: {
        doubleClick: function (props) {
          var userId = self.userId;
          var nodeType = self.userPivot.data.nodes.get(props.nodes[0]).nodeType;

          if (userId && nodeType) {
            selectionService.notify('search-event', {
              searchType: 'pivot',
              node: {
                Uuid: userId,
                NodeType: 'Person'
              },
              mode: 'type',
              nodeType: nodeType
            });
          }
        }
      }
    };

    // Trigger event to call search
    self.graphClick = function (points, event) {
      var label = points[0]._model.label;
      var question = event.target.id;

      // if the click is on a valid element 
      if ((question) && (label)) {
        $scope.$emit('dashboardClick', [question, label]);
      }
    };

    self.triggerSearch = function () {

    };

    var loadGraphs = function (response) {
      var result = response.data.data;

      if (response.status == 401)
        $log.debug("Error. Permission violation!");
      else if (typeof result != 'object')
        $log.debug("Error. API call did not return recognized Javascript object.");
      else {
        self.graphTiles = result;
        self.graphTiles.forEach(function (val) { // Do some display formatting on the graphs returned.

          // set spans based on type
          switch (val.chartType) {
             case 'line':
              val.colspan = 2;
              val.rowspan = 1;
              break;
            case 'pie':
              val.colspan = 1;
              val.rowspan = 1;
              break;
            case 'horizontalBar':
              val.colspan = 2;
              val.rowspan = 1;
              break;
            case 'bar':
              val.colspan = 2;
              val.rowspan = 1;
              break;
            default:
              val.colspan = 1;
              val.rowspan = 1;
              break;
          }

          val.click = self.graphClick;
        });
      }

      self.finishLoad();
    };

    var loadMetrics = function (response) {
      var result = response.data.data;

      if (response.status == 401)
        $log.debug("Error. Permission violation!");
      else if (typeof result != 'object')
        $log.debug("Error. API call did not return recognized Javascript object.");
      else
        self.metrics = result;

      self.finishLoad();
    };

    var loadUserPivot = function (response) {
      var result = response.data.data;

      if (response.status == 401)
        $log.debug("Error. Permission violation!");
      else if (typeof result != 'object')
        $log.debug("Error. API call did not return recognized Javascript object.");
      else {
        self.userId = result.nodes[0].uuid;

        self.userPivot.data = {
          nodes: VisDataSet(result.nodes),
          edges: VisDataSet(result.edges),
        };
      }

      self.finishLoad();
    };

    // Load the dashboard metrics.
    self.loading = true;
    self.pendingLoads += 2;
    webService.basicGet('/api/dashboard/graphs').then(loadGraphs);
    webService.basicGet('/api/dashboard/metrics').then(loadMetrics);
    webService.basicGet('/api/dashboard/userpivot').then(loadUserPivot);

    // Called when a REST call finishes loading.
    self.finishLoad = function () {
      self.pendingLoads -= 1;
      if (self.pendingLoads < 1)
        self.loading = false;
    };




  }



})();