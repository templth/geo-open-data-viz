'use strict';

/**
 * @ngdoc function
 * @name mapManagerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mapManagerApp
 */
angular.module('mapManagerApp')
  .controller('MapCtrl', function($scope, currentMapService, layerService, //
                                  projectionService, consoleService, //
                                  mapCreatorService, map, maps, sources, //
                                  commonsService) {
    // Register common functions
    commonsService.registerCommonFunctionsInScope(
      $scope, 'map', maps, sources);

    // Set current map elements
    currentMapService.currentMap = map;

    // Set current map in scope
    commonsService.setCurrentMapInScope($scope, map);

    // Add map functions in scipe
    commonsService.registerCommonMapFunctionsInScope($scope);
  })

  .controller('UpdateLayerCtrl', function($scope, commonsService) {
    commonsService.registerCommonMapLayerFunctionsInScope($scope);
  });