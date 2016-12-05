# How to get working Elasticsearch 

The most used Elasticsearch version for ItemsAPI is 1.7.x so it is also recommended. 

## Manual installation

### Installation

1. `sudo add-apt-repository -y ppa:webupd8team/java`
2. `sudo apt-get update`
3. `sudo apt-get -y install oracle-java8-installer`
4. `wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.2.deb`
5. `sudo dpkg -i elasticsearch-1.7.2.deb`
5. `sudo service elasticsearch start`

### Testing
`curl -X GET 'http://localhost:9200'`

```js
Output of curl
{
  "status" : 200,
  "name" : "Harry Leland",
  "cluster_name" : "elasticsearch",
  "version" : {
    "number" : "1.7.2",
    "build_hash" : "e43676b1385b8125d647f593f7202acbd816e8ec",
    "build_timestamp" : "2015-09-14T09:49:53Z",
    "build_snapshot" : false,
    "lucene_version" : "4.10.4"
  },
  "tagline" : "You Know, for Search"
}
```

You'll find more informations here https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-14-04

## Start with docker

- `docker run -p 9200:9200 elasticsearch:1.7.6` (it creates elasticsearch 1.7.6 instance on 9200 port)
- `docker run -p 127.0.0.1:9250:9200 elasticsearch:1.7.6` (it creates elasticsearch 1.7.6 instance on 127.0.0.1:9250)
- `docker run -d -p 127.0.0.1:9250:9200 elasticsearch:1.7.6` (it runs ES in background. You can see process here `docker ps`)

(if you have docker installed on your localhost and have even very basic understanding, it can be the easiest way to start ES) 

## Cloud version

- https://aws.amazon.com/elasticsearch-service/ - if you have AWS account this is very easy way to start ES. 
It is also paid per hour so great for testing & experimenting.
- https://www.digitalocean.com/ - there is no Elasticsearch package but it is relatively easy to create new server (i.e. Ubuntu 14.04).
You can also make tests, experiments and make server snapshot for further use   
- https://www.elastic.co/cloud
- https://qbox.io/
- https://bonsai.io/
- https://www.morpheusdata.com/
- https://aiven.io/elasticsearch
