'use strict';

var nconf = require('nconf');
var fs = require('fs');
var configFile = './config/local.json';

if (fs.existsSync(configFile) === false) {
  throw Error('Couldnt find ' + configFile);
}

nconf.use('memory');
nconf
  .file('overrides', {file: configFile})
  .file('defaults', {file: './config/root.json'});

var server = require('./server');


var cli = require('cli'); 

cli.parse({
  import: ['import', 'Import external data'],
  collection: ['collection', 'Collection name', 'string'],
  file: ['import', 'Path to file', 'string'],
});

cli.main(function(args, options) {
  console.log(args);
  console.log(options);

  if (options.import === true) {
    importService.import({
      collectionName: options.collection,
      documents: JSON.parse(fs.readFileSync(options.file, 'utf8'))
    })
  }
});
