'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var async = require('async');
var projectService = require('./../../src/services/project');
var dataService = require('./../../src/services/data');

(function(module) {

  /**
   * import json and create full project
   * ensure project
   * ensure mapping
   * add documents
   */
  module.import = function(data, callback) {
    projectService.ensureCollectionAsync(data)
    .then(function(res) {
      dataService.addAllDocuments(data, function(err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res);
      });
    });
  }
}(exports));
