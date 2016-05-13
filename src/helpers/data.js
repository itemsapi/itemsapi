'use strict';
var _ = require('lodash');
var collectionHelper = require('../helpers/collection');

/*
 * normalize input (item|items) from user
 * i.e. split comma delimiter string for array
 */
exports.inputMapper = function(items, collection, options) {
  if (_.isArray(items)) {
    return _.map(items, function(item) {
      return exports.convertItem(item, collection, options);
    })
  }
  return exports.convertItem(items, collection, options);
}

/**
 * map string with delimiter for an array
 */
exports.convertItem = function(item, collection, options) {
  var helper = collectionHelper(collection);
  options = options || {}

  if (!options.check_fields || _.indexOf(options.check_fields, 'array') !== -1) {
    item = exports.arrayField(item, helper.getSchema())
  }

  if (!options.check_fields || _.indexOf(options.check_fields, 'enabled') !== -1) {
    item = exports.enabledField(item, helper.getExtraSchema())
  }

  return item;
}

/**
 * add `enabled` field into item if `enabled` exists in extraSchema
 */
exports.enabledField = function(item, schema, options) {
  if (item.enabled === false || item.enabled === true) {
    return item;
  }
  if (schema.enabled) {
    item.enabled = collectionHelper().enabledFieldDefaultValue(schema);

    /*if (schema.enabled.default === false || schema.enabled.null_value === false) {
      item.enabled = false;
    } else {
      item.enabled = true;
    }*/
  }
  return item;
}

/**
 * if extraSchema.field exists enabled must be defined
 * otherwise it can be undefined
 */
exports.enabledFieldDefaultValue = function(schema) {
  if (schema.enabled) {
    if (schema.enabled.default === false || schema.enabled.null_value === false) {
      return false;
    } else {
      return true;
    }
  }
}

/**
 * map string with delimiter for an array
 * in the future array field should jump into extra schema
 * as elasticsearch doesnt have array field type
 */
exports.arrayField = function(item, schema, options) {
  var newItem = item;

  // it is unnecessary right now
  /*options = options || {};
  if (options.fields === 'schema') {
    newItem = _.pick(item, _.keys(schema));
  } else if (_.isArray(options.fields)) {
    newItem = _.pick(item, options.fields);
  }*/

  return _.mapValues(newItem, function(val, key) {
    if (schema[key] && schema[key].display === 'array' && _.isString(val)) {
      return _.map(val.split(','), function(chunk) {
        return chunk.trim();
      })
    }
    return val;
  });
}

module.exports = exports;
