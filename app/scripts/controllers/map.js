'use strict';

/**
 * @ngdoc function
 * @name mapManagerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mapManagerApp
 */
angular.module('mapManagerApp')
  .controller('MapCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.mapHints = {
      scale: 150,
      projection: ''
    };
  });
