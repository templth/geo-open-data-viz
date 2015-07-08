'use strict';

var fs = require('fs');

var map = {
    projection: 'orthographic',
    layers: [
      {
        id: 'graticuleLayer',
        type: 'graticule',
        name: 'Graticule',
        applyOn: 'layers',
        applied: true,
        visible: true,
        display: {
          background: true,
          lines: true,
          border: true
        },
        styles: {
          background: {
            fill: '#a4bac7'
          },
          border: {
            stroke: '#000',
            'stroke-width': '3px'
          },
          lines: {
            stroke: '#777',
            'stroke-width': '.5px',
            'stroke-opacity': '.5'
          }
        }
      },
      {
        id: 'worldLayer',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/continent.json',
          rootObject: 'countries',
          type: 'topojson',
          content: [],
          loaded: false
        },
        applyOn: 'layers',
        name: 'World',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'counties',
          type: 'topojson',
          content: [],
          loaded: false
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round'
          },
          d: {
            'stroke-width': '1.5px'
          }
        },
        applyOn: 'layers',
        name: 'US',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer1',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'counties',
          type: 'topojson',
          content: [],
          loaded: false,
          mesh: true
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round'
          },
          d: {
            'stroke-width': '0.5px'
          }
        },
        applyOn: 'layers',
        name: 'US counties',
        applied: true,
        visible: true
      },
      {
        id: 'usLayer2',
        type: 'geodata',
        data: {
          url: 'http://localhost:9000/scripts/json/us-light.json',
          rootObject: 'states',
          type: 'topojson',
          content: [],
          loaded: false,
          mesh: true
        },
        styles: {
          path: {
            fill: 'none',
            stroke: '#fff',
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round'
          },
          d: {
            'stroke-width': '1.5px'
          }
        },
        applyOn: 'layers',
        name: 'US states',
        applied: true,
        visible: true
      },
      {
        id: 'layer1',
        type: 'data',
        mode: 'objects',
        data: {
          url: 'http://localhost:9000/scripts/json/test.csv',
          type: 'csv',
          content: [],
          loaded: false
        },
        name: 'Cities',
        display: {
          shape: {
          	type: 'circle',
            radius: 'd.population / 3000000',
            origin: '[ d.lon, d.lat ]',
            fill: 'yellow',
            opacity: 0.75
          }
        },
        applyOn: 'layers',
        applied: true,
        visible: true
      },
      {
        id: 'layer2',
        type: 'data',
        mode: 'fill',
        data: {
          url: 'http://localhost:9000/scripts/json/unemployment.tsv',
          type: 'tsv',
          content: [],
          loaded: false
        },
        name: 'Unemployment rate',
        display: {
          fill: {
            threshold: {
              values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
              colors: [ '#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#756bb1', '#54278f' ]
            },
            value: 'd.rate',
            color: 'd.something'
          }
        },
        applyOn: 'usLayer',
        applied: true,
        visible: true
      }
    ]
  };

// See this issue: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
var mapAsString = JSON.stringify(map, null, 2);

var outputFilename = 'schema/sample-map.json';
fs.writeFile(outputFilename, mapAsString, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('JSON Sample Map saved to ' + outputFilename);
    }
}); 