exports.data = [
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
                click: {
                  display: 'tooltip'
                  //display: 'mouseOver',
                  //hide: 'mouseOut'
                }
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
                click: {
                  display: 'tooltip'
                  //display: 'mouseOver',
                  //hide: 'mouseOut'
                }
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