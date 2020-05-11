# Movies index and search

### Create server

```bash
docker run --privileged -it -p 3000:3000 itemsapi/itemsapi
```

### Create configuration

```bash
curl -i -X POST 'http://127.0.0.1:3000/configuration' \
  --header 'content-type: application/json' \
  --data-binary @./examples/configuration-movies.json
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
```
