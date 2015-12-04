'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/mapping'));
var elasticData = require('../elastic/data');
var searchService = Promise.promisifyAll(require('./search'));
var collectionHelper = require('./../helpers/collection');
var collectionService = require('./collection');

(function(module) {

  /**
   * add project (index)
   */
  module.addProjectAsync = function(data) {
    return elastic.addIndexAsync({index: data.projectName});
  },

  /**
   * ensure if project exist, if not then create it
   */
  module.ensureProjectAsync = function(data) {
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
   * add collection (type)
   */
  module.addCollectionAsync = function(data) {
    return collectionService.findCollectionAsync(data.collectionName)
    .then(function(res) {
      var helper = collectionHelper(res);
      return elastic.addMappingAsync({
        index: data.projectName,
        type: data.collectionName,
        body: {
          properties: helper.getElasticSchema()
        }
      })
    })
  },

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
   * add collection (type)
   */
  module.addMappingAsync = function(data) {
    return collectionService.findCollectionAsync(data.collectionName)
    .then(function(res) {
      var helper = collectionHelper(res);
      return elastic.addMappingAsync({
        index: data.projectName,
        type: data.collectionName,
        body: {
          properties: helper.getElasticSchema()
        }
      })
    })
  },

  /**
   * collection info
   */
  module.collectionInfoAsync = function(data) {
    var name = data.collectionName;
    var result;
    var collection;

    return collectionService.findCollectionAsync(name)
    .then(function(res) {
      collection = res;
      return elasticData.countDocumentsAsync({
        index: data.projectName,
        type: data.collectionName
      })
    })
    .then(function(res) {
      var helper = collectionHelper(collection);
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
    .catch(function(res) {
      console.log(res);
      throw new Error('An error occured');
    })
  }
}(exports));
