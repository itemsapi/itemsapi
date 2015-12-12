'use strict';

var isProduction = process.env.NODE_ENV === 'production';
var isTest = process.env.NODE_ENV === 'test';

var nconf = require('nconf');
var fs = require('fs');

var configFile = __dirname + '/local.json';

if (isTest) {
  configFile = __dirname + '/test.json';
}

nconf.use('memory');
if (fs.existsSync(configFile) !== false) {
  nconf.file('overrides', {file: configFile})
}

nconf.file('defaults', {file: __dirname + '/root.json'});

if (process.env.PORT) {
  nconf.set('server:port', process.env.PORT);
}

if (process.env.SEARCHBOX_URL) {
  nconf.set('elasticsearch:host', process.env.SEARCHBOX_URL);
} else if (process.env.BONSAI_URL) {
  nconf.set('elasticsearch:host', process.env.ELASTICSEARCH_URL);
}

module.exports = nconf.get();
