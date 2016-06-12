'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../../config/index').get();
var Collection = require('./../../../src/models/collection');

var filename = config.collections.filename;

// promise

/**
 * partial update collection
 */
var partialUpdateCollectionAsync = function(data, where) {
  if (data.schema) {
    data.normalSchema = data.schema
    delete data.schema
  }
  return Collection.update(where, { $set: data}).exec();
}

/**
 * update collection
 */
var updateCollectionAsync = function(data, where) {
  if (data.schema) {
    data.normalSchema = data.schema
    delete data.schema
  }
  return Collection.findOne(where).exec()
  .then(function(result) {
    if (!result) {
      throw new Error('Collection not found');
    }
  })
  .then(function(result) {
    return Collection.update(where, { $set: data}).exec();
  })
}

/**
 * find collection
 */
var findCollectionAsync = function(where) {
  return Collection.findOne(where).exec()
  .then(function(result) {
    return result.toObject({ getters: false, virtuals: true })
  })
  .then(function(result) {
    result.schema = result.normalSchema;
    delete result.normalSchema
    return result
  })
}

/**
 * add collection manually
 */
var addCollectionAsync = function(data) {
  if (data.schema) {
    data.normalSchema = data.schema
    delete data.schema
  }

  var collection = new Collection(data)
  return collection.save()
  .then(function(result) {
    return data
  })
}

var removeCollectionAsync = function(where) {
  return Collection.remove(where).exec()
}

var removeCollectionsAsync = function() {
  return Collection.remove().exec()
}

/**
 * get collections from json file
 * in the future it should supports other more scalable dbs like mongodb, mysql or redis
 */
var getCollectionsAsync = function(data) {
  return Collection.find({}).sort({'created_at': -1}).exec()
  .then(function(res){
    return _.map(res, function(o) {
      o = o.toJSON()
      o.schema = o.normalSchema;
      delete o.normalSchema
      return o
      //return o
      //return o.toObject({ getters: false, virtuals: true })
    })
  });
}

module.exports = {
  partialUpdateCollectionAsync: partialUpdateCollectionAsync,
  updateCollectionAsync: updateCollectionAsync,
  findCollectionAsync: findCollectionAsync,
  addCollectionAsync: addCollectionAsync,
  removeCollectionAsync: removeCollectionAsync,
  removeCollectionsAsync: removeCollectionsAsync,
  getCollectionsAsync: getCollectionsAsync,
}
