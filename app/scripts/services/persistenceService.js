'use strict';

function createPromise($q, $timeout, obj) {
  var deferred = $q.defer();
  $timeout(function() {
    deferred.resolve(obj);
  }, 50);
  return deferred.promise;
}

function generateUuid(uuid4) {
  return uuid4.generate();
}

function copySamples(singularDomainSuffix, collection, samplesService) {
  var samples = samplesService['get' + singularDomainSuffix + 'Samples']();
  //console.log('>> samples = '+JSON.stringify(samples));
  _.forEach(samples, function(sample) {
    if (!_.some(collection, 'id', sample.id)) {
      collection.push(sample);
    }
  });
}

function createInMemoryPersistenceService(
    domain, $q, $timeout, uuid4,
	samplesService) {
  var service = {};

  var pluralDomainSuffix = _.capitalize(domain) + 's';
  var singularDomainSuffix = _.capitalize(domain);

  var collection = [];

  copySamples(singularDomainSuffix, collection, samplesService);

  service['get' + pluralDomainSuffix] = function() {
    var targetCollection = collection;
    if (domain === 'layer' && arguments.length === 1) {
      var filteringId = arguments[0];
      targetCollection = _.filter(targetCollection, function(elt) {
        return _.includes(elt.maps, filteringId);
      });
    }
    return createPromise($q, $timeout, targetCollection);
  };

  service['add' + singularDomainSuffix] = function(item) {
    item.id = generateUuid(uuid4);
    collection.push(item);
    return createPromise($q, $timeout, item);
  };

  service['get' + singularDomainSuffix] = function(itemId) {
    return createPromise($q, $timeout, _.find(collection, 'id', itemId));
  };

  service['save' + singularDomainSuffix] = function(item) {
    var pItem = _.find(collection, 'id', item.id);
    _.assign(pItem, item);
    return createPromise($q, $timeout, pItem);
  };

  service['delete' + singularDomainSuffix] = function(itemId) {
    _.remove(collection, function(item) {
      return item.id === itemId;
    });
    return createPromise($q, $timeout);
  };

  return service;
}

function createLocalStoragePersistenceService(
    domain, $q, $timeout, $localStorage, uuid4,
    samplesService) {
  var service = {};

  var pluralDomain = domain + 's';
  var pluralDomainSuffix = _.capitalize(domain) + 's';
  var singularDomainSuffix = _.capitalize(domain);

  $localStorage[pluralDomain] = [];

  //copySamples(domain, $localStorage[pluralDomain], samplesService);

  service['get' + pluralDomainSuffix] = function() {
    var collection = $localStorage[pluralDomain];
    var targetCollection = collection;
    if (domain === 'layer' && arguments.length === 1) {
      var filteringId = arguments[0];
      targetCollection = _.filter(targetCollection, function(elt) {
        return _.includes(elt.maps, filteringId);
      });
    }
    return createPromise($q, $timeout, targetCollection);
  };

  service['add' + singularDomainSuffix] = function(item) {
    var collection = $localStorage[pluralDomain];
    item.id = generateUuid(uuid4);
    collection.push(item);
    return createPromise($q, $timeout, item);
  };

  service['get' + singularDomainSuffix] = function(itemId) {
    var collection = $localStorage[pluralDomain];
    return createPromise($q, $timeout, _.find(collection, 'id', itemId));
  };

  service['save' + singularDomainSuffix] = function(item) {
    var collection = $localStorage[pluralDomain];
    var pItem = _.find(collection, 'id', item.id);
    _.assign(pItem, item);
    return createPromise($q, $timeout, pItem);
  };

  service['delete' + singularDomainSuffix] = function(itemId) {
    var collection = $localStorage[pluralDomain];
    _.remove(collection, function(item) {
      return item.id === itemId;
    });
    return createPromise($q, $timeout);
  };

  return service;
}

function createAuthorizationHeader(currentProvider) {
  return 'Basic ' + btoa(currentProvider.username +
    ':' + currentProvider.password);
}

function createWebApiPersistenceService(domain, $http, providerService) {
  var service = {};

  var pluralDomain = domain + 's';
  var pluralDomainSuffix = _.capitalize(domain) + 's';
  var singularDomainSuffix = _.capitalize(domain);

  service['get' + pluralDomainSuffix] = function() {
    var currentProvider = providerService.getCurrentProvider();
    var options = {
      headers: { Authorization: createAuthorizationHeader(currentProvider) }
    };
    if (domain === 'layer') {
      options.params = {
        maps: arguments[0],
        $sort: 'rank ASC'
      };
    }
    return $http.get(currentProvider.url + pluralDomain + '/', options).then(function(response) {
      return response.data;
    });
  };

  service['add' + singularDomainSuffix] = function(item) {
    delete item.id;
    var currentProvider = providerService.getCurrentProvider();
    return $http.post(currentProvider.url + pluralDomain + '/', item, {
      headers: { Authorization: createAuthorizationHeader(currentProvider) }
    }).then(function(response) {
      return response.data;
    });
  };

  service['get' + singularDomainSuffix] = function(itemId) {
    var currentProvider = providerService.getCurrentProvider();
    return $http.get(currentProvider.url + pluralDomain + '/' + itemId, {
      headers: { Authorization: createAuthorizationHeader(currentProvider) }
    }).then(function(response) {
      return response.data;
    });
  };

  service['save' + singularDomainSuffix] = function(item) {
    var currentProvider = providerService.getCurrentProvider();
    return $http.put(currentProvider.url + pluralDomain + '/' + item.id, item, {
      headers: { Authorization: createAuthorizationHeader(currentProvider) }
    }).then(function(response) {
      return response.data;
    });
  };

  service['delete' + singularDomainSuffix] = function(itemId) {
    var currentProvider = providerService.getCurrentProvider();
    return $http.delete(currentProvider.url + pluralDomain + '/' + itemId, {
      headers: { Authorization: createAuthorizationHeader(currentProvider) }
    });
  };

  return service;
}

function createPersistenceService(
    domain, providerService, inMemoryProvider,
    browserStorageProvider, webApiProvider) {
  var service = {};

  var pluralDomainSuffix = _.capitalize(domain) + 's';
  var singularDomainSuffix = _.capitalize(domain);

  service['get' + pluralDomainSuffix] = function() {
    if (providerService.isInMemoryCurrentProvider()) {
     return inMemoryProvider['get' + pluralDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isBrowserStorageCurrentProvider()) {
      return browserStorageProvider['get' + pluralDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isWebApiCurrentProvider()) {
      return webApiProvider['get' + pluralDomainSuffix]
        .apply(inMemoryProvider, arguments);
    }
  };

  service['add' + singularDomainSuffix] = function(item) {
    if (providerService.isInMemoryCurrentProvider()) {
      return inMemoryProvider['add' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isBrowserStorageCurrentProvider()) {
      return browserStorageProvider['add' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isWebApiCurrentProvider()) {
      return webApiProvider['add' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    }
  };

  service['get' + singularDomainSuffix] = function(itemId) {
    if (providerService.isInMemoryCurrentProvider()) {
      return inMemoryProvider['get' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isBrowserStorageCurrentProvider()) {
      return browserStorageProvider['get' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isWebApiCurrentProvider()) {
      return webApiProvider['get' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    }
  };

  service['save' + singularDomainSuffix] = function(item) {
    if (providerService.isInMemoryCurrentProvider()) {
      return inMemoryProvider['save' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isBrowserStorageCurrentProvider()) {
      return browserStorageProvider['save' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isWebApiCurrentProvider()) {
      return webApiProvider['save' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    }
  };

  service['delete' + singularDomainSuffix] = function(itemId) {
    if (providerService.isInMemoryCurrentProvider()) {
      return inMemoryProvider['delete' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isBrowserStorageCurrentProvider()) {
      return browserStorageProvider['delete' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    } else if (providerService.isWebApiCurrentProvider()) {
      return webApiProvider['delete' + singularDomainSuffix]
        .apply(inMemoryProvider, arguments);
    }
  };

  return service;
}

angular.module('mapManager.persistence', [ 'app.config', 'mapManager.samples' ])

  // Provider
  .service('providerService', function($localStorage) {
    return {
      currentProvider: null,
      getCurrentProvider: function() {
        return this.currentProvider;
      },
      hasCurrentProvider: function() {
        return (this.currentProvider != null);
      },
      isInMemoryCurrentProvider: function() {
        return this.hasCurrentProvider() &&
          this.currentProvider.type === 'inmemory';
      },
      isBrowserStorageCurrentProvider: function() {
        return this.hasCurrentProvider() &&
          this.currentProvider.type === 'browserstorage';
      },
      isWebApiCurrentProvider: function() {
        return this.hasCurrentProvider() &&
          this.currentProvider.type === 'webapi';
      },
      selectInMemoryProvider: function() {
        this.currentProvider = {
          type: 'inmemory'
        };
        $localStorage.currentProvider = this.currentProvider;
      },
      selectBrowserStorageInMemoryProvider: function() {
        this.currentProvider = {
          type: 'browserstorage'
        };
        $localStorage.currentProvider = this.currentProvider;
      },
      selectWebApiProvider: function(data) {
        this.currentProvider = {
          type: 'webapi',
          url: data.url,
          username: data.username,
          password: data.password,
          readonly: data.readonly,
          secured: data.secured
        };
        $localStorage.currentProvider = this.currentProvider;
      }
    };
  })

  // Map resource

  .factory('mapInMemoryResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createInMemoryPersistenceService(
      'map', $q, $timeout, uuid4, samplesService,
      addSamples);
  })

  .factory('mapBrowserStorageResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createLocalStoragePersistenceService(
      'map', $q, $timeout, $localStorage, uuid4,
      samplesService, addSamples);
  })

  .factory('mapWebApiResource', function($http, providerService, apiBaseUrl) {
    return createWebApiPersistenceService(
      'map', $http, providerService, apiBaseUrl);
  })

  .factory('mapResource', function(providerService, mapInMemoryResource,
      mapBrowserStorageResource, mapWebApiResource) {
    return createPersistenceService(
      'map', providerService, mapInMemoryResource,
      mapBrowserStorageResource, mapWebApiResource);
  })

  // Layer resource

  .factory('layerInMemoryResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createInMemoryPersistenceService(
      'layer', $q, $timeout, uuid4, samplesService,
      addSamples);
  })

  .factory('layerBrowserStorageResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createLocalStoragePersistenceService(
      'layer', $q, $timeout, $localStorage, uuid4,
      samplesService, addSamples);
  })

  .factory('layerWebApiResource', function($http, providerService, apiBaseUrl) {
    return createWebApiPersistenceService(
      'layer', $http, providerService, apiBaseUrl);
  })

  .factory('layerResource', function(providerService, layerInMemoryResource,
      layerBrowserStorageResource, layerWebApiResource) {
    return createPersistenceService(
      'layer', providerService, layerInMemoryResource,
      layerBrowserStorageResource, layerWebApiResource);
  })

  // Source resource

  .factory('sourceInMemoryResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createInMemoryPersistenceService(
      'source', $q, $timeout, uuid4, samplesService,
      addSamples);
  })

  .factory('sourceBrowserStorageResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    return createLocalStoragePersistenceService(
      'source', $q, $timeout, $localStorage, uuid4,
      samplesService, addSamples);
  })

  .factory('sourceWebApiResource', function($http, providerService, apiBaseUrl) {
    return createWebApiPersistenceService(
      'source', $http, providerService, apiBaseUrl);
  })

  .factory('sourceResource', function(providerService, sourceInMemoryResource,
      sourceBrowserStorageResource, sourceWebApiResource) {
    return createPersistenceService(
      'source', providerService, sourceInMemoryResource,
      sourceBrowserStorageResource, sourceWebApiResource);
  });