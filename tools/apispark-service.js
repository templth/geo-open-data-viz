'use strict';

var fs = require('fs');
var urlApi = require('url');
var request = require('request');
var _ = require('lodash');

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
          callback(jsonBody);
        } else if (!error && response.statusCode === 204) {
          callback();
        } else {
          console.log('err = ' + error);
          console.log('response.statusCode = ' + response.statusCode);
          console.log(body);
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
      '/versions/1/access', 'GET', null, function(access) {
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
    console.log('url = ' + options.url);

    if (data !== null) {
      options.json = data;
    }

    request(
      options,
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
          callback(jsonBody);
        } else if (!error && response.statusCode === 204) {
          callback();
        } else {
          console.log('err = ' + error);
          console.log('response.statusCode = ' + response.statusCode);
          console.log(body);
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
    type: type/*,
    template: false*/,
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

// Service functions

exports.loadApisparkConfiguration = function(callback) {
  fs.readFile('tools/apispark.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var configuration = JSON.parse(data);
    callback(configuration);
  });
};

exports.getUserCells = function(configuration, callback) {
  executeApiRequest(configuration, '/dashboard',
      'GET', null, function(jsonBody) {
    callback(jsonBody.cells);
  });
};

exports.createCell = function(configuration, name, type, callback) {
  if (isDataStoreType(type)) {
    var dataStore = createDataStoreObject(name, type);
    executeApiRequest(configuration, '/stores/',
        'POST', dataStore, function(addedCell) {
      callback(addedCell);
    });
  } else if (isWebApiType(type)) {
    var webApi = createWebApiObject(name, type);
    executeApiRequest(configuration, '/apis/',
        'POST', webApi, function(addedCell) {
      callback(addedCell);
    });
  }
};

function checkDeployment(configuration, deploymentTask, callback) {
  executeApiRequest(configuration, '/tasks/' + deploymentTask.id,
            'GET', null, function(task) {
    if (task.status === 'success') {
      callback(true);
    } else if (task.status === 'failure') {
      callback(false);
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
        'POST', null, function(task) {
      console.log('Started deployment');
      setTimeout(function() {
        checkDeployment(configuration, task, callback);
      }, 500);
    });
};