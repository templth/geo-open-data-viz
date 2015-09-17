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

mapSample1.sources = sourcesSample1;
mapSample2.sources = sourcesSample2;
mapSample3.sources = sourcesSample2;

// Create map

var map = {};

_.merge(map, mapSample1);
_.merge(map, mapSample2);
_.merge(map, mapSample3);

// Create layers

map.layers = [];
_.forEach(layersSample1, function(layer) {
  map.layers.push(layer);
});
_.forEach(layersSample2, function(layer) {
  map.layers.push(layer);
});
_.forEach(layersSample3, function(layer) {
  map.layers.push(layer);
});

// Create sources

var sources = [];
_.forEach(sourcesSample1, function(source) {
  sources.push(source);
});

_.forEach(sourcesSample2, function(source) {
  sources.push(source);
});

// Write schema

jsonfile.writeFileSync(
  'schema/sample-map.json', map, { spaces: 2 });
jsonfile.writeFileSync(
  'schema/sample-source.json', sources, { spaces: 2 });