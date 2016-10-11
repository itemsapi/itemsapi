'use strict';

var projectService = require('./../../src/services/project');
var dataService = require('./../../src/services/data');
var collectionService = require('./../../src/services/collection');
var searchService = require('./../../src/services/search');
var elasticMapping = require('./../../src/elastic/mapping');
var collectionHelper = require('./../../src/helpers/collection');
var _ = require('underscore');
var fs = require('fs-extra');
var Promise = require('bluebird');

/**
 * import json and create full project
 * ensure index
 * ensure mapping
 * add documents
 */
exports.import = function(data, callback) {
  collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(res) {
    data.projectName = res.project;
    //data.index = 'test'
    //console.log(data);
    // @important should get index from collection
    // `project` is deprecated
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

exports.importAsync = Promise.promisify(exports.import)

/**
 * export collection
 */
exports.exportAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return searchService.searchAsync({
      index: helper.getIndex(),
      type: helper.getType(),
      per_page: data.limit || 100
    })
  })
  .then(function(res) {
    return res.data.items;
  })
  .then(function(res) {
    return fs.writeFileAsync(
      './data/exports/collection.json',
      JSON.stringify(res, null, 4),
      {encoding: 'utf8'}
    );
  })
}

/**
 * import elastic type and save it to local collections
 */
exports.importElasticTypeMappingAsync = function(data, callback) {
  return elasticMapping.getOneMappingAsync(data)
  .then(function(res) {
    return collectionService.addCollectionAsync({
      name: res.type,
      // to refactoring
      project: res.index,
      schema: res.properties,
      table: {
        fields: _.keys(res.properties)
      }
    });
  })
}
