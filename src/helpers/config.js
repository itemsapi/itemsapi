'use strict';
var _ = require('underscore');

module.exports = function(data) {
  var collectionsNames = function() {
    return _.keys(data.collections);
  }

  var getSchema = function(collectionName) {
    return data.collections[collectionName].schema;
  }

  var getAggregations = function(collectionName) {
    return data.collections[collectionName].aggregations || {};
  }

  var getSortings = function(collectionName) {
    return data.collections[collectionName].sortings || {};
  }

  var getMapping = function(collectionName) {
    var collection = data.collections[collectionName];
    return collection;
  }

  var getDefaults = function(collectionName) {
    var collection = data.collections[collectionName].defaults || {};
    return collection;
  }

  var getMetadata = function(collectionName) {
    var collection = data.collections[collectionName];
    return _.extend(_.clone(collection),
      {
        table: {
          fields: _.object(_.map(collection.table.fields, function(val, i) {
            var display = 'string';
            if (collection.schema[val] && collection.schema[val].display) {
              display = collection.schema[val].display;
            }
            return [val, {name: val, display: display, sort: i}];
          }))
        }
      }
    );
  }

  return {
    collectionsNames: collectionsNames,
    getSchema: getSchema,
    getAggregations: getAggregations,
    getSortings: getSortings,
    getMapping: getMapping,
    getDefaults: getDefaults,
    getMetadata: getMetadata
  }
};

