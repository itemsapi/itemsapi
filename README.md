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
- showing similar items (based on collaborative filtering algorithm)
- generating nice urls for fields (permalinks) out of the box
- geo searching

## Requirement
- node.js
- java
- elasticsearch > 1.4 < 2.0 

## Getting started

Install itemsapi package

`$ npm install itemsapi --save`

Starting ItemsAPI server:

```js
var itemsapi = require('itemsapi');

itemsapi.init({
  server: {
    port: 5000
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

## Documentation

To find out more go to the - <a href="https://itemsapi.readme.io" target="_blank">official documentation</a>.

<a href="https://www.itemsapi.com" target="_blank">ItemsAPI website</a>

Deploy ItemsAPI server instantly to heroku:

<a target="_blank" href="https://heroku.com/deploy?template=https://github.com/itemsapi/itemsapi"><img src="https://camo.githubusercontent.com/c0824806f5221ebb7d25e559568582dd39dd1170/68747470733a2f2f7777772e6865726f6b7563646e2e636f6d2f6465706c6f792f627574746f6e2e706e67" alt="Deploy" data-canonical-src="https://www.herokucdn.com/deploy/button.png"></a>

## Demo
- <a href="http://app.itemsapi.com/" target="_blank">angular.js dashboard</a> with many different collections i.e. movies, quotes, libraries, etc

## Tutorials
- https://www.itemsapi.com/docs/tutorials/how-to-create-search-backend-for-movies

## Testing
`npm test`

## License
ItemsAPI is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.
