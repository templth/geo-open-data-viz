
# Layer configuration parts

## Generic informations

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

## Display configuration

The display section of layers allows to configure a set of elements that will
be displayed on the map.

| Feature               | Description                                                  |
| --------------------- | -------------------------------------------------------------|
| [Geo data](#geo-data) |                                                              |
| [Fill](fill)          |                                                              |
| [Shapes](#shape)      |                                                              |
| [Colors](#colors)     |                                                              |
| [Legend](#legend)     |                                                              |
| [Tooltip](#tooltip)   |                                                              |

### Geo data

TODO

### Fill

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

### Shape

Supported shapes

| Shape               | Description                                              |
| ------------------- | -------------------------------------------------------- |
| [Circle](#circle)   |                                                          |
| [Polygon](#polygon) |                                                          |
| [Line](#line)       |                                                          |

#### Circle

Here are the supported features for the circle shape:

| Feature | Value       | Example                 | Description                                       |
| ------- | ----------- | ----------------------- | ------------------------------------------------- |
| Origin  | [Expr](#expressions)        | `\[ d.reclong, d.reclat \]` | Corresponds to the point where circles are positionned. Corresponding expressions need to leverage attributes in the dataset to define the position. |
| Radius  | Val \| [Expr](#expressions) | `d.mass / 5000000` or `10`  | Corresponds to the radius of circles. It can be fixed or dependent of the attributes of the dataset. |
| Color   | Val \| [Expr](#expressions) |                         | Corresponds to the color of circles. It can be the same for all circles or or dependent of the attributes of the dataset. Strategies like threshold or choropleth are supported. |
| Opacity | Val         | `0.75`                    | Corresponds to the opacity of the elements. It's a value between `0` (transparent) and `1` (opaque) |

The following sample describes the configuration of circles located using the attributes
`reclong` (longitude) and `reclat` (latitude) with variable radius and color. Regarding
colors, the threshold approach is chosen. In this case, an attribute `value` must be
defined to select the color to display. The threshold approach can be transparently
updated to a choropleth one.

Here is a sample configuration of circles with variable radius and colors (threshold approach):

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

Here is a sample configuration of circles with variable radius but fixed color:

```
{
  (...)
  display: {
    shape: {
      type: 'circle',
      radius: 'd.mass / 5000000',
      origin: '[ d.reclong, d.reclat ]',
      opacity: 0.75,
      color: '#ff0000'
    }
  }
  (...)
}
```

Here is a sample configuration of circles with variable radius but conditional colors:

```
{
  (...)
  display: {
    shape: {
      type: 'circle',
      radius: 'd.mass / 5000000',
      origin: '[ d.reclong, d.reclat ]',
      opacity: 0.75,
      color: 'd.id === 240 ? #ff0000 : #000000'
    }
  }
  (...)
}
```

#### Polygon

TODO

```
{
  (...)
  display: {
    shape: {
      type: 'polygon',
      value: 'd.points',
      pointValue: '[d.lon, d.lat]'
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

Here is a sample configuration of polygons with variable radius but fixed color:

```
{
  (...)
  display: {
    shape: {
      type: 'polygon',
      value: 'd.points',
      pointValue: '[d.lon, d.lat]'
      color: '#ff0000'
    }
  }
  (...)
}
```

Here is a sample configuration of polygons with variable radius but conditional colors:

```
{
  (...)
  display: {
    shape: {
      type: 'polygon',
      value: 'd.points',
      pointValue: '[d.lon, d.lat]'
      color: 'd.id === 240 ? #ff0000 : #000000'
    }
  }
  (...)
}
```

#### Line

TODO

```
{
  (...)
  display: {
    shape: {
      type: 'line',
      value: 'd.points',
      pointValue: '[d.lon, d.lat]'
    }
  }
  (...)
}
```

### Colors

#### Fixed

TODO

#### Conditional

TODO

#### Threshold

TODO

### Legend

In most cases, we use a set of colors (threshold or choropleth) to display data.
This really makes sense to define a legend in such cases to tell which values
correspond to colors. In this case, we need to add a block `legend` within the `display`
one. its attribute `label` is an expression. The element `d` corresponds to the
current value of the element in the defined range.

```
{
  (...)
  display: {
    legend: {
      enabled: true,
      label: 'd'
    }
  }
  (...)
}
```

We can have more advanced expressions. Here is an expression for the attribute `label`
that displays pourcents.

```
{
  (...)
  display: {
    legend: {
      enabled: true,
      label: '(d * 100) + " %"'
    }
  }
  (...)
}
```

### Tooltip

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
      text: '"Name: "+d.name+"&lt;br/&gt;Year: "+d.year+"&lt;br/&gt;Mass (g): "+d.mass',
    }
  }
  (...)
}
```


## Data configuration

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

## Styles configuration

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

## Behavior configuration

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

# Layer kinds

The layers leverage some of elements described in section "Generic informations" to
configure themselves. Here are the list of supported layer kinds:

| Layer kind      | Description                              |
| --------------- | ---------------------------------------- |
| Graticule       |

Following sub sections describe the way to configure these layers.

## Graticule layer

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

## Geodata layer

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

## Fill layer

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

## Objects layer

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

# Layer variables

## Defining variables

The block `variables` allows to define the set of usable variables. Each element must
be an object with the possible following attributes:

| Attribute   | Required | Description |
| ----------- | -------- | ----------- |
| `name`      | yes      | The name of the attribute |
| `type`      | yes      | The type of the attribute. Supported types are primitive types (`string`, `integer`, `boolean`, `date`) but also `bounds` for the current display area, `object` for data objects and `geometry` for the current shape. |
| `default`   | no       | The default value |

Following code describes how to define variables for a layer:

```
{
  id: 'meteorites',
  type: 'data',
  (...)
  variables: [
    {
      name: 'mass',
      type: 'string',
      default: 100
    },
    {
      name: 'area',
      type: 'bounds'
    },
    {
      name: 'data',
      type: 'object'
    },
    {
      name: 'geometry',
      type: 'Geometry'
    }
  ]
  (...)
}
```

## Using variables

Variable values are gotten from the current context of the layer and / or the map.

```
{
  id: 'meteorites',
  type: 'data',
  (...)
  data: {
    (...)
    where: 'mass<{mass} & lon < {area.y}'
  }
  (...)
}
```

```
{
  id: 'meteorites',
  type: 'data',
  (...)
  data: {
    (...)
    where: 'name == {data.name}
  }
  (...)
}
```

## Defining a filtering box

```
{
  id: 'meteorites',
  type: 'data',
  (...)
  display: {
    (...)
    filtering: {
      fields: [
        {
          label: 'Name',
          variable: 'name'
        },
        (...)
      ]
    }
  }
  (...)
}
```

# Sub maps

TODO

```
{
  (...)
  display: {
    subMap: {
      layers: [
        'layer1',
        'layer2'
      ],
      variables: [
        bounds: 
      ]
    }
  },
  (...)
}
```

```
{
  (...)
  behavior: {
    subMap: {
      display: 'dblclick'
    }
  }
  (...)
}
```

# Expressions

Expressions allow to define objects from a particular context. This allows to configure
elements of maps like shapes and fill. Expressions are based on the ones from Angular and
follow the JavaScript syntax. 

See the following links for more details:

* [https://docs.angularjs.org/guide/expression](https://docs.angularjs.org/guide/expression)
* [http://teropa.info/blog/2014/03/23/angularjs-expressions-cheatsheet.html](http://teropa.info/blog/2014/03/23/angularjs-expressions-cheatsheet.html)

## Literal expressions

In the case of the application, expressions allow to create objects that be used to configure
map elements. For this reason, they must correspond to values.

Values can be built using literal syntax of JavaScript:

```
10
10.2
"a string"
{
  attr1: 10,
  attr2: "a string"
}
[ 10, 11, 12 ]
[ "s1", "s2", "s3"]
[
  {
    attr1: 1,
    attr2: "s1"
  },
  {
    attr1: 2,
    attr2: "s2"
  }
]
```

## Inline conditions

Inline conditions are also supported, as described below:

```
d.val === 2 ? "#ff0000" : "#000000"
```

## Expression context

| Element   | Description                                     |
| --------- | ----------------------------------------------- |
| d         | The current element of data                     |
| i         | In the case of list, the current index          |
| parseDate | Utility function to convert string to date      |

Here is a sample of use of the context within expressions:

```
d.mass / 5000000
[ d.reclong, d.reclat ]
parseDate(d.year).getFullYear()
```