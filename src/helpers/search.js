'use strict';
var _ = require('underscore');
var mappingHelper = require('./mapping');

module.exports = function() {
  var searchConverter = function(input, data) {
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

          /*var source = doc.fields ||
          return _.extend(
            {id: doc._id, score: doc._score},
            source
          );*/
        }),
        groups: [],
        aggregations: _.extend(_.clone(data.aggregations), _.mapObject(data.aggregations, function(v, k) {
          var aggregation = mappingHelper.getAggregations(input.collection.name);

          // supports filters in aggregations
          if (!v.buckets && v[k]) {
            _.extend(v, v[k]);
            delete v[k];
          }
          return _.extend(v, {title: aggregation[k].title || k, name: k, type: aggregation[k].type });
        })),
        sortings: _.mapObject(mappingHelper.getSortings(input.collection.name), function(v, k) {
          return {
            name: k,
            order: v.order,
            title: v.title
          };
        })
      }
    }
  }
  return {
    searchConverter: searchConverter
  }
};

