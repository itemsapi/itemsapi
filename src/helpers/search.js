'use strict';
var _ = require('underscore');
var collectionHelper = require('./collection');

module.exports = function() {
  var searchConverter = function(input, data) {
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
        }),
        groups: [],
        aggregations: _.extend(_.clone(data.aggregations), _.mapObject(data.aggregations, function(v, k) {
          var aggregation = helper.getAggregations();

          // supports filters in aggregations
          if (!v.buckets && v[k]) {
            _.extend(v, v[k]);
            delete v[k];
          }
          return _.extend(v, {title: aggregation[k].title || k, name: k, type: aggregation[k].type });
        })),
        sortings: _.mapObject(helper.getSortings(), function(v, k) {
          return {
            name: k,
            order: v.order,
            title: v.title
          };
        })
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
    searchConverter: searchConverter,
    similarConverter: similarConverter
  }
};

