'use strict';

var itemsapi = require('./server');
var config = require('./config/index').get()
var logger = require('./config/logger')
var colors = require('colors')
//var figlet = require('figlet')
var statusHelper = require('./src/helpers/status');

//console.log(figlet.textSync('itemsapi'))

console.log('Welcome to ItemsAPI'.green);
console.log('Ideas, issues or questions - https://github.com/itemsapi/itemsapi/issues')
console.log()

itemsapi.init({
  elasticsearch: config.elasticsearch
})

itemsapi.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;

  if (!host || host === '::') {
    host = '127.0.0.1'
  }

  return statusHelper.elasticsearch(config.elasticsearch.host)
  .then(function(result) {
    logger.info('ItemsAPI started!'.green)

    if (result.elasticsearch_status === 200) {
      if (result.version >= '2.0') {
        logger.info('Your Elasticsearch version: %s is not recommended'.yellow, result.version)
        logger.info('Your api might not work properly'.yellow)
        logger.info('Instructions about recommended Elasticsearch version - https://github.com/itemsapi/itemsapi/blob/master/ELASTICSEARCH.md'.yellow)
      } else {
        logger.info('Elasticsearch status -', 'OK'.green)
      }

      itemsapi.get('logger').info('')
      itemsapi.get('logger').info('In order for easier API management, you can: ')
      itemsapi.get('logger').info('- install CLI tool `sudo npm install itemsapi-cli -g` and follow instructions')
      itemsapi.get('logger').info('- install search web application with frontend and admin side. (https://github.com/itemsapi/starter)')
      itemsapi.get('logger').info('')
      itemsapi.get('logger').info('Your API url - http://%s:%s/api/v1'.green, host, port)
    } else {
      logger.info('Elasticsearch status -', config.elasticsearch.host.red + ' is unavailable.'.red)
      logger.info('Your application might not work properly'.red)
      logger.info('Instructions about how to run Elasticsearch - https://github.com/itemsapi/itemsapi/blob/master/ELASTICSEARCH.md'.red)
      logger.info('To start app with your custom elasticsearch url:'.red)
      logger.info('ELASTICSEARCH_URL=http://localhost:9200 npm start'.red)
    }
  })
});
