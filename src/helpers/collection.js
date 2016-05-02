'use strict';
var _ = require('underscore');

module.exports = function(data) {

  var getSchema = function() {
    return data.schema || {};
  }

  var getName = function() {
    return data.name;
  }

  var getElasticSchema = function() {
    return _.mapObject(getSchema(), function(val, key) {
      return _.pick(val, 'type', 'index', 'store')
    });
  }

  var getAggregations = function() {
    return data.aggregations || {};
  }

  /**
   * be careful with using that
   * especially that aggretations is now as array or object
   */
  var getAggregation = function(name) {
    if (_.isArray(data.aggregations)) {
      return _.find(data.aggregations, {
        name: name
      });
    }
    return data.aggregations[name] || null;
  }

  var getSlugs = function() {
    return data.slugs || [];
  }

  var getSortings = function() {
    return data.sortings || {};
  }

  var getSorting = function(name) {
    return getSortings()[name] || null;
  }

  /**
   * defaults properties or property
   * i.e. sort
   */
  var getDefaults = function(option) {
    if (option) {
      return (data.defaults || {})[option];
    } else {
      return data.defaults || {};
    }
  }

  /**
   * default sorting option (key)
   */
  var getDefaultSorting = function() {
    return getSortings()[getDefaults('sort')] || null;
  }

  /**
   * chosen sorting key
   */
  var getChosenSortingKey = function(input) {
    if (getSorting(input)) {
      return input;
    } else if (getDefaultSorting()) {
      return getDefaults('sort');
    }
  }

  var getType = function() {
    return data.type || data.name;
  }

  var getIndex = function() {
    return data.index || data.project || getType();
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
    getName: getName,
    getDefaults: getDefaults,
    getDefaultSorting: getDefaultSorting,
    getChosenSortingKey: getChosenSortingKey,
    getElasticSchema: getElasticSchema,
    getAggregations: getAggregations,
    getAggregation: getAggregation,
    getSortings: getSortings,
    getSorting: getSorting,
    getType: getType,
    getIndex: getIndex,
    getSlugs: getSlugs,
    getMetadata: getMetadata
  }
};
