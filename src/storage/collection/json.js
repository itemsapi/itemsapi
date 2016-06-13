'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../../config/index').get();
var fs = Promise.promisifyAll(require('fs-extra'));

var filename = config.collections.filename;

// get mongodb

/**
 * partial update collection
 */
var partialUpdateCollectionAsync = function(data, where) {
  return getCollectionsAsync()
  .then(function(res) {
    var index = _.findIndex(res, _.pick(where, function(value) {
      return !_.isUndefined(value);
    }));

    if (index === -1) {
      throw new Error('Collection not found');
    }
    data.updated_at = new Date()
    res[index] = _.assign(res[index], data);
    return fs.writeFileAsync(
      filename,
      JSON.stringify(res, null, 4),
      {encoding: 'utf8'}
    );
  })
}

/**
 * update collection
 */
var updateCollectionAsync = function(data, where) {
  return getCollectionsAsync()
  .then(function(res) {
    var index = _.findIndex(res, _.pick(where, function(value) {
      return !_.isUndefined(value);
    }));

    if (index === -1) {
      throw new Error('Collection not found');
    }
    // not assign but hard replace
    data.updated_at = new Date()
    res[index] = data;
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
var findCollectionAsync = function(where) {
  return getCollectionsAsync()
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
 */
var addCollectionAsync = function(data) {
  if (!data || !data.name) {
    return Promise.reject(new Error('Collection name required'))
  }
  return getCollectionsAsync()
  .then(function(collections) {
    if (_.find(collections, {name: data.name})) {
      throw new Error('Collection with given name already exists')
    }
    data.created_at = new Date()
    data.updated_at = new Date()
    collections.push(data);
    return collections;
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
var removeCollectionAsync = function(where) {
  return getCollectionsAsync()
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
var getCollectionsAsync = function(data) {
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
var getCollectionsListAsync = function(data) {
  return getCollectionsAsync(data)
  .map(function(res) {
    return res.name;
  });
}

module.exports = {
  partialUpdateCollectionAsync: partialUpdateCollectionAsync,
  updateCollectionAsync: updateCollectionAsync,
  findCollectionAsync: findCollectionAsync,
  addCollectionAsync: addCollectionAsync,
  removeCollectionAsync: removeCollectionAsync,
  getCollectionsAsync: getCollectionsAsync,
  getCollectionsListAsync: getCollectionsListAsync
}
