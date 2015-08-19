'use strict';

angular.module('mapManager.source', [ 'mapManager.persistence' ])

  .service('sourcesService', function($route, sourceResource) {
    return {
      resolveSources: function() {
        return sourceResource.getSources();
      },

      resolveSource: function() {
        var sourceId = $route.current.params.sourceId;
        return sourceResource.getSource(sourceId);
      },

      getCurrentSource: function() {
        var sourceId = $route.current.params.sourceId;
        return sourceResource.getSource(sourceId);
      }
    };
  });
