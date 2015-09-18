'use strict';

angular.module('mapManager.d3.directives', [ 'mapManager.map',
  'mapManager.d3.services', 'mapManager.console' ])
.directive('map',
  function(currentMapService, mapInteractionService,
           mapCreatorService, d3Service) {
    return {
      restrict: 'A',
      scope: {
        val: '=',
        grouped: '='
      },
      link: function(scope, element) {
        d3Service.select('#map1').remove();
        currentMapService.setCurrentMapElement(element);
        currentMapService.setCurrentMapId('map1');
        mapCreatorService.createMap(scope, element);
      }
    };
  }
);