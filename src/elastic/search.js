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
    var aggregations = mappingHelper.getAggregations(data.collectionName);

    console.log(data.aggs);
    var aggregation_filters = {};
    _.each(data.aggs, function(value, key) {
      if (value.length) {

        if (aggregations[key].type === 'terms') {
          aggregation_filters[key] = ejs.TermsFilter(aggregations[key].field, value);
        } else if (aggregations[key].type === 'range') {
          aggregation_filters[key] = ejs.RangeFilter(aggregations[key].field, value);
        }
      }
    });

    //console.log(aggregation_filters.toJSON());

    /*var aggregation_filters = {
      director_terms: ejs.TermsFilter('director', ['David Fincher', 'Woody Allen']),
      tags_terms: ejs.TermsFilter('tags', ['dramat', 'komedia']),
      rating_range: ejs.RangeFilter('rating').gte(7),
      votes_range: ejs.RangeFilter('votes').gte(20),
      year_range: ejs.RangeFilter('year').gte(1970).lt(1975)
    }*/

    // each aggregation will have its own filter
    // we will assign all filters to aggregations except the aggregation filter
    body.filter(ejs.AndFilter(_.values(aggregation_filters)));

    _.each(aggregations, function(value, key) {

      var faggregation = ejs.FilterAggregation(key)
        .filter(ejs.AndFilter(_.values(_.omit(aggregation_filters, key))));

      var aggregation = null;
      if (value.type === 'terms') {
        aggregation = ejs.TermsAggregation(key)
          .field(value.field)
          .size(value.size);

        if (value.field === 'tags') {
          //aggregation.include('drama');
        }

        if (value.exclude) {
          aggregation.exclude(value.exclude);
        }
      } else if (value.type === 'range') {
        aggregation = ejs.RangeAggregation(key).field(value.field);
        _.each(value.ranges, function(v, k) {
          aggregation.range(v[0], v[1], v[2]);
        });
      } else if (value.type === 'geo_distance') {
        aggregation = ejs.GeoDistanceAggregation(key)
          .field(value.field)
          .point(ejs.GeoPoint(value.point))
          .unit(value.unit)

        _.each(value.ranges, function(v, k) {
          aggregation.range(v[0], v[1], v[2]);
        });
      }
      // filter aggregation
      faggregation.agg(aggregation);
      // add aggregation to request body
      body.aggregation(faggregation);
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
