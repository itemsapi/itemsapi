'use strict';

var Promise = require('bluebird');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');

exports.addDocumentValidate = function(data) {
  var constraints = {
    id: {presence: false},
    index: {presence: true},
    body: {presence: true},
    refresh: {presence: false},
    type: {presence: true}
  };
  return validate(data, constraints);
}

/**
 * add data to elastic
 * @param {Obj} data document
 */
exports.addDocument = function(data, callback) {

  var v = exports.addDocumentValidate(data);
  if (v) {
    return callback(v);
  }

  elastic.index({
    index: data.index,
    type: data.type,
    id: data.id,
    //replication: 'async',
    refresh: data.refresh || false,
    body: data.body
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}

exports.addDocumentsValidate = function(data) {
  var constraints = {
    index: {presence: true},
    body: {presence: true},
    type: {presence: true}
  };
  return validate(data, constraints);
}

/**
 * add multiple data to elastic
 * @param {Array} data documents
 * @param {String} index
 * @param {String} type
 */
exports.addDocuments = function(data, callback) {

  var v = exports.addDocumentsValidate(data);
  if (v) {
    return callback(v);
  }

  var body = [];
  for (var i = 0 ; i < data.body.length ; ++i) {
    var o = { create: { _id: data.body[i] ? data.body[i].id : undefined } };
    body.push(o);
    body.push(data.body[i]);
  }

  elastic.bulk({
    index: data.index,
    type: data.type,
    refresh: data.refresh || false,
    consistency: 'one',
    body: body
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}

/**
 * get item by id
 * @param {Obj} data document
 */
exports.getDocument = function(data, callback) {
  elastic.get({
    index: data.index,
    type: data.type,
    id: data.id
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}

/**
 * delete item by id
 * @param {Obj} data document
 */
exports.deleteDocument = function(data, callback) {
  elastic.delete({
    index: data.index,
    type: data.type,
    id: data.id
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}

/**
 * count documents
 * @param {Obj} data document
 */
exports.countDocumentsAsync = function(data, callback) {
  return elastic.count({
    index: data.index,
    type: data.type,
  }).then(function(res) {
    return res.count;
  });
}

/**
 * clean documents
 * @param {Obj} data document
 */
exports.cleanDocumentsAsync = function(data, callback) {
  return elastic.deleteByQuery({
    index: data.index,
    type: data.type,
    body: {
      query: {
        match_all: {}
      }
    }
  }).then(function(res) {
    return res;
  });
}

/**
 * partial update item by id
 * @param {Obj} data document
 */
exports.updateDocument = function(data, callback) {
  elastic.update({
    index: data.index,
    type: data.type,
    id: data.id,
    refresh: data.refresh || false,
    body: {doc: data.body}
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}
