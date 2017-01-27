'use strict';

var elastic = require('../connections/elastic').getElastic();
var ejs = require('elastic.js');
var collectionHelper = require('./../helpers/collection');
var geoHelper = require('./../helpers/geo');
var _ = require('lodash');
var log = require('../../config/logger')


/**
 * ItemsAPI search builder
 */
exports.searchBuilder = function(data, collection) {
  var page = data.page || 1;
  var per_page = data.per_page || 10;
  var offset = (page - 1) * per_page;
  data.geoPoint = geoHelper.getGeoPoint(data.aroundLatLng)

  var body = ejs.Request()
  .size(per_page)
  .from(offset);

  var helper = collectionHelper(collection);

  var sortOptions = helper.getSorting(data.sort) || helper.getDefaultSorting();
  var sort = exports.generateSort(sortOptions, data);

  //console.log(sort.toJSON())
  if (sort && !_.isArray(sort)) {
    body.sort(sort);
  }
  var aggregationsOptions = helper.getAggregations();

  var aggregationFilters = exports.generateAggregationFilters(aggregationsOptions, data.aggs);
  // responsible for filtering items
  var filters = _.values(aggregationFilters);

  // if field is missing we assume its default (true)
  var enabledFilter = exports.getEnabledFilter(data.collection, data)

  if (enabledFilter) {
    filters.push(enabledFilter)
  }

  body.filter(ejs.AndFilter(filters));
  //body.filter(ejs.AndFilter(ejs.TermFilter('enabled', true)));

  //console.log(JSON.stringify(body.toJSON()));

  // generate aggretations according to options
  var aggregations = exports.generateAggregations(aggregationsOptions, aggregationFilters, data);

  // add all aggregations to body builder
  _.each(aggregations, function(value) {
    body.aggregation(value);
  });

  if (data.key && data.val) {
    body.query(ejs.TermQuery(data.key, data.val));
  } else if (data.query_string && data.query) {
    var query_mix = '(' + data.query_string + ') AND "' + data.query + '"'
    body.query(
      ejs.QueryStringQuery(
        query_mix
      )
    )
  } else if (data.query_string) {
    // i.e. 'actor:Pacino AND genre:Dram*'
    body.query(ejs.QueryStringQuery(data.query_string));
  } else if (data.query) {
    // i.e. 'Al Pacino'
    body.query(ejs.QueryStringQuery('"' + data.query + '"'));
  }

  log.debug(JSON.stringify(body.toJSON(), null, 2));

  // we return json object instead of elastic.js object
  // because elastic.js is not flexible in many cases
  body = body.toJSON()

  // elastic.js doesn't support custom array like in
  // https://www.elastic.co/guide/en/elasticsearch/reference/1.5/search-request-sort.html
  // so we need to hack body query
  if (_.isArray(sort)) {
    body['sort'] = sort
  }

  return body

}

/**
 * search documents (on low level)
 */
exports.searchAsync = function(data, collection) {
  var body = exports.searchBuilder(data, collection)

  //console.log(body);
  return elastic.search({
    index: data.index,
    type: data.type,
    body: body,
    _source: data.fields || true
  })
}


/**
*/
exports._searchAsync = function(data) {
  return elastic.search({
    index: data.index,
    type: data.type,
    body: data.body
  })
}

/**
 * generate aggregations
 */
exports.generateAggregations = function(aggregations, filters, input) {
  var input = input || {};

  // load only desired aggregations
  if (_.isArray(input.load_aggs)) {
    aggregations = _.pick(aggregations, input.load_aggs)
  }

  var count_field = input.facetName || input.fieldName
  if (count_field && aggregations[count_field]) {
    aggregations[count_field + '_internal_count'] = {
      type: 'cardinality',
      field: aggregations[count_field].field
    }
  }

  return _.map(aggregations, function(value, key) {
    //console.log(key, value.field);
    // we considering two different aggregations formatting (object | array)
    key = value.name || key;
    var filterAggregation = ejs.FilterAggregation(key)
    .filter(ejs.AndFilter(_.values(_.omit(filters, key))));

    if (value.conjunction === true) {
      var filterAggregation = ejs.FilterAggregation(key)
      .filter(ejs.AndFilter(_.values(filters)));
    }

    var aggregation = null;
    if (value.type === 'terms') {

      value.sort = _.includes(['_count', '_term'], value.sort) ? value.sort : '_count'
      value.order = _.includes(['asc', 'desc'], value.order) ? value.order : 'desc'
      value.size = value.size || 10

      log.debug(value)

      aggregation = ejs.TermsAggregation(key)
      .field(value.field)
      .size(value.size)
      .order(value.sort, value.order)

      if (value.exclude) {
        aggregation.exclude(value.exclude);
      }
    } else if (value.type === 'cardinality') {
      aggregation = ejs.CardinalityAggregation(key).field(value.field);
    } else if (value.type === 'range') {
      aggregation = ejs.RangeAggregation(key).field(value.field);
      _.each(value.ranges, function(v, k) {
        aggregation.range(v.gte, v.lte, v.name);
      });
    } else if (value.type === 'geo_distance') {
      aggregation = ejs.GeoDistanceAggregation(key)
      .field(value.field)
      .point(ejs.GeoPoint(input.geoPoint))
      .unit(value.unit)

      _.each(value.ranges, function(v, k) {
        aggregation.range(v.gte, v.lte, v.name);
      });
    }
    filterAggregation.agg(aggregation);
    return filterAggregation;
  });
}

/**
 * generate sorting
 */
exports.generateSort = function(sortOptions, input) {
  var input = input || {};

  if (sortOptions) {

    var sort = ejs.Sort(sortOptions.field)
    // dont use query builder but directly return array of sorted fields
    // it is multi field sorting
    if (sortOptions.sort) {
      return sortOptions.sort
    }


    if (!sortOptions.type || sortOptions.type === 'normal') {
    } else if (sortOptions.type === 'geo') {
      sort.geoDistance(ejs.GeoPoint(input.geoPoint)).unit('km')
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
exports.generateTermsFilter = function(options, values) {
  if (options.conjunction === true) {
    return ejs.AndFilter(_.map(values, function(val) {
      return ejs.TermFilter(options.field, val);
    }));
  }
  return ejs.TermsFilter(options.field, values);
}

/**
 * generate range filter for aggregation
 */
exports.generateRangeFilter = function(options, values) {
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

exports.getEnabledFilter = function(collection, data) {
  var enabledFilter

  if (data.enabled === true) {
    enabledFilter = ejs.AndFilter(
      ejs.OrFilter([
        ejs.TermFilter('enabled', 'T'),
        ejs.MissingFilter('enabled')
      ])
    )
  } else if (data.enabled === false) {
    enabledFilter = ejs.AndFilter(
      ejs.TermFilter('enabled', 'F')
    )
  }

  return enabledFilter;
}

/**
 * generate aggregation filters
 */
exports.generateAggregationFilters = function(aggregations, values) {

  var aggregation_filters = {};
  _.each(values, function(value, key) {
    if (value.length) {
      var aggregation = collectionHelper({
        aggregations: aggregations
      }).getAggregation(key);

      if (!aggregation) {
        throw new Error('aggregation "' + key + '" is not defined in conf')
      }

      if (aggregation.type === 'terms') {
        aggregation_filters[key] = exports.generateTermsFilter(aggregation, value)
      } else if (aggregation.type === 'range') {
        aggregation_filters[key] = exports.generateRangeFilter(aggregation, value);
      }
    }
  });
  return aggregation_filters;
}


/**
 * similar documents
 * https://www.elastic.co/guide/en/elasticsearch/reference/1.3/query-dsl-mlt-query.html#query-dsl-mlt-query
 */
exports.similarAsync = function(data) {
  //var body = ejs.Request()
  //var helper = collectionHelper(data.collection);
  //ejs.MoreLikeThisQuery('tags')
  //body.query(ejs.MoreLikeThisQuery('tags'));
  // elastic.js doesnt support `ids` so we need to write plain json query
  //
  // useful
  //http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html

  var query = {
    filtered: {
      query: {
        mlt:{
          fields: data.fields,
          ids: data.ids,
          min_doc_freq: 0,
          min_term_freq: 0
        }
      }
    }
  }

  if (data.query_string) {
    query.filtered.filter = {
      query: {
        query_string: {
          query: data.query_string
        }
      }
    }
  }

  var body = {
    query: query,
    //from: 0,
    //size: 5
  }

  return elastic.search({
    index: data.index,
    type: data.type,
    body: body,
  });
}

/**
 * suggest documents (low level)
 */
exports.suggestAsync = function(data, callback) {
  var query = data.query || '';
  var body = ejs.TermSuggester('mysuggester')
  .text(data.query)
  .field('name');

  //logger.info(body.toJSON());

  elastic.suggest({
    index: data.index,
    body: body
  }, function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res);
  });
}

/**
 * find one document
 */
exports.findOneAsync = function(data, callback) {
  var body = ejs.Request()
  var query = ejs.TermQuery(data.key, data.val)
  body.query(query);

  return elastic.search({
    index: data.index,
    type: data.type,
    body: body,
    _source: true
  }).then(function(res) {
    var result = res.hits.hits;
    result = result.length ? _.extend({
      id: result[0]._id
    }, result[0]._source) : null;
    return result;
  });
}
