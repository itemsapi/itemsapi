'use strict';

var server = null;

var winston = require('winston');

winston.loggers.add('query', {
  console: {
    level: 'info',
    colorize: true,
    prettyPrint: true,
    label: 'query'
  },
  file: {
    json: true,
    filename: './data/logs/query.log'
  }
});

server = require('./server');
server.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;

  console.log('server started');
  console.log('Example app listening at http://%s:%s', host, port);
});
