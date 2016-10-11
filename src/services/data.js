'use strict';

var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../elastic/data'));
var collectionService = require('../services/collection');
var slugs = require('../libs/slugs');
var async = require('async');
var _ = require('lodash');
var dataHelper = require('../helpers/data');
var collectionHelper = require('../helpers/collection');

/**
 * get document
 */
exports.addDocumentAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);

    return slugs.setSlugsAsync(
      helper.getName(),
      helper.getSlugs(),
      dataHelper.inputMapper(data.body, collection)
    ).then(function(res) {
      return elastic.addDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        refresh: data.refresh,
        body: dataHelper.inputMapper(data.body, collection),
        id: data.body.id
      })
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
exports.updateDocumentAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return slugs.setSlugsAsync(
      helper.getName(),
      helper.getSlugs(),
      dataHelper.inputMapper(data.body, collection)
    ).then(function(res) {

      // dirty hack
      // should be enabled should be ignored as additional configuratoin
      // i.e. ignoredFields object
      /*var temp = _.clone(collection);
        if (temp.extraSchema && temp.extraSchema.enabled) {
        delete temp.extraSchema.enabled;
        }*/

      return elastic.updateDocumentAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        //body: data.body,
        refresh: data.refresh,
        body: dataHelper.inputMapper(data.body, collection, {
          check_fields: ['array']
        }),
        id: data.id
      })
    })
  }).then(function(res) {
    return res;
  })
}

/**
 * clean documents
 */
exports.cleanDocumentsAsync = function(data) {
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
exports.deleteDocumentAsync = function(data) {
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
 * enable / disable item / document
 */
exports.enableDocumentAsync = function(data) {
  if (!data.id) {
    throw new Error('item id is missing')
  }
  return collectionService.findCollectionAsync({
    name: data.name
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return elastic.updateDocumentAsync({
      index: helper.getIndex(),
      type: helper.getType(),
      refresh: data.refresh,
      body: {
        enabled: data.enabled
      },
      id: data.id
    })
  })
  .then(function(res) {
    return res;
  })
}

/**
 * get document
 */
exports.getDocumentAsync = function(data) {
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
exports.addDocumentsAsync = function(data) {
  var project;
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);

    // adding slugs mapping to key value datastore
    return slugs.setSlugsAsync(
      helper.getName(),
      helper.getSlugs(),
      dataHelper.inputMapper(data.body, collection)
    ).then(function(res) {
      return elastic.addDocumentsAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        refresh: data.refresh,
        body: dataHelper.inputMapper(data.body, collection),
      })
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
exports.addAllDocuments = function(data, callback) {

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
      exports.addDocumentsAsync({
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
