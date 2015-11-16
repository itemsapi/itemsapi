'use strict';

var nconf = require('nconf');
var fs = require('fs');
var configFile = './config/local.json';
var server = null;
var winston = require('winston');


nconf.use('memory');

if (fs.existsSync(configFile) !== false) {
  nconf.file('overrides', {file: configFile})
}

nconf.file('defaults', {file: './config/root.json'});

winston.loggers.add('query', {
  console: {
    level: 'info',
    colorize: true,
    prettyPrint: true,
    label: 'query'
  },
  file: {
    json: true,
    //prettyPrint: true,
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
