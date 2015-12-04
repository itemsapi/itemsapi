'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index');
var fs = Promise.promisifyAll(require('fs-extra'));

(function(module) {

  /**
   * find collection
   */
  module.findCollectionAsync = function(where) {
    // pick only properties which are defined
    where = _.pick(where, function(value) {
      return !_.isUndefined(value);
    });

    return module.getCollectionsAsync()
    .then(function(res) {
      return res;
    })
    .then(function(res) {
      return _.findWhere(res, where);
    });
  }

  /**
   * add collection manually
   * we should switch to https://github.com/typicode/lowdb later
   * we should make data validation too
   */
  module.addCollectionAsync = function(data) {
    var filename = config.collections.filename;

    return fs.readFileAsync(filename)
    .then(function(res) {
      return JSON.parse(res);
    })
    .then(function(res) {
      res.push(data);
      return res;
    })
    .then(function(res) {
      return fs.writeFileAsync(
        filename,
        JSON.stringify(res, null, 4),
        {encoding: 'utf8'}
      );
    });
  }

  /**
   * remove collection manually
   * we should switch to https://github.com/typicode/lowdb later
   */
  module.removeCollectionAsync = function(where) {
    var filename = config.collections.filename;

    return fs.readFileAsync(filename)
    .then(function(res) {
      return JSON.parse(res);
    })
    .then(function(res) {
      return _.reject(res, where);
    })
    .then(function(res) {
      return fs.writeFileAsync(
        filename,
        JSON.stringify(res, null, 4),
        {encoding: 'utf8'}
      );
    });
  }

  /**
   * get collections from json file
   * in the future it should supports other more scalable dbs like mongodb, mysql or redis
   */
  module.getCollectionsAsync = function(data) {
    var filename = config.collections.filename;

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
      return res.name;
    });
  }

}(exports));
