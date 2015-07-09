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
    console.log(' ' + task.message);
    onEndCallback();
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

function createWebApiIdMessage(msg) {
  return {
    message: msg,
    type: 'message'
  };
}

function createFolderTask(configuration, msg, folderName) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.createFolder(configuration, folderName,
          cells.fileStore.id, function(err) {
          	if (err!=null)
          	console.log(JSON.stringify(err));
        callback((err === null));
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
        callback((err === null));
      });
    }
  };
}

function linkFileStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.linkCells(configuration, cells.webApi.id,
          cells.fileStore.id, true, function(err) {
        callback((err === null));
      });
    }
  };
}

function deployWebApiTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration, 'webapi',
          cells.webApi.id, function(err) {
        callback((err === null));
      });
    }
  };
}

function deployEntityStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration,
          'entitystore', cells.entityStore.id, function(err) {
        callback((err === null));
      });
    }
  };
}

function deployFileStoreTask(configuration, msg) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.deployCell(configuration, 'filestore',
          cells.fileStore.id, function(err) {
        callback((err === null));
      });
    }
  };
}

apisparkService.loadApisparkConfiguration(function(configuration) {
  var tasks = [
    // Creating cells

    createGroupMessage('Create cells'),
    {
      message: 'Create Web API "' + cells.webApi.name + '"',
      processing: function(callback) {
        apisparkService.createCell(configuration, cells.webApi.name,
            'fullwebapi', function(err, addedCell) {
          if (addedCell !== null) {
            cells.webApi.id = addedCell.id;
          }
          callback((err === null));
        });
      }
    },
    {
      message: 'Create Entity Store "' + cells.entityStore.name + '"',
      processing: function(callback) {
        apisparkService.createCell(configuration, cells.entityStore.name,
            'entitystore', function(err, addedCell) {
          if (addedCell !== null) {
            cells.entityStore.id = addedCell.id;
          }
          callback((err === null));
        });
      }
    },
    {
      message: 'Create File Store "' + cells.fileStore.name + '"',
      processing: function(callback) {
        apisparkService.createCell(configuration, cells.fileStore.name,
            'filestore', function(err, addedCell) {
          if (addedCell !== null) {
            cells.fileStore.id = addedCell.id;
          }
          callback((err === null));
        });
      }
    },

    // Display hints

    createGroupMessage('Dispay identifiers of created cells'),
    /*createSimpleMessage('Web API : ' + cells.webApi.id),
    createSimpleMessage('Entity store : ' + cells.entityStore.id),
    createSimpleMessage('File store : ' + cells.fileStore.id),*/

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

    // Deploy all cells
    createGroupMessage('Deploy cells'),
    deployWebApiTask(configuration, 'Deploy Web API', cells.webApi.id),
    deployEntityStoreTask(configuration, 'Deploy entity store',
      cells.entityStore.id),
    deployFileStoreTask(configuration, 'Deploy file store', cells.fileStore.id),

    // Import sample data
    createGroupMessage('Import sample data'),
  ];

  async.series(_.map(tasks, function(task) {
    return function(callback) {
      executeTask(task, function() {
        callback();
      });
    };
  }));
});