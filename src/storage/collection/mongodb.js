'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var Collection = require('./../../../src/models/collection');
//var logger = require('./../../../config/logger');
var mongoose = require('./../../../config/mongoose')

/**
 * partial update collection
 */
var partialUpdateCollectionAsync = function(data, where) {
  if (data.schema) {
    data.normalSchema = data.schema
    delete data.schema
  }

  if (data.name && where.name !== data.name) {
    return Promise.reject(new Error('Cannot change collection name'))
  }

  return Collection.findOne(where).exec()
  .then(function(result) {
    if (!result) {
      throw new Error('Collection not found');
    }

    return Collection.update(where, { $set: data}).exec();
  })
}

/**
 * update collection
 */
var updateCollectionAsync = function(data, where) {
  if (data.schema) {
    data.normalSchema = data.schema
    delete data.schema
  }

  if (data.name && where.name !== data.name) {
    return Promise.reject(new Error('Cannot change collection name'))
  }

  return Collection.findOne(where).exec()
  .then(function(result) {
    if (!result) {
      throw new Error('Collection not found');
    }
  })
  .then(function(result) {
    return Collection.update(where, data, {upsert: false}).exec()
    //return Collection.update(where, { $set: data}).exec();
  })
}

/**
 * find collection
 */
var findCollectionAsync = function(where) {
  return Collection.findOne(where).exec()
  .then(function(result) {
    if (!result) {
      throw new Error('Not found collection');
    }
    return result.toObject({ getters: false, virtuals: true })
  })
  .then(function(result) {
    result.schema = result.normalSchema;
    return _.omit(result, ['normalSchema', 'id', '_id', '__v'])
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
  return Collection.findOne({name: data.name}).exec()
  .then(function(result) {

    if (result) {
      throw new Error('Collection with given name already exists');
    }

    var collection = new Collection(data)
    return collection.save()
    .then(function(result) {
      return data
    })
  })
}

var removeCollectionAsync = function(where) {
  return Collection.remove(where).exec()
}

var removeCollectionsAsync = function() {
  return Collection.remove().exec()
}

var getCollectionsAsync = function(data) {
  return Collection.find({}).sort({'created_at': -1}).exec()
  .then(function(res){
    return _.map(res, function(o) {
      o = o.toJSON()
      o.schema = o.normalSchema
      return _.omit(o, ['normalSchema', 'id', '_id', '__v'])
    })
  });
}

module.exports = {
  partialUpdateCollectionAsync: partialUpdateCollectionAsync,
  updateCollectionAsync: partialUpdateCollectionAsync,
  findCollectionAsync: findCollectionAsync,
  addCollectionAsync: addCollectionAsync,
  removeCollectionAsync: removeCollectionAsync,
  removeCollectionsAsync: removeCollectionsAsync,
  getCollectionsAsync: getCollectionsAsync,
}
