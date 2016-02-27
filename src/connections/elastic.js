'use strict';

(function(module) {

  var elasticsearch = require('elasticsearch');
  var logger = require('../../config/logger');
  var client;

  module.init = function(conf) {
    try {
      client = new elasticsearch.Client({
        host: conf.host || "localhost:9200",
        log: conf.log
      });
    } catch (err) {
      logger.error('Unable to initialize elasticsearch! Error :' + err.message);
      //return callback(err);
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
