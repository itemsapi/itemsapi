# How to get working Elasticsearch 

The most used Elasticsearch version for ItemsAPI is 1.7.x so it is also recommended. 

## Manual installation

- Ubuntu 14.04 https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-14-04

## Start with docker

- `docker run -p 127.0.0.1:9250:9200 elasticsearch:1.7.6` (it creates elasticsearch 1.7.6 instance on 127.0.0.1:9250)
- `docker run -p 127.0.0.1:9250:9200 elasticsearch:1.7.6` (it creates elasticsearch 1.7.6 instance on 127.0.0.1:9250)

(if you have docker installed on your localhost and have even very basic understanding, it can be the easiest way to start ES) 

## Cloud version

- https://aws.amazon.com/elasticsearch-service/ - if you have AWS account this is the easiest way to start ES. 
It is also paid per hour so great for experimenting.
- https://www.digitalocean.com/ - there is no Elasticsearch package but it is relatively easy to create new server (i.e. Ubuntu 14.04).
You can also make tests, experiments and make server snapshot for further use   
- https://www.elastic.co/cloud
- https://qbox.io/
- https://bonsai.io/
- https://www.morpheusdata.com/
- https://aiven.io/elasticsearch
