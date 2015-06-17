'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');

(function(module) {

  module.addDocumentValidate = function(data) {
    var constraints = {
      id: {presence: true},
      index: {presence: true},
      body: {presence: true},
      refresh: {presence: false},
      type: {presence: true}
    };
    return validate(data, constraints);
  }

  /**
   * add data to elastic
   * @param {String} index
   * @param {String} type
   * @param {String} id
   * @param {Obj|Array} body document
   */
  module.addDocument = function(data, callback) {

    var v = module.addDocumentValidate(data);
    if (v) {
      return callback(v);
    }

    elastic.index({
      index: data.index,
      type: data.type,
      id: data.id,
      //replication: 'async',
      //refresh: true,
      body: data.body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  module.addDocumentsValidate = function(data) {
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
  module.addDocuments = function(data, callback) {

    var v = module.addDocumentsValidate(data);
    if (v) {
      return callback(v);
    }

    var body = [];
    for (var i = 0 ; i < data.body.length ; ++i) {
      var o = { create: { _id: data.body[i].id } };
      body.push(o);
      body.push(data.body[i].data);
    }

    elastic.bulk({
      index: data.index,
      type: data.type,
      refresh: false,
      consistency: "one",
      body: body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

}(exports));
