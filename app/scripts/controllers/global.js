'use strict';

angular.module('mapManagerApp')
  .controller('HomeCtrl', function($scope, $modal, maps, sources, commonsService) {
    // Register common functions
    commonsService.registerCommonFunctionsInScope(
      $scope, $modal, 'home', maps, sources);
  });
