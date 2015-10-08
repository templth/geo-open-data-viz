# Source DSL

This part of the DSL tackles sources. This defines the structure of data used within
map layers. It's useful then to know source structures and sample datasets. In the
Web UI, the expression dialog leverages such data to hep building expressions.

## Map sources

This kind of sources provides general informations such as the URL and a sample of data,
actually the first five elements within the `objects` element:

```
{
  "id": "us-counties",
  "name": "US counties",
  "type": "map",
  "url": "https://mapapi.apispark.net/data/us-counties.json",
  "dataType": "json",
  "sample": "{
    \"type\": \"Topology\",
    \"objects\": {
      \"counties\": {
        \"type\": \"GeometryCollection\",
        \"bbox\": [
          -179.1473399999999,
          17.67439566600018,
          179.7784800000003,
          71.38921046500008
        ],
        \"geometries\": [
          {
            \"type\": \"MultiPolygon\",
            \"id\": 53073,
            \"arcs\": []
          },
          {
            \"type\": \"Polygon\",
            \"id\": 30105,
            \"arcs\": []
          },
          {
            \"type\": \"Polygon\",
            \"id\": 30029,
            \"arcs\": []
          },
          {
            \"type\": \"Polygon\",
            \"id\": 16021,
            \"arcs\": []
          },
          {
            \"type\": \"Polygon\",
            \"id\": 30071,
            \"arcs\": []
          }
        ]
      },
      \"states\": {
        \"type\": \"GeometryCollection\",
        \"geometries\": [
          {
            \"type\": \"MultiPolygon\",
            \"arcs\": [],
            \"id\": 53\n
          },
          {
            \"type\": \"MultiPolygon\",
            \"arcs\": [],
            \"id\": 30
          },
          {
            \"type\": \"MultiPolygon\",
            \"arcs\": [],
            \"id\": 16
          },
          {
            \"type\": \"MultiPolygon\",
            \"arcs\": [],
            \"id\": 38
          },
          {
            \"type\": \"MultiPolygon\",
            \"arcs\": [],
            \"id\": 27
          }
        ]
      },
      \"land\": {
        \"type\": \"MultiPolygon\",
        \"arcs\": []
      }
    },
    \"arcs\": [],
    \"transform\": {
      \"scale\": [
        0.0003589261789261791,
        0.0000537148685138684
      ],
      \"translate\": [
        -179.1473399999999,
        17.67439566600018
      ]
    }
  }"
}
```

You can notice that for each element the attribute `arcs` was empty not to have too much data.

## Data sources

This kind of sources provides general informations such as the URL and the type (JSON, CSV, TSV, ...).

It also gives interesting informations that are useful when creating expressions at the layer level: the
structure, the number of rows, the minimum and maximum values for columns of type number and a sample. The
latter corresponds to the first five rows.

Here is a sample of such sources:

```
{
  "id": "us-unemployment",
  "name": "US unemployment",
  "type": "data",
  "url": "https://mapapi.apispark.net/data/unemployment.tsv",
  "dataType": "tsv",
  "structure": "[
    \"id\",
    \"rate\"
  ]",
  "rowNumber": 3218,
  "minMax": "{
    \"id\": [
      \"1001\",
      \"72153\"
    ],
    \"rate\": [
      \".012\",
      \".301\"
    ]
  }",
  "sample": "[
    {
      \"id\": \"1001\",
      \"rate\": \".097\"
    },
    {
      \"id\": \"1003\",
      \"rate\": \".091\"
    },
    {
      \"id\": \"1005\",
      \"rate\": \".134\"
    },
    {
      \"id\": \"1007\",
      \"rate\": \".121\"
    },
    {
      \"id\": \"1009\",
      \"rate\": \".099\"
    }
  ]"
}
```