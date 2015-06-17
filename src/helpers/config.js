'use strict';

var _ = require('underscore');

module.exports = function(data) {
  var collectionsNames = function() {
    return _.keys(data.collections);
  }

  return {
    collectionsNames: collectionsNames
  }
};

