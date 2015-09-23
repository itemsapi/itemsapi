'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');
var ejs = require('elastic.js');
var logger = winston.loggers.get('query');
var mappingHelper = require('./../helpers/mapping');
var _ = require('underscore');

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
      .from(offset);

    /*var scriptField = ejs.ScriptField('distance').script("doc[\u0027geo\u0027].arcDistanceInKm(lat,lon)");
    scriptField.params({
      lat: 50.0646500,
      lon: 19.9449800
    }).lang('groovy');
    body.scriptField(scriptField);
    body.fields('_source');*/

    var sortOptions = mappingHelper.getSortings(data.collectionName)[data.sort];
    var mappingDefaults = mappingHelper.getDefaults(data.collectionName);
    var defaultSort = mappingHelper.getSortings(data.collectionName)[mappingDefaults.sort];

    if (sortOptions) {
      var sort = ejs.Sort(sortOptions.field)
      if (!sortOptions.type || sortOptions.type === 'normal') {
      } else if (sortOptions.type === 'geo') {
          sort.geoDistance(ejs.GeoPoint([50.0646500, 19.9449800])).unit('km')
      }

      if (sortOptions.order) {
        sort.order(sortOptions.order);
      }
      body.sort(sort);
    } else if (defaultSort) {
      if (!defaultSort.type || defaultSort.type === 'normal') {
        var sort = ejs.Sort(defaultSort.field)
        if (defaultSort.order) {
          sort.order(defaultSort.order);
        }
        body.sort(sort);
      }
    }

    _.each(mappingHelper.getAggregations(data.collectionName), function(value, key) {
      if (value.type === 'terms') {
        var aggregation = ejs.TermsAggregation(key)
          .field(value.field)
          .size(value.size);

        if (value.exclude) {
          aggregation.exclude(value.exclude);
        }
        body.aggregation(aggregation);
      } else if (value.type === 'range') {
        var aggregation = ejs.RangeAggregation(key).field(value.field);
        _.each(value.ranges, function(v, k) {
          aggregation.range(v[0], v[1], v[2]);
        });
        body.aggregation(aggregation);
      } else if (value.type === 'geo_distance') {
        var aggregation = ejs.GeoDistanceAggregation(key)
          .field(value.field)
          .point(ejs.GeoPoint(value.point))
          .unit(value.unit)

        _.each(value.ranges, function(v, k) {
          aggregation.range(v[0], v[1], v[2]);
        });

        body.aggregation(aggregation);
      }
    });

    if (data.query) {
      body.query(ejs.QueryStringQuery(data.query));
    }

    logger.info(body.toJSON());

    elastic.search({
      index: data.projectName,
      type: data.collectionName,
      body: body,
      _source: data.fields || true
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
