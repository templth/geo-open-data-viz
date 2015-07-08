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

function readSampleMapData(callback) {
  fs.readFile('schema/sample-map.json', 'utf8', function (err, data) {
    if (err) {
      throw err;
    }

    var map = mergingAllMapElements(JSON.parse(data));
    callback(map);
  });
}

function readSampleMapSourceData(callback) {
  fs.readFile('schema/sample-mapSource.json', 'utf8', function (err, data) {
    if (err) {
      throw err;
    }

    callback(JSON.parse(data));
  });
}

function readSampleDataSourceData(callback) {
  fs.readFile('schema/sample-dataSource.json', 'utf8', function (err, data) {
    if (err) {
      throw err;
    }

    callback(JSON.parse(data));
  });
}

function readSampleData(callback) {
  async.parallel({
  	map: function(callback) {
  	  readSampleMapData(function(map) {
        callback(null, map);
  	  });
  	},
  	dataSource: function(callback) {
  	  readSampleDataSourceData(function(dataSource) {
        callback(null, dataSource);
  	  });
  	},
  	mapSource: function(callback) {
  	  readSampleMapSourceData(function(mapSource) {
        callback(null, mapSource);
  	  });
  	}
  }, function(err, results) {
    callback(results.map, results.mapSource, results.dataSource);
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
  entity.pkPolicy = 'auto-generated';
  entity.properties = [];
}

function getType(value) {
  if (_.isString(value)) {
  	return 'String';
  } else if (_.isNumber(value)) {
  	return 'Integer';
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
  for(var elt in obj) {
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
readSampleData(function(map, mapSource, dataSource) {
  var entities = [];

  // Map entity
  var mapEntity = {};
  entities.push(mapEntity);
  buildEntity(map, mapEntity, 'Map');

  // Map source entity
  var mapSourceEntity = {};
  entities.push(mapSourceEntity);
  buildEntity(mapSource, mapSourceEntity, 'MapSource');

  // Data source entity
  var dataSourceEntity = {};
  entities.push(dataSourceEntity);
  buildEntity(dataSource, dataSourceEntity, 'DataSource');

  // Serialize schema
  writeSchemaData({ entities: entities });
});