(function () {
  'use strict';

  angular.module('theLink')

    /* Service for tracking selected items between controllers */
    .factory('MapService', ['$log', 'theLinkSelectionService', 'WebService', 'NgMap', 'StreetView',

      function ($log, selectionService, WebService, NgMap, StreetView) {

        return {

          /// PROPERTIES
          map: null, // variable to get the MAP instance back from the control
          markers: [], // array for tracking map markers
          lastMapCenter: null, // tracking last map center point for marker redraw calculation
          lastMapDistance: null, // tracking last map distance for marker redraw calculuation
          lastMapZoom: null, // tracking last map zoom for marker redraw calculation
          currentBounds: null, // current map bounds 
          zoomThreshold: null, // zoom threshold for triggering marker draw vs. marker clustering
          iconScale: .5, // scale of the icons to display 
          iconOpacity: 0.8, // opacity of icons
          selectedMarker: null, // currenlty selected marker
          selectedMarkerColor: '#9966ff', // color for selected marker
          markerColor: '#0099ff',
          firstTimeMapOpened: true, // flag to track first map open instance: true on load. 

          // zoom/clustering parameters:
          mapZoomMarkerThrehold: 14,
          size: -1,
          style: -1,
          markerClusterer: null, // custerer for markers
          boundsChangeTimer: 500,
          defaultZoom: 4,
          defaultMapCenterLat: 53,
          defaultMapCenterLong: -107,


          /// METHODS
          // adds a marker to the specified map
          addMarker: function (card, $scope) {
            var self = this;
            var location = new google.maps.LatLng(card.Latitude, card.Longitude);

            // check if marker already in list
            if (!this.cardInMarkers(card)) {
              
              var marker = this.generateMarker(card, this.markerColor);

              // add click handler - needs to have $scope.apply to fire $watch
              google.maps.event.addListener(marker, 'click', function () {
                selectionService.selectedCard = marker.card;
                $scope.setSelectedMarker(marker);
                $scope.$apply();
              });

              // push the marker to the tracking array
              this.markers.push(marker);
            }
          },


          // identifies if specified card is in markers array : checks on UUID
          cardInMarkers: function (card) {
            var self = this;
            var found = false;
            for (var i = 0; i < this.markers.length; i++) {
              if (this.markers[i].Uuid == card.Uuid) {
                return true;
              }
            }
            // no hit by end retrun false
            return false;
          },

          // fully removes a marker from the array
          removeMarker: function (card) {
            var self = this;
            var found = false;
            for (var i = 0; i < this.markers.length; i++) {
              if (this.markers[i].Uuid == card.Uuid) {
                this.markers[i].setMap(null);
                this.markers.splice(i, 1);
                break;
              }
            }
          },

          // hides a marker, but doesn't remove it from the array
          hideMarker: function (marker) {
            var self = this;
            for (var i = 0; i < this.markers.length; i++) {
              if (this.markers[i].Uuid == marker.Uuid) {
                this.markers[i].setMap(null);
                break;
              }
            }
          },

          // shows a hidden marker in the array
          showMarker: function (marker) {
            var self = this;
            for (var i = 0; i < this.markers.length; i++) {
              if (this.markers[i].Uuid == marker.Uuid) {
                this.markers[i].setMap(this.map);
                break;
              }
            }
          },

          // clears all markers
          clearMarkers: function () {
            var self = this;
            for (var i = 0; i < this.markers.length; i++ ) {
                this.markers[i].setMap(null);
              }
              //this.markers.length = [];
          },

          // pan and zoom to location
          focusLocation: function (zoom, location) {
            this.map.setZoom(zoom);
            this.map.panTo(location);
          },

          // sets the map center and focuses it 
          setMapCenter: function (lat, long, zoom) {
            var self = this;
            var location = new google.maps.LatLng(lat, long);

            this.map.setCenter(location);
            this.map.setZoom(zoom);
            this.map.panTo(location);
          },

          // radians function
          rad: function (x) {
            return x * Math.PI / 180;
          },

          // calculate distance between two points
          distance: function (p1, p2) {
            var self = this;
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = self.rad(p2.lat() - p1.lat());
            var dLong = self.rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(self.rad(p1.lat())) * Math.cos(self.rad(p2.lat())) *
              Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d; // returns the distance in meter
          },

          // gets the appropriate icon for card type
          getMapIcon: function (card) {
            var self = this;
            var cardIcon = null;

            if (selectionService.nodeTypes[card.NodeType] != null)
              cardIcon = selectionService.nodeTypes[card.NodeType].icon;
            else
              return fontawesome.markers.EXCLAMATION_CIRCLE;

            // map string types to match marker library index
            cardIcon = cardIcon.toUpperCase();
            cardIcon = cardIcon.replace('-', '_');

            return fontawesome.markers[cardIcon];
          },

          // generates a marker object from specfied card
          generateMarker: function (card, color) {
            var self = this;
            var pathToMarker = this.getMapIcon(card);
            var location = new google.maps.LatLng(card.Latitude, card.Longitude);
            var marker = new google.maps.Marker({
              icon: {
                path: pathToMarker,
                scale: this.iconScale,
                strokeWeight: 0.2,
                strokeColor: 'black',
                strokeOpacity: 1,
                fillColor: color,
                fillOpacity: this.iconOpacity,
              },
              position: location,
              map: this.map,
              title: card.Name,
              card: card,
              Uuid: card.Uuid,
              nodeType: card.NodeType,
            });
            return marker;
          }
        };
      }
    ]);

})();