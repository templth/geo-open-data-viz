'use strict';

var fs = require('fs');
var _ = require('lodash');

function transformTopojson(obj) {
  if (_.isArray(obj)) {
    for (var i = 0; i<obj.length; i++) {
      transformTopojson(obj[i]);
    }
  } else if (_.isObject(obj)) {
    for(var elt in obj) {
      console.log('>> elt = '+elt);
  	  if (elt === 'arcs') {
  	    delete obj[elt];
  	  } else {
        transformTopojson(obj[elt]);
      }
    }
  }
}

fs.readFile('app/scripts/json/us.json', 'utf8', function (err, data) {
  if (err) throw err;
  var obj = JSON.parse(data);

  transformTopojson(obj);

  console.log('>> '+JSON.stringify(obj, null, 4));
});