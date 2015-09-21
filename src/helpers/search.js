'use strict';
var _ = require('underscore');

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
        aggregations: data.aggregations
      }
    }
  }

  return {
    searchConverter: searchConverter
  }
};

