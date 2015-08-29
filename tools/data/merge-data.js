'use strict';

// See https://www.npmjs.com/package/fast-csv
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var csv = require('fast-csv');

function getStateCodeFromCountyName(stateCountyLinks, county) {
  return _.find(stateCountyLinks, function(link) {
  	// console.log('>> link.countyName = '+link.countyName+', county.name = '+county.name);
    return (link.countyName === county.name);
  });
}

function getStateFromCode(states, stateCode) {
  return _.find(states, function(state) {
    return (state.code === stateCode);
  });
}

async.parallel([
  function(callback) {
    var stateCountyLinks = [];
    // Load links between counties and states
    var stream = fs.createReadStream(
      'app/scripts/json/us/counties-with-states.csv');
    csv.fromStream(stream, { headers: ['stateCode', 'countyName'], delimiter: ',' })
      .on('data', function(data) {
        stateCountyLinks.push(data);
      })
      .on('end', function() {
        callback(null, stateCountyLinks);
      });
  },

  function(callback) {
    var states = [];
    // Load states
    var stream = fs.createReadStream(
      'app/scripts/json/us/us-state-names.tsv');
    csv.fromStream(stream, { headers: ['id', 'code', 'name'], delimiter: '\t' })
      .on('data', function(data) {
        states.push(data);
      })
      .on('end', function() {
        callback(null, states);
      });
  },

  function(callback) {
    var counties = [];
    // Load counties
    var stream = fs.createReadStream(
      'app/scripts/json/us/us-county-names.tsv');
    csv.fromStream(stream, { headers: ['id', 'name'], delimiter: '\t' })
      .on('data', function(data) {
        counties.push(data);
      })
      .on('end', function() {
        callback(null, counties);
      });
  }
], function(err, results) {
  var stateCountyLinks = results[0];
  var states = results[1];
  var counties = results[2];
  _.forEach(counties, function(county, i) {
  	//console.log('>> country = '+JSON.stringify(county));
  	if (i === 0) {
  	  return;
  	}

    var stateCode = getStateCodeFromCountyName(
      stateCountyLinks, county);
    if (stateCode != null) {
      //console.log('  >> stateCode = '+JSON.stringify(stateCode));
      var state = getStateFromCode(states, stateCode.stateCode);
      if (state != null) {
        county.stateCode = stateCode.stateCode;
        county.stateId = state.id;
        county.stateName = state.name;
        //console.log('  >> updateCountry = '+JSON.stringify(county));
      } else {
        console.log('>> state not found = '+JSON.stringify(stateCode));
      }
    } else {
  	  console.log('>> county not found = '+JSON.stringify(county));
    }
  });

  //console.log('>> counties = '+JSON.stringify(counties));
});