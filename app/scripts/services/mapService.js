'use strict';

angular.module('mapManager.map', [ 'mapManager.d3.services' ])
  .service('mapService', function() {
    return {
      currentMap: null,

      currentMapContext: {},

      configureMapResize: function(scope, element) {
        scope.getElementDimensions = function() {
          return { h: element.height(), w: element.width() };
        };

        scope.$watch(scope.getElementDimensions, function(newValue, oldValue) {
          //<<perform your logic here using newValue.w and set your variables on the scope>>
          console.log('new value = ' + newValue);
          console.log('old value = ' + oldValue);
        }, true);

        element.bind('resize', function() {
          scope.$apply();
        });
      }
    };
  });
