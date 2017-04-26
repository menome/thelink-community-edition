/**
 * TheLinkService.js
 *
 * Contains Angular services for theLink
 * One of them is the selection service. This service handles card selection and display info.
 * It requires that a global variable called 'nodeTypes' is defined.
 * theLink includes a file with this definition: 'nodeconf.js'
 * If this file is not included, things will break.
 **/

(function () {
  'use strict';

  // Wraps display pairs in an object for easy display.
  // Include URL if it should be a hyperlink
  // Include card = true if you want it to be shown on the item's card
  var displayPairWrapper = function (name, val, onCard, url, newtab) {
    var retobj = {
      displayName: name,
      displayVal: val,
      onCard: false,
      newtab: false,
    };
    if (typeof url !== 'undefined') retobj.url = url;
    if (typeof onCard !== 'undefined') retobj.onCard = onCard;
    if (typeof newtab !== 'undefined') retobj.newtab = newtab;
    return retobj;
  };

  angular.module('theLink')

    /* Service for tracking selected items between controllers */
    .factory('theLinkSelectionService', ['$log', '$rootScope', 'WebService', function ($log, $rootScope, WebService) {
      return {
        /* The card that we have currently selected in information mode */
        selectedCard: null,
        subscribe: function (scope, event, callback) {
          var handler = $rootScope.$on(event, callback);
          scope.$on('$destroy', handler);
        },
        notify: function (event, args) {
          $rootScope.$emit(event, args);
        },
        /* Gives an object that contains all the fields we need in order to display the card. */
        cardSummary: function (card) {
          if (!card) return null;

          var type = nodeTypes[card.NodeType];
          if (!type) type = nodeTypes.Generic;

          var displayName = (typeof type.getDisplayName === 'function') ? type.getDisplayName(card) : card.Name;
          var displaySummary = (typeof type.getDisplaySummary === 'function') ?
            type.getDisplaySummary(card) : "Pivotable " + card.NodeType + " node";
          var displayPairs = (typeof type.getDisplayPairs === 'function') ?
            type.getDisplayPairs(card) : {};

          // Make lists of stuff more display-friendly.
          if (displayPairs.forEach) {
            displayPairs.forEach(function (val, idx, arr) {
              if (val.displayVal && typeof val.displayVal.join === 'function')
                val.displayVal = val.displayVal.join(", ");
            });
          }

          var sourceLink = (typeof card.Source === 'undefined') ? "" : card.Source;
          var photoUrl = (typeof card.PhotoUrl === 'undefined') ? "" : card.PhotoUrl;
          var markdownContent = (typeof card.MarkdownContent === 'undefined') ? null : card.MarkdownContent;

          // if we have a person node, return image based on formatting
          // TODO: This is a hack until we host all images locally.
          if (card.NodeType == 'Person') {
            // for a person node, if the status is active, return photo URL if any otherwise, return default person icon
            if (card.Status == 'Active') {
              if (photoUrl.indexOf("http") > -1)
                photoUrl = photoUrl;
              else if (photoUrl.length > 1) // valid local URI
                photoUrl = WebService.baseUrl + '/images/' + photoUrl;
            } else
              photoUrl = WebService.baseUrl + '/images/user.png';
          }

          return {
            Name: displayName,
            Summary: displaySummary,
            DisplayPairs: displayPairs,
            Uuid: card.Uuid,
            Icon: type.icon,
            Source: sourceLink,
            PhotoUrl: photoUrl,
            MarkdownContent: markdownContent,
          };
        },

        /* Contains the above list of nodes and their properties for any controller that needs them */
        nodeTypes: nodeTypes
      };
    }])

    //Service for showing dialogue boxes. These boxes can be used to display information, or to allow the user to input data (such as for creating a new article).
    .factory('theLinkDialogueService', ['$log', '$mdMedia', '$mdDialog', 'WebService',
      function ($log, $mdMedia, $mdDialog, WebService) {
        var service = {};

        var dialogContentDisplayController = function ($scope, $mdDialog, card) {

          $scope.cancel = function () {
            $mdDialog.cancel();
          };

          $scope.card = card;
        };

        var dialogController = function ($scope, $mdDialog) {
          $scope.topicList = [];

          WebService.basicGet('/api/card?nodeType=Topic').then(function (result) {
            $scope.topicList = result.data.data;
          });

          $scope.cancel = function () {
            $mdDialog.cancel();
          };

          $scope.answer = function (answer) {
            $scope.loading = true;

            var data = WebService.serializeData({
              name: answer.title,
              source: answer.source,
              photourl: answer.photourl,
              summary: answer.summary,
              topicid: answer.topicid
            });

            WebService.basicPost("/api/articles", data).then(function (result) {
              $scope.loading = false;
              if (result.status == 201) {
                $mdDialog.hide(answer);
                $scope.failed = false;
              } else
                $scope.failed = true;
            });
          };
        };

        service.confirmDialog = function (ev, desc) {
          var confirm = $mdDialog.confirm()
            .title('Confirm Action')
            .textContent(desc)
            .ariaLabel('Confirm Action')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('Cancel');

          return $mdDialog.show(confirm);
        };

        service.notifyDialog = function (ev, title, desc) {
          var confirm = $mdDialog.alert()
            .title(title)
            .textContent(desc)
            .ariaLabel(title)
            .ok('OK')
            .targetEvent(ev);

          return $mdDialog.show(confirm);
        };

        service.createArticle = function (ev) {
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

          return $mdDialog.show({
            controller: dialogController,
            templateUrl: './src/thelink/templates/dialog-create-article.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: useFullScreen
          });
        };

        service.displayContent = function (ev, card) {
          var useFullScreen = true; //($mdMedia('sm') || $mdMedia('xs'));

          return $mdDialog.show({
            controller: dialogContentDisplayController,
            templateUrl: './src/thelink/templates/dialog-content-display.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
            locals: {
              card: card
            }
          });
        };

        service.creationDialogues = [{
          name: "New Article",
          node: nodeTypes.Article,
          dialog: service.createArticle
        }];

        return service;
      }
    ]);
})();