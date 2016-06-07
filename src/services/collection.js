'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index').get();
var fs = Promise.promisifyAll(require('fs-extra'));

var filename = config.collections.filename;
var collectionJson = require('./../storage/collection/json');
var collectionMongodb = require('./../storage/collection/mongodb');
/*var collectionJson = require('./../storage/collection/json')(
  filename: filename
);*/


module.exports = collectionJson;

