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

module.exports = nconf.get();
