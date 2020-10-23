# ItemsAPI 2.0 - fast faceted search

Blazingly fast faceted search. It has Node.js simplicity and C++ speed.

## Features

- fast faceted search
- full text search
- fast data indexing
- pagination
- simple JSON API
- web ui for exploring / managing index
- dockerized with alpine

## Performance

ItemsAPI has a great indexing performance. It can index 2M documents in less than 2 minutes on local computer.
Searching seems to be 10x faster than Elasticsearch for similar use cases

### Docker

```bash
docker pull itemsapi/itemsapi:latest
docker run --privileged -it -p 3000:3000 itemsapi/itemsapi
```

## Getting started

Please look into full example here - [index and search movies](/examples/movies.md)



## Licence

ItemsAPI 2.x is created by Mateusz Rzepa. You can use ItemsAPI for free, if your project is Open Source. If you want to use ItemsAPI in to build commercial software, you need to buy a commercial license.
Commercial editions can be used in closed source environment. More info soon
