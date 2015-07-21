'use strict';

angular.module('mapManager.map', [
  'mapManager.d3.services', 'mapManager.webapi' ])

  .service('currentMapService', function() {
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
  })

  .service('mapsService', function($route, mapResource, $q, $timeout) {
    return {
      resolveMaps: function() {
        // return mapResource.query().$promise;
        var deferred = $q.defer();
        $timeout(function() {
          deferred.resolve([ { id: 1, name:'test' } ]);
        }, 500);
        return deferred.promise;
      },

      resolveCurrentMap: function() {
        // return this.getCurrentMap().$promise;
        var deferred = $q.defer();
        $timeout(function() {
          deferred.resolve({
            projection: 'orthographic',
            scale: 100,
            //projection: 'mercator',
            //projection: '',
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
          });
        });
        return deferred.promise;
      },

      getCurrentMap: function() {
        var mapId = $route.current.params.mapId;
        return mapResource.get({ mapId: mapId });
      }
    };
  });
