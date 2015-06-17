'use strict';

var nconf = require('nconf');
var fs = require('fs');
var configFile = './config/local.json';
var server = null;


if (fs.existsSync(configFile) === false) {
  throw Error('Couldnt find ' + configFile);
}

nconf.use('memory');
nconf
  .file('overrides', {file: configFile})
  .file('defaults', {file: './config/root.json'});

server = require('./server');
server.start(function serverStart(serverInstance) {
  var host = serverInstance.address().address;
  var port = serverInstance.address().port;

  console.log('server started');
  console.log('Example app listening at http://%s:%s', host, port);
});
