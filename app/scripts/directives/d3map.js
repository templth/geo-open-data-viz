'use strict';

angular.module('mapManager.d3.directives', [ 'mapManager.map', 'mapManager.d3.services', 'mapManager.console' ])
.directive('map', ['currentMapService', 'layerService', 'mapInteractionService', 'mapCreatorService',
  function(currentMapService, layerService, mapInteractionService, mapCreatorService) {
    return {
      restrict: 'A',
      scope: {
        val: '=',
        grouped: '='
      },
      link: function(scope, element) {
        currentMapService.currentMap.element = element;
        mapCreatorService.createMap(element);
      }
    };
  }
]);