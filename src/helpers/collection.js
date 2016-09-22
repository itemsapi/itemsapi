'use strict';
var _ = require('lodash');

module.exports = function(data) {

  data = data || {}

  var getSchema = function() {
    return data.schema || {};
  }

  var getExtraSchema = function() {
    return data.extraSchema || {};
  }

  var getFullSchema = function() {
    return _.merge(getExtraSchema(), getSchema());
  }

  var getName = function() {
    return data.name;
  }

  var getElasticSchema = function() {
    // omit non elasticsearch properties
    // elasticsearch 2.x is more strict about non elasticsearch properties
    return _.mapValues(getSchema(), function(val, key) {
      return _.omit(val, 'display')
    });
    /*return _.mapObject(getSchema(), function(val, key) {
      return _.pick(val, 'type', 'index', 'store')
    });*/
  }

  var getAggregations = function() {
    return data.aggregations || {};
  }

  /**
   * update aggregation on fly
   * by field, value or object with key value pairs
   */
  var updateAggregation = function(name, a, b) {
    if (_.isArray(data.aggregations)) {
      var index = _.findIndex(data.aggregations, {
        name: name
      })
      if (!data.aggregations[index]) {
        throw new Error('aggregation "' + name + '" doesnt exist')
      }
      data.aggregations[index][a] = b
    } else {
      if (!data.aggregations[name]) {
        throw new Error('aggregation "' + name + '" doesnt exist')
      }
      data.aggregations[name][a] = b
    }
  }

  /**
   * add aggregation on fly (by field)
   * by field, value or object with key value pairs
   */
  var addAggregation = function(name, obj) {
    if (_.isArray(data.aggregations)) {
      obj.name = name

      var index = _.findIndex(data.aggregations, {
        name: name
      })
      if (!data.aggregations[index]) {
        data.aggregations.push(obj)
      } else {
        data.aggregations[index] = obj
      }
    } else {
      data.aggregations[name] = obj
    }
  }

  /**
   * be careful with using that
   * especially that aggretations is now as array or object
   */
  var getAggregation = function(name) {
    if (_.isArray(data.aggregations)) {
      return _.find(data.aggregations, {
        name: name
      })
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

  var enabledFieldDefaultValue = function(schema) {
    var schema = schema || getExtraSchema()
    if (!schema.enabled || schema.enabled.default === false || schema.enabled.null_value === false) {
      return false;
    }
    return true;
  }

  var getCollection = function() {
    return data
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
    getExtraSchema: getExtraSchema,
    getFullSchema: getFullSchema,
    enabledFieldDefaultValue: enabledFieldDefaultValue,
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
    getMetadata: getMetadata,
    getCollection: getCollection,
    updateAggregation: updateAggregation,
    addAggregation: addAggregation
  }
};
