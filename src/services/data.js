'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/data');
var async = require('async');
var _ = require('lodash');

(function(module) {

  /**
   * get document
   */
  module.addDocument = function(data, callback) {
    elastic.addDocument({
      index: 'project',
      type: data.collectionName,
      body: data.body,
      id: data.body.id
    }, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    })
  }

  /**
   * update document
   */
  module.updateDocument = function(data, callback) {
    elastic.updateDocument({
      index: 'project',
      type: data.collectionName,
      body: data.body,
      id: data.id
    }, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    })
  }

  /**
   * delete document
   */
  module.deleteDocument = function(data, callback) {
    elastic.deleteDocument({
      index: 'project',
      type: data.collectionName,
      id: data.id
    }, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res._source);
    })
  }

  /**
   * get document
   */
  module.getDocument = function(data, callback) {
    elastic.getDocument({
      index: 'project',
      type: data.collectionName,
      id: data.id
    }, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res._source);
    })
  }

  /**
   * add multiple documents elastic
   * @param {Array} data documents
   * @param {String} projectName
   * @param {String} collectionName
   */
  module.addDocuments = function(data, callback) {
    elastic.addDocuments({
      index: data.projectName,
      type: data.collectionName,
      body: data.body
    }, function(err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
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

        module.addDocuments({
          projectName: projectName,
          collectionName: collectionName,
          body: removed
        }, function(err, res) {
          if (err) {
            console.log(err);
          }
          return callback(err, res);
        });
        length -= removed.length;
      },
      function (err, res) {
        callback(null, limit + ' documents added');
      }
    );
  }
}(exports));
