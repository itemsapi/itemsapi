'use strict';
var _ = require('underscore');

module.exports = function(data) {

  var getSchema = function() {
    return data.schema || {};
  }

  var getAggregations = function() {
    return data.aggregations || {};
  }

  var getAggregation = function(name) {
    return data.aggregations[name] || null;
  }

  var getSortings = function() {
    return data.sortings || {};
  }

  var getSorting = function(name) {
    return getSortings()[name] || null;
  }

  var getMetadata = function() {
    var collection = data;
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
    getSchema: getSchema,
    getAggregations: getAggregations,
    getAggregation: getAggregation,
    getSortings: getSortings,
    getSorting: getSorting,
    getMetadata: getMetadata
  }
};

