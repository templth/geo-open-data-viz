'use strict';

var fs = require('fs');
var _ = require('lodash');
var clone = require('clone');
var async = require('async');
var camelize = require('camelize');

function mergingAllMapElements(map) {
  var mergedMap = {};

  mergedMap = clone(map);
  delete mergedMap.layers;
  mergedMap.layers = [ map.layers[0] ];

  _.forEach(map.layers, function(layer) {
    _.merge(mergedMap.layers[0], layer);
  });

  return mergedMap;
}

function mergingAllSourceElements(sources) {
  var mergedSource = {};

  mergedSource = clone(sources[0]);

  _.forEach(sources, function(source) {
    _.merge(mergedSource, source);
  });

  console.log('>> '+JSON.stringify(mergedSource));

  return mergedSource;
}

function readSampleMapData(callback) {
  fs.readFile('schema/sample-map.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var map = mergingAllMapElements(JSON.parse(data));
    callback(map);
  });
}

function readSampleSourceData(callback) {
  fs.readFile('schema/sample-source.json', 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var source = mergingAllSourceElements(JSON.parse(data));
    callback(source);
  });
}

function readSampleData(callback) {
  async.parallel({
    map: function(callback) {
      readSampleMapData(function(map) {
        callback(null, map);
      });
    },
    source: function(callback) {
      readSampleSourceData(function(dataSource) {
        callback(null, dataSource);
      });
    }
  }, function(err, results) {
    callback(results.map, results.source);
  });
}

function writeSchemaData(obj) {
  var objAsString = JSON.stringify(obj, null, 2);
  fs.writeFile('schema/entities-schema.json', objAsString, function (err) {
    if (err) {
      throw err;
    }

    console.log('File written');
  });
}

function isPrimitive(value) {
  return (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isDate(value));
}

function initializeEntity(entity, name) {
  entity.name = name;
  // entity.pkPolicy = 'auto-generated';
  entity.pkPolicy = 'user-generated';
  entity.properties = [];
}

// See http://stackoverflow.com/questions/3885817/how-to-check-that-a-number-is-float-or-integer

function isInteger(value) {
  return value % 1 === 0;
}

function getType(value) {
  if (_.isString(value)) {
    return 'String';
  } else if (_.isNumber(value)) {
    if (isInteger(value)) {
      return 'Integer';
    } else {
      return 'Float';
    }
  } else if (_.isBoolean(value)) {
    return 'Boolean';
  } else if (_.isDate(value)) {
    return 'Date';
  } else {
    return 'String';
  }
}

function isPk(name, level) {
  return (level === 0 && 'id' === name);
}

function createPrimitiveType(props) {
  return {
    name: camelize(props.name),
    type: props.type,
    required: false,
    list: props.list,
    primaryKey: props.pk
  };
}

function createCompositeType(props) {
  return {
    name: camelize(props.name),
    type: 'composite',
    required: false,
    list: props.list,
    properties: []
  };
}

function buildProperties(obj, element, level) {
  for (var elt in obj) {
    if (_.isArray(obj[elt])) {
      var firstObjElt = obj[elt][0];
      if (_.isObject(firstObjElt)) {
        // Composite type
        var property = createCompositeType({
          name: elt,
          list: true
        });
        element.properties.push(property);

        // Add sub properties to composite
        buildProperties(obj[elt][0], property, level + 1);
      } else {
        // Primitive type
        var property = createPrimitiveType({
          name: elt,
          type: getType(firstObjElt),
          list: true,
          pk: isPk(elt, level)
        });
        element.properties.push(property);
      }
    } else if (isPrimitive(obj[elt])) {
      // Primitive type
      var property = createPrimitiveType({
        name: elt,
        type: getType(obj[elt]),
        list: false,
        pk: isPk(elt, level)
      });
      element.properties.push(property);
    } else if (_.isObject(obj[elt])) {
      // Composite type
      var property = createCompositeType({
        name: elt,
        list: false
      });
      element.properties.push(property);

      // Add sub properties to composite
      buildProperties(obj[elt], property, level + 1);
    }
  }
}

function buildEntity(obj, entity, name) {
  initializeEntity(entity, name);
  buildProperties(obj, entity, 0);
}

// Create schema
readSampleData(function(map, source) {
  var entities = [];

  var layer = map.layers[0];
  map.layers = null;

  // Map entity
  var mapEntity = {};
  entities.push(mapEntity);
  buildEntity(map, mapEntity, 'Map');

  // Layer entity
  var layerEntity = {};
  entities.push(layerEntity);
  buildEntity(layer, layerEntity, 'Layer');

  // Map source entity
  var sourceEntity = {};
  entities.push(sourceEntity);
  buildEntity(source, sourceEntity, 'Source');

  // Serialize schema
  writeSchemaData({ entities: entities });
});