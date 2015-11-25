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

    var sortOptions = mappingHelper.getSortings(data.collectionName)[data.sort];
    var mappingDefaults = mappingHelper.getDefaults(data.collectionName);
    var defaultSort = mappingHelper.getSortings(data.collectionName)[mappingDefaults.sort];

    var sort = module.generateSort(sortOptions);
    if (sort) {
      body.sort(sort);
    }

    var aggregationsOptions = mappingHelper.getAggregations(data.collectionName);
    var aggregationFilters = module.generateAggregationFilters(aggregationsOptions, data.aggs);
    body.filter(ejs.AndFilter(_.values(aggregationFilters)));

    // generate aggretations according to options
    var aggregations = module.generateAggregations(aggregationsOptions, aggregationFilters);

    // add all aggregations to body builder
    _.each(aggregations, function(value) {
      body.aggregation(value);
    });

    if (data.query) {
      body.query(ejs.QueryStringQuery(data.query));
    }

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
   * generate aggregations
   */
  module.generateAggregations = function(aggregations, filters) {
    return _.map(aggregations, function(value, key) {

      var filterAggregation = ejs.FilterAggregation(key)
        .filter(ejs.AndFilter(_.values(_.omit(filters, key))));

      var aggregation = null;
      if (value.type === 'terms') {
        aggregation = ejs.TermsAggregation(key)
          .field(value.field)
          .size(value.size)

        if (value.order) {
          var avg_aggregation = ejs.AvgAggregation('visits_avg')
          .field('visits');
          aggregation.aggregation(avg_aggregation);
          aggregation.order('visits_avg', 'desc');
        }

        if (value.exclude) {
          aggregation.exclude(value.exclude);
        }
      } else if (value.type === 'range') {
        aggregation = ejs.RangeAggregation(key).field(value.field);
        _.each(value.ranges, function(v, k) {
          aggregation.range(v.gte, v.lte, v.name);
        });
      } else if (value.type === 'geo_distance') {
        aggregation = ejs.GeoDistanceAggregation(key)
          .field(value.field)
          .point(ejs.GeoPoint(value.point))
          .unit(value.unit)

        _.each(value.ranges, function(v, k) {
          // @deprecated config style
          aggregation.range(v[0], v[1], v[2]);
        });
      }
      filterAggregation.agg(aggregation);
      return filterAggregation;
    });

  }

  /**
   * generate sorting
   */
  module.generateSort = function(sortOptions) {

    if (sortOptions) {
      var sort = ejs.Sort(sortOptions.field)
      if (!sortOptions.type || sortOptions.type === 'normal') {
      } else if (sortOptions.type === 'geo') {
        sort.geoDistance(ejs.GeoPoint([50.0646500, 19.9449800])).unit('km')
      }

      if (sortOptions.order) {
        sort.order(sortOptions.order);
      }
      return sort;
    }
  }

  /**
   * generate terms filter for aggregation
   */
  module.generateTermsFilter = function(options, values) {
    return ejs.TermsFilter(options.field, values);
  }

  /**
   * generate range filter for aggregation
   */
  module.generateRangeFilter = function(options, values) {
    var rangeFilters = _.chain(values)
    .map(function(value) {
      var rangeOptions = _.findWhere(options.ranges, {name: value});
      // if input is incorrect
      if (!rangeOptions) {
        return null;
      }
      var rangeFilter = ejs.RangeFilter(options.field);
      if (rangeOptions.gte) {
        rangeFilter.gte(rangeOptions.gte);
      }
      if (rangeOptions.lte) {
        rangeFilter.lte(rangeOptions.lte);
      }
      return rangeFilter;
    })
    .filter(function(val) {
      return val !== null;
    })
    .value()
    return ejs.OrFilter(rangeFilters);
  }


  /**
   * generate aggregation filters
   */
  module.generateAggregationFilters = function(aggregations, values) {
    var aggregation_filters = {};
    _.each(values, function(value, key) {
      if (value.length) {
        if (aggregations[key].type === 'terms') {
          aggregation_filters[key] = module.generateTermsFilter(aggregations[key], value)
        } else if (aggregations[key].type === 'range') {
          aggregation_filters[key] = module.generateRangeFilter(aggregations[key], value);
        }
      }
    });
    return aggregation_filters;
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
