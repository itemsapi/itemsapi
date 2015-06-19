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
    var page = data.page || 1;
    var per_page = data.per_page || 10;
    var offset = (page - 1) * per_page;

    var body = ejs.Request()
      .size(per_page)
      .from(offset)
      .query(ejs.QueryStringQuery(data.query))
      //.query(ejs.MatchQuery('name', data.query))
      //.facet(ejs.TermsFacet('tags').field('tags'))
      ;

    var logger = winston.loggers.get('query');
    logger.info(body.toJSON());

    elastic.search({
      index: data.projectName,
      _source: data.fields || true,
      body: body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

}(exports));
