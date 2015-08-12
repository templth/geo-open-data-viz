# Map DSL

TODO: intro

## Maps

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

```
```
