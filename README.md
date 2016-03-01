# ItemsAPI 

<a href="https://www.itemsapi.com" target="_blank">ItemsAPI</a> is restful search backend written in express.js / node.js and elasticsearch.

The goal of this project is creating advanced search application without spending time for backend. You just provide configuration and data and your backend is ready to go. You don't need to be node.js developer to use it.

With ItemsAPI you can create very easily:
- various catalogs (restaurants, gyms, doctors, foods)
- autocomplete and simple recommendation system for ecommerce
- songs and movies recommendation

This backend offers powerful functionality like:
- full text searching
- generating facets / aggregations out of the box
- managing schema and indexes from command line or by API
- geo searching

## Getting started

Starting ItemsAPI server:
```js
var itemsapi = require('itemsapi');

itemsapi.init({
  server: {
    port: 5000
  },
  collections: {
    db: 'json',
    filename:  './collections.json'
  },
  elasticsearch: {
    host: 'localhost:9200'
  }
})

itemsapi.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;
  itemsapi.get('logger').info('ItemsAPI backend started on http://%s:%s', host, port)
});
```

Searching items in your current `movie` collection 
```js
var ItemsAPI = require('itemsapi-node');
var client = new ItemsAPI('http://localhost:5000/api/v1', 'movie');

var facets = {
  tags:['drama', 'war']
};

client.search({
  sort: 'most_votes',
  query: '',
  page: 1,
  aggs: JSON.stringify(facets),
  per_page: 12
}).then(function(res) {
  console.log((res));
})
```

Showing similar items (collaborative filtering):
```js
client.similar('item-id', {
  fields: ['tags']
}).then(function(res) {
  console.log((res));
})
```

(more information about client API - https://github.com/itemsapi/itemsapi-node)


<a href="https://www.itemsapi.com/docs/getting-started" target="_blank">Installation</a>

<a href="https://www.itemsapi.com" target="_blank">ItemsAPI website</a>

<a target="_blank" href="https://heroku.com/deploy?template=https://github.com/itemsapi/itemsapi"><img src="https://camo.githubusercontent.com/c0824806f5221ebb7d25e559568582dd39dd1170/68747470733a2f2f7777772e6865726f6b7563646e2e636f6d2f6465706c6f792f627574746f6e2e706e67" alt="Deploy" data-canonical-src="https://www.herokucdn.com/deploy/button.png"></a>

## Documentation

To find out more go to the - <a href="https://itemsapi.readme.io" target="_blank">official documentation</a>.

## Requirement
- node.js, npm
- java8
- elasticsearch > 1.4

## CLI
You can import huge json collection within one command. i.e.

`node cli.js --import --collection=movie --file ./data/documents.json`

## Demo
- go to see <a href="http://app.itemsapi.com/" target="_blank">many different collections i.e. movies, quotes, libraries, etc</a> 

Example collections:
- [Movies](http://app.itemsapi.com/documents/name/movie "Movies")
- [Cities](http://app.itemsapi.com/documents/name/city "Cities")
- [NPM libraries](http://app.itemsapi.com/documents/name/npm "NPM libraries")

## Community
- <a href="https://twitter.com/itemsapi" target="_blank">Twitter @itemsapi</a>
- ask directly <a href="https://github.com/cigolpl" target="_blank">@cigolpl</a>


## Tutorials
- https://www.itemsapi.com/docs/tutorials/how-to-create-search-backend-for-movies

## Contributions
If you like ItemsAPI and want to help you can:
- ask for new feature
- make code review and suggest improvements
- share your ideas
- write clients for frameworks (angular, node.js, ror, php)

## Testing
`npm test`

## Long term inspiration
- http://expressjs.com/resources/middleware.html (expressjs for simplicity)
- http://neo4j.com/docs/stable/cypher-cookbook-similar-favorites.html (recommendation system)
- https://www.algolia.com/ (very fast hosted search engine)

## License
ItemsAPI is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.
