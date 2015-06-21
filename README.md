# ItemsAPI 
## Description
The goal of this project is creating advanced search application without spending a lot of time for backend. You just provide configuration and data and your backend is ready to go. You don't need to be node.js developer to use it.

With ItemsAPI you can create very easily:
- various catalogs (restaurants, gyms, doctors, foods)
- autocomplete and simple recommendation system for ecommerce
- songs and movies recommendation

ItemsAPI is restful backend best for:
- javascript frameworks (angular.js, meteor.js, react.js)
- mobile (ios, android)
 
This backend will offer powerful functionality like:
- full text searching
- autocomplete
- simple recommendation
- geo searching
- field types like standard (int, string, etc) and custom (image, rating, geo)

## Requirement
- node.js, npm
- java8
- elasticsearch > 1.4

## CLI
You can import huge json collection within one command. i.e.

`node cli.js --import --collection=movie --file ./data/documents.json`
## Installation
`npm install`
## Plans
- Improve searching especially make sorting more flexible.
- Improve schema configuration. Make it simplier and higher level than elastic search.
- Autocomplete
- Create simple documentation
- Add "facets" https://en.wikipedia.org/wiki/Faceted_search functionality. This is what makes it better than any other databases. 
- Add "similar to" functionality.
- Add "image" field type in schema which allows for adding images out of the box.
- Add "geo" field type in schema which will allow for sorting documents by geolocalisation.

## Contributions
If you have idea how to make this ItemsAPI better, feel free to join!

## Testing
`grunt test`
