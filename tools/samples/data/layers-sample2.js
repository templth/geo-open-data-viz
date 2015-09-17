exports.data = [
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