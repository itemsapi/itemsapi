'use strict';

var Promise = require('bluebird');
var elastic = require('../connections/elastic').getElastic();
var indices = require('../connections/elastic').getElastic().indices;
var cat = require('../connections/elastic').getElastic().cat;
var _ = require('lodash');

/**
 */
exports.refreshAsync = function(data) {
  data = data || {};
  return indices.refresh({
    index: data.index,
    force: true
  })
  .then(function(res) {
    return res;
  });
}
