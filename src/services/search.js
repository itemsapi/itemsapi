'use strict';

var async = require('async');
var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/search'));
var _ = require('lodash');
var searchHelper = require('../helpers/search');
var collectionHelper = require('../helpers/collection');
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
    .then(function(collection) {
      var helper = collectionHelper(collection);
      data.collection = collection;
      data.index = helper.getIndex();
      data.type = helper.getType();
      return elastic.searchAsync(data);
    })
    .then(function(res) {
      return searchHelper().searchConverter(data, res);
    })
  }

  /**
   * similar documents
   */
  module.similarAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName,
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      //data.collection = collection;
      data.index = helper.getIndex();
      data.type = helper.getType();
      //delete data.collection;
      return elastic.similarAsync(data);
    })
    .then(function(res) {
      return searchHelper().similarConverter(data, res);
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
