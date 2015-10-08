# Map DSL

This part of the DSL tackles maps.

## Maps

A map defines general hints regarding its name and its type but also
things specifying the way to display it and to interact with.

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

## Layers

A map contains a set of layers defining elements to display.

```
{
  (...)
  layers: [
    {
      id: 'graticuleLayer',
      type: 'graticule',
      (...)
    },
    (...)
  ],
  (...)
}
```


## Sources

A map imports a set of sources that layers will use. This part is important in the UI
since it will be used to visually validate expressions used when defining layers.

```
  "sources": [
    {
      "id": "us-counties",
      "name": "US counties",
      "type": "map",
      "url": "http://localhost:9000/scripts/json/us-counties.json",
      "dataType": "json",
      "sample": "{\n  \"type\": \"Topology\",\n  \"objects\": {\n    \"counties\": ... ]\n  }\n}"
    },
    {
      "id": "us-unemployment",
      "name": "US unemployment",
      "type": "data",
      "url": "http://localhost:9000/scripts/json/unemployment.tsv",
      "dataType": "tsv",
      "structure": "[\n  \"id\",\n  \"rate\"\n]",
      "rowNumber": 3218,
      "minMax": "{\n  \"id\": [\n    \"1001\",\n    \"72153\"\n  ],\n  \"rate\": [\n    \".012\",\n    \".301\"\n  ]\n}",
      "sample": "[\n  {\n    \"id\": \"1001\",\n    \"rate\": \".097\"\n  },\n ... }\n]"
    }
  ]
```
