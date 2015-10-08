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

function importDataTask(configuration, msg, domain, fileName) {
  return {
    message: msg,
    processing: function(callback) {
      apisparkService.importData(configuration, cells.webApi.id,
        domain, fileName, function(err) {
        callback(err == null);
      });
    }
  };
}

var env = 'dev';
/*if (process.argv.length >= 1) {
  env = process.argv[0];
}*/

apisparkService.loadApisparkConfiguration(env, function(configuration) {
  cells.webApi.id = configuration.cells.webApi;
  cells.entityStore.id = configuration.cells.entityStore;
  cells.fileStore.id = configuration.cells.fileStore;

  var tasks = [
    // Import sample data
    createGroupMessage('Import sample data'),
    importDataTask(configuration, 'Import data for sample map #1',
      'maps', 'tools/samples/json/map-sample1-' + env + '.json'),
    importDataTask(configuration, 'Import data for sample map #2',
      'maps', 'tools/samples/json/map-sample2-' + env + '.json'),
    importDataTask(configuration, 'Import data for sample map #3',
      'maps', 'tools/samples/json/map-sample3-' + env + '.json'),
    // Layers #1
    importDataTask(configuration, 'Import data for sample layers #1 (0)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-0.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (1)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-1.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (2)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-2.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (3)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-3.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (4)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-4.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (5)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-5.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (6)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-6.json'),
    importDataTask(configuration, 'Import data for sample layers #1 (7)',
      'layers', 'tools/samples/json/layers-sample1-' + env + '-7.json'),
    // Layers #2
    importDataTask(configuration, 'Import data for sample layers #2 (0)',
      'layers', 'tools/samples/json/layers-sample2-' + env + '-0.json'),
    importDataTask(configuration, 'Import data for sample layers #2 (1)',
      'layers', 'tools/samples/json/layers-sample2-' + env + '-1.json'),
    importDataTask(configuration, 'Import data for sample layers #2 (2)',
      'layers', 'tools/samples/json/layers-sample2-' + env + '-2.json'),
    // Layers #3
    importDataTask(configuration, 'Import data for sample layers #3 (0)',
      'layers', 'tools/samples/json/layers-sample3-' + env + '-0.json'),
    importDataTask(configuration, 'Import data for sample layers #3 (1)',
      'layers', 'tools/samples/json/layers-sample3-' + env + '-1.json'),
    importDataTask(configuration, 'Import data for sample layers #3 (2)',
      'layers', 'tools/samples/json/layers-sample3-' + env + '-2.json'),
    importDataTask(configuration, 'Import data for sample layers #3 (3)',
      'layers', 'tools/samples/json/layers-sample3-' + env + '-3.json'),
    importDataTask(configuration, 'Import data for sample layers #3 (4)',
      'layers', 'tools/samples/json/layers-sample3-' + env + '-4.json'),
    // Sources #1
    importDataTask(configuration, 'Import data for sample sources #1 (0)',
      'sources', 'tools/samples/json/sources-sample1-' + env + '-0.json'),
    importDataTask(configuration, 'Import data for sample sources #1 (1)',
      'sources', 'tools/samples/json/sources-sample1-' + env + '-1.json'),
    // Sources #2
    importDataTask(configuration, 'Import data for sample sources #2 (0)',
      'sources', 'tools/samples/json/sources-sample2-' + env + '-0.json'),
    importDataTask(configuration, 'Import data for sample sources #2 (1)',
      'sources', 'tools/samples/json/sources-sample2-' + env + '-1.json')
  ];

  async.series(_.map(tasks, function(task) {
    return function(callback) {
      executeTask(task, function() {
        callback();
      });
    };
  }));
});