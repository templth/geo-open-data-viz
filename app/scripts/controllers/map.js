'use strict';

/**
 * @ngdoc function
 * @name mapManagerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mapManagerApp
 */
angular.module('mapManagerApp')
  .controller('MapCtrl', function($scope, $modal, currentMapService, layerService, //
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

    // Modals
    $scope.openAddLayerDialog = function($event) {
      // See bug on backgrop:
      // https://github.com/angular-ui/bootstrap/issues/3620
      var modalInstance = $modal.open({
        animation: false,
        templateUrl: 'views/add-layer-modal.html', // Url du template HTML
        controller: 'AddLayerCtrl'
      });

      modalInstance.result.then(function(selectedItem) {
        $scope.selected = selectedItem;
        console.log('end');
      }, function() {
        // $log.info('Modal dismissed at: ' + new Date());
        console.log('Modal dismissed at: ' + new Date());
      });

      $event.stopPropagation();
    };
  })

  .controller('UpdateLayerCtrl', function($scope, commonsService) {
    commonsService.registerCommonMapLayerFunctionsInScope($scope);
    commonsService.registerCommonMapLayerPanelFunctionsInScope($scope);
  })

  .controller('AddLayerCtrl', function($scope, $modalInstance, commonsService) {
    commonsService.registerCommonMapLayerPanelFunctionsInScope($scope);

    $scope.layerToAdd = {};

    $scope.addLayer = function() {
      $modalInstance.close(/*$scope.selected.item*/);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.$watch('layerToAdd.type', function(newValue, oldValue) {
      if (oldValue === newValue) {
        return;
      }

      console.log('>> layerToAdd newValue = '+newValue);
      if (newValue === 'data') {
        console.log('>> $scope.displayLayerMode = '+$scope.displayLayerMode);
        $scope.displayLayerMode();
      } else {
        $scope.hideLayerMode();
      }
    });

    for (var elt in $scope) {
      console.log('>> elt = '+elt);
    }
  });