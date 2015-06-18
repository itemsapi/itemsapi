'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var async = require('async');

(function(module) {

  /**
   * import json and create full project
   * ensure project
   * ensure mapping
   * add documents
   * show statistics
   */
  module.import = function(data, callback) {

    projectService.ensureCollection(data.mapping, function(err, res) {
      if (err) {
        return callback(err);
      }

      dataService.addAllDocuments({
        projectName: mapping.project_name,
        collectionName: mapping.table_name,
        documents: documents
      }, function(err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res);
      });
    });
  }
}(exports));
