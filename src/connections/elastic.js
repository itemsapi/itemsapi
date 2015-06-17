'use strict';

(function(module) {

  var elasticsearch = require('elasticsearch');
  var winston = require('winston');
  var nconf = require('nconf');
  var client;

  module.init = function() {
    try {
      var log = [{
        type: 'stdio',
        level: 'debug'
      }, {
        type: 'tracer',
        level: 'debug'
      }];

      log = [];

      client = new elasticsearch.Client({
        host: nconf.get().elasticsearch.url,
        log: log
      });
    } catch (err) {
      winston.error('Unable to initialize elasticsearch! Error :' + err.message);
      return callback(err);
    }

    module.elastic = client;
    return client;
  };

  // todo
  module.close = function() {
  };

  module.getElastic = function() {
    return module.elastic;
  }

  module.flushdb = function(data, callback) {
    var index = data.index || 'project*';
    client.indices.delete({index: index}, function(err, res) {
      callback(err, res);
    });
  };

}(exports));
