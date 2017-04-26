//Directives for TheLink live here.
(function (angular) {

  angular
    .module('theLink')
    .directive('theLinkLeftPanel', function () {
      return {
        restrict: 'E',
        link: function (scope, element, attrs) {
          scope.contentUrl = './src/thelink/templates/' + attrs.type + '.tmpl.html';
          attrs.$observe("type", function (t) {
            scope.contentUrl = './src/thelink/templates/' + t + '.tmpl.html';
          });
        },
        template: '<div ng-include="contentUrl"></div>'
      };
    })
    .directive('theLinkCard', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/card-Generic.tmpl.html',
        scope: {
          card: '=',
          media: '=',
          select: '&onSelect',
          click: '&click',
        }
      };
    })
    .directive('theLinkGraphCard', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/card-Graph.tmpl.html',
        scope: {
          card: '=',
          graphType: '=',
          select: '&onSelect',
        }
      };
    })
    .directive('theLinkDashboard', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/dashboard-grid.tmpl.html',
        scope: {
          select: '&onSelect',
        }
      };
    })
    .directive('theLinkDisplayPairList', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/display-pair-list.tmpl.html',
        scope: {
          pairs: '=',
          card: '=',
          charlimit: '=',
        },
      };
    })
    .directive('theLinkDashboardList', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/display-dashboard-list.tmpl.html',
        scope: {
          pairs: '=',
          card: '=',
          charlimit: '=',
        },
      };

    })
    .directive('theLinkGroupCard', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/card-Group.tmpl.html',
        scope: {
          card: '=',
          media: '=',
          click: '&click',
        },
      };
    })
    .directive('theLinkDateCards', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/card-Dates.tmpl.html',
        scope: {
          dates: '=',
          click: '&click',
        },
      };
    })
    .directive('theLinkLocationCards', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/card-Locations.tmpl.html',
        scope: {
          locations: '=',
          click: '&click',
        },
      };
    })
    .directive('theLinkRightPanelDigest', function () {
      return {
        restrict: 'E',
        templateUrl: './src/thelink/templates/rightpanel-node-digest.tmpl.html',
        scope: {
          card: '=displayCard',
          readonly: '='
        }
      };
    });
})(window.angular);