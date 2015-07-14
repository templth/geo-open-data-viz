'use strict';

var async = require('async');
var _ = require('lodash');
require('colors');
var apisparkService = require('./lib/apispark-service');

var cells = {
  webApi: {
    id: '',
    name: 'MapApi'
  },
  entityStore: {
    id: '',
    name: 'MapES'
  },
  fileStore: {
    id: '',
    name: 'MapFS'
  }
};

function logTask(msg, task) {
  process.stdout.write('   ' + msg);
  task(function(success) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    var indicator = success ? '\u2713'.green : '\u00d7'.red ;
    process.stdout.write(' ' + indicator + ' ' + msg);
    process.stdout.write('\n');
  });
}

function executeTaskProcessing(task, callback) {
  task.processing(callback);
}

function executeTask(task, onEndCallback) {
  if (task.type !== null && task.type === 'group') {
    console.log('');
    console.log(task.message.grey);
    console.log('');
    onEndCallback();
  } else if (task.type !== null && task.type === 'message') {
    if (task.processing != null) {
      task.processing(onEndCallback);
    }
  } else {
    logTask(task.message, function(end) {
      executeTaskProcessing(task, function(success) {
        end(success);
        if (success) {
          onEndCallback();
        }
      });
    });
  }
}

function createGroupMessage(msg) {
  return {
    message: msg,
    type: 'group'
  };
}

function createSimpleMessage(callback) {
  return {
    type: 'message',
    processing: function(asyncCallback) {
      callback();
      asyncCallback();
    }
  };
}

function createWebApiIdMessage(msg) {
  return {
    message: msg,
    type: 'message'
  };
}

function createCell(configuration, cellType, cellName) {
  var cellMessage = '';
  if (cellType === 'fullwebapi') {
    cellMessage = 'Create Web API';
  } else if (cellType === 'entitystore') {
    cellMessage = 'Create entity store';
  } else if (cellType === 'filestore') {
    cellMessage = 'Create file store';
  }
  return {
    message: cellMessage + ' "' + cellName + '"',
    processing: function(callback) {
      apisparkService.createCell(configuration, cellName,
          cellType, function(err, addedCell) {
        if (addedCell !== null) {
          if (cellType === 'fullwebapi') {
            cells.webApi.id = addedCell.id;
          } else if (cellType === 'entitystore') {
            cells.entityStore.id = addedCell.id;
          } else if (cellType === 'filestore') {
            cells.fileStore.id = addedCell.id;
          }
        }
        callback((err == null));
      });
    }
  };
}

function createFolderTask(configuration, msg, folderName) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.createFolder(configuration, folderName,
          cells.fileStore.id, function(err) {
        callback((err == null));
      });
    }
  };
}

function linkEntityStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.linkCells(configuration, cells.webApi.id,
          cells.entityStore.id, true, function(err) {
        callback((err == null));
      });
    }
  };
}

function linkFileStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.linkCells(configuration, cells.webApi.id,
          cells.fileStore.id, false, function(err) {
        callback((err == null));
      });
    }
  };
}

function configureHttpEndpoinTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.configureHttpEndpoint(configuration, cells.webApi.id,
          function(err) {
        callback((err == null));
      });
    }
  };
}

function deployWebApiTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration, 'webapi',
          cells.webApi.id, function(err, success) {
        callback(err == null && success);
      });
    }
  };
}

function deployEntityStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration,
          'entitystore', cells.entityStore.id, function(err, success) {
        callback(err == null && success);
      });
    }
  };
}

function deployFileStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration, 'filestore',
          cells.fileStore.id, function(err, success) {
        callback(err == null && success);
      });
    }
  };
}

function importDataTask(configuration, msg, domain, fileName) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration, 'filestore',
          cells.fileStore.id, function(err, success) {
        callback(err == null && success);
      });

      apisparkService.importData(configuration, cells.webApi.id,
        domain, fileName, function(err) {
        callback(err == null);
      });
    }
  };
}

apisparkService.loadApisparkConfiguration(function(configuration) {
  var tasks = [
    // Creating cells

    createGroupMessage('Create cells'),
    createCell(configuration, 'fullwebapi', cells.webApi.name),
    createCell(configuration, 'entitystore', cells.entityStore.name),
    createCell(configuration, 'filestore', cells.fileStore.name),

    // Display hints

    createGroupMessage('Dispay identifiers of created cells'),
    createSimpleMessage(function() {
      console.log('  Web API : ' + cells.webApi.id);
    }),
    createSimpleMessage(function() {
      console.log('  Entity store : ' + cells.entityStore.id);
    }),
    createSimpleMessage(function() {
      console.log('  File store : ' + cells.fileStore.id);
    }),

    // Creating structures

    createGroupMessage('Create structures'),
    // Import schema in entity store
    {
      message: 'Import schema in entity store',
      processing: function(callback) {
        apisparkService.importEntities(configuration,
            cells.entityStore.id, 'schema/entities-schema.json', function() {
          callback(true);
        });
      }
    },
    // Create folders in file store
    createFolderTask(configuration, 'Create folder "html" in file store',
      'html'),
    createFolderTask(configuration, 'Create folder "js" in file store',
      'js'),
    createFolderTask(configuration, 'Create folder "css" in file store',
      'css'),

    // Link web api with stores and generate its structure

    createGroupMessage('Link Web API with stores'),
    linkEntityStoreTask(configuration, 'Link Web API with entity store'),
    linkFileStoreTask(configuration, 'Link Web API with file store'),

    // Configure for HTTP
    configureHttpEndpoinTask(configuration, 'Configure HTTP endpoint'),

    // Deploy all cells
    createGroupMessage('Deploy cells'),
    deployWebApiTask(configuration, 'Deploy Web API'),
    deployEntityStoreTask(configuration, 'Deploy entity store'),
    deployFileStoreTask(configuration, 'Deploy file store'),

    // Import sample data
    createGroupMessage('Import sample data'),
    importDataTask(configuration, 'Import sample map data',
      'maps', 'schema/sample-map.json')
  ];

  async.series(_.map(tasks, function(task) {
    return function(callback) {
      executeTask(task, function() {
        callback();
      });
    };
  }));
});