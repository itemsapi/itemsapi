'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../connections/elastic').getElastic());
var indices = Promise.promisifyAll(require('../connections/elastic').getElastic().indices);
var cat = Promise.promisifyAll(require('../connections/elastic').getElastic().cat);
var _ = require('lodash');

(function(module) {

  /**
   */
  module.refreshAsync = function(data) {
    data = data || {};
    return indices.refreshAsync({
      index: data.index,
      force: true
    })
    .then(function(res) {
      return res[0];
    });
  }
}(exports));
