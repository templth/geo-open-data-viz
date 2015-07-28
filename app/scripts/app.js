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
    'mapManager.form',
    'mapManager.console',
    'mapManager.map',
    'mapManager.source',
    'mapManager.webapi',
    'mapManager.commons',
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
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
  })
  /*.config(function($provide) {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  })*/
  .config(['$httpProvider', function($httpProvider) {
    // See http://stackoverflow.com/questions/23823010/how-to-enable-cors-in-angularjs
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }])
  .run(function($http) {
    var currentUser = {
      username: 'daf3b0cd-d8b8-49a7-85b5-47cdb47e8aad',
      password: 'fcfa853b-0359-44a9-8372-ff55ca7c6815'
    };
    var encodedCurrentUser = btoa(currentUser.username +
      ':' + currentUser.password);
    $http.defaults.headers.common.Authorization = 'Basic ' + encodedCurrentUser;

  })

  /*.run(function($httpBackend) {
    for (var elt in $httpBackend) {
      console.log('>> elt = '+elt);
    }
    $httpBackend.whenGET('http://mapapi.apispark-dev.net:8182/v1/maps').respond(function(method, url, data) {
      var maps = [ {id: '1', name: 'test'} ];
      return [200, maps, {}];
    });

    $httpBackend.whenGET('http://mapapi.apispark-dev.net:8182/v1/sources').respond(function(method, url, data) {
      var sources = [ {id: '1', name: 'test'} ];
      return [200, sources, {}];
    });
  })*/;
