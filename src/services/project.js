'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var elasticData = require('../elastic/data');
var configHelper = require('./../helpers/config')(nconf.get());
var Promise = require('bluebird');
var searchService = Promise.promisifyAll(require('./search'));
var mappingHelper = require('./../helpers/mapping');

(function(module) {

  /**
   * add project (index)
   */
  module.addProject = function(data, callback) {
    elastic.addIndex({index: data.projectName}, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    })
  },

  /**
   * ensure if project exist
   */
  module.ensureProject = function(data, callback) {
    elastic.existsIndex({index: data.projectName}, function(err, res) {
      if (err) {
        return callback(err);
      }
      if (res === false) {
        elastic.addIndex({index: data.projectName}, function(err, res) {
          if (err) {
            return callback(err);
          }
          callback(null, res);
        })
      } else {
        callback(null, res);
      }
    })
  },

  /**
   * add collection (type)
   */
  module.addMapping = function(data, callback) {
    elastic.addMapping({
      index: data.projectName,
      type: data.collectionName,
      body: {
        properties: configHelper.getSchema(data.collectionName)
      }
    }, function(err, res, status) {
      if (err) {
        return callback(err);
      }
      callback(null, res)
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
  },

  /**
   * add collection (type)
   */
  module.addCollection = function(data, callback) {
    elastic.addMapping({
      index: data.projectName,
      type: data.collectionName,
      body: {
        properties: configHelper.getSchema(data.collectionName)
      }
    }, function(err, res, status) {
      if (err) {
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * ensure collection exists
   */
  module.ensureCollection = function(data, callback) {
    this.ensureProject(data, function(err, res) {
      if (err) {
        return callback(err);
      }

      module.addCollection(data, function(err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res)
      })
    })
  }
}(exports));
