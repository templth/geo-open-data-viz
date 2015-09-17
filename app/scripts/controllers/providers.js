'use strict';

angular.module('mapManagerApp')
  /**
   * @ngdoc function
   * @name mapManagerApp.controller:ProvidersCtrl
   * @description
   * # ProvidersCtrl
   * Controller of the mapManagerApp
   */
  .controller('ProvidersCtrl', function($scope, $location, providerService) {
    $scope.providers = {
      inmemory: {
      },
      browserstorage: {
      },
      webapi: {
        url: '',
        readonly: true,
        secured: false,
        username: '',
        password: ''
      }
    };

    if (providerService.isWebApiCurrentProvider()) {
      var currentProvider = providerService.getCurrentProvider();
      $scope.providers.webapi.url = currentProvider.url;
      $scope.providers.webapi.readonly = currentProvider.readonly;
      $scope.providers.webapi.secured = currentProvider.secured;
      $scope.providers.webapi.username = currentProvider.username;
      $scope.providers.webapi.password = currentProvider.password;
    }

    $scope.shouldBeSecuredWebApiProvider = function() {
      return $scope.providers.webapi.secured;
    };

    $scope.selectInMemoryProvider = function() {
      providerService.selectInMemoryProvider(
        $scope.providers.inmemory);
      $location.path('/');
    };

    $scope.selectBrowserStorageProvider = function() {
      providerService.selectBrowserStorageProvider(
        $scope.providers.browserstorage);
      $location.path('/');
    };

    $scope.selectWebApiProvider = function() {
      providerService.selectWebApiProvider(
        $scope.providers.webapi);
      $location.path('/');
    };
  });