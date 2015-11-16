'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var async = require('async');
var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/search'));
var _ = require('lodash');
var searchHelper = require('../helpers/search');

(function(module) {

  /**
   * search documents
   */
  module.searchAsync = function(data) {
    return elastic.searchAsync(data)
    .then(function(res) {
      return searchHelper().searchConverter(data, res);
    })
  }

  /**
   * suggest documents
   */
  module.suggestAsync = function(data) {
    return elastic.suggestAsync(data)
    .then(function(res) {
      return res;
    });
  }
}(exports));
