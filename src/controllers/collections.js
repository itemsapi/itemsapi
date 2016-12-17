var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../helpers/collection');
var configurationHelper = require('./../helpers/configuration');
var projectService = Promise.promisifyAll(require('./../services/project'));
var elasticMapping = Promise.promisifyAll(require('./../elastic/mapping'));
var collectionService = require('./../services/collection');

/*
 * delete collection
 */
exports.delete = function deleteCollection(req, res, next) {
  return collectionService.removeCollectionAsync({
    name: req.params.name,
    project: req.query.project
  })
  .then(function(result) {
    return res.json({});
  }).catch(function(err) {
    return res.status(404).json();
    return next(err);
  });
};

/*
 * create collection
 */
exports.create = function postItem(req, res, next) {
  var name = req.params.name;
  var project = req.query.project;

  return collectionService.addCollectionAsync(req.body)
  .then(function(result) {
    return res.json({});
  }).catch(function(err) {
    return res.status(404).json();
    return next(err);
  });
};

/*
 * partial update specific collection
 */
exports.partialUpdate = function updateItem(req, res, next) {
  return collectionService.partialUpdateCollectionAsync(req.body, {
    name: req.params.name
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(err) {
    return res.status(404).json();
    return next(err);
  });
};

/*
 * update specific collection
 */
exports.update = function updateItem(req, res, next) {
  return collectionService.updateCollectionAsync(req.body, {
    name: req.params.name
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(err) {
    return res.status(404).json();
    return next(err);
  });
};

/*
 * get collection
 */
exports.get = function getCollection(req, res, next) {
  return collectionService.findCollectionAsync({
    name: req.params.name,
    project: req.query.project
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(err) {
    return res.status(404).json();
    return next(err);
  });
};

/*
 * get collections
 */
exports.getall = function getCollections(req, res, next) {
  return collectionService.getCollectionsAsync()
  .map(function(collection) {
    return projectService.collectionInfoAsync({
      projectName: collection.project,
      collectionName: collection.name
    }).then(function(result) {
      return _.extend(result, {
        author: 'itemsapi',
        visibility: collection.visibility
      });
    }).catch(function(result) {
      return null;
    })
  }).then(function(result) {
    return _.filter(result, function(val) {
      //return val !== null;
      return val !== null && val.visibility !== 'private';
    })
  }).then(function(result){
    return res.json({
      meta: {},
      pagination: {
        page: 1,
        per_page: 10,
        total: result.length
      },
      data: {
        items: result
      }
    });
  });
};

/*
 * processed collection info (schema, table, etc)
 * second route is deprecated
 */
exports.metadata = function getCollectionInfo(req, res, next) {
  var name = req.params.name;
  return collectionService.findCollectionAsync({
    name: name
  })
  .then(function(collection) {
    return res.json({
      metadata: collectionHelper(collection).getMetadata()
    });
  })
};

/*
 * reindex collection
 * (create new mapping on custom index/type, copy data there, and update collection configuration)
 */
exports.reindex = function (req, res, next) {
  return projectService.reindexCollectionAsync({
    collectionName: req.params.name,
    new_type: req.query.new_type,
    new_index: req.query.new_index
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(err) {
    return res.status(500).json();
  });
};

/*
 * generate collection based on sample items
 */
exports.generate = function (req, res, next) {
  var collection = configurationHelper.generateConfiguration(req.body, {
    name: req.query.name
  });
  return res.json(collection);
  //return res.status(500).json();
}
