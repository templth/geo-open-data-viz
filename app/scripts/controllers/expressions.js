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
    console.log('sourceId = '+sourceId);
    console.log('linkedSources = '+JSON.stringify(linkedSources, null, 2));
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

      try {
        var exprFct = $parse($scope.expression.value);
        var context = null;
        if (valueChecker.isNotNull($scope.expression.context)) {
          var contextFct = $parse($scope.expression.context);
          context = contextFct();
        }

        if (_.isArray(jsData)) {
          var results = [];
          _.forEach(jsData, function(elt, i) {
            results.push(exprFct(
              expressionService.getExpressionContext(elt, i, context)));
          });
          $scope.expression.result = JSON.stringify(results, null, 2);
        } else {
          var result = exprFct(
            expressionService.getExpressionContext(jsData, 0, context));
          $scope.expression.result = JSON.stringify(result, null, 2);
        }
        $scope.expression.success = true;
      } catch (err) {
        $scope.expression.result = err.message;
        $scope.expression.success = false;
      }
    };

    $scope.updateExpression = function() {
      $modalInstance.close($scope.expression.value);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });