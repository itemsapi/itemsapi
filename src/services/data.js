'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/data'));
var collectionService = require('../services/collection');
var async = require('async');
var _ = require('lodash');
var dataHelper = require('../helpers/data');
var collectionHelper = require('../helpers/collection');

(function(module) {

  /**
   * get document
   */
  module.addDocumentAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.addDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        refresh: data.refresh,
        body: dataHelper.inputMapper(data.body, collection.schema),
        id: data.body.id
      })
    }).then(function(res) {
      return {
        id: res._id,
        collection: res._type,
        project: res._index
      }
    })
  }

  /**
   * update document
   */
  module.updateDocumentAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.updateDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        body: dataHelper.inputMapper(data.body, collection.schema),
        id: data.id
      })
    }).then(function(res) {
      return res;
    })
  }

  /**
   * clean documents
   */
  module.cleanDocumentsAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.cleanDocumentsAsync({
        index: helper.getIndex(),
        type: helper.getType()
      });
    })
  }

  /**
   * delete document
   */
  module.deleteDocumentAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.deleteDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        id: data.id
      })
    })
  }

  /**
   * get document
   */
  module.getDocumentAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.getDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        id: data.id
      })
    })
    .then(function(res) {
      var output = res._source;
      //console.log(res);
      //console.log(output);
      if (output.body) {
        output.body.id = res._id;
      }
      return res._source;
    })
  }

  /**
   * add multiple documents elastic
   * @param {Array} data documents
   * @param {String} projectName
   * @param {String} collectionName
   */
  module.addDocumentsAsync = function(data) {
    var project;
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.addDocumentsAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        refresh: data.refresh,
        body: dataHelper.inputMapper(data.body, collection.schema),
      })
    }).then(function(res) {
      return _.pick(_.extend(res, {
        ids: _.map(res.items, function(val) {
          return val.create._id;
        }),
        //project: project,
        collection: data.collectionName
      }), 'took', 'errors', 'ids', 'collection');
    })
  }

  /**
   * add all documents to elastic
   * @param {Array} documents full data
   * @param {String} projectName
   * @param {String} collectionName
   * @param {Integer} batchSize
   * @return {String} inserted documents count
   */
  module.addAllDocuments = function(data, callback) {

    var documents = data.body;
    var limit = documents.length;
    var length = documents.length;

    var batchSize = data.batchSize || 1000;

    var count = 0;

    // needs to be refactored
    var projectName = data.projectName;
    var collectionName = data.collectionName;

    async.whilst(
      function () { return length > 0; },
      function (callback) {

        var removed = documents.splice(0, batchSize);
        module.addDocumentsAsync({
          // needs to be refactored
          projectName: projectName,
          collectionName: collectionName,
          refresh: data.refresh,
          body: removed
        }).then(function(res) {
          return callback(null, res);
        }).catch(function(err) {
          return callback(err);
        })
        length -= removed.length;
      },
      function (err, res) {
        if (err) {
          console.log(err);
        }
        callback(null, limit + ' documents added');
      }
    );
  }
}(exports));
