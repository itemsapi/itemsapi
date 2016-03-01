'use strict';

var config = require('./config/index');
var logger = require('./config/logger');
var server;
var app;
var router;

exports.init = function (data) {
  logger.info('app initialized');
  data = data || {};
  config.merge(data);
  require('./src/connections/elastic').init(config.get().elasticsearch);
  //app = require('./app').app;
  app = require('./express').app;
  router = require('./express').router;
};


exports.get = function (name) {
  if (name === 'config') {
    return config.get();
  } else if (name === 'logger') {
    return logger;
  } else if (name === 'express') {
    return app;
  } else if (name === 'router') {
    return router;
  }
};

/**
 * start server
 */
exports.start = function start(done) {
  server = app.listen(config.get().server.port, function afterListen() {
    done(server);
  });
};

/**
 * stop server
 */
exports.stop = function stop(done) {
  server.close(function() {
    done();
  })
};

module.exports = exports;
