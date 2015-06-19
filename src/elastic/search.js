'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');
var ejs = require('elastic.js');

(function(module) {

  /**
   * search documents (on low level)
   */
  module.search = function(data, callback) {
    elastic.search({
      index: data.projectName,
      body: ejs.Request()
      //.query(ejs.MatchQuery('title', 'test'))
      //.facet(ejs.TermsFacet('tags').field('tags'))
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

}(exports));
