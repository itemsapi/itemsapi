'use strict';
var _ = require('lodash')
var randomstring = require('randomstring')

var rowsToSingleArray = function(rows) {
  return _.chain(rows)
  .filter(_.isString)
  .map(function(o) {
    return _.map(o.split(','), function(val) {
      return val.trim();
    })
  })
  .flatten()
  .value()
}

exports.rowsToSingleArray = rowsToSingleArray

/**
 * arguments list should be refactored soon
 */
var detectFieldType = function(val, rows) {
  if (Number(val) === val && val % 1 !== 0) {
    return 'float'
  } else if (val === false || val === true) {
    return 'boolean'
  } else if (_.isString(val) && val.match(/([+-]?\d+(\.\d+)?)\s*\,\s*([+-]?\d+(\.\d+)?)/)) {
    return 'geo'
  } else if (_.isPlainObject(val) && val.latitude && val.longitude) {
    return 'geo'
  } else if (_.isString(val) && val.match(/\.(jpg|png|gif|jpeg)/)) {
    return 'image'
  } else if (_.isNumber(val)) {
    return 'integer'
  } else if (_.isArray(val)) {
    return 'array'
  } else if (new Date(val) !== 'Invalid Date' && !isNaN(new Date(val))) {
    //http://stackoverflow.com/a/30870755/659682
    return 'date'

    // that works but needs to be simplified
  } else if (_.isString(val)) {
    var tags = _.map(val.split(','), function(val) {
      return val.trim();
    })
    var filter = _.filter(tags, function(val) {
      return val.length <= 15
    })

    if (tags.length > 1 && filter.length === tags.length) {
      return 'array'
    }

    if (_.isArray(rows)) {
      // if value is too long then string (not array)
      for (var i = 0 ; i < rows.length ; ++i) {
        if (_.isString(rows[i]) && rows[i].length > 100) {
          return 'string'
        }
      }

      var singleArray = rowsToSingleArray(rows)
      var countBy = _.chain(singleArray)
        // ignore elements which are empty
        .filter(function(o) {
          return o.length >= 1
        })
        .countBy()
        .values()
        .sortBy()
        .reverse()
        .value();

      // if values are repeatable
      if (countBy.length >= 1 && countBy[0] > 1) {
        for (var i = 0 ; i < rows.length ; ++i) {
          if (_.isString(rows[i]) && rows[i].split(',').length > 1) {
            return 'array'
          }
        }
        return 'repeatable_string'
      }
    }

    return 'string'
  }
}

exports.detectFieldType = detectFieldType

var generateField = function(val, rows) {
  var type = detectFieldType(val, rows)

  if (type === 'float') {
    return {
      type: 'float',
      store: true
    }
  } else if (type === 'geo') {
    return {
      type: 'geo_point'
    }
  } else if (type === 'image') {
    return {
      type: 'string',
      display: 'image'
    }
  } else if (type === 'boolean') {
    return {
      type: 'boolean'
    }
  } else if (type === 'integer') {
    return {
      type: 'integer',
      store: true
    }
  } else if (type === 'repeatable_string') {
    return {
      type: 'string',
      index: 'not_analyzed',
      store: true
    }
  } else if (type === 'array') {
    return {
      type: 'string',
      display: 'array',
      index: 'not_analyzed',
      store: true
    }
  } else if (type === 'date') {
    return {
      type: 'date',
      store: true
    }
  } else if (type === 'string') {
    return {
      type: 'string',
      store: true
    }
  }
}

var generateSorting = function(key, val, rows) {
  var type = detectFieldType(val, rows)

  if (type === 'float' || type === 'integer' || type === 'date' || type === 'repeatable_string' || (type === 'string' && val.length <= 100)) {
    return {
      title: key,
      type: 'normal',
      order: 'desc',
      field: key
    }
  } else if (type === 'geo') {
    return {
      title: key,
      type: 'geo',
      order: 'asc',
      field: key
    }
  }
}

var generateAggregation = function(key, val, rows) {
  var type = detectFieldType(val, rows)

  if (type === 'float' || type === 'integer') {
    return {
      type: 'range',
      field: key,
      title: key,
      ranges: [
        {
          lte: 2,
          name: '1 - 2'
        },
        {
          lte: 3,
          gte: 2,
          name: '2 - 3'
        },
        {
          gte: 3,
          lte: 4,
          name: '3 - 4'
        },
        {
          gte: 4,
          name: '4 - 5'
        }
      ]
    }
  } else if (type === 'geo') {
    return {
      type: 'geo_distance',
      field: key,
      ranges: [
        {
          lte: 500,
          name: '< 500'
        },
        {
          gte: 500,
          lte: 1000,
          name: '500 - 1000'
        },
        {
          gte: 500,
          name: '> 1000'
        }
      ],
      unit: 'km',
      title: 'Distance ranges [km]'
    }
  } else if (type === 'array' || type === 'boolean' || type === 'repeatable_string') {
    return {
      type: 'terms',
      size: 15,
      field: key,
      title: key
    }
  }
}

/**
 * generate configuration
 */
exports.generateConfiguration = function(data, options) {
  var item = _.first(data);
  var schema = _.mapValues(item, function(val, key) {
    var rows = _.map(data, key)
    return generateField(val, rows);
  })

  var aggregations = _.mapValues(item, function(val, key) {
    var rows = _.map(data, key)
    return generateAggregation(key, val, rows);
  })

  aggregations = _.pick(aggregations, function(val) {
    return !!val
  })

  var sortings = _.mapValues(item, function(val, key) {
    var rows = _.map(data, key)
    return generateSorting(key, val, rows);
  })

  sortings = _.pick(sortings, function(val) {
    return !!val
  })

  options = options || {}
  var name = options.name || randomstring.generate({
    charset: 'abcdefghijklmnoprstuwxyz',
    length: 8
  });

  var output = {
    name: name,
    schema: schema,
    aggregations: aggregations,
    sortings: sortings
  }

  return output
}

module.exports = exports;
