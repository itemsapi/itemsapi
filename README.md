# ItemsAPI 
## Description
Restful backend for angular.js, android, ios, node.js and symfony2 with powerful functionality like:
- full text searching
- autocomplete
- geo searching
- custom types

ItemsAPI is inspired mostly by symfony2 and node.js

## Requirement
`node.js installed`
`java7 or java8, elasticsearch > 1.4`
## CLI
You can import huge json collection within one command. i.e.

`node cli.js --import --collection=movie --file ./data/documents.json`
## Installation
`npm install`
## Plans
- Improve searching especially make sorting more flexible.
- Improve schema configuration. Make it simplier and higher level than elastic search.
- Autocomplete
- Add "facets" https://en.wikipedia.org/wiki/Faceted_search functionality. This is what makes it better than any other databases. 
- Add "similar to" functionality.
- Add "image" field type in schema which allows for adding images out of the box.
- Add "geo" field type in schema which will allow for sorting documents by geolocalisation.

## Contributions
If you have idea how to make this API better of fix some issues, feel free to join!
## Testing
`mocha tests/*`
