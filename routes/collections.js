var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../src/helpers/collection');
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var collectionService = require('./../src/services/collection');

module.exports = function(router) {

  /*
   * delete collection
   */
  router.delete('/collections/:name', function deleteCollection(req, res, next) {
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
  });

  /*
   * create collection
   */
  router.post('/collections', function postItem(req, res, next) {
    var name = req.params.name;
    var project = req.query.project;

    return collectionService.addCollectionAsync(req.body)
    .then(function(result) {
      return res.json({});
    }).catch(function(err) {
      return res.status(404).json();
      return next(err);
    });
  });

  /*
   * update specific collection
   */
  router.put('/collections/:name', function updateItem(req, res, next) {
    return collectionService.updateCollectionAsync(req.body, {
      name: req.params.name,
      project: req.query.project
    })
    .then(function(result) {
      return res.json(result);
    }).catch(function(err) {
      return res.status(404).json();
      return next(err);
    });
  });

  /*
   * get collection
   */
  router.get('/collections/:name', function getCollection(req, res, next) {
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
  });

  /*
   * get collections
   */
  router.get('/collections', function getCollections(req, res, next) {
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
  });

  /*
   * processed collection info (schema, table, etc)
   * second route is deprecated
   */
  router.get(['/collections/:name/metadata', '/:name/metadata'], function getCollectionInfo(req, res, next) {
    var name = req.params.name;
    return collectionService.findCollectionAsync({
      name: name
    })
    .then(function(collection) {
      return res.json({
        metadata: collectionHelper(collection).getMetadata()
      });
    })
  });

  /*
   * returns elasticsearch mapping for collection
   */
  router.get('/collections/:name/mapping', function getCollectionInfo(req, res, next) {
    var name = req.params.name;
    return collectionService.findCollectionAsync({
      name: name
    })
    .then(function(collection) {
      return elasticMapping.getMappingAsync({
        type: collection.name,
        index: collection.project
      })
    })
    .then(function(mapping) {
      return res.json(mapping);
    })
  });

  /*
   * update elasticsearch mapping
   */
  router.put('/collections/:name/mapping', function (req, res, next) {
    var name = req.params.name;
    return projectService.updateMappingAsync({
      collectionName: name
    })
    .then(function(result) {
      return res.json(result);
    })
  });

  /*
   * add elasticsearch mapping
   */
  router.post('/collections/:name/mapping', function (req, res, next) {
    var name = req.params.name;
    return projectService.addMappingAsync({
      collectionName: name
    })
    .then(function(result) {
      return res.json(result);
    })
  });
}
