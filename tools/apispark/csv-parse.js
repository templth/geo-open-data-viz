'use strict';

var fs = require('fs');

var firstLine = true;
var numberOfLineForSample = 5;
var structure = {
  samples: []
};
//var separator = '\t';
var separator = ',';

function readLines(input, callback, end) {
  var remaining = '';
  var lineNumber = 0;

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var lineData = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      callback(lineNumber, lineData);
      lineNumber++;
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(lineNumber, remaining);
    }
    end();
  });
}

function func(lineNumber, lineData) {
  if (firstLine) {
    console.log('Line: ' + lineData);
  	firstLine = false;
    var columns = lineData.split(separator);
    structure.columns = columns;
  } else {
    if (lineNumber<=numberOfLineForSample+1) {
      structure.samples.push(lineData);
    }
  }
}

//var input = fs.createReadStream('app/scripts/json/unemployment.tsv');
var input = fs.createReadStream('app/scripts/json/test.csv');
readLines(input, func, function() {
  console.log('>> structure = '+JSON.stringify(structure));
});

/*fs.readFile('app/scripts/json/unemployment.tsv', 'utf8', function (err, data) {
});*/