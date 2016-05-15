'use strict';

var elasticsearch = require('elasticsearch');
var logger = require('../../config/logger');
var client;
var Promise = require('bluebird');

exports.init = function(conf) {
  try {
    //https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html
    conf.apiVersion = '1.7';
    conf.defer = function () {
      var resolve, reject;
      var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
      });
      return {
        resolve: resolve,
        reject: reject,
        promise: promise
      };
    }
    client = new elasticsearch.Client(conf);
  } catch (err) {
    logger.error('Unable to initialize elasticsearch! Error :' + err.message);
    //return callback(err);
  }

  exports.elastic = client;
  return client;
};

// todo
exports.close = function() {
};

exports.getElastic = function() {
  return client;
}

exports.flushdb = function(data, callback) {
  var index = data.index || 'project*';
  client.indices.delete({index: index}, function(err, res) {
    callback(err, res);
  });
};
