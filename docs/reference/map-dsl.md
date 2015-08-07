# Map DSL

TODO: intro

## Maps

## Layers

### Layer configuration parts

#### Generic informations

Some hints allow to configure the map itself, initial display and
its behavior.

// TODO: add a table

Here is a sample configuration of these hints:

```
{
  id: '1',
  name: 'World',
  type: 'd3js',
  projection: 'orthographic',
  scale: 420,
  center: {
    lon: 60,
    lat: -30
  },
  interactions: {
    moving: 'mouseMove',
    zooming: 'mouseWheel'
  },
  (...)
}
```

#### Display configuration

Fill

```
{
  (...)
  display: {
    fill: {
      threshold: {
        values: [ 0.02, 0.04, 0.06, 0.08, 0.10 ],
        colors: [ '#f2f0f7', '#dadaeb', '#bcbddc',
                  '#9e9ac8', '#756bb1', '#54278f' ]
      },
      value: 'd.rate'
    }
  }
  (...)
}
```

Shape

```
{
  (...)
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
      value: 'parseDate(d.year).getFullYear()'
    }
  }
  (...)
}
```

In most cases, we use a set of colors (threshold or cholore) to display data.
This really makes sense to define a legend in such cases to tell which values
correspond to color.

```
{
  (...)
  display: {
    legend: {
      enabled: true,
      label: 'd'
    },
  }
  (...)
}
```

In most cases, we need some more details about areas or shapes. In this case,
having a tooltip is a good thing. In the case of tooltip, we need to configure
a behavior for the layer to tell when and how the tooltip will be displayed.

```
{
  (...)
  display: {
    tooltip: {
      enabled: true,
      fromScale: 300,
      text: '"Name: "+d.name+"<br/>Year: "+d.year+"<br/>Mass (g): "+d.mass',
    }
  }
  (...)
}
```


#### Data configuration

Most of layers rely on data. This can be either geo data that represent
shapes, lines... but also data sets that we need to apply on a map. Such data
sets are used to deduce geo data.

// TODO: add a table

Here is a sample configuration of data source:

```
{
  (...)
  data: {
    url: 'http://localhost:9000/scripts/json/Meteorite_Landings.csv',
    type: 'csv',
    source: 'meteoritesSource',
    id: 'name',
    where: 'd.mass > 100000',
    order: {
      field: 'mass',
      ascending: false
    }
  },
  (...)
}
```


Data used by the layer can be also defined inline using the attribute
`inline`. The corresponding value corresponds to a JSON object as string.
In the future, both strings and literal JSON objects will be supported.

Here is a sample configuration of the inline approach:

```
{
  (...)
  data: {
    inline: '[{ points: [ {lon: -74.007124, lat: 40.71455}, {lon: -118.245323, lat: 34.05349}, { lon: -92.888759, lat: 45.37399} ] }] '
  }
  (...)
}
```

#### Styles configuration

This section provides configuration regarding styles to apply
to parts of the layer. They are basically related to background,
lines and borders. But they can also apply to elements like
legends or tooltips.

Here is a sample configuration of styles for layers:

```
{
  (...)
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
  (...)
}
```

#### Behavior configuration

```
{
  (...)
  behavior: {
    zoomBoundingBox: {
      display: 'click'
      //display: 'mouseOver',
      //hide: 'mouseOut'
    }
  }
  (...)
}
```

```
{
  (...)
  behavior: {
    tooltip: {
      display: 'click'
      //display: 'mouseOver',
      //hide: 'mouseOut'
    }
  }
  (...)
}
```

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

### Geodata layer

```
{
  id: 'worldLayer',
  type: 'geodata',
  rank: 2,
  data: {
    url: 'http://localhost:9000/scripts/json/continent.json',
    rootObject: 'countries',
    type: 'topojson',
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
    zoomBoundingBox: {
      display: 'click'
      //display: 'mouseOver',
      //hide: 'mouseOut'
    }
  },
  applyOn: 'layers',
  name: 'World',
  applied: true,
  visible: true
}
```

### Fill layer

```
{
  id: 'layer2',
  type: 'data',
  mode: 'fill',
  rank: 7,
  data: {
    url: 'http://(...)/unemployment.tsv',
    type: 'tsv',
  },
  name: 'Unemployment rate',
  display: {
    fill: {
      threshold: {
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
  applyOn: 'usLayer',
  applied: true,
  visible: true
}
```

### Objects layer

```
{
  id: 'meteorites',
  type: 'data',
  mode: 'objects',
  rank: 6,
  data: {
    url: 'http://(...)/Meteorite_Landings.csv',
    type: 'csv',
    content: [],
    loaded: false,
    id: 'name',
    where: 'd.mass < 50000',
    order: {
      field: 'mass',
      ascending: false
    }
  },
  name: 'Meteorites',
  display: {
    shape: {
      type: 'circle',
      radius: 'd.mass / 50000',
      origin: '[ d.reclong, d.reclat ]',
      opacity: 0.75,
      threshold: {
        values: [ 1800, 1900, 1950, 2000, 2015 ],
        colors: [ '#ffffb2', '#fed976', '#feb24c',
                  '#fd8d3c', '#f03b20', '#bd0026' ]
      },
      value: 'parseDate(d.year).getFullYear()'
    },
    legend: {
      enabled: true,
      label: 'd'
    },
    tooltip: {
      enabled: true,
      fromScale: 300,
      text: '"Name: "+d.name+"<br/>Year: "+d.year+"<br/>Mass (g): "+d.mass',
      event: 'click' // or over
    }
  },
  behavior: {
    tooltip: {
      display: 'click'
      //display: 'mouseOver',
      //hide: 'mouseOut'
    }
  },
  applyOn: 'layers',
  applied: true,
  visible: true
}
```

## Sources