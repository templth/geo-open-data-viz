'use strict';

angular.module('mapManager.commons', [ 'mapManager.map',
        'mapManager.d3.services', 'mapManager.utilities' ])
  /**
   * @ngdoc service
   * @name mapManager.commons:commonsService
   * @description
   * Provide utility functions for controllers to register content
   * into their associated scope.
   */
  .service('commonsService', function(currentMapService,
      layerService, mapCreatorService, toaster, valueChecker) {
    return {
      /**
       * @ngdoc method
       * @name registerCommonFunctionsInScope
       * @methodOf mapManager.commons:commonsService
       * @description
       * Register common functions and elements into the scope of
       * a controller.
       * These functions are used by the generic parts of the
       * layout:
       *
       * * Functions to select the screen to show
       * * Functions to open modals to add elements
       *
       * Common elements registered within the scope are the
       * list of maps and sources.
       *
       * @param {Object} $scope the current scope
       * @param {Object} $modal the $modal service of Angular
       * @param {string} screenType the screen type
       * @param {Array} maps all the maps
       * @param {Array} sources all the sources
      */
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

      /**
       * @ngdoc method
       * @name setCurrentMapInScope
       * @methodOf mapManager.commons:commonsService
       * @description
       * Set the map elements into the current scope.
       *
       * @param {Object} $scope the current scope
       * @param {Object} currentMap the select map
      */
      setCurrentMapInScope: function($scope, currentMap) {
        $scope.properties = {
          projection: currentMap.projection,
          scale: currentMap.scale,
          center: currentMap.center
        };
        $scope.interactions = {
          moving: currentMap.interactions.moving,
          zooming: currentMap.interactions.zooming
        };
        $scope.mapName = currentMap.name;
        $scope.mapType = currentMap.type;
        $scope.layers = currentMap.layers;
        $scope.linkedSources = currentMap.sources;
        // $scope.messages = consoleService.messages;
        $scope.currentProperties =
          currentMapService.getCurrentMapContext().properties;
        $scope.$watch('currentProperties.scale', function(newValue, oldValue) {
          if (newValue === oldValue) { return; }
          console.log('updated currentProperties.scale');
        });
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

        $scope.shouldDisplayShapeArea = function(layer) {
          return (valueChecker.isNotNull(layer.display) &&
            valueChecker.isNotNull(layer.display.shape));
        };

        $scope.addDisplayShapeArea = function(layer) {
          if (valueChecker.isNotNull(layer.display)) {
            layer.display.shape = {};
          }
        };

        $scope.removeDisplayShapeArea = function(layer) {
          if (valueChecker.isNotNull(layer.display) &&
              valueChecker.isNotNull(layer.display.shape)) {
            delete layer.display.shape;
          }
        };

        $scope.shouldDisplayLegendArea = function(layer) {
          return (valueChecker.isNotNull(layer.display) &&
            valueChecker.isNotNull(layer.display.legend));
        };

        $scope.addDisplayLegendArea = function(layer) {
          if (valueChecker.isNotNull(layer.display)) {
            layer.display.legend = {};
          }
        };

        $scope.removeDisplayLegendArea = function(layer) {
          if (valueChecker.isNotNull(layer.display) &&
              valueChecker.isNotNull(layer.display.legend)) {
            delete layer.display.legend;
          }
        };

        $scope.shouldDisplayTooltipArea = function(layer) {
          return (valueChecker.isNotNull(layer.display) &&
            valueChecker.isNotNull(layer.display.tooltip));
        };

        $scope.addDisplayTooltipArea = function(layer) {
          if (valueChecker.isNotNull(layer.display)) {
            layer.display.tooltip = {};
          }
        };

        $scope.removeDisplayTooltipArea = function(layer) {
          if (valueChecker.isNotNull(layer.display) &&
              valueChecker.isNotNull(layer.display.tooltip)) {
            delete layer.display.tooltip;
          }
        };

        $scope.$watch('properties.projection', function(newValue, oldValue) {
          if (oldValue === newValue) {
            return;
          }

          mapCreatorService.updateProjection($scope, newValue);
        });

        $scope.$watch('properties.scale', function(newValue, oldValue) {
          if (oldValue === newValue) {
            return;
          }

          mapCreatorService.updateScale($scope, newValue);
        });

        $scope.toggleLayerVisibility = function($event, layer) {
          console.log('>> toggleLayerVisibility');
          layerService.toggleLayerVisibility(layer);
          layer.visible = !layer.visible;
          //$event.stopPropagation();
        };

        $scope.toggleLayerApplying = function($event, layer) {
          var svg = currentMapService.getCurrentMapContext().svg;
          var path = currentMapService.getCurrentMapContext().path;

          layerService.toggleLayerApplying(svg, path, layer);
          layer.applied = !layer.applied;
          //$event.stopPropagation();
        };

        $scope.refreshLayerApplying = function($event, layer) {
          var svg = currentMapService.getCurrentMapContext().svg;
          var path = currentMapService.getCurrentMapContext().path;

          layerService.refreshLayerApplying(svg, path, layer);
          //$event.stopPropagation();
        };

        $scope.isLayerWithFillMode = function(layer) {
          return (layer.type === 'data' && layer.mode === 'fill');
        };
      },

      registerCommonMapLayerFunctionsInScope: function($scope, $modal) {
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
          var svg = currentMapService.getCurrentMapContext().svg;
          var path = currentMapService.getCurrentMapContext().path;

          layerService.refreshLayerApplying(svg, path, layer);
        });

        $scope.shoudDisplayCheckExpression = function(sourceId) {
          return valueChecker.isNotNull(sourceId);
        };

        $scope.checkExpression = function(domain, attribute, linkedSources,
                                        source, rootObject, expression, description) {
          var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'views/modals/expression-check-modal.html',
            controller: 'CheckExpressionCtrl',
            resolve: {
              sourceId: function() {
                return source;
              },
              expression: function() {
                return expression;
              },
              description: function() {
                return description;
              },
              linkedSources: function() {
                return linkedSources;
              },
              domain: function() {
                return domain;
              },
              attribute: function() {
                return attribute;
              },
              rootObject: function() {
                return rootObject;
              }
            }
          });

          modalInstance.result.then(function(expression) {
            domain[attribute] = expression;
          }, function() {
            // $log.info('Modal dismissed at: ' + new Date());
            console.log('Modal dismissed at: ' + new Date());
          });
        };
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
  })

  /**
   * @ngdoc service
   * @name mapManager.commons:commonsService
   * @description
   * Provide utility functions for controllers to register content
   * into their associated scope.
   */
  .service('expressionService', [ 'valueChecker', '$parse', function(valueChecker, $parse) {
    return {
      getExpressionParameterDescriptions: function() {
        return 'd: the current element in the collection\n' +
          'i: the index of the current element in the collection\n' +
          'parseDate: utility function to convert a string to a date object\n' +
          'isInBounds: utility function to check if a point is in bounds';
      },

      getExpressionContext: function(d, i, additionalContext) {
        var context = {
          d: d,
          i: i,
          parseDate: function(val) {
            return (new Date(val));
          },
          isInBounds: function(point, bounds) {
            // See http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object/17067379#17067379
            var leftBottom = bounds[0];
            var rightTop = bounds[1];
            // console.log('isInBounds - bounds = '+JSON.stringify(bounds));
            // console.log('isInBounds - point = '+JSON.stringify(point));
            return (point[0] >= leftBottom[0] &&
              point[0] <= rightTop[0] &&
              point[1] >= leftBottom[1] &&
              point[1] <= rightTop[1]);
          }
        };

        if (valueChecker.isNotNull(additionalContext)) {
          _.forEach(additionalContext, function(n, key) {
            context[key] = additionalContext[key];
          });
        }

        return context;
      },

      parseExpression: function(expression) {
        return $parse(expression);
      },

      evaluateExpression: function(parsedExpression, d, i, additionalContext) {
        var value = parsedExpression(this.getExpressionContext(
              d, i, additionalContext));
        if (_.isFunction(value)) {
          return value();
        } else {
          return value;
        }
      }
    };
  }]);
