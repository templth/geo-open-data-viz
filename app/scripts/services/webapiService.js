'use strict';

angular.module('mapManager.webapi', [ /*'application.config'*/ ])

  .constant('MAPS_API', 'http://mapapi.apispark-dev.net:8182/v1/maps')
  .constant('SOURCES_API', 'http://mapapi.apispark-dev.net:8182/v1/sources')

  .factory('mapResource', function(MAPS_API, $resource) {
    return $resource(MAPS_API + '/:mapId/', { mapId: '@id' });
  })
  .factory('sourceResource', function(SOURCES_API, $resource) {
    return $resource(SOURCES_API + '/:sourceId/', { sourceId: '@id' });
  });