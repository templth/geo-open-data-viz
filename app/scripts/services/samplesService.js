'use strict';

angular.module('mapManager.samples', [  ])

  .service('samplesService', function() {
    return {
      getMapSamples: function() {
        var maps = [];
        maps.push(this.getMapSample1());
        maps.push(this.getMapSample2());
        maps.push(this.getMapSample3());
        return maps;
      },

      getMapSample1: function() {
        var sources = this.getSourcesSample1();
        return {
          id: '1',
          name: 'Meteorites',
          type: 'd3js',
          projection: 'orthographic',
          //projection: 'mercator',
          scale: 420,
          center: {
            lon: 60,
            lat: -30
          },
          interactions: {
            moving: 'mouseMove',
            zooming: 'mouseWheel'
          },
          sources: sources
        };
      },

      getMapSample2: function() {
        var sources = this.getSourcesSample2();
        return {
          id: '2',
          name: 'US unemployment',
          type: 'd3js',
          projection: 'orthographic',
          //projection: 'mercator',
          scale: 420,
          center: {
            lon: 102,
            lat: -47
          },
          interactions: {
            moving: 'mouseMove',
            zooming: 'mouseWheel'
          },
          sources: sources
        };
      },

      getMapSample3: function() {
        var sources = this.getSourcesSample2();
        return {
          id: '3',
          name: 'US unemployment (1)',
          type: 'd3js',
          projection: 'orthographic',
          //projection: 'mercator',
          scale: 420,
          center: {
            lon: 102,
            lat: -47
          },
          interactions: {
            moving: 'mouseMove',
            zooming: 'mouseWheel'
          },
          sources: sources
        };
      },

      getLayerSamples: function() {
        var layers = [];
        var layers1 = this.getLayersSample1();
        _.forEach(layers1, function(layer) {
          layers.push(layer);
        });
        var layers2 = this.getLayersSample2();
        _.forEach(layers2, function(layer) {
          layers.push(layer);
        });
        var layers3 = this.getLayersSample3();
        _.forEach(layers3, function(layer) {
          layers.push(layer);
        });
        return layers;
      },

      getLayersSample1: function() {
        return [
          // Map #1
          // Graticule
          {
            id: 'graticuleLayer',
            type: 'graticule',
            rank: 1,
            name: 'Graticule',
            applied: true,
            visible: true,
            maps: [ '1' ],
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
                strokeWidth: '3px'
              },
              lines: {
                stroke: '#777',
                strokeWidth: '.5px',
                strokeOpacity: '.5'
              }
            }
          },

          // World layer
          {
            id: 'worldLayer',
            type: 'geodata',
            rank: 2,
            name: 'World',
            applied: true,
            visible: true,
            maps: [ '1' ],
            data: {
              url: '"http://localhost:9000/scripts/json/continent.json"',
              rootObject: 'countries',
              type: 'topojson',
              source: 'continents-source',
              content: [],
              loaded: false
            },
            display: {
              fill: {
                categorical: {
                  name: 'category20b',
                  value: 'i'
                }//,
                //value: 'd.id === 840 || d.id === 250 ? "#ff0000" : "#000000"'*/
              },
              bounds: {
                applyIf: ''
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.properties.name',
              },
              subMap: {
                layers: [
                  'cities-country',
                  'meteorites-country'
                ],
                variables: [
                  'bounds', 'shape'
                ],
                legend: {
                  label: 'shape.properties.name'
                }
              }
            },
            styles: {
              background: {
                fill: '#ff0000'
              },
              lines: {
                stroke: '#fff',
                strokeWidth: '1px',
                strokeOpacity: '1'
              }
            },
            behavior: {
              events: {
                click: [
                  {
                    display: 'subMap'
                  }
                ],
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
              }
              //zoomBoundingBox: {
              //  display: 'click'
                //display: 'mouseOver',
                //hide: 'mouseOut'
              //},
              //subMap: {
              //  display: 'click'
              //},
              //tooltip: {
                //display: 'click'
              //  display: 'mouseOver',
              //  hide: 'mouseOut'
              //}
            }
          },

          // Main meteorites
          {
            id: 'meteorites',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '1' ],
            data: {
              url: '"http://localhost:9000/scripts/json/Meteorite_Landings.csv"',
              type: 'csv',
              source: 'meteorites-source',
              content: [],
              loaded: false,
              id: 'name',
              where: 'd.mass > 10000',
              order: {
                field: 'mass',
                ascending: false
              }
            },
            name: 'Meteorites',
            display: {
              shape: {
                type: 'circle',
                radius: 'd.mass / 5000000',
                origin: '[ d.reclong, d.reclat ]',
                opacity: 0.75,
                threshold: {
                  paletteCode: 'YlOrRd',
                  paletteReverse: false,
                  values: [ 1800, 1900, 1950, 2000, 2015 ],
                  colors: [ '#ffffb2', '#fed976', '#feb24c',
                            '#fd8d3c', '#f03b20', '#bd0026' ]
                },
                value: 'parseDate(d.year).getFullYear()',
                //label: {
                //  text: 'd.name',
                //  position: { x: 5, y: 5 }
                //}
              },
              legend: {
                enabled: true,
                label: 'd'
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.name+"<br/>Year: "+parseDate(d.year).getFullYear()+"<br/>Mass: "+d.mass/1000+" kg"'
              }
            },
            behavior: {
              events: {
                click: [
                  {
                    display: 'tooltip'
                    //display: 'mouseOver',
                    //hide: 'mouseOut'
                  }
                ]
              }
            },
            applied: true,
            visible: true
          },

          // Meteorites per area
          {
            id: 'meteorites-country',
            type: 'data',
            mode: 'objects',
            rank: 7,
            maps: [ '1' ],
            data: {
              url: '"http://localhost:9000/scripts/json/Meteorite_Landings.csv"',
              type: 'csv',
              source: 'meteorites-source',
              content: [],
              loaded: false,
              id: 'name',
              where: 'd.mass < 100000 && isInBounds([d.reclong, d.reclat], bounds)',
              order: {
                field: 'mass',
                ascending: false
              }
            },
            name: 'Meteorites (Country)',
            display: {
              shape: {
                type: 'circle',
                radius: 'd.mass / 50000',
                origin: '[ d.reclong, d.reclat ]',
                opacity: 0.75,
                threshold: {
                  paletteCode: 'YlOrRd',
                  paletteReverse: false,
                  values: [ 1800, 1900, 1950, 2000, 2015 ],
                  colors: [ '#ffffb2', '#fed976', '#feb24c',
                            '#fd8d3c', '#f03b20', '#bd0026' ]
                },
                value: 'parseDate(d.year).getFullYear()',
              },
              legend: {
                enabled: true,
                label: 'd'
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.name+"<br/>Year: "+parseDate(d.year).getFullYear()+"<br/>Mass: "+d.mass/1000+" kg"'
              }
            },
            behavior: {
              animation: {
                value: 'parseDate(d.year).getFullYear()',
                startValue: 1950,
                ascending: true,
                interval: 500,
                showAllAtEnd: true,
                label: '"Year: "+d'
              },
              events: {
                click: [
                  {
                    display: 'tooltip'
                    //display: 'mouseOver',
                    //hide: 'mouseOut'
                  }
                ]
              }
            },
            applied: false,
            visible: false
          },

          // Cities
          {
            id: 'cities-country',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '1' ],
            data: {
              inline: '[{name: "Paris", lat: 48.50, lon: 2.20 }]',
              content: [],
              loaded: false,
              id: 'name',
              where: 'isInBounds([d.lon, d.lat], bounds)'
              //,
              //where: 'd.mass < 100000 && isInBounds([d.reclong, d.reclat], bounds)',
              //order: {
              //  field: 'mass',
              //  ascending: false
              //}
            },
            name: 'Cities (Country)',
            display: {
              shape: {
                type: 'circle',
                radius: '.2',
                origin: '[ d.lon, d.lat ]',
                opacity: 0.75,
                color: 'black',
                label: {
                  text: 'd.name',
                  position: { x: 5, y: 5 }
                }
              }
            },
            applied: false,
            visible: false
          },
          {
            id: 'images',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '1' ],
            data: {
              inline: '[{name: "Paris", lat: 48.50, lon: 2.20 }]',
              content: [],
              loaded: false,
              id: 'name'
              //where: 'isInBounds([d.lon, d.lat], bounds)'
              //,
              //where: 'd.mass < 100000 && isInBounds([d.reclong, d.reclat], bounds)',
              //order: {
              //  field: 'mass',
              //  ascending: false
              //}
            },
            name: 'Cities (Country)',
            display: {
              shape: {
                type: 'image',
                radius: '.2',
                origin: '[ d.lon, d.lat ]',
                opacity: 0.75,
                color: 'black',
                label: {
                  text: 'd.name',
                  position: { x: 5, y: 5 }
                }
              }
            },
            applied: true,
            visible: true
          },
          // Test lines (inline)
          {
            id: 'test',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '1' ],
            data: {
              inline: '[{ points: [ {lon: -74.007124, lat: 40.71455}, {lon: -118.245323, lat: 34.05349}, { lon: -92.888759, lat: 45.37399} ] }] ',
            },
            name: 'Test line',
            display: {
              shape: {
                type: 'line',
                value: 'd.points',
                pointValue: '[d.lon, d.lat]'
              }
            },
            styles: {
              lines: {
                stroke: '#f00',
                strokeWidth: '1px'
              }
            },
            applied: true,
            visible: true
          },
          {
            id: 'race',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '1' ],
            data: {
              url: '"http://localhost:9000/scripts/json/M50_08.json"',
              type: 'json',
              source: 'meteorites-source',
              formatDataAsArray: true,
              content: [],
              loaded: false,
            },
            name: 'Race',
            display: {
              shape: {
                type: 'line',
                value: 'd',
                pointValue: '[d.lon_dec, d.lat_dec]'
              }
            },
            styles: {
              lines: {
                stroke: '#f00',
                strokeWidth: '1px'
              }
            },
            applied: true,
            visible: true
          }
        ];
      },

      getLayersSample2: function() {
        return [
          // Map #2
          {
            id: 'graticuleLayer2',
            type: 'graticule',
            rank: 1,
            name: 'Graticule',
            applied: true,
            visible: true,
            maps: [ '2' ],
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
                strokeWidth: '3px'
              },
              lines: {
                stroke: '#777',
                strokeWidth: '.5px',
                strokeOpacity: '.5'
              }
            }
          },
          {
            id: 'usCounties',
            type: 'geodata',
            rank: 4,
            maps: [ '2' ],
            data: {
              source: 'us-counties',
              url: '"http://localhost:9000/scripts/json/us/us-counties.json"',
              properties: {
                url: '"http://localhost:9000/scripts/json/us/us-county-names2.csv"',
                type: 'csv'
              },
              rootObject: 'counties',
              type: 'topojson',
              content: [],
              loaded: false
            },
            display: {
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.properties.name+"<br/>State: "+d.properties.stateName+"("+d.properties.stateCode+")"',
              }
            },
            styles: {
              path: {
                fill: 'none',
                stroke: '#fff',
                strokeLinejoin: 'round',
                strokeLinecap: 'round'
              },
              d: {
                strokeWidth: '0.5px'
              }
            },
            behavior: {
              events: {
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
              }
            },
            name: 'US counties',
            applied: true,
            visible: true
          },
          /*{
            id: 'usLayer2',
            type: 'geodata',
            rank: 5,
            maps: [ '2' ],
            data: {
              url: '"http://localhost:9000/scripts/json/us-light.json"',
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
                strokeLinejoin: 'round',
                strokeLinecap: 'round'
              },
              d: {
                strokeWidth: '1.5px'
              }
            },
            applyOn: 'layers',
            name: 'US states',
            applied: true,
            visible: true
          },*/
          /*{
            id: 'layer12',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '2' ],
            data: {
              url: '"http://localhost:9000/scripts/json/test.csv"',
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
                color: 'yellow',
                opacity: 0.75
              }
            },
            applyOn: 'layers',
            applied: true,
            visible: true
          },*/
          /*{
            id: 'layer12a',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '2' ],
            data: {
              content: [],
              inline: '[{ rank:1, place: "New York", population: 8175133, lat: 40.71455, lon: -74.007124 }]',
              loaded: false
            },
            name: 'Cities (1)',
            display: {
              shape: {
                type: 'circle',
                radius: 'd.population / 3000000',
                origin: '[ d.lon, d.lat ]',
                color: 'yellow',
                opacity: 0.75
              }
            },
            applyOn: 'layers',
            applied: true,
            visible: true
          },*/
          /*{
            id: 'layer12b',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '2' ],
            data: {
              content: [],
              inline: '[{ rank:1, place: "New York", population: 8175133, lat: 40.71455, lon: -74.007124 }]',
              loaded: false
            },
            name: 'Cities (b)',
            display: {
              shape: {
                type: 'image',
                //radius: 'd.population / 3000000',
                origin: '[ d.lon, d.lat ]',
                //color: 'yellow',
                opacity: 0.75
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Value: "+value',
                event: 'click' // or over
              }
            },
            applyOn: 'layers',
            applied: true,
            visible: true
          },*/
          {
            id: 'layer22',
            type: 'data',
            mode: 'fill',
            rank: 7,
            maps: [ '2' ],
            data: {
              source: 'us-unemployment',
              url: '"http://localhost:9000/scripts/json/unemployment.tsv"',
              type: 'tsv',
              content: [],
              loaded: false
            },
            name: 'Unemployment rate',
            display: {
              fill: {
                threshold: {
                  paletteCode: 'Purples',
                  paletteReverse: false,
                  values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
                  colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
                            '#9e9ac8', '#756bb1', '#54278f' ]
                },
                value: 'd.rate'
              },
              legend: {
                enabled: true,
                label: '(d * 100) + " %"'
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Value: "+value',
              }
            },
            styles: {
              legend: {

              },
              tooltip: {

              }
            },
            behavior: {
              tooltip: {
                //display: 'click'
                display: 'mouseOver',
                hide: 'mouseOut'
              }
            },
            applyOn: 'usCounties',
            applied: true,
            visible: true
          }
        ];
      },

      getLayersSample3: function() {
        return [
          // Map #2
          {
            id: 'graticuleLayer3',
            type: 'graticule',
            rank: 1,
            name: 'Graticule',
            applied: true,
            visible: true,
            maps: [ '3' ],
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
                strokeWidth: '3px'
              },
              lines: {
                stroke: '#777',
                strokeWidth: '.5px',
                strokeOpacity: '.5'
              }
            }
          },
          {
            id: 'usStates3',
            type: 'geodata',
            rank: 4,
            maps: [ '3' ],
            data: {
              source: 'us-counties',
              url: '"http://localhost:9000/scripts/json/us/us-counties.json"',
              properties: {
                url: '"http://localhost:9000/scripts/json/us/us-state-names1.csv"',
                type: 'csv'
              },
              rootObject: 'states',
              type: 'topojson',
              content: [],
              loaded: false
            },
            display: {
              fill: {
                categorical: {
                  name: 'category20b',
                  value: 'i'
                }//,
                //value: 'd.id === 840 || d.id === 250 ? "#ff0000" : "#000000"'*/
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.properties.name+" ("+d.properties.code+")"'
              },
              subMap: {
                layers: [
                  'usCounties3',
                  'layer223',
                  'usCities'
                ],
                variables: [
                  'bounds', 'shape'
                ],
                legend: {
                  label: 'shape.properties.name+" ("+shape.properties.code+")"'
                }
              }
            },
            styles: {
              path: {
                fill: 'none',
                stroke: '#fff',
                strokeLinejoin: 'round',
                strokeLinecap: 'round'
              },
              d: {
                strokeWidth: '0.5px'
              }
            },
            behavior: {
              events: {
                click: {
                  display: 'subMap'
                },
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
              }
            },
            name: 'US states',
            applied: true,
            visible: true
          },
          {
            id: 'usCounties3',
            type: 'geodata',
            rank: 4,
            maps: [ '3' ],
            data: {
              source: 'us-counties',
              url: '"http://localhost:9000/scripts/json/us/us-counties.json"',
              properties: {
                url: '"http://localhost:9000/scripts/json/us/us-county-names2.csv"',
                type: 'csv'
              },
              rootObject: 'counties',
              type: 'topojson',
              where: 'shape.properties.code === d.properties.stateCode',
              content: [],
              loaded: false
            },
            display: {
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: '"Name: "+d.properties.name+" ("+d.properties.stateCode+")"'
              }
            },
            styles: {
              path: {
                fill: 'none',
                stroke: '#fff',
                strokeLinejoin: 'round',
                strokeLinecap: 'round'
              },
              d: {
                strokeWidth: '0.5px'
              }
            },
            /*behavior: {
              events: {
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
              }
            },*/
            name: 'US counties',
            applied: false,
            visible: false
          },
          {
            id: 'layer223',
            type: 'data',
            mode: 'fill',
            rank: 7,
            maps: [ '3' ],
            data: {
              source: 'us-unemployment',
              url: '"http://localhost:9000/scripts/json/unemployment.tsv"',
              type: 'tsv',
              content: [],
              loaded: false
            },
            name: 'Unemployment rate',
            display: {
              fill: {
                threshold: {
                  paletteCode: 'Purples',
                  paletteReverse: false,
                  values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
                  colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
                            '#9e9ac8', '#756bb1', '#54278f' ]
                },
                value: 'd.rate'
              },
              legend: {
                enabled: true,
                label: '(d * 100) + " %"'
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: 'd.properties.name+" ("+d.properties.stateCode+")<br/>Rate: "+formatNumber(value*100, 2)+"%"',
              }
            },
            styles: {
              legend: {

              },
              tooltip: {

              }
            },
            behavior: {
              events: {
                /*click: {
                  display: 'tooltip'
                },*/
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
                  //display: 'mouseOver',
                  //hide: 'mouseOut'
              }
            },
            applyOn: 'usCounties3',
            applied: false,
            visible: false
          },
          {
            id: 'usCities',
            type: 'data',
            mode: 'objects',
            rank: 6,
            maps: [ '3' ],
            data: {
              url: '"http://localhost:9000/scripts/json/us/us-main-cities.csv"',
              type: 'csv',
              content: [],
              loaded: false,
              id: 'name',
              where: 'shape.properties.code === d.stateCode && isInBounds([d.lon, d.lat], bounds)'
              //,
              //where: 'd.mass < 100000 && isInBounds([d.reclong, d.reclat], bounds)',
              //order: {
              //  field: 'mass',
              //  ascending: false
              //}
            },
            name: 'Cities (Country)',
            display: {
              shape: {
                type: 'circle',
                radius: '.1',
                origin: '[ d.lon, d.lat ]',
                opacity: 0.75,
                color: 'gray'/*,
                label: {
                  text: 'd.name',
                  position: { x: 5, y: 5 }
                }*/
              },
              tooltip: {
                enabled: true,
                fromScale: 300,
                text: 'd.name',
              }
            },
            behavior: {
              events: {
                /*click: {
                  display: 'tooltip'
                },*/
                mouseover: {
                  display: 'tooltip'
                },
                mouseout: {
                  hide: 'tooltip'
                }
                  //display: 'mouseOver',
                  //hide: 'mouseOut'
              }
            },
            applied: false,
            visible: false
          },
        ];
      },

      getSourceSamples: function() {
        var sources = [];
        var sources1 = this.getSourcesSample1();
        _.forEach(sources1, function(source) {
          sources.push(source);
        });
        var sources2 = this.getSourcesSample2();
        _.forEach(sources2, function(source) {
          sources.push(source);
        });
        return sources;
      },

      getSourcesSample1: function() {
        return [
          // List of meteorites
          {
            id: 'meteorites-source',
            name: 'List of meteorites',
            type: 'data',
            url: 'http://localhost:9000/scripts/json/Meteorite_Landings.csv',
            dataType: 'csv',
            structure: '[\n  \"name\",\n  \"id\",\n  \"nametype\",\n  \"recclass\",\n  \"mass\",\n  \"fall\",\n  \"year\",\n  \"reclat\",\n  \"reclong\",\n  \"GeoLocation\"\n]',
            rowNumber: 45716,
            minMax: '{\n  "id": [\n    "1",\n    "57458"\n  ],\n  "mass": [\n    "0.5",\n    "60000000"\n  ],\n  "year": [\n    "01/01/1880 12:00:00 AM",\n    "12/24/1399 12:00:00 AM"\n  ],\n  "reclat": [\n    "-87.366670",\n    "81.166670"\n  ],\n  "reclong": [\n    "-165.116670",\n    "354.473330"\n  ]\n}',
            sample: '[\n  {\n    \"name\": \"Aachen\",\n    \"id\": \"1\",\n    \"nametype\": \"Valid\",\n    \"recclass\": \"L5\",\n    \"mass\": \"21\",\n    \"fall\": \"Fell\",\n    \"year\": \"01/01/1880 12:00:00 AM\",\n    \"reclat\": \"50.775000\",\n    \"reclong\": \"6.083330\",\n    \"GeoLocation\": \"(50.775000, 6.083330)\"\n  },\n  {\n    \"name\": \"Aarhus\",\n    \"id\": \"2\",\n    \"nametype\": \"Valid\",\n    \"recclass\": \"H6\",\n    \"mass\": \"720\",\n    \"fall\": \"Fell\",\n    \"year\": \"01/01/1951 12:00:00 AM\",\n    \"reclat\": \"56.183330\",\n    \"reclong\": \"10.233330\",\n    \"GeoLocation\": \"(56.183330, 10.233330)\"\n  },\n  {\n    \"name\": \"Abee\",\n    \"id\": \"6\",\n    \"nametype\": \"Valid\",\n    \"recclass\": \"EH4\",\n    \"mass\": \"107000\",\n    \"fall\": \"Fell\",\n    \"year\": \"01/01/1952 12:00:00 AM\",\n    \"reclat\": \"54.216670\",\n    \"reclong\": \"-113.000000\",\n    \"GeoLocation\": \"(54.216670, -113.000000)\"\n  },\n  {\n    \"name\": \"Acapulco\",\n    \"id\": \"10\",\n    \"nametype\": \"Valid\",\n    \"recclass\": \"Acapulcoite\",\n    \"mass\": \"1914\",\n    \"fall\": \"Fell\",\n    \"year\": \"01/01/1976 12:00:00 AM\",\n    \"reclat\": \"16.883330\",\n    \"reclong\": \"-99.900000\",\n    \"GeoLocation\": \"(16.883330, -99.900000)\"\n  },\n  {\n    \"name\": \"Achiras\",\n    \"id\": \"370\",\n    \"nametype\": \"Valid\",\n    \"recclass\": \"L6\",\n    \"mass\": \"780\",\n    \"fall\": \"Fell\",\n    \"year\": \"01/01/1902 12:00:00 AM\",\n    \"reclat\": \"-33.166670\",\n    \"reclong\": \"-64.950000\",\n    \"GeoLocation\": \"(-33.166670, -64.950000)\"\n  }\n]'
          },
          // Contient map
          {
            id: 'continents-source',
            name: 'Map of countries',
            type: 'map',
            url: 'http://localhost:9000/scripts/json/continent.json',
            dataType: 'json',
            sample: '{\n  \"type\": \"Topology\",\n  \"transform\": {\n    \"scale\": [\n      0.03600360036003601,\n      0.017366249624962495\n    ],\n    \"translate\": [\n      -180,\n      -90\n    ]\n  },\n  \"objects\": {\n    \"land\": {\n      \"type\": \"MultiPolygon\",\n      \"arcs\": []\n    },\n    \"countries\": {\n      \"type\": \"GeometryCollection\",\n      \"geometries\": [\n        {\n          \"type\": \"Polygon\",\n          \"id\": 4,\n          \"arcs\": [],\n          \"properties\": {\n            \"name\": \"Afghanistan\",\n            \"type\": \"country\",\n            \"capital\": \"Kabul\",\n            \"borders\": \"Surrounding Countries:  China, Iran, Pakistan, Tajikistan, Turkmenistan, Uzbekistan\",\n            \"continent\": \"Asia\"\n          }\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"id\": 24,\n          \"arcs\": [],\n          \"properties\": {\n            \"name\": \"Angola\",\n            \"type\": \"country\",\n            \"capital\": \"Luanda\",\n            \"borders\": \"Surrounding Countries:  Democratic Republic of the Congo, Republic of the Congo, Namibia, Zambia\",\n            \"continent\": \"Africa\"\n          }\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 8,\n          \"arcs\": [],\n          \"properties\": {\n            \"name\": \"Albania\",\n            \"type\": \"country\",\n            \"capital\": \"Tirana\",\n            \"continent\": \"Europe\"\n          }\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 784,\n          \"arcs\": [],\n          \"properties\": {\n            \"name\": \"United Arab Emirates\",\n            \"type\": \"country\",\n            \"capital\": \"Abu Dhabi\",\n            \"continent\": \"Asia\"\n          }\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"id\": 32,\n          \"arcs\": [],\n          \"properties\": {\n            \"name\": \"Argentina\",\n            \"type\": \"country\",\n            \"capital\": \"Buenos Aires\",\n            \"borders\": \"Surrounding Countries:  Bolivia, Brazil, Chile, Paraguay, Uruguay\",\n            \"continent\": \"South America\"\n          }\n        }\n      ]\n    }\n  },\n  \"arcs\": []\n}'
          }
        ];
      },

      getSourcesSample2: function() {
        return [
          // US counties
          {
            id: 'us-counties',
            name: 'US counties',
            type: 'map',
            url: 'http://localhost:9000/scripts/json/us-counties.json',
            dataType: 'json',
            sample: '{\n  \"type\": \"Topology\",\n  \"objects\": {\n    \"counties\": {\n      \"type\": \"GeometryCollection\",\n      \"bbox\": [\n        -179.1473399999999,\n        17.67439566600018,\n        179.7784800000003,\n        71.38921046500008\n      ],\n      \"geometries\": [\n        {\n          \"type\": \"MultiPolygon\",\n          \"id\": 53073,\n          \"arcs\": []\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 30105,\n          \"arcs\": []\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 30029,\n          \"arcs\": []\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 16021,\n          \"arcs\": []\n        },\n        {\n          \"type\": \"Polygon\",\n          \"id\": 30071,\n          \"arcs\": []\n        }\n      ]\n    },\n    \"states\": {\n      \"type\": \"GeometryCollection\",\n      \"geometries\": [\n        {\n          \"type\": \"MultiPolygon\",\n          \"arcs\": [],\n          \"id\": 53\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"arcs\": [],\n          \"id\": 30\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"arcs\": [],\n          \"id\": 16\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"arcs\": [],\n          \"id\": 38\n        },\n        {\n          \"type\": \"MultiPolygon\",\n          \"arcs\": [],\n          \"id\": 27\n        }\n      ]\n    },\n    \"land\": {\n      \"type\": \"MultiPolygon\",\n      \"arcs\": []\n    }\n  },\n  \"arcs\": [],\n  \"transform\": {\n    \"scale\": [\n      0.0003589261789261791,\n      0.0000537148685138684\n    ],\n    \"translate\": [\n      -179.1473399999999,\n      17.67439566600018\n    ]\n  }\n}'
          },
          // US unemployment
          {
            id: 'us-unemployment',
            name: 'US unemployment',
            type: 'data',
            url: 'http://localhost:9000/scripts/json/unemployment.tsv',
            dataType: 'tsv',
            structure: '[\n  \"id\",\n  \"rate\"\n]',
            rowNumber: 3218,
            minMax: '{\n  "id": [\n    "1001",\n    "72153"\n  ],\n  "rate": [\n    ".012",\n    ".301"\n  ]\n}',
            sample: '[\n  {\n    \"id\": \"1001\",\n    \"rate\": \".097\"\n  },\n  {\n    \"id\": \"1003\",\n    \"rate\": \".091\"\n  },\n  {\n    \"id\": \"1005\",\n    \"rate\": \".134\"\n  },\n  {\n    \"id\": \"1007\",\n    \"rate\": \".121\"\n  },\n  {\n    \"id\": \"1009\",\n    \"rate\": \".099\"\n  }\n]'
          }
        ];
      }
    };
  });