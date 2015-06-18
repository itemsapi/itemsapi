'use strict';

var _ = require('underscore');

module.exports = function(data) {
  var collectionsNames = function() {
    return _.keys(data.collections);
  }

  var getSchema = function(collectionName) {
    return data.collections[collectionName].schema;
  }

  return {
    collectionsNames: collectionsNames,
    getSchema: getSchema
  }
};

