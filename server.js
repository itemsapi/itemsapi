'use strict';

var config = require('./config/index').get();
var logger = require('./config/logger');
var server;

exports.init = function (data) {
};

exports.get = function (name) {
  if (name === 'config') {
    return config;
  } else if (name === 'logger') {
    return logger;
  }
};

var elastic = require('./src/connections/elastic');
elastic.init(config.elasticsearch);

var app = require('./express')

/**
 * start server
 */
exports.start = function start(done) {
  server = app.listen(config.server.port, function afterListen() {
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
  //server.close();
};

module.exports = exports;
