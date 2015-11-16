var nconf = require('nconf');
var Promise = require('bluebird');
var _ = require('underscore');
var configHelper = require('./../src/helpers/config')(nconf.get());
var mappingHelper = require('./../src/helpers/mapping');
var collectionsNames = configHelper.collectionsNames();
var dataService = Promise.promisifyAll(require('./../src/services/data'));
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var searchService = Promise.promisifyAll(require('./../src/services/search'));

module.exports = function(router) {

  /*
   * create specific item
   */
  router.post('/:name', function postItem(req, res, next) {
    var name = req.params.name;
    var processAsync;

    if (_.isArray(req.body)) {
      processAsync = dataService.addDocumentsAsync({
        projectName: 'project',
        collectionName: name,
        body: req.body
      });
    } else {
      processAsync = dataService.addDocumentAsync({
        projectName: 'project',
        collectionName: name,
        body: req.body
      });
    }

    return processAsync.then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    })
  });

  /*
   * get specific item
   */
  router.get('/:name/id/:id', function getItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.getDocument({
      projectName: 'project',
      collectionName: name,
      id: id
    }, function afterGet(error, result) {
      if (error) {
        //return res.status(httpNotFound).json(error);
        return next(error);
      }
      return res.json(result);
    });
  });

  /*
   * clean items
   */
  router.put('/:name/recreate-mapping', function recreateMapping(req, res, next) {
    var name = req.params.name;

    elasticMapping.deleteMappingAsync({
      index: 'project',
      type: name
    })
    .then(function(result) {
      return projectService.addMappingAsync({
        projectName: 'project',
        collectionName: name
      })
    })
    .then(function(result) {
      return res.json({});
    }).catch(function(result) {
      return next(result);
    })
  });

  /*
   * clean items
   */
  router.delete('/:name', function deleteItem(req, res, next) {
    var name = req.params.name;

    dataService.cleanDocumentsAsync({
      projectName: 'project',
      collectionName: name
    }).then(function(result) {
      return res.json({});
    }).catch(function(result) {
      return next(result);
    })
  });

  /*
   * delete specific item
   */
  router.delete('/:name/id/:id', function deleteItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.deleteDocument({
      projectName: 'project',
      collectionName: name,
      id: id
    }, function afterDelete(error, result) {
      if (error) {
        return next(error);
      }
      return res.json(result);
    });
  });

  /*
   * update specific item
   */
  router.put('/:name/id/:id', function updateItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.updateDocument({
      projectName: 'project',
      collectionName: name,
      id: id,
      body: req.body
    }, function afterUpdate(error, result) {
      if (error) {
        return next(error);
      }
      return res.json(result);
    });
  });

  /*
   * search items
   */
  router.get('/:name/find', function getItems(req, res, next) {
    var name = req.params.name;

    var aggs = {};
    if (req.query.aggs) {
      aggs = JSON.parse(req.query.aggs);
    }
    //console.log(req.query.aggs);
    //console.log(aggs);

    var fields = req.query.fields;
    if (fields !== undefined) {
      fields = fields.split(",");
    }

    // it should goes to configuration files
    var per_page = req.query.per_page || 10;
    if (per_page > 20) {
      per_page = 20;
    }

    // it should goes to configuration files
    var page = req.query.page || 1;
    if (page > 10) {
      page = 10;
    }

    var time = Date.now();

    // @todo filtering params
    searchService.search({
      projectName: 'project',
      collectionName: name,
      page: page,
      per_page: per_page,
      query: req.query.query || '',
      sort: req.query.sort || '',
      aggs: aggs,
      fields: fields
    }, function afterSearch(error, result) {
      if (error) {
        return next(error);
      }
      result.meta.search_time = Date.now() - time;
      return res.json(result);
    });
  });

  /*
   * collection info (schema, table, etc)
   */
  router.get('/:name/metadata', function getCollectionInfo(req, res, next) {
    var name = req.params.name;
    return res.json({
      metadata: configHelper.getMetadata(name)
    });
  });

  /*
   * mapping
   */
  router.get('/:name/mapping', function getMapping(req, res, next) {
    var name = req.params.name;
    return res.json({
      mapping: configHelper.getMapping(name)
    });
  });

  /*
   * get similar items
   * @not working yet - in progress
   */
  router.get('/:name/:id/similar', function getSimilarItems(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    if (!id) {
      return res.status(httpNotFound).json({});
    }
    res.json({});
  });

  /*
   * item autocomplete
   * @not working yet - in progress
   *
   */
  router.get('/:name/autocomplete', function autocomplete(req, res, next) {
    var name = req.params.name;
    // @todo filtering params
    searchService.suggest({
      projectName: 'project',
      collectionName: name,
      query: req.query.query || ''
    }, function afterSuggest(error, result) {
      if (error) {
        return next(error);
      }
      return res.json(result);
    });
  });

  /**
   * find nearest items to provided current gps
   * @not working yet - in progress
   */
  router.get('/:name/near/:key/:gps', function autocomplete(req, res, next) {
    var name = req.params.name;
    res.json({});
  });
}
