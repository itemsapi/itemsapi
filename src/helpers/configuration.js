'use strict';
var _ = require('lodash')
var randomstring = require('randomstring')

var detectFieldType = function(val) {
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
  } else if (_.isString(val)) {
    return 'string'
  }
}

var generateField = function(val) {
  var type = detectFieldType(val)

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

var generateSorting = function(key, val) {
  var type = detectFieldType(val)

  if (type === 'float' || type === 'integer' || type === 'date' || (type === 'string' && val.length <= 100)) {
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

var generateAggregation = function(key, val) {
  var type = detectFieldType(val)

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
  } else if (type === 'array' || type === 'boolean') {
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
    return generateField(val);
  })

  var aggregations = _.mapValues(item, function(val, key) {
    return generateAggregation(key, val);
  })

  aggregations = _.pick(aggregations, function(val) {
    return !!val
  })

  var sortings = _.mapValues(item, function(val, key) {
    return generateSorting(key, val);
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
