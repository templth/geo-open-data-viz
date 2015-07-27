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
          deferred.resolve([ { id: 1, name: 'test' } ]);
        }, 500);
        return deferred.promise;
      },

      resolveCurrentMap: function() {
        // return this.getCurrentMap().$promise;
        var deferred = $q.defer();
        $timeout(function() {
          deferred.resolve({
            id: '1',
            name: 'World',
            projection: 'orthographic',
            scale: 220,
            interactions: {
              moving: 'mouveWheel',
              zooming: 'drag'
            },
            layers: [
              {
                id: 'graticuleLayer',
                type: 'graticule',
                rank: 1,
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
                rank: 2,
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
              /*{
                id: 'countriesColors',
                type: 'data',
                mode: 'fill',
                rank: 7,
                name: 'Countries colors',
                display: {
                  fill: {
                    categorical: {
                    },
                  },
                },
                styles: {
                },
                applyOn: 'worldLayer',
                applied: true,
                visible: true
              },*/
              {
                id: 'meteorites',
                type: 'data',
                mode: 'objects',
                rank: 6,
                data: {
                  url: 'http://localhost:9000/scripts/json/Meteorite_Landings.csv',
                  type: 'csv',
                  content: [],
                  loaded: false,
                  id: 'name',
                  where: 'd.mass > 10000',
                  order: {
                    field: 'mass',
                    ascending: false
                  }
                },
                name: 'Meteorites',
                display: {
                  shape: {
                    type: 'circle',
                    radius: 'd.mass / 5000000',
                    origin: '[ d.reclong, d.reclat ]',
                    opacity: 0.75,
                    threshold: {
                      values: [ 1800, 1900, 1950, 2000, 2015 ],
                      colors: [ '#ffffb2', '#fed976', '#feb24c',
                                '#fd8d3c', '#f03b20', '#bd0026' ]
                    },
                    value: 'parseDate(d.year).getFullYear()'
                  },
                  legend: {
                    enabled: true,
                    label: 'd'
                  },
                  tooltip: {
                    enabled: true,
                    fromScale: 300,
                    text: '"Name: "+d.name+"<br/>Year: "+d.year+"<br/>Mass (g): "+d.mass',
                    event: 'click' // or over
                  }
                },
                behavior: {
                  tooltip: {
                    display: 'click'
                    //display: 'mouseOver',
                    //hide: 'mouseOut'
                  }
                },
                applyOn: 'layers',
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
