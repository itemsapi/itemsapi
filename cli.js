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
var collectionService = require('./src/services/collection');
var elasticStats = require('./src/elastic/stats');
var elasticMapping = require('./src/elastic/mapping');

var cli = require('cli');

cli.parse({
  import: ['import', 'Import external data'],
  export: ['export', 'Export data'],
  collection: ['collection', 'Collection name', 'string'],
  project: ['project', 'Project name', 'string'],
  file: ['import', 'Path to file', 'string'],

  elasticsearch: ['elasticsearch', 'Elasticsearch utils'],
  indices: ['indices', 'Indices'],
  mapping: ['mapping', 'Mapping'],
  index: ['index', 'Elastic index', 'string'],
  type: ['type', 'Elastic type', 'string'],
  limit: ['limit', 'Items limit', 'int']
});

cli.main(function(args, options) {
  if (options.elasticsearch === true) {
    if (options.export === true) {
      importService.exportAsync({
        projectName: options.project,
        collectionName: options.collection,
        limit: options.limit
      })
      .then(function(res) {
        console.log('Data has been exported to ./data/exports/collections.json');
        process.exit();
      });
    } else if (options.import === true) {
      importService.importElasticTypeMappingAsync({
        index: options.index,
        type: options.type
      })
      .then(function(res) {
        console.log('type from elasticsearch has been imported to local database');
        process.exit();
      });
    } else if (options.indices === true) {
      elasticStats.getIndicesAsync()
      .then(function(res) {
        console.log(res);
        process.exit();
      });
    } else if (options.mapping === true) {
      elasticMapping.getMappingAsync({
        index: options.index,
        type: options.type
      })
      .then(function(res) {
        console.log(JSON.stringify(res, null, 4));
        process.exit();
      });
    }
  } else if (options.import === true) {
    var filename = options.file || './data/movies.json';
    importService.import({
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
