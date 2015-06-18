'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');

(function(module) {

  /**
   * add project (index)
   */
  module.addProject = function(data, callback) {
    elastic.addIndex({index: data.project_name}, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    })
  },

  /**
   * add collection (type)
   */
  module.addCollection = function(data, callback) {
    elastic.addMapping({
      index: data.projectName,
      type: data.tableName,
      body: {
        properties: data.properties
      }
    }, function(err, res, status) {
      if (err) {
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * add project and collection together 
   */
  module.addTogether = function(data, callback) {
    this.addProject(data, function(err, res) {
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
