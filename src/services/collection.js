'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index').get();
var fs = Promise.promisifyAll(require('fs-extra'));

var filename = config.collections.filename;

/**
 * update collection
 */
exports.updateCollectionAsync = function(data, where) {
  return exports.getCollectionsAsync()
  .then(function(res) {
    var index = _.findIndex(res, _.pick(where, function(value) {
      return !_.isUndefined(value);
    }));

    if (index === -1) {
      throw new Error('Not found');
    }
    res[index] = _.assign(res[index], data);
    return fs.writeFileAsync(
      filename,
      JSON.stringify(res, null, 4),
      {encoding: 'utf8'}
    );
  })
}

/**
 * find collection
 */
exports.findCollectionAsync = function(where) {
  return exports.getCollectionsAsync()
  .then(function(res) {
    return res;
  })
  .then(function(res) {
    return _.findWhere(res, _.pick(where, function(value) {
      return !_.isUndefined(value) && value !== null;
    }));
  })
  .then(function(res) {
    if (!res) {
      throw new Error('Not found collection');
    }
    return res;
  });
}

/**
 * add collection manually
 * we should switch to https://github.com/typicode/lowdb later
 * we should make data validation too
 */
exports.addCollectionAsync = function(data) {
  return exports.getCollectionsAsync()
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
exports.removeCollectionAsync = function(where) {
  return exports.getCollectionsAsync()
  .then(function(res) {
    return _.reject(res, _.pick(where, function(value) {
      return !_.isUndefined(value);
    }));
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
exports.getCollectionsAsync = function(data) {
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
exports.getCollectionsListAsync = function(data) {
  return exports.getCollectionsAsync(data)
  .map(function(res) {
    return res.name;
  });
}
