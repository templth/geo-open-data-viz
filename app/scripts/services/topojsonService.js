'use strict';

angular.module('mapManager.topojson.services', [])
  .service('topojsonService', function() {
    return {
      transformTopojson: function(obj) {
        var self = this;
        if (_.isArray(obj)) {
          _.forEach(obj, function(objElt) {
            self.transformTopojson(objElt);
          });
        } else if (_.isObject(obj)) {
          _.forIn(obj, function(elt) {
            if (elt === 'arcs') {
              delete obj[elt];
            } else {
              self.transformTopojson(obj[elt]);
            }
          });
        }
      }
    };
  });

