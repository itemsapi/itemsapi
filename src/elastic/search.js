'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');
var ejs = require('elastic.js');
var logger = winston.loggers.get('query');

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
      //.sort('votes', 'desc')
      //.sort(ejs.Sort('votes').order('desc'))
      .from(offset);

    if (data.query) {
      body.query(ejs.QueryStringQuery(data.query));
    }

    logger.info(body.toJSON());

    elastic.search({
      index: data.projectName,
      type: data.collectionName,
      _source: data.fields || true,
      body: body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  /**
   * suggest documents (low level)
   */
  module.suggest = function(data, callback) {
    var query = data.query || '';
    var body = ejs.TermSuggester('mysuggester')
      .text(data.query)
      .field('name');

    logger.info(body.toJSON());

    elastic.suggest({
      index: data.projectName,
      body: body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

}(exports));
