#!/bin/sh

# Generate the schema of application
echo "Generating entities schema"
node tools/schema-entities-generator.js

# Create cells
echo "Creating cells"
ES_ID="$(node tools/apispark.js create entitystore MapES)"
FS_ID="$(node tools/apispark.js create filestore MapFS)"
WA_ID="$(node tools/apispark.js create fullwebapi MapAPI)"

# Display hints
echo "Created web api with id $WA_ID"
echo "Created entity store with id $ES_ID"
echo "Created file store with id $FS_ID"

# Import schema in entity store
echo "Importing entities schema"
node tools/apispark.js entities $ES_ID -i schema/entities-schema.json

# Create folders in file store
echo "Creating folders"
node tools/apispark.js create folder html -c $FS_ID
node tools/apispark.js create folder js -c $FS_ID
node tools/apispark.js create folder css -c $FS_ID

# Link web api with stores and generate its structure
echo "Linking cells together"
node tools/apispark.js link $WA_ID $ES_ID -s
node tools/apispark.js link $WA_ID $FS_ID -s

# Deploy all cells
echo "Deploying cells"
node tools/apispark.js deploy entitystore $ES_ID
node tools/apispark.js deploy filestore $FS_ID
node tools/apispark.js deploy fullwebapi $WA_ID

# Import sample data
echo "Importing sample data"
node tools/apispark.js data $WA_ID dataSources -i schema/sample-dataSource.json
node tools/apispark.js data $WA_ID mapSources -i schema/sample-mapSource.json
node tools/apispark.js data $WA_ID maps -i schema/sample-map.json