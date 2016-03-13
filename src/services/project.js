'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/mapping'));
var elasticData = require('../elastic/data');
var searchService = Promise.promisifyAll(require('./search'));
var collectionHelper = require('./../helpers/collection');
var collectionService = require('./collection');

(function(module) {


  /**
   * ensure if index exist, if not then create it
   */
  module.ensureIndexAsync = function(data) {
    return elastic.existsIndexAsync({index: data.projectName})
    .then(function(res) {
      if (res === false) {
        return elastic.addIndexAsync({index: data.projectName});
      }
      return res;
    })
    .then(function(res) {
      return res;
    });
  },

  /**
   * ensure if project exist, if not then create it
   */
  module.ensureProjectAsync = module.ensureIndexAsync,

  /**
   * add mapping from collection schema
   */
  module.addMappingAsync = function(data) {
    var collection;
    var helper;
    return collectionService.findCollectionAsync({
      name: data.collectionName
    })
    .then(function(_collection) {
      collection = _collection;
      helper = collectionHelper(collection);
      return module.ensureProjectAsync({
        projectName: helper.getIndex()
      })
    })
    .then(function(res) {
      return elastic.addMappingAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        body: {
          properties: collection.schema
        }
      })
    })
  },

  /**
   * update mapping from collection schema
   */
  module.updateMappingAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.updateMappingAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        body: {
          properties: collection.schema
        }
      })
    })
  },

  /**
   * get mapping
   */
  module.getMappingAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.getMappingAsync({
        index: helper.getIndex(),
        type: helper.getType()
      })
    })
  },

  /**
   * add collection (type)
   * @the name is deprecated in the future
   */
  module.addCollectionAsync = module.addMappingAsync,

  /**
   * ensure collection exists
   */
  module.ensureCollectionAsync = function(data) {
    return module.ensureProjectAsync(data)
    .then(function(res) {
      return module.addCollectionAsync(data)
    })
  },

  /**
   * collection info
   */
  module.collectionInfoAsync = function(data) {
    var name = data.collectionName;
    var result;
    var collection;
    var helper;

    return collectionService.findCollectionAsync({
      name: name
    })
    .then(function(_collection) {
      collection = _collection;
      helper = collectionHelper(collection);
      return elasticData.countDocumentsAsync({
        index: helper.getIndex(),
        type: helper.getType()
      })
    })
    .then(function(res) {
      var display_name = name;
      if (collection.meta && collection.meta.title) {
        display_name = collection.meta.title;
      }
      return {
        name: name,
        project: collection.project,
        //visibility: collection.visibility,
        display_name: display_name,
        count: res
      };
    })
    .catch(function(err) {
      throw new Error('An error occured' + err);
    })
  }
}(exports));
