'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var async = require('async');
var elastic = require('../elastic/search');
var _ = require('lodash');
var searchHelper = require('../helpers/search');

(function(module) {

  /**
   * search documents
   */
  module.search = function(data, callback) {
    elastic.search({
      projectName: 'project'
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, searchHelper().searchConverter(res));
    });
  }
  
}(exports));
