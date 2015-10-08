'use strict';

angular.module('mapManager.errors', [  ])
  .factory('errorsHandler', function($q, $location) {
    return {
      responseError: function(response) {
        var status = response.status;
        if (status === 401 || status === 403) {
          $location.path('/providers');
        }
        return $q.reject(response);
      }
    };
  });