'use strict';
var _ = require('underscore');
var mappingHelper = require('./mapping');

module.exports = function() {
  var searchConverter = function(input, data) {
    return {
      meta: {
        query: input.query
      },
      pagination: {
        page: input.page,
        per_page: input.per_page,
        total: data.hits.total
      },
      data: {
        items: _.map(data.hits.hits, function(doc) {
          var source = doc.fields || doc._source
          return _.extend(
            {id: doc._id, score: doc._score},
            source
          );
        }),
        groups: [],
        aggregations: _.extend(_.clone(data.aggregations), _.mapObject(data.aggregations, function(v, k) {
          var aggregation = mappingHelper.getAggregations(input.collectionName);
          return _.extend(v, {title: aggregation[k].title || k });
        }))
      }
    }
  }

  return {
    searchConverter: searchConverter
  }
};

