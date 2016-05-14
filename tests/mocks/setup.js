'use strict';

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

    process.env.NODE_ENV = 'test';
    var config = require('./../../config/index').get();

    server  = require(__dirname + '/../../server.js');
    server.init();

    describe(name, function describe() {
      before(function before(done) {
        server.start(function serverStart(serverInstance) {
          module.setServer(serverInstance);
          var elasticClient = require('./../../src/connections/elastic');
          var projectService  = require('./../../src/services/project');
          elasticClient.flushdb({index: 'test'}, function(err, res) {
            // need to add mapping for all test collections

            //require('./../../src/elastic/mapping').addSettingsAsync(settings)
            //.then(function(res) {
              projectService.addMappingAsync({
                index: 'test',
                type: 'movie'
              })
              .then(function(res) {
                //console.log('add mapping');
                done();
              })
            //})
            //})
          });
        });
      });

      tests();

      after(function after(done) {
        server.stop(function(res) {
          done();
        });
      });
    });
  };
})(exports);
