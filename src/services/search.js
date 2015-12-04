'use strict';

var async = require('async');
var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/search'));
var _ = require('lodash');
var searchHelper = require('../helpers/search');
var collectionService = require('./collection');

(function(module) {

  /**
   * search documents
   */
  module.searchAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName,
    })
    .then(function(res) {
      data.collection = res;
      data.projectName = res.project;
      return elastic.searchAsync(data);
    })
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
