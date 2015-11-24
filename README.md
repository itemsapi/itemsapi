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
To find out more information about ItemsAPI please go to the official page - <a href="https://www.itemsapi.com/" target="_blank">Go to the documentation</a>.

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
- [Songs](http://app.itemsapi.com/documents/name/song "Songs")
- [Quotes](http://app.itemsapi.com/documents/name/quote "Quotes")
- [NPM libraries](http://app.itemsapi.com/documents/name/npm "NPM libraries")

## Community
- <a href="https://itemsapi.slack.com" target="_blank">Slack</a>
- <a href="https://twitter.com/itemsapi" target="_blank">Twitter @itemsapi</a>
- ask directly @cigolpl

## Contributions
If you have idea how to make this ItemsAPI better or help somehow, feel free to join!

## Testing
`grunt test`
