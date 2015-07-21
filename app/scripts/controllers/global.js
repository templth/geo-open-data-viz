'use strict';

angular.module('mapManagerApp')
  .controller('HomeCtrl', function($scope, maps, sources, commonsService) {
    // Register common functions
    commonsService.registerCommonFunctionsInScope(
      $scope, 'home', maps, sources);
  });
