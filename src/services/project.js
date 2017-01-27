'use strict';

var Promise = require('bluebird');
var exec = require('child_process').exec
var elastic = Promise.promisifyAll(require('../elastic/mapping'));
var elasticData = require('../elastic/data');
var searchService = Promise.promisifyAll(require('./search'));
var collectionHelper = require('./../helpers/collection');
var configurationHelper = require('./../helpers/configuration');
var collectionService = require('./collection');
var dataService = require('./data');
var config = require('./../../config/index').get();
var logger = require('./../../config/logger');
var request = Promise.promisifyAll(require('request'));
var randomstring = require('randomstring')
var fs = require('fs')

/**
 * create project (collection + mapping + items)
 */
exports.createProjectAsync = function(data) {
  var collection

  return (data.url ? request.getAsync({
    url: data.url,
    json: true,
    gzip: true
  }) : Promise.resolve())
  .then(function(res) {
    if (data.url && res && res.body) {
      data.data = res.body
    }

    //console.log(data);
    collection = data.collection
    if (data.auto || !collection) {
      collection = configurationHelper.generateConfiguration(data.data);
    }
    collection.name = data.name || collection.name
    return collectionService.addCollectionAsync(collection)
    .then(function(res) {
      return exports.addMappingAsync({
        collectionName: collection.name
      })
    })
    .then(function(res) {
      if (data.data) {
        return dataService.addDocumentsAsync({
          collectionName: collection.name,
          body: data.data
        })
      }
    })
    .then(function(res) {
      return {
        name: collection.name
      }
    })
  })
},

/**
 * remove project (collection + mapping + data)
 */
exports.removeProjectAsync = function(data) {
  var helper
  var collection
  return collectionService.findCollectionAsync({
    name: data.name
  })
  .then(function(_collection) {
    collection = _collection
    helper = collectionHelper(collection)

    return collectionService.removeCollectionAsync({
      name: data.name
    })
  })
  .then(function(res) {
    return elastic.deleteMappingAsync({
      index: helper.getIndex(),
      type: helper.getType()
    })
  })
},

/**
 * ensure if index exist, if not then create it
 */
exports.ensureIndexAsync = function(data) {
  return elastic.existsIndexAsync({index: data.projectName})
  .then(function(res) {
    if (res === false) {
      return elastic.addIndexAsync({index: data.projectName});
    }
    return res;
  })
  .then(function(res) {
    return res;
  });
},

/**
 * ensure if project exist, if not then create it
 */
exports.ensureProjectAsync = exports.ensureIndexAsync,

  /**
   * add mapping from collection schema
   */
exports.addMappingAsync = function(data) {
  var collection;
  var helper;
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(_collection) {
    collection = _collection;
    helper = collectionHelper(collection);
    return exports.ensureIndexAsync({
      projectName: data.index || helper.getIndex()
    })
  })
  .then(function(res) {
    return elastic.addMappingAsync({
      index: data.index || helper.getIndex(),
      type: data.type || helper.getType(),
      body: {
        properties: helper.getElasticSchema()
      }
    })
  })
},

/**
 * reindex
 */
exports.reindexAsync = function(data) {
  var host = data.host || config.elasticsearch.host;
  var old_type = data.old_type
  var old_index = data.old_index
  var new_type = data.new_type
  var new_index = data.new_index

  if (!new_type || !new_index || !old_type || !old_index) {
    throw new Error('Provide data value for reindexing')
  }

  // 'host' is required for elasticsearch-reindex to work properly
  if (host.indexOf('http') === -1) {
    host = `http://${host}`;
  }

  return new Promise(function(resolve, reject) {
    var src = `${__dirname}/../../node_modules/elasticsearch-reindex/bin/elasticsearch-reindex.js`

    if (!fs.existsSync(src)) {
      src = `${__dirname}/node_modules/elasticsearch-reindex/bin/elasticsearch-reindex.js`;
    }

    if (!fs.existsSync(src)) {
      src = `node_modules/elasticsearch-reindex/bin/elasticsearch-reindex.js`;
    }

    var command = `${src} -f ${host}/${old_index}/${old_type} -t ${host}/${new_index}/${new_type}`;

    logger.info('Reindexing started.. Please wait..')
    logger.profile('collection reindexing')
    exec(command, (error, stdout, stderr) => {
      logger.profile('collection reindexing')
      logger.info(stdout)
      if (error !== null) {
        logger.error(`exec error: ${error}`);
        return reject(error)
      }
      return resolve()
    });
  })
},

/**
 * reindex collection
 */
exports.reindexCollectionAsync = function(data) {
  var reindex_data;
  var collection;
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(_collection) {
    collection = _collection;
    var helper = collectionHelper(collection);
    reindex_data = {
      // be careful about host and hosts (failover)
      host: config.elasticsearch.host,
      old_index: helper.getIndex(),
      old_type: helper.getType(),
      new_type: data.new_type || randomstring.generate({
        charset: 'abcdefghijklmnoprstuwxyz',
        length: 8
      }),
      new_index: data.new_index || helper.getIndex()
    }

    if (reindex_data.old_type === reindex_data.new_type && reindex_data.old_index === reindex_data.new_index) {
      throw new Error('there should be provided new_type or new_index different then current one')
    }

    return exports.addMappingAsync({
      collectionName: collection.name,
      type: reindex_data.new_type,
      index: reindex_data.new_index
    })
  })
  .then(function(res) {
    return exports.reindexAsync(reindex_data)
  })
  .then(function(res) {
    logger.info('reindexed data')
    return collectionService.partialUpdateCollectionAsync({
      index: reindex_data.new_index,
      type: reindex_data.new_type
    }, {
      name: collection.name
    })
  })
},




/**
 * update mapping from collection schema
 */
exports.updateMappingAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return elastic.updateMappingAsync({
      // no need to provide another custom index and type
      index: helper.getIndex(),
      type: helper.getType(),
      body: {
        properties: helper.getElasticSchema()
      }
    })
  })
},

/**
 * get mapping
 */
exports.getMappingAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return elastic.getMappingAsync({
      index: helper.getIndex(),
      type: helper.getType()
    })
  })
},

/**
 * get mapping for type
 * it is an object only with schema / mapping for given collection
 */
exports.getMappingForTypeAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return elastic.getMappingForTypeAsync({
      index: helper.getIndex(),
      type: helper.getType()
    })
  })
},

/**
 * add collection (type)
 * @the name is deprecated in the future
 */
exports.addCollectionAsync = exports.addMappingAsync,

  /**
   * ensure collection exists
   */
  exports.ensureCollectionAsync = function(data) {
  return exports.ensureProjectAsync(data)
  .then(function(res) {
    return exports.addCollectionAsync(data)
  })
},

/**
 * collection info
 */
exports.collectionInfoAsync = function(data) {
  var name = data.collectionName;
  var result;
  var collection;
  var helper;

  return collectionService.findCollectionAsync({
    name: name
  })
  .then(function(_collection) {
    collection = _collection;
    helper = collectionHelper(collection);
    return elasticData.countDocumentsAsync({
      index: helper.getIndex(),
      type: helper.getType()
    })
  })
  .then(function(res) {
    var display_name = name;
    if (collection.meta && collection.meta.title) {
      display_name = collection.meta.title;
    }
    return {
      name: name,
      project: collection.project,
      index: collection.index,
      type: collection.type,
      //visibility: collection.visibility,
      display_name: display_name,
      count: res
    };
  })
  .catch(function(err) {
    throw new Error('An error occured' + err);
  })
}
