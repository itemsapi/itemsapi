'use strict';

var nconf = require('nconf');
var fs = require('fs');
var configFile = './config/local.json';

nconf.use('memory');
if (fs.existsSync(configFile) !== false) {
  nconf.file('overrides', {file: configFile})
}

nconf.file('defaults', {file: './config/root.json'});

var server = require('./server');
var importService = require('./src/services/import');

var cli = require('cli');

cli.parse({
  import: ['import', 'Import external data'],
  collection: ['collection', 'Collection name', 'string'],
  file: ['import', 'Path to file', 'string'],
});

cli.main(function(args, options) {
  if (options.import === true) {
    var filename = options.file || './data/movies.json';
    importService.import({
      projectName: 'project',
      collectionName: options.collection,
      bulkSize: 200,
      body: JSON.parse(fs.readFileSync(filename, 'utf8'))
    }, function(err, res) {
      console.log('data has been imported');
      console.log(res);
      process.exit();
    })
  }
});
