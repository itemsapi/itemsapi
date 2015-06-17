'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var collections = require('../connections/collections');
var elastic = require('../connections/elastic').getElastic();
var _ = require('lodash');
var validate = require('validate.js');

module.exports = {

  addIndexValidate: function(data) {
    var constraints = {
      index: {presence: true},
    };
    return validate(data, constraints);
  },

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

  addMappingValidate: function(data) {
    var constraints = {
      index: {presence: true},
      type: {presence: true},
      body: {presence: true},
    };
    return validate(data, constraints);
  },
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
