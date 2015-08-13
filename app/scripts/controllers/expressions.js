'use strict';

angular.module('mapManagerApp')
  /**
   * @ngdoc function
   * @name mapManagerApp.controller:MapCtrl
   * @description
   * # MainCtrl
   * Controller of the mapManagerApp
   */
  .controller('CheckExpressionCtrl', function($scope, $parse, $modalInstance,
                       valueChecker, expression, linkedSources,
                       sourceId, rootObject, description, domain, attribute,
                       commonsService, expressionService) {
    commonsService.registerCommonPanelFunctionsInScope($scope, 'expression');

    var data = '[{name:"test1"},{name:"test2"}]';
    var structure = '["name"]';
    if (valueChecker.isNotNull(sourceId) &&
        valueChecker.isNotNull(linkedSources)) {
      var source = _.find(linkedSources, 'id', sourceId);
      if (valueChecker.isNotNull(source) &&
          valueChecker.isNotNull(source.sample)) {
        data = source.sample;
        structure = source.structure;
      }
    }

    $scope.expression = {
      domain: domain,
      attribute: attribute,
      structure: structure,
      data: data,
      rootObject: rootObject,
      value: expression,
      description: description,
      parameters: expressionService.getExpressionParameterDescriptions(),
      result: ''
    };

    $scope.checkExpression = function() {
      var dataFct = $parse($scope.expression.data);
      var jsData = dataFct();

      if (valueChecker.isNotNullAndNotEmpty($scope.expression.rootObject)) {
        jsData = jsData.objects[$scope.expression.rootObject];
        if (jsData.type === 'GeometryCollection') {
          jsData = jsData.geometries;
        }
      }

      var exprFct = $parse($scope.expression.value);

      if (_.isArray(jsData)) {
        var results = [];
        _.forEach(jsData, function(elt, i) {
          results.push(exprFct(expressionService.getExpressionContext(elt, i)));
        });
        $scope.expression.result = JSON.stringify(results, null, 2);
      } else {
        var result = exprFct(expressionService.getExpressionContext(jsData, 0));
        $scope.expression.result = JSON.stringify(result, null, 2);
      }
    };

    $scope.updateExpression = function() {
      $modalInstance.close($scope.expression.value);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
