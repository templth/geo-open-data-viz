

## Topojson commandline

https://github.com/mbostock/topojson/wiki/Command-Line-Reference#external-properties

```
./node_modules/topojson/bin/topojson -o us-counties-all.json -e samples/sources/data/us-county-names2.csv --id-property=+id -p name=+name samples/sources/maps/us-counties.json
```