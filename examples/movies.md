# Movies index and search

### Create server

```bash
docker pull itemsapi/itemsapi:latest
docker run -it -p 3000:3000 itemsapi/itemsapi
```

### Create configuration

```bash
curl https://raw.githubusercontent.com/itemsapi/itemsapi/2.0-branch/examples/configuration-movies.json -o configuration.json

curl -i -X POST 'http://127.0.0.1:3000/configuration' \
  --header 'content-type: application/json' \
  --data-binary @./configuration.json
```

### Index data

```bash
curl https://raw.githubusercontent.com/itemsapi/itemsapi-example-data/master/items/imdb.json -o movies.json

curl -i -X POST 'http://127.0.0.1:3000/index' \
  --header 'content-type: text/plain' \
  --data-binary @movies.json
```

### Search

```bash
curl -i -XPOST 'http://127.0.0.1:3000/search' --header 'content-type: application/json'  -d '{"filters":{"tags": ["police"], "country": ["USA"]}}'
curl -i -XPOST 'http://127.0.0.1:3000/search' --header 'content-type: application/json'  -d '{"filters":{"tags": [], "country": []}}'
curl -i -XPOST 'http://127.0.0.1:3000/search' --header 'content-type: application/json'
curl -i -XGET 'http://127.0.0.1:3000/search?page=1&per_page=30' --header 'content-type: application/json'
```
