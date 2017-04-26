/*
 * infinite-scroll.js
 * Adapted from
 *  ng-infinite-scroll - v1.0.0 - 2013-09-16
 * https://sroze.github.io/ngInfiniteScroll/index.html
 */

var module = angular.module('infinite-scroll', []);

module.directive('infiniteScroll', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return {
    link: function (scope, element, attrs) {
      var container = angular.element(document.querySelector(attrs.infiniteScrollContainer));
      var scrollDistance = 0;
      var scrollEnabled = true;
      var checkWhenEnabled = false;

      var handler = function () {
        var shouldScroll = (container[0].scrollTop + container[0].clientHeight) >=
          (container[0].scrollHeight);

        if (shouldScroll && scrollEnabled) {
          if ($rootScope.$$phase) {
            return scope.$eval(attrs.infiniteScroll);
          } else {
            return scope.$apply(attrs.infiniteScroll);
          }
        } else if (shouldScroll) {
          checkWhenEnabled = true;
        }
      };

      if (!attrs.infiniteScrollDistance) {
        scope.$watch(attrs.infiniteScrollDistance, function (value) {
          scrollDistance = parseInt(value, 10);
        });
      }

      if (!attrs.infiniteScrollDisabled) {
        scope.$watch(attrs.infiniteScrollDisabled, function (value) {
          scrollEnabled = !value;

          if (scrollEnabled && checkWhenEnabled) {
            checkWhenEnabled = false;

            return handler();
          }
        });
      }

      container.bind('scroll', handler);
      scope.$on('$destroy', function () {
        return container.unbind('scroll', handler);
      });

      return $timeout((function () {
        if (attrs.infiniteScrollImmediateCheck) {
          if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
            return handler();
          }
        } else {
          return handler();
        }
      }), 0);
    }
  };
}]);