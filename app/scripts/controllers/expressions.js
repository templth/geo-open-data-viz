'use strict';

angular.module('mapManagerApp')
  /**
   * @ngdoc function
   * @name mapManagerApp.controller:MapCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('CheckExpressionCtrl', function($scope, $parse, expression, source) {
    $scope.expression = {
      data: '{name:"test"}',
      value: expression,
      result: ''
    };

    $scope.checkExpression = function() {
      var dataFct = $parse($scope.expression.data);
      var jsData = dataFct();

      var exprFct = $parse($scope.expression.value);

      var result = exprFct({d: jsData});
      $scope.expression.result = JSON.stringify(result, null, 2);
    };
  });
