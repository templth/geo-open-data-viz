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
  console.log('>> singularDomainSuffix = '+singularDomainSuffix);
  var samples = samplesService['get' + singularDomainSuffix + 'Samples']();
  //console.log('>> samples = '+JSON.stringify(samples));
  _.forEach(samples, function(sample) {
    console.log('>> sample.id = '+sample.id);
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

  copySamples(domain, $localStorage[pluralDomain], samplesService);

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

function createWebApiPersistenceService(
	domain, $resource) {
  var service = {};

  var pluralDomain = domain + 's';
  var pluralDomainSuffix = _.capitalize(domain) + 's';
  var singularDomainSuffix = _.capitalize(domain);

  var resource = $resource(
    pluralDomain + '/:id',
    { id: '@id' },
    {
      add: {method: 'POST'},
      save: {method: 'PUT'}
    }
  );

  service['get' + pluralDomainSuffix] = function() {
    return resource.query().$promise;
  };

  service['add' + singularDomainSuffix] = function(item) {
    delete item.id;
    return resource.add(item).$promise;
  };

  service['get' + singularDomainSuffix] = function(itemId) {
    return resource.get({id: itemId}).$promise;
  };

  service['save' + singularDomainSuffix] = function(item) {
    return resource.save(item).$promise;
  };

  service['delete' + singularDomainSuffix] = function(itemId) {
    return resource.delete({id: itemId}).$promise;
  };

  return service;
}

function isInMemoryStorageType(storageType) {
  return storageType === 'inmemory';
}

function isLocalStorageStorageType(storageType) {
  return storageType === 'browserstorage';
}

function isWebApiStorageType(storageType) {
  return storageType === 'webapi';
}

angular.module('mapManager.persistence', [ 'app.config', 'mapManager.samples' ])

  // Map resource
  .factory('mapResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    if (isInMemoryStorageType(storageType)) {
      return createInMemoryPersistenceService(
        'map', $q, $timeout, uuid4, samplesService,
        addSamples);
    } else if (isLocalStorageStorageType(storageType)) {
      return createLocalStoragePersistenceService(
        'map', $q, $timeout, $localStorage, uuid4,
        samplesService, addSamples);
    } else if (isWebApiStorageType(storageType)) {
      return createWebApiPersistenceService(
        'map', $resource, apiBaseUrl);
    }
  })

  // Layer resource
  .service('layerResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    if (isInMemoryStorageType(storageType)) {
      return createInMemoryPersistenceService(
        'layer', $q, $timeout, uuid4, samplesService,
        addSamples);
    } else if (isLocalStorageStorageType(storageType)) {
      return createLocalStoragePersistenceService(
        'layer', $q, $timeout, $localStorage, uuid4,
        samplesService, addSamples);
    } else if (isWebApiStorageType(storageType)) {
      return createWebApiPersistenceService(
        'layer', $resource, apiBaseUrl);
    }
  })

  // Source resource
  .service('sourceResource', function($q, $timeout,
      $localStorage, $resource, storageType, addSamples, apiBaseUrl,
      uuid4, samplesService) {
    if (isInMemoryStorageType(storageType)) {
      return createInMemoryPersistenceService(
        'source', $q, $timeout, uuid4, samplesService,
        addSamples);
    } else if (isLocalStorageStorageType(storageType)) {
      return createLocalStoragePersistenceService(
        'source', $q, $timeout, $localStorage, uuid4,
        samplesService, addSamples);
    } else if (isWebApiStorageType(storageType)) {
      return createWebApiPersistenceService(
        'source', $resource, apiBaseUrl);
    }
  });