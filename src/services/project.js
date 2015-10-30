'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var configHelper = require('./../helpers/config')(nconf.get());

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
