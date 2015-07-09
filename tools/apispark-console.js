'use strict';

var fs = require('fs');
var program = require('commander');
var _ = require('lodash');
var apisparkService = require('./lib/apispark-service');

function loadApisparkConfiguration(callback) {
  fs.readFile('tools/apispark.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var configuration = JSON.parse(data);
    callback(configuration);
  });
}

function checkNotEmptyOptionParameter(value, name) {
  if (value === null) {
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

        apisparkService.createFolder(configuration, name,
             cell, function(addedFolder) {
          if (options.id !== null) {
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

      var synchronize = isSynchronizeElementsOption(options);
      apisparkService.linkCells(configuration, webApi, store,
          synchronize, function(addedDependency) {
        console.log('Added dependency with id ' + addedDependency.id);
        if (synchronize) {
          console.log('Synchronized dependency');
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
  return (options.list !== null);
}

function isEntitiesImportOption(options) {
  return (options.import !== null);
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

        apisparkService.getEntities(configuration, id, function(entities) {
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

        apisparkService.importEntities(configuration, id, fileName, function() {
          console.log('Uploaded entities definition');
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
  return (options.list !== null);
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

        apisparkService.getFolders(configuration, id, function(folders) {
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
  return (options.display !== null);
}

function isDataImportOption(options) {
  return (options.import !== null);
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

        apisparkService.getData(configuration, id, domain, function(data) {
          console.log('ok');
          console.log(JSON.stringify(data, null, 2));
        });
      });
    } else if (isDataImportOption(options)) {
      loadApisparkConfiguration(function(configuration) {
        var fileName = options.import;
        var id = cell;
        checkNotEmptyOptionParameter(id, 'Id of cell');

        apisparkService.importData(configuration, id,
            domain, fileName, function() {
          console.log('ok');
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