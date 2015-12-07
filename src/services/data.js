'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/data'));
var collectionService = require('../services/collection');
var async = require('async');
var _ = require('lodash');

(function(module) {

  /**
   * get document
   */
  module.addDocumentAsync = function(data) {
    return collectionService.findCollectionAsync({
      name: data.collectionName,
      project: data.projectName
    })
    .then(function(res) {
      var collection = res || {};
      return elastic.addDocumentAsync({
        index: collection.project,
        type: data.collectionName,
        body: data.body,
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
    .then(function(res) {
      return elastic.updateDocumentAsync({
        index: res.project,
        type: data.collectionName,
        body: data.body,
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
    .then(function(res) {
      return elastic.cleanDocumentsAsync({
        index: res.project,
        type: data.collectionName,
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
    .then(function(res) {
      return elastic.deleteDocumentAsync({
        index: res.project,
        type: data.collectionName,
        id: data.id
      })
    })

    return elastic.deleteDocumentAsync({
      index: data.projectName,
      type: data.collectionName,
      id: data.id
    }).then(function(res) {
      return res._source;
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
    .then(function(res) {
      return elastic.getDocumentAsync({
        index: res.project,
        type: data.collectionName,
        id: data.id
      })
    })
    .then(function(res) {
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
    .then(function(res) {
      project = res.project;
      return elastic.addDocumentsAsync({
        index: project,
        type: data.collectionName,
        body: data.body
      })
    }).then(function(res) {
      return _.pick(_.extend(res, {
        ids: _.map(res.items, function(val) {
          return val.create._id;
        }),
        project: project,
        collection: data.collectionName
      }), 'took', 'errors', 'ids', 'project', 'collection');
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

    var projectName = data.projectName;
    var collectionName = data.collectionName;

    async.whilst(
      function () { return length > 0; },
      function (callback) {

        var removed = documents.splice(0, batchSize);
        module.addDocumentsAsync({
          projectName: projectName,
          collectionName: collectionName,
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
