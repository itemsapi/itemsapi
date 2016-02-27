'use strict';

var itemsapi = require('./server');
var logger = require('./config/logger')

itemsapi.init({
  elasticsearch: {
    host: "localhost:9200",
    log: "error"
  },
  server: {
    host: "http://127.0.0.1",
    port: 3000
  },
  collections: {
    db: "json",
    filename:  "./config/collections.json"
  }
})


// should be implemented in custom application not in itemsapi itself
/*if (config.hooks && config.hooks.limiter && config.hooks.limiter.enabled === true) {
  var client = require('redis').createClient(config.redis);
  // limit requests per IP
  var limiter = require('./hooks/limiter')(router, client);
}*/

var winston = require('winston')

itemsapi.get('logger').info('it works!')

itemsapi.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;

  logger.info('server started');
  logger.info('app listening at http://%s:%s', host, port);
});
