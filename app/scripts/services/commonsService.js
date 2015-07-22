'use strict';

angular.module('mapManager.commons', [ 'mapManager.map',
                                'mapManager.d3.services' ])
  .service('commonsService', function(currentMapService, layerService, mapCreatorService) {
    return {
      registerCommonFunctionsInScope: function($scope,
            screenType, maps, sources) {
        $scope.shoudDisplayHome = function() {
          return (screenType === 'home');
        };

        $scope.shoudDisplayMap = function() {
          return (screenType === 'map');
        };

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

        $scope.screenType = screenType;

        $scope.maps = maps;
        console.log('maps = '+JSON.stringify(maps));
        $scope.sources = sources;
        console.log('sources = '+JSON.stringify(sources));
      },

      setCurrentMapInScope: function($scope, currentMap) {
        $scope.properties = {
          projection: currentMap.projection,
          scale: currentMap.scale
        };
        $scope.layers = currentMapService.currentMap.layers;
        // $scope.messages = consoleService.messages;
      },

      registerCommonMapFunctionsInScope: function($scope) {
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

      registerCommonMapLayerPanelFunctionsInScope: function($scope) {
        $scope.displayLayerPanel = function(panelName) {
          $scope.displayedPanel = panelName;
        };

        $scope.shouldDisplayLayerPanel = function(panelName) {
          return ($scope.displayedPanel === panelName);
        };

        $scope.isDisplayedLayerPanel = function(panelName) {
          return ($scope.displayedPanel === panelName);
        };

        $scope.displayLayerPanel('properties');

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
      }
    };
  });
