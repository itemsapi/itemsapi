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
        items: data.hits.hits,
        groups: [],
        filters: {}
      }
    }
  }

  return {
    searchConverter: searchConverter
  }
};

