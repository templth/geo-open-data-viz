'use strict';

/**
 * @ngdoc overview
 * @name mapManagerApp
 * @description
 * # mapManagerApp
 *
 * Main module of the application.
 */
angular
  .module('mapManagerApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'mapManager.form',
    'mapManager.console',
    'mapManager.map',
    'mapManager.d3.services',
    'mapManager.d3.directives',
    'mapManager.colorbrewer'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
