var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../src/helpers/collection');
var dataService = Promise.promisifyAll(require('./../src/services/data'));
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var searchService = Promise.promisifyAll(require('./../src/services/search'));
var collectionService = require('./../src/services/collection');

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
  router.delete('/:name/:id', function deleteItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.deleteDocumentAsync({
      projectName: 'project',
      collectionName: name,
      id: id
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * update specific item
   */
  router.put('/:name/:id', function updateItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.updateDocumentAsync({
      projectName: 'project',
      collectionName: name,
      id: id,
      body: req.body
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  var searchItemsAsync = function(req, res, next) {
    var name = req.params.name;

    var aggs = {};
    if (req.query.aggs) {
      aggs = JSON.parse(req.query.aggs);
    }

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
    return searchService.searchAsync({
      projectName: 'project',
      collectionName: name,
      page: page,
      per_page: per_page,
      query: req.query.query || '',
      sort: req.query.sort || '',
      aggs: aggs,
      aroundLatLng: req.query.around_lat_lng,
      fields: fields
    })
    .then(function(result) {
      result.meta.search_time = Date.now() - time;
      return result;
    })
  };

  /*
   * search items
   */
  router.get('/:name/export', function searchItems(req, res, next) {
    return searchItemsAsync(req, res, next)
    .then(function(result) {
      res.type('application/octet-stream');
      return res.end(JSON.stringify(_.map(result.data.items, function(val) {
        return _.omit(val, 'id', 'score');
      }), null, 4));

    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * search items
   */
  router.get('/:name', function searchItems(req, res, next) {
    return searchItemsAsync(req, res, next)
    .then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * collection info (schema, table, etc)
   */
  router.get('/:name/metadata', function getCollectionInfo(req, res, next) {
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
   * mapping
   */
  router.get('/:name/mapping', function getMapping(req, res, next) {
    var name = req.params.name;
    return res.json({
      //mapping: configHelper.getMapping(name)
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
   */
  router.get('/:name/autocomplete', function autocomplete(req, res, next) {
    var name = req.params.name;
    // @todo filtering params
    searchService.suggestAsync({
      projectName: 'project',
      collectionName: name,
      query: req.query.query || ''
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
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

  /*
   * get specific item
   */
  router.get('/:name/:id', function getItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    dataService.getDocumentAsync({
      projectName: 'project',
      collectionName: name,
      id: id
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });
}
