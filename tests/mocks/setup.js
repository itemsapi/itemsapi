'use strict';

var nconf = require('nconf');
var fs = require('fs');
var winston = require('winston');
var server;


(function (module) {
  var serverInstance;

  /**
   * get server instance
   */
  module.getServer = function getServer() {
    return serverInstance;
  };

  /**
   * set server (after starting)
   */
  module.setServer = function setServer(server) {
    serverInstance = server;
  };

  module.makeSuite = function addSuite(name, tests) {
    var configFile = './config/test.json';

    if (fs.existsSync(configFile) === false) {
      throw Error('Couldnt find ' + configFile);
    }

    nconf.use('memory');
    nconf
    .file('overrides', {file: configFile})
    .file('defaults', {file: './config/root.json'});

    server  = require(__dirname + '/../../server.js');




    describe(name, function describe() {
      before(function before(done) {
        server.start(function serverStart(serverInstance) {
          module.setServer(serverInstance);
          var elasticClient = require('./../../src/connections/elastic');
          elasticClient.flushdb({index: 'test'}, function(err, res) {
            done();
          });
        });
      });

      tests();

      after(function after(done) {
        server.stop();
        done();
      });
    });
  };
})(exports);
