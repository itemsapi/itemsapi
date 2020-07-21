# Movies index and search

### Create server

```bash
docker pull itemsapi/itemsapi:latest
docker run -it -p 3000:3000 itemsapi/itemsapi
```

### Create configuration

```bash
wget https://raw.githubusercontent.com/itemsapi/itemsapi/2.0-branch/examples/configuration-movies.json -O configuration.json

curl -i -X POST 'http://127.0.0.1:3000/configuration' \
  --header 'content-type: application/json' \
  --data-binary @./configuration.json
```

### Index data

```bash
wget https://github.com/itemsapi/itemsapi-example-data/blob/master/items/imdb.json\?raw\=true -O movies.json

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
