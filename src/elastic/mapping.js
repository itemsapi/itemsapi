'use strict';

var winston = require('winston');
var Promise = require('bluebird');
var elastic = Promise.promisifyAll(require('../connections/elastic').getElastic());
var indices = Promise.promisifyAll(require('../connections/elastic').getElastic().indices);
var _ = require('lodash');
var validate = require('validate.js');

(function(module) {

  /**
   * validation for adding index
   */
  module.addIndexValidate = function(data) {
    var constraints = {
      index: {presence: true},
    };
    return validate(data, constraints);
  },

  /**
   * add index (project)
   */
  module.addIndex = function(data, callback) {
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
  module.existsIndex = function(data, callback) {
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
  module.deleteIndex = function(data, callback) {
    elastic.indices.delete(data, function(err, res) {
      if (err) {
        winston.error(err);
        return callback(err);
      }
      callback(null, res)
    })
  },

  /**
   * validation for adding mapping (collection schema)
   */
  module.addMappingValidate = function(data) {
    var constraints = {
      index: {presence: true},
      type: {presence: true},
      body: {presence: true},
    };
    return validate(data, constraints);
  },

  /**
   * add mapping
   */
  module.addMapping = function(data, callback) {
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
  module.updateMapping = function(data, callback) {
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
  module.existsMappingAsync = function(data, callback) {
    return indices.existsType(data)
    .then(function (res) {
      return res;
    })
  },

  /**
   * check type
   * @return true | false
   */
  module.existsTypeAsync = module.existsMappingAsync,

  /**
   * delete mapping
   */
  module.deleteMappingAsync = function(data, callback) {
    return module.existsMappingAsync(data)
    .then(function (res) {
      if (!res) {
        return {
          notExisted: true,
          acknowledged: true
        }
      }

      return indices.deleteMappingAsync(data)
      .then(function (res) {
        return res[0];
      })
    })
  },

  /**
   * get mapping for one type
   * @deprecated
   */
  module.getMappingForType = function(data, callback) {
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

  /**
   * get mapping for index / type
   */
  module.getMappingAsync = function(data) {
    return elastic.indices.getMappingAsync(data)
    .then(function (res) {
      return res[0];
    })
  }

  /**
   * get mapping properties
   * return object with type, index and properties
   */
  module.getOneMappingAsync = function(data) {
    var index, type;
    return module.getMappingAsync(data)
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
}(exports));
