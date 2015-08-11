'use strict';

angular.module('mapManager.map', [
  'mapManager.d3.services', 'mapManager.webapi' ])

/**
 * @ngdoc service
 * @name mapManager.d3.services:currentMapService
 * @description
 * Provide functions regarding the currently displayed map.
 */
  .service('currentMapService', function() {
    return {
      currentMapId: 'map1',
      currentMapNumber: 1,
      currentMapElement: null,

      currentMap: null,
      currentMapContext: {},

      setCurrentMapElement: function(currentMapElement) {
        this.currentMapElement = currentMapElement;
      },

      getCurrentMapElement: function() {
        return this.currentMapElement;
      },

      setCurrentMapId: function(mapId) {
        this.currentMapId = mapId;
      },

      getCurrentMap: function() {
        return this.currentMap;
      },

      setCurrentMap: function(map) {
        this.currentMap = map;
      },

      registerCurrentMapContext: function(svg, path,
          projection, gMap, gLayers) {
        if (this.currentMapContext[this.currentMapId] == null) {
          this.currentMapContext[this.currentMapId] = {};
        }

        this.currentMapContext[this.currentMapId].svg = svg;
        this.currentMapContext[this.currentMapId].path =  path;
        this.currentMapContext[this.currentMapId].projection = projection;
        this.currentMapContext[this.currentMapId].gMap = gMap;
        this.currentMapContext[this.currentMapId].gLayers = gLayers;
      },

      getCurrentMapContext: function() {
        if (this.currentMapContext[this.currentMapId] == null) {
          this.currentMapContext[this.currentMapId] = {};
        }

        return this.currentMapContext[this.currentMapId];
      },

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
            type: 'd3js',
            projection: 'orthographic',
            scale: 420,
            center: {
              lon: 60,
              lat: -30
            },
            interactions: {
              moving: 'mouseMove',
              zooming: 'mouseWheel'
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
                styles: {
                  background: {
                    fill: '#ff0000'
                  },
                  lines: {
                    stroke: '#fff',
                    strokeWidth: '1px',
                    strokeOpacity: '1'
                  }
                },
                behavior: {
                  zoomBoundingBox: {
                    display: 'click'
                    //display: 'mouseOver',
                    //hide: 'mouseOut'
                  }
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
                  source: 'meteoritesSource',
                  content: [],
                  loaded: false,
                  id: 'name',
                  where: 'd.mass > 100000',
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
                      paletteCode: 'YlOrRd',
                      paletteReverse: false,
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
              },
              {
                id: 'test',
                type: 'data',
                mode: 'objects',
                rank: 6,
                data: {
                  inline: '[{ points: [ {lon: -74.007124, lat: 40.71455}, {lon: -118.245323, lat: 34.05349}, { lon: -92.888759, lat: 45.37399} ] }] ',
                  /*url: 'http://localhost:9000/scripts/json/Meteorite_Landings.csv',
                  type: 'csv',
                  source: 'meteoritesSource',
                  content: [],
                  loaded: false,
                  id: 'name',
                  where: 'd.mass > 100000',
                  order: {
                    field: 'mass',
                    ascending: false
                  }*/
                },
                name: 'Test line',
                display: {
                  shape: {
                    type: 'line',
                    value: 'd.points',
                    pointValue: '[d.lon, d.lat]'
                  }
                },
                styles: {
                  lines: {
                    stroke: '#f00',
                    strokeWidth: '1px'
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
