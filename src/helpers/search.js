'use strict';
var _ = require('underscore');
var collectionHelper = require('./collection');

/**
 * export here should not be global
 * should be refactored
 */
module.exports = function() {

  var getAggregationsResponse = function(collection_aggregations, elastic_aggregations) {
    var aggregations;
    if (_.isArray(collection_aggregations)) {
      aggregations = _.map(collection_aggregations, function(v, k) {
        var output = _.extend(v, elastic_aggregations[v.name]);
        if (elastic_aggregations[v.name][v.name]) {
          output = _.extend(v, elastic_aggregations[v.name][v.name]);
          delete output[v.name]
        }
        return output;
      })
    } else {
      aggregations = _.extend(_.clone(elastic_aggregations), _.mapObject(elastic_aggregations, function(v, k) {
        // supports filters in aggregations
        if (!v.buckets && v[k]) {
          _.extend(v, v[k]);
          delete v[k];
        }
        return _.extend(v, {
          title: collection_aggregations[k].title || k,
          name: k,
          type: collection_aggregations[k].type
        });
      }))
    }

    return aggregations;
  }

  var searchConverter = function(input, data) {
    var helper = collectionHelper(input.collection);

    var items = _.map(data.hits.hits, function(doc) {
      return _.extend(
        {id: doc._id, score: doc._score},
        doc._source, doc.fields
      );
    })

    var sortings = _.mapObject(helper.getSortings(), function(v, k) {
      return {
        name: k,
        order: v.order,
        title: v.title
      };
    })

    return {
      meta: {
        query: input.query,
        sort: input.sort
      },
      pagination: {
        page: input.page,
        per_page: input.per_page,
        total: data.hits.total
      },
      data: {
        items: items,
        aggregations: getAggregationsResponse(
          helper.getAggregations(),
          data.aggregations
        ),
        sortings: sortings
      }
    }
  }

  var similarConverter = function(input, data) {
    var helper = collectionHelper(input.collection);
    return {
      meta: {
        query: input.query,
        sort: input.sort
      },
      pagination: {
        page: input.page,
        per_page: input.per_page,
        total: data.hits.total
      },
      data: {
        items: _.map(data.hits.hits, function(doc) {
          return _.extend(
            {id: doc._id, score: doc._score},
            doc._source, doc.fields
          );
        })
      }
    }
  }

  return {
    getAggregationsResponse: getAggregationsResponse,
    searchConverter: searchConverter,
    similarConverter: similarConverter
  }
};

