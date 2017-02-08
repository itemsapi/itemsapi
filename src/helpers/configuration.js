'use strict';
var _ = require('lodash')
var randomstring = require('randomstring')
var moment = require('moment')

var DATE_FORMATS = [
  moment.ISO_8601,
  'MM/DD/YYYY'
];


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
    //http://stackoverflow.com/a/1830844/659682
    return 'float'
  } else if (val === false || val === true) {
    return 'boolean'
  } else if (
    _.isString(val) &&
    // we assume we have no more than 3 numbers in a string
    val.replace(/[0-9\s\.\,]/g,"").length < 3 &&
    val.match(/([+-]?\d+(\.\d+)?)\s*\,\s*([+-]?\d+(\.\d+)?)/)
  ) {
    return 'geo'
  } else if (_.isPlainObject(val) && val.latitude && val.longitude) {
    return 'geo'
  } else if (_.isString(val) && val.match(/\.(jpg|png|gif|jpeg)/)) {
    return 'image'
  } else if (_.isNumber(val)) {
    //http://stackoverflow.com/a/1830844/659682
    return 'integer'
  } else if (_.isArray(val)) {
    return 'array'
  } else if (moment(val, DATE_FORMATS, true).isValid()) {
  //} else if (new Date(val) !== 'Invalid Date' && !isNaN(new Date(val))) {
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

var generateField = function(key, val, rows) {
  var type = detectFieldType(val, rows)

  if (key === 'image') {
    return {
      type: 'string',
      display: 'image'
    }
  } else if (key === 'permalink') {
    return {
      type: 'string',
      index: 'not_analyzed',
      store: true
    }
  } else if (type === 'float') {
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

/**
 * the easiest and simpliest algorithm
 * it needs to be better
 */
var generateRanges = function(rows, count) {
  count = count || 5
  var min = _.floor(_.min(rows))
  var max = _.ceil(_.max(rows))

  if (max - min < count) {
    count = max - min
  }

  var step = parseInt(((max-min) / count))
  var result = _.range(min, max, step)

  if ((max-min) % count !== 0) {
    result.pop()
  }
  result.push(max)
  return result
}

exports.generateRanges = generateRanges

/**
 * the easiest and simpliest algorithm for generating number ranges
 */
var generateRangesForElastic = function(rows, count) {

  var ranges = generateRanges(rows, count)
  var output = []

  for (var i = 0 ; i < ranges.length - 1 ; ++i) {
    var obj = {
      name: ranges[i] + ' - ' + ranges[i+1]
    }

    if (i === 0) {
      obj.lte = ranges[i+1]
    } else if (i === ranges.length - 2) {
      obj.gte = ranges[i]
    } else {
      obj.lte = ranges[i+1]
      obj.gte = ranges[i]
    }

    output.push(obj)
  }
  return output;
}

exports.generateRangesForElastic = generateRangesForElastic

var generateAggregation = function(key, val, rows) {
  var type = detectFieldType(val, rows)

  var ranges = generateRangesForElastic(rows)


  if (type === 'float' || type === 'integer') {
    return {
      type: 'range',
      field: key,
      title: key,
      ranges: ranges
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
      conjunction: true,
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
    return generateField(key, val, rows);
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
