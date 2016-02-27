'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../connections/elastic').getElastic());
var indices = Promise.promisifyAll(require('../connections/elastic').getElastic().indices);
var cat = Promise.promisifyAll(require('../connections/elastic').getElastic().cat);
var _ = require('lodash');

(function(module) {

  /**
   */
  module.getIndicesAsync = function(data) {
    data = data || {};
    return cat.indicesAsync({
      v: data.v || true,
      bytes: data.bytes || 'm'
    })
    .then(function(res) {
      return res;
    });
  }
}(exports));
