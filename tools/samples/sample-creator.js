'use strict';

var jsonfile = require('jsonfile');
var _ = require('lodash');

// Layers
var layersSample1 = require('./data/layers-sample1').data;
var layersSample2 = require('./data/layers-sample2').data;
var layersSample3 = require('./data/layers-sample3').data;
// Maps
var mapSample1 = require('./data/map-sample1').data;
var mapSample2 = require('./data/map-sample2').data;
var mapSample3 = require('./data/map-sample3').data;
// Sources
var sourcesSample1 = require('./data/sources-sample1').data;
var sourcesSample2 = require('./data/sources-sample2').data;

function writeSampleJsonFile(filename, data) {
  jsonfile.writeFileSync(
    'app/scripts/samples/' + filename, data, { spaces: 2 });
  jsonfile.writeFileSync(
    'tools/samples/json/' + filename, data, { spaces: 2 });
}

function writeSampleArrayJsonFile(prefix, suffix, data) {
  jsonfile.writeFileSync(
    'app/scripts/samples/' + prefix + suffix, data, { spaces: 2 });
  _.forEach(data, function(d, i) {
    jsonfile.writeFileSync(
      'tools/samples/json/' + prefix + '-' + i + suffix, d, { spaces: 2 });
  });
}

// Create sources

writeSampleArrayJsonFile('sources-sample1', '.json', sourcesSample1);
writeSampleArrayJsonFile('sources-sample2', '.json', sourcesSample2);

// Create maps

mapSample1.sources = sourcesSample1;
mapSample2.sources = sourcesSample2;
mapSample3.sources = sourcesSample2;

writeSampleJsonFile('map-sample1.json', mapSample1);
writeSampleJsonFile('map-sample2.json', mapSample2);
writeSampleJsonFile('map-sample3.json', mapSample3);

// Create layers

writeSampleArrayJsonFile('layers-sample1', '.json', layersSample1);
writeSampleArrayJsonFile('layers-sample2', '.json', layersSample2);
writeSampleArrayJsonFile('layers-sample3', '.json', layersSample3);