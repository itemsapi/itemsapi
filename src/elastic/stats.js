'use strict';

var Promise = require('bluebird');
var elastic = require('../connections/elastic').getElastic();
var indices = require('../connections/elastic').getElastic().indices;
var cat = require('../connections/elastic').getElastic().cat;
var _ = require('lodash');

/**
 */
exports.getIndicesAsync = function(data) {
  data = data || {};
  return cat.indices({
    v: data.v || true,
    bytes: data.bytes || 'm'
  })
  .then(function(res) {
    return res;
  });
}
