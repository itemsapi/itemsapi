'use strict';

var winston = require('winston');
var Promise = require('bluebird');
var elastic = require('../connections/elastic').getElastic();
var indices = elastic.indices;
var _ = require('lodash');
var validate = require('validate.js');

/**
 * validation for adding index
 */
exports.addIndexValidate = function(data) {
  var constraints = {
    index: {presence: true},
  };
  return validate(data, constraints);
},

/**
 * add index (project)
 */
exports.addIndex = function(data, callback) {
  var v = this.addIndexValidate(data);
  if (v) {
    return callback(v);
  }

  elastic.indices.create(data, function(err, res) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    callback(null, res)
  })
},

/**
 * check index exists
 */
exports.existsIndex = function(data, callback) {
  elastic.indices.exists(data, function(err, res) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    callback(null, res)
  })
},

/**
 * delete index exists
 */
exports.deleteIndex = function(data, callback) {
  elastic.indices.delete(data, function(err, res) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    callback(null, res)
  })
},

exports.deleteIndexAsync = Promise.promisify(exports.deleteIndex);

/**
 * validation for adding mapping (collection schema)
 */
exports.addMappingValidate = function(data) {
  var constraints = {
    index: {presence: true},
    type: {presence: true},
    body: {presence: true},
  };
  return validate(data, constraints);
},

/**
 * add get settings
 */
exports.getSettingsAsync = function(data) {
  return elastic.indices.getSettings(data)
},

/**
 * add settings
 */
exports.addSettingsAsync = function(data) {
  var indexconf = {
    index: data.index
  }
  return elastic.indices.exists(indexconf)
  .then(function (res) {
    if (!res) {
      return elastic.indices.create(indexconf)
    }
  })
  .then(function (res) {
    return elastic.cluster.health({
      index: data.index,
      waitForStatus: 'yellow'
    })
  })
  .then(function (res) {
    return elastic.indices.close({
      index: data.index,
      //ignoreUnavailable: true,
      //allowNoIndices: true
    })
  })
  .then(function (res) {
    return elastic.indices.putSettings(data)
  })
  .then(function (res) {
    return elastic.indices.open(indexconf)
  })
},

/**
 * add mapping
 */
exports.addMapping = function(data, callback) {
  var v = this.addMappingValidate(data);
  if (v) {
    return callback(v);
  }
  elastic.indices.putMapping(data, function(err, res, status) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    callback(null, res)
  })
},

/**
 * update mapping
 */
exports.updateMapping = function(data, callback) {
  var v = this.addMappingValidate(data);
  if (v) {
    return callback(v);
  }
  data.ignore_conflicts = true;
  elastic.indices.putMapping(data, function(err, res, status) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    callback(null, res)
  })
},

/**
 * check mapping
 * @return true | false
 */
exports.existsMappingAsync = function(data, callback) {
  return indices.existsType(data)
  .then(function (res) {
    return res;
  })
},

/**
 * check type
 * @return true | false
 */
exports.existsTypeAsync = exports.existsMappingAsync,

  /**
   * delete mapping
   */
exports.deleteMappingAsync = function(data) {
  return exports.existsMappingAsync(data)
  .then(function (res) {
    if (!res) {
      return {
        notExisted: true,
        acknowledged: true
      }
    }

    return indices.deleteMapping(data)
    .then(function (res) {
      return res;
    })
  })
},

/**
 * get mapping for one type
 * @deprecated
 */
exports.getMappingForType = function(data, callback) {
  elastic.indices.getMapping(data, function(err, res, status) {
    if (err) {
      winston.error(err);
      return callback(err);
    }
    if (res[data.index] === undefined) {
      return callback('Mapping not found');
    }
    callback(null, res[data.index].mappings[data.type].properties);
  })
}

exports.getMappingForTypeAsync = Promise.promisify(exports.getMappingForType)

/**
 * get mapping for index / type
 */
exports.getMappingAsync = function(data) {
  return elastic.indices.getMapping(data)
  .then(function (res) {
    return res;
  })
}

/**
 * get mapping properties
 * return object with type, index and properties
 */
exports.getOneMappingAsync = function(data) {
  var index, type;
  return exports.getMappingAsync(data)
  .then(function (res) {
    // get first index
    index = _.keys(res)[0];
    return res[index];
  })
  .then(function (res) {
    // get mappings
    return res.mappings;
  })
  .then(function (res) {
    // get first type
    type = _.keys(res)[0];
    return res[type];
  })
  .then(function (res) {
    return {
      index: index,
      type: type,
      properties: res.properties
    };
  })
}
