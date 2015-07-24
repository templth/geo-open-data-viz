'use strict';

angular.module('mapManager.commons', [ 'mapManager.map',
                                'mapManager.d3.services' ])
  .service('commonsService', function(currentMapService,
      layerService, mapCreatorService, toaster) {
    return {
      registerCommonFunctionsInScope: function($scope, $modal,
            screenType, maps, sources) {
        // Display global views
        $scope.shoudDisplayHome = function() {
          return (screenType === 'home');
        };

        $scope.shoudDisplayMap = function() {
          return (screenType === 'map');
        };

        $scope.screenType = screenType;

        // Modals
        $scope.openAddMapDialog = function() {
          // See bug on backgrop:
          // https://github.com/angular-ui/bootstrap/issues/3620
          var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'views/modals/add-map-modal.html',
            controller: 'AddMapCtrl'
          });

          modalInstance.result.then(function(mapToAdd) {
            $scope.maps.push(mapToAdd);
            toaster.pop('success', 'Map "' +
              sourceToAdd.name + '"',
              'Successfully added');
          }, function() {
            // $log.info('Modal dismissed at: ' + new Date());
            console.log('Modal dismissed at: ' + new Date());
          });
        };

        $scope.openAddSourceDialog = function() {
          // See bug on backgrop:
          // https://github.com/angular-ui/bootstrap/issues/3620
          var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'views/modals/add-source-modal.html',
            controller: 'AddSourceCtrl'
          });

          modalInstance.result.then(function(sourceToAdd) {
            $scope.sources.push(sourceToAdd);
            toaster.pop('success', 'Source "' +
              sourceToAdd.name + '"',
              'Successfully added');
          }, function() {
            // $log.info('Modal dismissed at: ' + new Date());
            console.log('Modal dismissed at: ' + new Date());
          });
        };

        // Global data
        $scope.maps = maps;
        $scope.sources = sources;
      },

      setCurrentMapInScope: function($scope, currentMap) {
        $scope.properties = {
          projection: currentMap.projection,
          scale: currentMap.scale
        };
        $scope.mapName = currentMap.name;
        $scope.layers = currentMapService.currentMap.layers;
        $scope.linkedSources = currentMapService.currentMap.sources;
        // $scope.messages = consoleService.messages;
      },

      registerCommonMapFunctionsInScope: function($scope) {
        $scope.shouldDisplayGraticuleProperties = function(layer) {
          return (layer.type === 'graticule');
        };

        $scope.shouldDisplayGeoDataProperties = function(layer) {
          return (layer.type === 'geodata');
        };

        $scope.shouldDisplayGeoDataStylesProperties = function(layer) {
          return (layer.type === 'geodata' &&
            layer.styles != null);
        };

        $scope.shouldDisplayDataFillProperties = function(layer) {
          return (layer.type === 'data' && layer.mode === 'fill');
        };

        $scope.shouldDisplayDataObjectsProperties = function(layer) {
          return (layer.type === 'data' && layer.mode === 'objects');
        };

        $scope.shouldDisplayDataCircleProperties = function(layer) {
          return (layer.type === 'data' && layer.mode === 'objects' &&
            layer.display.shape.type === 'circle');
        };

        $scope.$watch('properties.projection', function(newValue, oldValue) {
          if (oldValue === newValue) {
            return;
          }

          mapCreatorService.updateProjection(newValue);
        });

        $scope.$watch('properties.scale', function(newValue, oldValue) {
          if (oldValue === newValue) {
            return;
          }

          mapCreatorService.updateScale(newValue);
        });

        $scope.toggleLayerVisibility = function($event, layer) {
          console.log('>> toggleLayerVisibility');
          layerService.toggleLayerVisibility(layer);
          layer.visible = !layer.visible;
          $event.stopPropagation();
        };

        $scope.toggleLayerApplying = function($event, layer) {
          console.log('>> toggleLayerApplying');
          var svg = currentMapService.currentMapContext.svg;
          var path = currentMapService.currentMapContext.path;

          layerService.toggleLayerApplying(svg, path, layer);
          layer.applied = !layer.applied;
          $event.stopPropagation();
        };

        $scope.refreshLayerApplying = function($event, layer) {
          console.log('>> refreshLayerApplying');
          var svg = currentMapService.currentMapContext.svg;
          var path = currentMapService.currentMapContext.path;

          layerService.refreshLayerApplying(svg, path, layer);
          $event.stopPropagation();
        };

        $scope.isLayerWithFillMode = function(layer) {
          return (layer.type === 'data' && layer.mode === 'fill');
        };
      },

      registerCommonMapLayerFunctionsInScope: function($scope) {
        $scope.$watch('layer.name', function(newValue, oldValue) {
        	console.log('newValue = '+newValue);
        	console.log('oldValue = '+oldValue);
        });

        $scope.$watch('layer.styles.background.fill', function(newValue, oldValue) {
        	console.log('>> watch layer.styles');
          if (oldValue === newValue) {
            return;
          }

          var layer = $scope.layer;
          var svg = currentMapService.currentMapContext.svg;
          var path = currentMapService.currentMapContext.path;

          layerService.refreshLayerApplying(svg, path, layer);
        });
      },

      registerCommonPanelFunctionsInScope: function($scope, defaultPanelName) {
        if (defaultPanelName == null) {
          defaultPanelName = 'properties';
        }

        $scope.displayPanel = function(panelName) {
          $scope.displayedPanel = panelName;
        };

        $scope.shouldDisplayPanel = function(panelName) {
          return ($scope.displayedPanel === panelName);
        };

        $scope.isDisplayedPanel = function(panelName) {
          return ($scope.displayedPanel === panelName);
        };

        $scope.displayPanel(defaultPanelName);
      },

      registerCommonMapLayerPanelFunctionsInScope: function($scope) {
        $scope.shoudDisplayLayerMode = function() {
          return $scope.displayedLayerMode;
        };

        $scope.toggleLayerMode = function() {
          $scope.displayedLayerMode = !$scope.displayedLayerMode;
        };

        $scope.displayLayerMode = function() {
          $scope.displayedLayerMode = true;
        };

        $scope.hideLayerMode = function() {
          $scope.displayedLayerMode = false;
        };

        $scope.displayedLayerMode = false;
      },

      registerCommonMapSourcePanelFunctionsInScope: function($scope) {
      }
    };
  });
