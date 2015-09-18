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
    'toaster',
    'colorpicker.module',
    'colorBrewer',
    'd3',
    'uuid4',
    'ngStorage',
    'app.config',
    'mapManager.form',
    'mapManager.console',
    'mapManager.map',
    'mapManager.source',
    'mapManager.samples',
    'mapManager.persistence',
    'mapManager.commons',
    'mapManager.utilities',
    'mapManager.d3.services',
    'mapManager.topojson.services',
    'mapManager.d3.directives',
    'mapManager.colorbrewer'/*,
    'mapManager.templates'*/
  ])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/global-layout.html',
        controller: 'HomeCtrl',
        resolve: {
          maps: function(mapsService) {
            return mapsService.resolveMaps();
          },
          sources: function(sourcesService) {
            return sourcesService.resolveSources();
          }
        }
      })
      .when('/maps/:mapId', {
        templateUrl: 'views/global-layout.html',
        controller: 'MapCtrl',
        resolve: {
          map: function(mapsService) {
            return mapsService.resolveCurrentMap();
          },
          mapLayers: function(mapsService) {
            return mapsService.resolveCurrentMapLayers();
          },
          maps: function(mapsService) {
            return mapsService.resolveMaps();
          },
          sources: function(sourcesService) {
            return sourcesService.resolveSources();
          }
        }
      })
      .when('/sources/:sourceId', {
        templateUrl: 'views/global-layout.html',
        controller: 'SourceCtrl',
        resolve: {
          source: function(sourcesService) {
            return sourcesService.resolveCurrentSource();
          },
          maps: function(mapsService) {
            return mapsService.resolveMaps();
          },
          sources: function(sourcesService) {
            return sourcesService.resolveSources();
          }
        }
      })
      .when('/providers', {
        templateUrl: 'views/providers.html',
        controller: 'ProvidersCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });


  })
  .config(['$httpProvider', function($httpProvider) {
    // See http://stackoverflow.com/questions/23823010/how-to-enable-cors-in-angularjs
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }])
  .run(function($localStorage, providerService) {
    providerService.currentProvider = $localStorage.currentProvider;
  })
  .run(function($rootScope, $location, $route, providerService) {
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      console.log('>> $locationChangeStart');
      /*var nextRoute = $route.routes[$location.path()];
      if (!providerService.hasCurrentProvider()) {
        console.log('>> redirect');
        event.preventDefault();
        $location.path('/providers');
        return;
      }
      console.log('>> $locationChangeStart = '+JSON.stringify(next))*/
      console.log('>> hasCurrentProvider = ' + providerService.hasCurrentProvider());
    });
  });