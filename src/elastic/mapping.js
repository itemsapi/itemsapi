'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var _ = require('lodash');
var validate = require('validate.js');

module.exports = {

  /**
   * validation for adding index
   */
  addIndexValidate: function(data) {
    var constraints = {
      index: {presence: true},
    };
    return validate(data, constraints);
  },

  /**
   * add index (project)
   */
  addIndex: function(data, callback) {
    var v = this.addIndexValidate(data);
    if (v) {
      return callback(v);
    }

    elastic.indices.create(data, function(err, res) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * check index exists
   */
  existsIndex: function(data, callback) {
    elastic.indices.exists(data, function(err, res) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * delete index exists
   */
  deleteIndex: function(data, callback) {
    elastic.indices.delete(data, function(err, res) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * validation for adding mapping (collection schema)
   */
  addMappingValidate: function(data) {
    var constraints = {
      index: {presence: true},
      type: {presence: true},
      body: {presence: true},
    };
    return validate(data, constraints);
  },

  /**
   * add mapping
   */
  addMapping: function(data, callback) {
    var v = this.addMappingValidate(data);
    if (v) {
      return callback(v);
    }

    elastic.indices.putMapping(data, function(err, res, status) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * delete mapping
   */
  deleteMapping: function(data, callback) {
    elastic.indices.deleteMapping(data, function(err, res, status) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * get mapping for type
   */
  getMappingForType: function(data, callback) {

    elastic.indices.getMapping(data, function(err, res, status) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      if (res[data.index] === undefined) {
        return callback('Mapping not found');
      }

      callback(null, res[data.index].mappings[data.type].properties);
    })
  }
}
