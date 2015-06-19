'use strict';
var _ = require('underscore');

module.exports = function() {
  var searchConverter = function(data) {
    return {
      meta: {
      },
      pagination: {
        page: 1,
        per_page: 10,
        total: data.hits.total
      },
      data: {
        items: _.map(data.hits.hits, function(data) {
          return _.extend(
            {id: data._id, score: data._score},
            data._source 
          );
        }),
        groups: [],
        filters: {}
      }
    }
  }

  return {
    searchConverter: searchConverter
  }
};

