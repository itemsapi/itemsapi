'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index').get();

var storage

if (config.collections.db === 'mongodb') {
  storage = require('./../storage/collection/mongodb');
} else {
  storage = require('./../storage/collection/json');
}

module.exports = storage;

