  'use strict';

angular.module('mapManager.form', [])

  .directive('field', function() {
    return {
      require: '^form',
      restrict: 'EA',
      replace: true,
      templateUrl: 'views/directives/form-field-template.html',
      transclude: true,
      scope: {
        label: '@',
        size: '@',
        classOpt: '@'
      },
      link: function(scope, element) {
        var id = element.find(':input').attr('name');
        if (!id) {
          id = element.find('textarea').attr('name');
        }
        if (!id) {
          id = element.find('select').attr('name');
        }
        scope.for = id;

      }
    };
  })

  .directive('fieldMultiLabels', function() {
    return {
      require: '^form',
      restrict: 'EA',
      replace: true,
      templateUrl: 'views/directives/form-field-multi-labels-template.html',
      transclude: true,
      scope: {
        label1: '@',
        label2: '@',
        size: '@',
        classOpt: '@'
      },
      link: function(scope, element) {
        var id = element.find(':input').attr('name');
        if (!id) {
          id = element.find('textarea').attr('name');
        }
        if (!id) {
          id = element.find('select').attr('name');
        }
        scope.for = id;

      }
    };
  });