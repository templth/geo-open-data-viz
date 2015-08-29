'use strict';

var fs = require('fs');
var csv = require('fast-csv');
var _ = require('lodash');

var counties = [];

var first = true;
var stream = fs.createReadStream(
  'app/scripts/json/us/us-county-names1.csv');
csv.fromStream(stream, { headers: ['stateCode', 'stateId', 'countyId', 'name', 'classCode'], delimiter: ',' })
  .on('data', function(data) {
    if (!first) {
      data.id = parseInt(data.stateId + data.countyId);
      counties.push(data);
    } else {
      first = false;
    }
  })
  .on('end', function() {
    var csvStream = csv.createWriteStream({headers: true});
    var writableStream = fs.createWriteStream(
      'app/scripts/json/us/us-county-names2.csv');

    writableStream.on('finish', function() {
      console.log('DONE!');
    });

    csvStream.pipe(writableStream);
    _.forEach(counties, function(county) {
      csvStream.write(county);
    });
    csvStream.end();
  });
