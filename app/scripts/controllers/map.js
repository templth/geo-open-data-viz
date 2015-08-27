'use strict';

angular.module('mapManagerApp')
  /**
   * @ngdoc function
   * @name mapManagerApp.controller:MapCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('MapCtrl', function($scope, $modal, currentMapService, layerService, //
                                  projectionService, consoleService, //
                                  mapCreatorService, map, mapLayers, maps, sources, //
                                  commonsService, toaster) {

    // Register common functions
    commonsService.registerCommonFunctionsInScope(
      $scope, $modal, 'map', maps, sources);

    // Set layers in map
    map.layers = mapLayers;

    // Set current map elements
    currentMapService.setCurrentMap(map);

    currentMapService.getCurrentMapContext().properties = {
      scale: map.scale,
      center: {
        lon: map.center.lon,
        lat: map.center.lat
      },
      clipAngle: map.clipAngle
    };

    // Set current map in scope
    commonsService.setCurrentMapInScope($scope, map);

    // Add map functions in scope
    commonsService.registerCommonMapFunctionsInScope($scope);

    // Modals
    $scope.openAddLayerDialog = function($event) {
      // See bug on backgrop:
      // https://github.com/angular-ui/bootstrap/issues/3620
      var modalInstance = $modal.open({
        animation: false,
        templateUrl: 'views/modals/add-layer-modal.html',
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

    // Modals
    $scope.openImportSourceDialog = function($event) {
      // See bug on backgrop:
      // https://github.com/angular-ui/bootstrap/issues/3620
      var modalInstance = $modal.open({
        animation: false,
        templateUrl: 'views/modals/import-source-modal.html',
        controller: 'ImportSourceCtrl',
        resolve: {
          sources: function() {
            return sources;
          }
        }
      });

      modalInstance.result.then(function(selectedSource) {
        if ($scope.linkedSources == null) {
          $scope.linkedSources = [];
        }
        $scope.linkedSources.push(selectedSource);

        toaster.pop('success', 'Map "' +
          currentMapService.currentMap.name + '"',
          'Successfully imported source');
      }, function() {
        // $log.info('Modal dismissed at: ' + new Date());
        console.log('Modal dismissed at: ' + new Date());
      });

      $event.stopPropagation();
    };
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:AddMapCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('AddMapCtrl', function($scope, $modalInstance, commonsService) {
    commonsService.registerCommonPanelFunctionsInScope($scope);

    $scope.mapToAdd = { type: 'd3' };

    $scope.addMap = function() {
      $modalInstance.close($scope.mapToAdd);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:AddSourceCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('AddSourceCtrl', function($scope,
      $modalInstance, commonsService, topojsonService, typeUtils) {
    commonsService.registerCommonPanelFunctionsInScope($scope);

    $scope.shouldDisplayStructure = function() {
      return ($scope.sourceToAdd.type === 'data');
    };

    $scope.sourceToAdd = { id: '15', name: 'test', type: 'data' };

    $scope.$watch('sourceToAdd.url', function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }

      if (_.endsWith(newValue, '.tsv')) {
        $scope.sourceToAdd.dataType = 'tsv';
      } else if (_.endsWith(newValue, '.csv')) {
        $scope.sourceToAdd.dataType = 'csv';
      } else if (_.endsWith(newValue, '.json')) {
        $scope.sourceToAdd.dataType = 'json';
      }
    });

    $scope.loadData = function() {
      var loadFct = null;
      if ($scope.sourceToAdd.dataType === 'json') {
        loadFct = d3.json;
      } else if ($scope.sourceToAdd.dataType === 'csv') {
        loadFct = d3.csv;
      } else if ($scope.sourceToAdd.dataType === 'tsv') {
        loadFct = d3.tsv;
      }

      if (loadFct != null) {
        loadFct($scope.sourceToAdd.url, function(data) {
          if ($scope.sourceToAdd.type === 'data') {
            // Structure
            var structure = [];
            if (!_.isEmpty(data)) {
              for (var elt in data[0]) {
                structure.push({
                  name: elt,
                  type: typeUtils.getType(data[0][elt])
                });
              }
            }

            // Min / max
            var minMax = {};
            _.forEach(structure, function(elt) {
              if (elt.type === 'integer' || elt.type === 'float' ||
                  elt.type === 'date') {
                minMax[elt.name] = [];
                var min = _.min(data, function(d) {
                  if (elt.type === 'integer') {
                    return typeUtils.parseIntegerValue(d[elt.name]);
                  } else if (elt.type === 'float') {
                    return typeUtils.parseFloatValue(d[elt.name]);
                  } else if (elt.type === 'date') {
                    return typeUtils.parseDateValue(d[elt.name]);
                  } else {
                    return d[elt.name];
                  }
                });
                minMax[elt.name].push(min[elt.name]);
                var max = _.max(data, function(d) {
                  if (elt.type === 'integer') {
                    return typeUtils.parseIntegerValue(d[elt.name]);
                  } else if (elt.type === 'float') {
                    return typeUtils.parseFloatValue(d[elt.name]);
                  } else if (elt.type === 'date') {
                    return typeUtils.parseDateValue(d[elt.name]);
                  } else {
                    return d[elt.name];
                  }
                });
                minMax[elt.name].push(max[elt.name]);
              }
            });

            $scope.sourceToAdd.structure = JSON.stringify(structure, null, 2);
            $scope.sourceToAdd.rowNumber = data.length;
            $scope.sourceToAdd.minMax = JSON.stringify(minMax, null, 2);

            var sample = _.slice(data, 0, 5);
            $scope.sourceToAdd.sample = JSON.stringify(sample, null, 2);
          } else if ($scope.sourceToAdd.type === 'map') {
            topojsonService.transformTopojson(data);
            _.forEach(data.objects, function(object, key) {
              if (object.type === 'GeometryCollection') {
                object.geometries = _.slice(object.geometries, 0, 5);
              }
            });
            $scope.sourceToAdd.sample = JSON.stringify(data, null, 2);
          }
        });
      }
    };

    $scope.addSource = function() {
      console.log('>> $scope.sourceToAdd = '+JSON.stringify($scope.sourceToAdd, null, 2));
      $modalInstance.close($scope.sourceToAdd);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:UpdatePropertiesCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('UpdatePropertiesCtrl', function($scope, commonsService) {
    commonsService.registerCommonPanelFunctionsInScope($scope, 'initial');
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:UpdateLayerCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('UpdateLayerCtrl', function($scope, $modal,
                             commonsService, valueChecker) {
    commonsService.registerCommonPanelFunctionsInScope($scope);
    commonsService.registerCommonMapLayerFunctionsInScope($scope, $modal);
    commonsService.registerCommonMapLayerPanelFunctionsInScope($scope);

    // Set the fill mode for shape
    if (valueChecker.isNotNull($scope.layer.display) &&
        valueChecker.isNotNull($scope.layer.display.shape)) {
      if (valueChecker.isNotNull($scope.layer.display.shape.threshold)) {
        $scope.layer.display.shape.fillMode = 'threshold';
      } else if (valueChecker.isNotNull(
        $scope.layer.display.shape.choropleth)) {
        $scope.layer.display.shape.fillMode = 'choropleth';
      } else {
        $scope.layer.display.shape.fillMode = 'static';
      }

      $scope.selectBrewColors = function(item, isReverse) {
        $scope.layer.display.shape.threshold.paletteCode = item.name;
        $scope.layer.display.shape.threshold.paletteReverse = isReverse;
        $scope.layer.display.shape.threshold.colors = item.colors;
      };
    }

    // Set the fill mode for fill
    if (valueChecker.isNotNull($scope.layer.display) &&
        valueChecker.isNotNull($scope.layer.display.fill)) {
      if (valueChecker.isNotNull($scope.layer.display.fill.threshold)) {
        $scope.layer.display.fill.fillMode = 'threshold';
      } else if (valueChecker.isNotNull(
        $scope.layer.display.fill.choropleth)) {
        $scope.layer.display.fill.fillMode = 'choropleth';
      } else {
        $scope.layer.display.fill.fillMode = 'static';
      }

      $scope.selectBrewColors = function(item, isReverse) {
        $scope.layer.display.fill.threshold.paletteCode = item.name;
        $scope.layer.display.fill.threshold.paletteReverse = isReverse;
        $scope.layer.display.fill.threshold.colors = item.colors;
      };
    }
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:AddLayerCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('AddLayerCtrl', function($scope, $modalInstance, commonsService) {
    commonsService.registerCommonPanelFunctionsInScope($scope);
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

      if (newValue === 'data') {
        $scope.displayLayerMode();
      } else {
        $scope.hideLayerMode();
      }
    });
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:ImportSourceCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('ImportSourceCtrl', function($scope,
      $modalInstance, commonsService, sources) {
    commonsService.registerCommonPanelFunctionsInScope($scope);
    commonsService.registerCommonMapSourcePanelFunctionsInScope($scope);

    $scope.layerToAdd = {};
    $scope.sources = sources;
    $scope.preview = { enabled: false };
    $scope.selectedSource = { id: '' };
    $scope.sourcePreview = {};

    $scope.$watch('selectedSource.id', function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }

      $scope.sourcePreview = _.find(sources, 'id', newValue);
    });

    $scope.shouldDisplaySourcePreview = function() {
      return $scope.preview.enabled;
    };

    $scope.importSource = function() {
      $scope.sourcePreview = _.find(sources, 'id', $scope.selectedSource.id);
      $modalInstance.close($scope.sourcePreview);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  })

  /**
   * @ngdoc function
   * @name mapManagerApp.controller:UpdateSourceCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('UpdateSourceCtrl', function($scope, commonsService) {
    commonsService.registerCommonPanelFunctionsInScope($scope, 'preview');
  });