'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../../config/index').get();
var Collection = require('./src/models/project');

var filename = config.collections.filename;

// promise
mongoose.Promise = require('bluebird');

/**
 * partial update collection
 */
var partialUpdateCollectionAsync = function(data, where) {
  return Collection.update(where, { $set: data}).exec();
}

/**
 * update collection
 */
var updateCollectionAsync = function(data, where) {
  return Collection.update(where, { $set: data}).exec();
}

/**
 * find collection
 */
var findCollectionAsync = function(where) {
  return Collection.findOne(where).exec();
}

/**
 * add collection manually
 */
var addCollectionAsync = function(data) {
  var collection = new Collection(data)
  return collection.save();
  .then(function(result) {
    return data
  })
}

var removeCollectionAsync = function(where) {
  return Collection.remove(where).exec()
}

/**
 * get collections from json file
 * in the future it should supports other more scalable dbs like mongodb, mysql or redis
 */
var getCollectionsAsync = function(data) {
  return Collection.find({}).sort({'created_at': -1}).exec()
  .then(function(res){
    return res
  });
}

module.exports = {
  partialUpdateCollectionAsync: partialUpdateCollectionAsync,
  updateCollectionAsync: updateCollectionAsync,
  findCollectionAsync: findCollectionAsync,
  addCollectionAsync: addCollectionAsync,
  removeCollectionAsync: removeCollectionAsync,
  getCollectionsAsync: getCollectionsAsync,
}
