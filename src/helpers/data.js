'use strict';
var _ = require('underscore');

/*
 * normalize input (item|items) from user
 */
exports.inputMapper = function(items, schema, options) {
  if (_.isArray(items)) {
    return _.map(items, function(item) {
      return exports.convertItem(item, schema, options);
    })
  }
  return exports.convertItem(items, schema, options);
}

exports.convertItem = function(item, schema, options) {
  var newItem = item;
  options = options || {};
  if (options.fields === 'schema') {
    newItem = _.pick(item, _.keys(schema));
  } else if (_.isArray(options.fields)) {
    newItem = _.pick(item, options.fields);
  }

  return _.mapObject(newItem, function(val, key) {
    if (schema[key] && schema[key].display === 'array' && _.isString(val)) {
      return _.map(val.split(','), function(chunk) {
        return chunk.trim();
      })
    }
    return val;
  });
}

module.exports = exports;
