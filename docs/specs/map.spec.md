
## Map

TODO

## Layers

### Graticule layer

```
{
  id: 'graticuleLayer',
  type: 'graticule',
  rank: 1,
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
      strokeWidth: '3px'
    },
    lines: {
      stroke: '#777',
      strokeWidth: '.5px',
      strokeOpacity: '.5'
    }
  }
}
```

### Geo data

Simple:

```
{
  id: 'worldLayer',
  type: 'geodata',
  rank: 2,
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
}
```

With mesh

```
{
  id: 'usLayer2',
  type: 'geodata',
  rank: 5,
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
}
```

### Data layer (shape)

```
{
  id: 'layer1',
  type: 'data',
  mode: 'objects',
  rank: 6,
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
      color: 'yellow',
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
}
```

### Data layer (fill)

```
{
  id: 'layer2',
  type: 'data',
  mode: 'fill',
  rank: 7,
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
        colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
                  '#9e9ac8', '#756bb1', '#54278f' ]
      },
      value: 'd.rate',
    },
    legend: {
      enabled: true,
      label: '(d * 100) + " %"'
    },
    tooltip: {
      enabled: true,
      fromScale: 300,
      text: '"Value: "+value',
      event: 'click' // or over
    }
  },
  applyOn: 'usLayer',
  applied: true,
  visible: true
}
```

## Imported sources

TODO

## Interactions

TODO

## Behaviors

TODO

