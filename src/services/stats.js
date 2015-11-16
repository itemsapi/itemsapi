'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var elasticData = require('../elastic/data');
var Promise = require('bluebird');
var configHelper = require('./../helpers/config')(nconf.get());

(function(module) {

  /**
   * get stats
   */
  module.statsAsync = function(data) {
    return elasticData.countDocumentsAsync({
      index: data.projectName,
      type: data.collectionName
    })
    .then(function(res) {
      return {
        'documents_count': res,
        'collections_count': configHelper.collectionsNames().length
      };
    })
  }

}(exports));
