'use strict';

var projectService = require('./../../src/services/project');
var dataService = require('./../../src/services/data');
var collectionService = require('./../../src/services/collection');
var elasticMapping = require('./../../src/elastic/mapping');
var _ = require('underscore');

(function(module) {

  /**
   * import json and create full project
   * ensure project
   * ensure mapping
   * add documents
   */
  module.import = function(data, callback) {
    collectionService.findCollectionAsync(data.collectionName)
    .then(function(res) {
      data.projectName = res.project;
      return projectService.ensureCollectionAsync(data)
    })
    .then(function(res) {
      dataService.addAllDocuments(data, function(err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res);
      });
    });
  }

  /**
   * import elastic type and save it to local collections
   */
  module.importElasticTypeMappingAsync = function(data, callback) {
    return elasticMapping.getOneMappingAsync(data)
    .then(function(res) {
      return collectionService.addCollectionAsync({
        name: res.type,
        project: res.index,
        schema: res.properties,
        table: {
          fields: _.keys(res.properties)
        }
      });
    })
  }
}(exports));
