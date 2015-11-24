'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index');
var fs = Promise.promisifyAll(require('fs-extra'));

(function(module) {

  /**
   * find collection
   */
  module.findCollectionAsync = function(name) {
    return module.getCollectionsAsync()
    .then(function(res) {
      return _.findWhere(res, {collection: name});
    });
  }

  /**
   * get collections from json file
   * in the future it should supports other more scalable dbs like mongodb, mysql or redis
   */
  module.getCollectionsAsync = function(data) {
    var filename = config.collection.filename;

    return fs.readFileAsync(filename)
    .then(function(res) {
      return JSON.parse(res);
    })
    .then(function(res) {
      return _.where(res, data);
    });
  }

  /**
   * get collections list
   */
  module.getCollectionsListAsync = function(data) {
    return module.getCollectionsAsync(data)
    .map(function(res) {
      return res.collection
    });
  }

}(exports));
