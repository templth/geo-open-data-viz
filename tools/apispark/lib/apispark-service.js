'use strict';

var fs = require('fs');
var urlApi = require('url');
var request = require('request');
var async = require('async');

exports = module.exports;

// Utility functions

function executeApiRequest(configuration, path, method, data, callback) {
  // console.log('>> url = '+configuration.baseUrl + 'api' + path);
  var options = {
    url: configuration.baseUrl + 'api' + path,
    method: method,
    headers: {
      accept: 'application/json'
    },
    auth: {
      user: configuration.username,
      pass: configuration.password
    }
  };

  if (data !== null) {
    options.json = data;
  }

  request(
      options,
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
          callback(null, jsonBody);
        } else if (!error && response.statusCode === 204) {
          callback();
        } else {
          console.log('err = ' + error);
          console.log('response.statusCode = ' + response.statusCode);
          console.log(body);
          if (error !== null) {
            callback(error, null);
          } else {
            var jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
            callback(jsonBody, null);
          }
        }
      });
}

function getRootUrl(rootUrl) {
  var rootUrlElts = urlApi.parse(rootUrl);
  // For dev environment
  rootUrlElts.host = null;
  rootUrlElts.port = 8182;
  return urlApi.format(rootUrlElts);
}

function executeWebApiRequest(configuration, apiId,
    path, method, data, callback) {
  executeApiRequest(configuration, '/apis/' + apiId +
      '/versions/1/access', 'GET', null, function(err, access) {
    // console.log('>> access = '+JSON.stringify(access));
    var options = {
      url: getRootUrl(access.rootUrl) + path,
      method: method,
      headers: {
        accept: 'application/json'
      },
      auth: {
        user: access.username,
        pass: access.token
      }
    };
    // console.log('url = ' + options.url);

    if (data !== null) {
      options.json = data;
    }

    request(
      options,
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
          callback(null, jsonBody);
        } else if (!error && response.statusCode === 204) {
          callback();
        } else {
          console.log('err = ' + error);
          console.log('response.statusCode = ' + response.statusCode);
          console.log(body);
          if (error !== null) {
            callback(error, null);
          } else {
            var jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
            callback(jsonBody, null);
          }
        }
      }
    );
  });
}

function isDataStoreType(type) {
  return (type === 'entitystore' || type === 'filestore');
}

function isWebApiType(type) {
  return (type === 'fullwebapi');
}

function createDataStoreObject(name, type) {
  return {
    name: name,
    description: '',
    type: type,
    // template: false*/,
    source: ''
  };
}

function createWebApiObject(name, type) {
  return {
    name: name,
    description: '',
    domainName: name.toLowerCase(),
    type: type/*,
    template: false*/
  };
}

function createFolderObject(name) {
  return {
    name: name
  };
}

function createDependencyObject(webApi, store) {
  return {
    sourceVersion: {
      id: webApi + '#1'
    },
    targetVersion: {
      id: store + '#1'
    },
    type: ''
  };
}

function createEndpointObject(protocol, domain, api) {
  return {
    protocol: protocol,
    domain: {
      id: domain.id
    },
    version: {
      id: api + '#1'
    }
  };
}

// Service functions

exports.loadApisparkConfiguration = function(callback) {
  fs.readFile('tools/apispark/apispark.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var configuration = JSON.parse(data);
    callback(configuration);
  });
};

exports.getUserCells = function(configuration, callback) {
  executeApiRequest(configuration, '/dashboard',
      'GET', null, function(err, jsonBody) {
    callback(jsonBody.cells);
  });
};

exports.createCell = function(configuration, name, type, callback) {
  if (isDataStoreType(type)) {
    var dataStore = createDataStoreObject(name, type);
    executeApiRequest(configuration, '/stores/',
        'POST', dataStore, function(err, addedCell) {
      callback(err, addedCell);
    });
  } else if (isWebApiType(type)) {
    var webApi = createWebApiObject(name, type);
    executeApiRequest(configuration, '/apis/',
        'POST', webApi, function(err, addedCell) {
      callback(err, addedCell);
    });
  }
};

exports.configureHttpEndpoint = function(configuration, cellId, callback) {
  async.waterfall([
    function(callback) {
      executeApiRequest(configuration, '/apis/' + cellId + '/versions/1/endpoints/',
          'GET', null, function(err, endpoints) {
        if (err == null) {
          callback(err, endpoints.endpoints[0]);
        } else {
          callback(err);
        }
      });
    },
    function(endpoint, callback) {
      executeApiRequest(configuration, '/apis/' + cellId + '/versions/1/endpoints/' + endpoint.id,
          'DELETE', null, function(err) {
        if (err == null) {
          callback(err, endpoint);
        } else {
          callback(err);
        }
      });
    },
    function(oldEndpoint, callback) {
      var endpoint = createEndpointObject('HTTP/1.1', oldEndpoint.domain, cellId);
      executeApiRequest(configuration, '/apis/' + cellId + '/versions/1/endpoints/',
          'POST', endpoint, function(err, addedEndpoint) {
        if (err == null) {
          callback(err, addedEndpoint);
        } else {
          callback(err);
        }
      });
    }
  ], function(err) {
    callback(err);
  });
};

function checkDeployment(configuration, deploymentTask, callback) {
  executeApiRequest(configuration, '/tasks/' + deploymentTask.id,
            'GET', null, function(err, task) {
    if (err != null) {
      callback(err, false);
    } else if (task.status === 'success') {
      callback(err, true);
    } else if (task.status === 'failure') {
      callback(err, false);
    } else {
      setTimeout(function() {
        checkDeployment(configuration, task, callback);
      }, 500);
    }
  });
}

exports.deployCell = function(configuration, type, id, callback) {
  var urlPrefix = isDataStoreType(type) ? '/stores/' : '/apis/';

  executeApiRequest(configuration, urlPrefix + id +
        '/versions/1/deploy',
        'POST', null, function(err, task) {
      setTimeout(function() {
        checkDeployment(configuration, task, callback);
      }, 500);
    });
};

exports.createFolder = function(configuration, name, cellId, callback) {
  var folder = createFolderObject(name);
  executeApiRequest(configuration, '/stores/' +
      cellId + '/versions/1/folders/',
     'POST', folder, function(err, addedFolder) {
    callback(err, addedFolder);
  });
};

exports.linkCells = function(configuration, webApiId,
      storeId, synchronize, callback) {
  var dependency = createDependencyObject(webApiId, storeId);

  executeApiRequest(configuration, '/apis/' + webApiId +
      '/versions/1/dependencies/',
      'POST', dependency, function(err, addedDependency) {
    if (synchronize) {
      executeApiRequest(configuration, '/apis/' + webApiId +
          '/versions/1/dependencies/' + addedDependency.id + '/synchronize',
          'POST', null, function(err) {
        callback(err, addedDependency);
      });
    } else {
      callback(err, addedDependency);
    }
  });
};

exports.getEntities = function(configuration, storeId, callback) {
  executeApiRequest(configuration, '/stores/' + storeId +
      '/versions/1/entities/', 'GET',
      null, function(err, jsonBody) {
    var entities = jsonBody.entities;
    callback(entities);
  });
};

exports.importEntities = function(configuration, storeId, fileName, callback) {
  fs.readFile(fileName, function(err, data) {
    if (err) {
      throw err;
    }

    executeApiRequest(configuration, '/stores/' + storeId +
        '/versions/1/definition',
        'POST', JSON.parse(data), function(/*jsonBody*/) {
      // TODO: jhandle errors
      callback();
    });
  });
};

exports.getFolders = function(configuration, storeId, callback) {
  executeApiRequest(configuration, '/stores/' + storeId +
      '/versions/1/folders/', 'GET',
      null, function(err, jsonBody) {
    var folders = jsonBody.folders;
    callback(folders);
  });
};

exports.getResources = function(configuration, webApiId, callback) {
  executeApiRequest(configuration, '/apis/' + webApiId +
      '/versions/1/resources/', 'GET',
      null, function(err, jsonBody) {
    var resources = jsonBody.resources;
    callback(resources);
  });
};

exports.getRepresentations = function(configuration, webApiId, callback) {
  executeApiRequest(configuration, '/apis/' + webApiId +
      '/versions/1/representations/', 'GET',
      null, function(err, jsonBody) {
    var representations = jsonBody.representations;
    callback(representations);
  });
};

exports.getData = function(configuration, webApiId, domain, callback) {
  executeWebApiRequest(configuration, webApiId, domain + '/',
      'GET', null, function(err, data) {
    callback(err, data);
  });
};

exports.importData = function(configuration, webApiId,
    domain, fileName, callback) {
  fs.readFile(fileName, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    executeWebApiRequest(configuration, webApiId, domain + '/',
        'POST', JSON.parse(data), function(err) {
      callback(err);
    });
  });
};