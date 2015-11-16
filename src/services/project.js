'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/mapping'));
var elasticData = require('../elastic/data');
var configHelper = require('./../helpers/config')(nconf.get());
var searchService = Promise.promisifyAll(require('./search'));
var mappingHelper = require('./../helpers/mapping');

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
    return elastic.addMappingAsync({
      index: data.projectName,
      type: data.collectionName,
      body: {
        properties: configHelper.getSchema(data.collectionName)
      }
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
    return elastic.addMappingAsync({
      index: data.projectName,
      type: data.collectionName,
      body: {
        properties: configHelper.getSchema(data.collectionName)
      }
    })
  },

  /**
   * collection info
   */
  module.collectionInfoAsync = function(data) {
    var name = data.collectionName;
    var result;

    return elasticData.countDocumentsAsync({
      index: data.projectName,
      type: data.collectionName
    })
    .then(function(res) {
      var mapping = mappingHelper.getMapping(name);
      var display_name = name;
      if (mapping.meta && mapping.meta.title) {
        display_name = mapping.meta.title;
      }
      return {
        name: name,
        visibility: mapping.visibility,
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
