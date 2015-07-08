'use strict';

/**
 * @ngdoc function
 * @name mapManagerApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mapManagerApp
 */
angular.module('mapManagerApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
