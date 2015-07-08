'use strict';

angular.module('mapManager.d3.directives', [ 'mapManager.map', 'mapManager.d3.services', 'mapManager.console' ])
.directive('map', ['mapService', 'layerService', 'mapInteractionService', 'mapCreatorService',
  function(mapService, layerService, mapInteractionService, mapCreatorService) {
    return {
      restrict: 'A',
      scope: {
        val: '=',
        grouped: '='
      },
      link: function(scope, element) {
        mapService.currentMap.element = element;
        mapCreatorService.createMap(element);
      }
    };
  }
])

.controller('MapController', [ '$scope', 'mapService', 'layerService', 'projectionService', 'consoleService', 'mapCreatorService',
  function($scope, mapService, layerService, projectionService, consoleService, mapCreatorService) {
  mapService.currentMap = {
    projection: 'orthographic',
    /*projection: 'mercator',*/
    /*projection: '',*/
    layers: [
      {
        id: 'graticuleLayer',
        type: 'graticule',
        name: 'Graticule',
        applyOn: 'layers',
        applied: true,
        visible: true,
        display: {
          background: true,
          lines: true,
          border: true
        },
        styles: {
          background: {
            fill: '#a4bac7'
          },
          border: {
            stroke: '#000',
            strokeWidth: '3px'
          },
          lines: {
            stroke: '#777',
            strokeWidth: '.5px',
            strokeOpacity: '.5'
          }
        }
      },
      {
        id: 'worldLayer',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/continent.json',
          rootObject: 'countries',
          type: 'topojson',
          content: [],
          loaded: false
        },
        applyOn: 'layers',
        name: 'World',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'counties',
          type: 'topojson',
          content: [],
          loaded: false
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          },
          d: {
            strokeWidth: '1.5px'
          }
        },
        applyOn: 'layers',
        name: 'US',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer1',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'counties',
          type: 'topojson',
          content: [],
          loaded: false,
          mesh: true
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          },
          d: {
            strokeWidth: '0.5px'
          }
        },
        applyOn: 'layers',
        name: 'US counties',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer2',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'states',
          type: 'topojson',
          content: [],
          loaded: false,
          mesh: true
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          },
          d: {
            strokeWidth: '1.5px'
          }
        },
        applyOn: 'layers',
        name: 'US states',
        applied: true,
        visible: true
      },
      {
        id: 'layer1',
        type: 'data',
        mode: 'objects',
        data: {
          url: 'http://localhost:9000/scripts/json/test.csv',
          type: 'csv',
          content: [],
          loaded: false
        },
        name: 'Cities',
        display: {
          shape: {
            type: 'circle',
            radius: 'd.population / 3000000',
            origin: '[ d.lon, d.lat ]',
            color: 'yellow',
            opacity: 0.75
          }
        },
        applyOn: 'layers',
        applied: true,
        visible: true
      },
      {
        id: 'layer2',
        type: 'data',
        mode: 'fill',
        data: {
          url: 'http://localhost:9000/scripts/json/unemployment.tsv',
          type: 'tsv',
          content: [],
          loaded: false
        },
        name: 'Unemployment rate',
        display: {
          fill: {
            threshold: {
              values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
              colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
                        '#9e9ac8', '#756bb1', '#54278f' ]
            },
            value: 'd.rate'
          }
        },
        applyOn: 'usLayer',
        applied: true,
        visible: true
      }
    ]
  };

  $scope.layers = mapService.currentMap.layers;
  $scope.messages = consoleService.messages;

  $scope.properties = { projection: 'orthographic' };

  $scope.$watch('properties.projection', function(newValue, oldValue) {
    if (oldValue === newValue) {
      return;
    }

    mapCreatorService.updateProjection(newValue);
  });

  $scope.changeColor = function() {
    d3.selectAll('path').attr('fill', function(d) {
      //console.log('d = '+JSON.stringify(d));
      if (d.id === 'USA') {
        return 'blue';
      } else {
        return 'green';
      }
    });

    var sel = d3.select(document.getElementById('FRA'));
    if (sel.empty()) {
      // setTimeout(changeColor, 100);
    } else {
      sel.attr('fill', 'red');
    }
  };

  $scope.toggleLayerVisibility = function($event, layer) {
    console.log('>> toggleLayerVisibility');
    layerService.toggleLayerVisibility(layer);
    layer.visible = !layer.visible;
    $event.stopPropagation();
  };

  $scope.toggleLayerApplying = function($event, layer) {
    console.log('>> toggleLayerApplying');
    var svg = mapService.currentMapContext.svg;
    var path = mapService.currentMapContext.path;

    layerService.toggleLayerApplying(svg, path, layer);
    layer.applied = !layer.applied;
    $event.stopPropagation();
  };
}]);