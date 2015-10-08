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

var devUrlPrefix = 'http://localhost:9000/scripts/json/';
var prodUrlPrefix = 'https://mapapi.apispark.net/data/';

function updateUrl(obj, prop, env) {
  if (obj != null && obj[prop] != null) {
  	console.log('>> obj[prop] = '+obj[prop]);
    if (env === 'dev') {
      obj[prop] = obj[prop].replace(prodUrlPrefix, devUrlPrefix);
    } else if (env === 'prod') {
      obj[prop] = obj[prop].replace(devUrlPrefix, prodUrlPrefix);
    }
  	console.log('  >> obj[prop] = '+obj[prop]);
  }
}

function updateUrls(layers, sources, env) {
  _.forEach(layers, function(layer) {
    updateUrl(layer.data, 'url', env);
    if (layer.data != null) {
      updateUrl(layer.data.properties, 'url', env);
    }
  });

  _.forEach(sources, function(source) {
    updateUrl(source, 'url', env);
  });
}

function createLayersSamplesArray(layersSample1,
                  layersSample2, layersSample3) {
  var layers = [];
  _.forEach(layersSample1, function(layer) {
    layers.push(layer);
  });
  _.forEach(layersSample2, function(layer) {
    layers.push(layer);
  });
  _.forEach(layersSample3, function(layer) {
    layers.push(layer);
  });
  return layers;
}

function createSourcesSamplesArray(sourcesSample1,
                  sourcesSample2) {
  var sources = [];
  _.forEach(sourcesSample1, function(source) {
    sources.push(source);
  });
  _.forEach(sourcesSample2, function(source) {
    sources.push(source);
  });
  return sources;
}

var environments = [ 'dev', 'prod' ];

_.forEach(environments, function(env) {
  updateUrls(
    createLayersSamplesArray(layersSample1, layersSample1, layersSample1),
    createSourcesSamplesArray(sourcesSample1, sourcesSample2), env);

  // Create sources
  writeSampleArrayJsonFile('sources-sample1-' + env, '.json', sourcesSample1);
  writeSampleArrayJsonFile('sources-sample2-' + env, '.json', sourcesSample2);

  // Create maps
  mapSample1.sources = sourcesSample1;
  mapSample2.sources = sourcesSample2;
  mapSample3.sources = sourcesSample2;

  writeSampleJsonFile('map-sample1-' + env + '.json', mapSample1);
  writeSampleJsonFile('map-sample2-' + env + '.json', mapSample2);
  writeSampleJsonFile('map-sample3-' + env + '.json', mapSample3);

  // Create layers

  writeSampleArrayJsonFile('layers-sample1-' + env, '.json', layersSample1);
  writeSampleArrayJsonFile('layers-sample2-' + env, '.json', layersSample2);
  writeSampleArrayJsonFile('layers-sample3-' + env, '.json', layersSample3);
});