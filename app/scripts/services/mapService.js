'use strict';

angular.module('mapManager.map', [
  'mapManager.d3.services', 'mapManager.persistence' ])

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

      getCurrentMapId: function() {
        return this.currentMapId;
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
          projection, gMap, gLayers, dimensions) {
        if (this.currentMapContext[this.currentMapId] == null) {
          this.currentMapContext[this.currentMapId] = {};
        }

        this.currentMapContext[this.currentMapId].svg = svg;
        this.currentMapContext[this.currentMapId].path =  path;
        this.currentMapContext[this.currentMapId].projection = projection;
        this.currentMapContext[this.currentMapId].gMap = gMap;
        this.currentMapContext[this.currentMapId].gLayers = gLayers;
        this.currentMapContext[this.currentMapId].dimensions = dimensions;
      },

      getCurrentMapContext: function() {
        if (this.currentMapContext[this.currentMapId] == null) {
          console.log('1');
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

  .service('mapsService', function($route, mapResource, layerResource) {
    return {
      resolveMaps: function() {
        return mapResource.getMaps();
      },

      resolveCurrentMap: function() {
        var mapId = $route.current.params.mapId;
        return mapResource.getMap(mapId);
      },

      resolveCurrentMapLayers: function() {
        var mapId = $route.current.params.mapId;
        return layerResource.getLayers(mapId);
      },

      getCurrentMap: function() {
        var mapId = $route.current.params.mapId;
        return mapResource.get({ mapId: mapId });
      }
    };
  });
