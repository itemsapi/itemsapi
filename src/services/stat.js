'use strict';

var Promise = require('bluebird');
var elasticData = require('../elastic/data');

(function(module) {

  /**
   * get stats
   */
  module.statsAsync = function(data) {
    return elasticData.countDocumentsAsync({
    }).then(function(res) {
      return {
        'documents_count': res,
        'collections_count': 0
      };
    })
  }
}(exports));
