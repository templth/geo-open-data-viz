'use strict';

var fs = require('fs');
var urlApi = require('url');
var program = require('commander');
var request = require('request');
var _ = require('lodash');
var apisparkService = require('./apispark-service');

function loadApisparkConfiguration(callback) {
  fs.readFile('tools/apispark.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var configuration = JSON.parse(data);
    callback(configuration);
  });
}

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

  if (data != null) {
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

    if (data != null) {
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

function checkNotEmptyOptionParameter(value, name) {
  if (value == null) {
    throw new Error(name + ' must be specified');
  }
}

// Cell management

function isCellListOption(options) {
  return (options.list != null);
}

program
  .command('cells')
  .alias('ce')
  .description('handle entities of an entity store')
  .option('-l, --list', 'List all cells')
  .action(function(options) {
    if (isCellListOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        apisparkService.getUserCells(configuration, function(cells) {
          _.forEach(cells, function(cell) {
            console.log('- (' + cell.id + ') ' + cell.name + ' - ' + cell.type);
          });
        });
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark cells -l');
    console.log('    $ apispark cells -c');
    console.log();
  });

// Creation

function isCellType(type) {
  return (isDataStoreType(type) || isWebApiType(type));
}

function isFolderType(type) {
  return type === 'folder';
}

program
  .command('create <type> <name>')
  .alias('cre')
  .description('handle entities of an entity store')
  .option('-v, --verbose', 'Verbose mode')
  .option('-c, --cell', 'Id of the cell')
  .action(function(type, name, options) {
    checkNotEmptyOptionParameter(type, 'Type of cell');
    if (isCellType(type)) {
      loadApisparkConfiguration(function(configuration) {
        checkNotEmptyOptionParameter(name, 'Name of cell');

        apisparkService.createCell(configuration,
            name, type, function(addedCell) {
          if (options.verbose !== null) {
            console.log('Added data store with id ' + addedCell.id);
          } else {
            console.log(addedCell.id);
          }
        });
      });
    } else if (isFolderType(type)) {
      loadApisparkConfiguration(function(configuration) {
        var cell = options.cell;
        checkNotEmptyOptionParameter(name, 'Name of folder');
        checkNotEmptyOptionParameter(cell, 'Id of the cell');

        var folder = createFolderObject(name);
        executeApiRequest(configuration, '/stores/' +
            cell + '/versions/1/folders/',
            'POST', folder, function(addedFolder) {
          if (options.id != null) {
            console.log(addedFolder.id);
          } else {
            console.log('Added folder with id ' + addedFolder.id);
          }
        });
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark create entitystore tes');
    console.log('    $ apispark create filestore tes');
    console.log('    $ apispark create fullwebapi twa');
    console.log('    $ apispark create folder myfolder');
    console.log();
  });

// Deployment

program
  .command('deploy <type> <cell>')
  .alias('de')
  .description('handle entities of an entity store')
  .action(function(type, cell) {
    loadApisparkConfiguration(function(configuration) {
      var id = cell;
      checkNotEmptyOptionParameter(id, 'Id of cell');
      checkNotEmptyOptionParameter(type, 'Type of cell');

      apisparkService.deployCell(configuration, type, id, function(success) {
        console.log('Deployment ends ' + (success ? 'successfully' : 'with errors'));
      });
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark cells -l');
    console.log('    $ apispark cells -c');
    console.log();
  });

// Link cell

function isSynchronizeElementsOption(options) {
  return (options.synchronize !== null);
}

program
  .command('link <webapi> <store>')
  .alias('li')
  .description('Link cells together')
  .option('-s, --synchronize', 'synchronize elements')
  .action(function(webApi, store, options) {
    loadApisparkConfiguration(function(configuration) {
      checkNotEmptyOptionParameter(webApi, 'Id of web api');
      checkNotEmptyOptionParameter(store, 'Type of data store');

      var dependency = createDependencyObject(webApi, store);

      executeApiRequest(configuration, '/apis/' + webApi +
            '/versions/1/dependencies/',
            'POST', dependency, function(addedDependency) {
        console.log('Added dependency with id ' + addedDependency.id);
        if (isSynchronizeElementsOption(options)) {
          executeApiRequest(configuration, '/apis/' + webApi +
            '/versions/1/dependencies/' + addedDependency.id + '/synchronize',
            'POST', null, function() {
            console.log('Synchronized dependency');
          });
        }
      });

    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark cells -l');
    console.log('    $ apispark cells -c');
    console.log();
  });



// Management of entities

function isEntitiesListOption(options) {
  return (options.list != null);
}

function isEntitiesImportOption(options) {
  return (options.import != null);
}

program
  .command('entities <cell>')
  .alias('ent')
  .description('handle entities of an entity store')
  .option('-l, --list', 'List entities of an entity store')
  .option('-i, --import <file>', 'Create entities from a file')
  .action(function(cell, options) {
    if (isEntitiesListOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');

        executeApiRequest(configuration, '/stores/' + id +
            '/versions/1/entities/', 'GET',
            null, function(jsonBody) {
          var entities = jsonBody.entities;
          console.log('List of entities:');
          _.forEach(entities, function(entity) {
            console.log('- (' + entity.id + ') ' + entity.name);
          });
        });
      });
    } else if (isEntitiesImportOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var fileName = options.import;
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');

        fs.readFile(fileName, function(err, data) {
          if (err) {
            throw err;
          }

          executeApiRequest(configuration, '/stores/' + id +
              '/versions/1/definition',
              'POST', JSON.parse(data), function(jsonBody) {
            console.log(jsonBody);
            console.log('Uploaded entities definition');
          });
        });
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark entities -l');
    console.log('    $ apispark entities -i entities.json');
    console.log();
  });

// Management of folders

function isEntitiesListOption(options) {
  return (options.list !=null);
}

program
  .command('folders <cell>')
  .alias('ent')
  .description('handle entities of an entity store')
  .option('-l, --list', 'List entities of an entity store')
  .action(function(cell, options) {
    if (isEntitiesListOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');

        executeApiRequest(configuration, '/stores/' + id +
            '/versions/1/folders/', 'GET',
            null, function(jsonBody) {
          var folders = jsonBody.folders;
          console.log('List of folders:');
          _.forEach(folders, function(folder) {
            console.log('- (' + entity.id + ') ' + entity.name);
          });
        });
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark entities -l');
    console.log('    $ apispark entities -i entities.json');
    console.log();
  });

// Import data

function isDataDisplayOption(options) {
  return (options.display !=null);
}

function isDataImportOption(options) {
  return (options.import !=null);
}

program
  .command('data <cell> <domain>')
  .alias('dat')
  .description('import data into API')
  .option('-d, --display', 'Display data')
  .option('-i, --import <file>', 'File to import')
  .action(function(cell, domain, options) {
    if (isDataDisplayOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');
        checkNotEmptyOptionParameter(domain, 'Data domain');

        executeWebApiRequest(configuration, id, domain + '/',
            'GET', null, function(data) {
          console.log('ok');
          console.log(JSON.stringify(data, null, 2));
        });
      });
    } else if (isDataImportOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var fileName = options.import;
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');

        fs.readFile(fileName, function(err, data) {
          if (err) {
            throw err;
          }

          console.log(JSON.parse(data));
          executeWebApiRequest(configuration, id, domain + '/',
              'POST', JSON.parse(data), function() {
            console.log('ok');
          });
        });
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ apispark entities -l');
    console.log('    $ apispark entities -i entities.json');
    console.log();
  });

program.parse(process.argv);