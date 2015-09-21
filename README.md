# ItemsAPI 
The goal of this project is creating advanced search application without spending time for backend. You just provide configuration and data and your backend is ready to go. You don't need to be node.js developer to use it.

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
- field types like standard (int, string, etc) and custom (image, rating, geo, tags)

## Getting started
To find out more information about ItemsAPI please go to the official page - <a href="https://www.itemsapi.com/" target="_blank">Go there</a>.

## Requirement
- node.js, npm
- java8
- elasticsearch > 1.4

## CLI
You can import huge json collection within one command. i.e.

`node cli.js --import --collection=movie --file ./data/documents.json`

## Demo
- it is in progress


## Plan of 21 September 2015
- Importing big json files and make internal indexing (finished)
- Full text searching with pagination (finished)
- Create simple documentation (finished but requires update https://www.itemsapi.com/docs/start/overview.html)
- Make aggregations i.e. tags count, categories count, distance calculations, date range (in progress)
- Sorting by field and by scores
- Make schema configuration higher level than elasticsearch and easy for integration with external systems like angular.js
- "Similar to" functionality. Simple recommendation system.
- Authentication and user privileges
- Autocomplete

## Long term plans
- people who like this also like (elasticsearch or neo4j) 

## Contributions
If you have idea how to make this ItemsAPI better, feel free to join!

## Testing
`grunt test`
