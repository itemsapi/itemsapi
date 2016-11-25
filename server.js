'use strict';

var config = require('./config/index')
var logger
var server
var app
var router

/**
 * it inits application
 * init logger
 * start elasticsearch
 * start mongoose if configured
 */
exports.init = function (data) {
  data = data || {};
  config.merge(data);
  logger = require('./config/logger');
  require('./src/connections/elastic').init(config.get().elasticsearch);
  app = require('./express').app;
  router = require('./express').router;
};

/**
 * any method should be called after init
 */
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
