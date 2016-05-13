var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../src/helpers/collection');
var dataService = Promise.promisifyAll(require('./../src/services/data'));
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var elastic = Promise.promisifyAll(require('./../src/elastic/search'));
var searchService = Promise.promisifyAll(require('./../src/services/search'));
var collectionService = require('./../src/services/collection');

module.exports = function(router) {

  /*
   * create specific item
   */
  router.post(['/items/:name', '/:name'], function postItem(req, res, next) {
    var name = req.params.name;
    var project = req.query.project;
    var processAsync;

    if (_.isArray(req.body)) {
      processAsync = dataService.addDocumentsAsync({
        projectName: project,
        collectionName: name,
        body: req.body
      });
    } else {
      processAsync = dataService.addDocumentAsync({
        projectName: project,
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
   * @deprecated
   */
  router.put(['/items/:name/recreate-mapping', '/:name/recreate-mapping'], function recreateMapping(req, res, next) {
    var name = req.params.name;
    var project = req.query.project;

    elasticMapping.deleteMappingAsync({
      index: project,
      type: name
    })
    .then(function(result) {
      return projectService.addMappingAsync({
        projectName: project,
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
  router.delete(['/items/:name', '/:name'], function deleteItem(req, res, next) {
    var name = req.params.name;
    var project = req.query.project;

    dataService.cleanDocumentsAsync({
      projectName: project,
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
  router.delete(['/items/:name/:id', '/:name/:id'], function deleteItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;
    var project = req.query.project;

    dataService.deleteDocumentAsync({
      projectName: project,
      collectionName: name,
      id: id
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * enable / disable item
   */
  router.put(['/items/:name/:id/enable', '/items/:name/:id/disable'], function (req, res, next) {
    var id = req.params.id;
    var name = req.params.name;
    var path = req.route.path;
    var enabled = path.indexOf('enable') !== -1 ? true : false;

    dataService.enableDocumentAsync({
      name: name,
      id: id,
      enabled: enabled
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * update specific item
   */
  router.put(['/items/:name/:id', '/:name/:id'], function updateItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;
    var project = req.query.project;

    dataService.updateDocumentAsync({
      projectName: project,
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
    var project = req.query.project;

    var aggs = {};
    if (req.query.aggs) {
      aggs = JSON.parse(req.query.aggs);
    }

    var fields = req.query.fields;
    if (fields !== undefined) {
      fields = fields.split(",");
    }

    var per_page = req.query.per_page || 10;

    // max limit etc should goes to configuration files
    var page = req.query.page || 1;

    var time = Date.now();

    // @todo filtering params
    return searchService.searchAsync({
      projectName: project,
      collectionName: name,
      page: page,
      per_page: per_page,
      query: req.query.query || '',
      sort: req.query.sort || '',
      key: req.query.key || '',
      val: req.query.val || '',
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
  router.get(['/items/:name/export', '/:name/export'], function searchItems(req, res, next) {
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
  router.get(['/items/:name', '/:name'], function searchItems(req, res, next) {
    return searchItemsAsync(req, res, next)
    .then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });

  /*
   * search items using native (prefiltered) elasticsearch /_search endpoint
   */
  router.post(['/items/:name/_search'], function searchItems(req, res, next) {

    var name = req.params.name;
    var body = req.body || {};

    return collectionService.findCollectionAsync({
      name: name
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic._searchAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        body: body
      })
    })
    .then(function(result) {
      return res.json(result);
    })
    .catch(function(result) {
      console.log(result.stack);
      return res.status(400).json({});
    })
  });



  /*
   * mapping
   * @deprecated
   */
  router.get('/:name/mapping', function getMapping(req, res, next) {
    var name = req.params.name;
    return res.json({
      //mapping: configHelper.getMapping(name)
    });
  });

  /*
   * get similar items
   */
  router.get('/items/:name/:id/similar', function getSimilarItems(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;
    var project = req.query.project;

    var fields = req.query.fields;
    if (fields !== undefined) {
      fields = fields.split(",");
    }

    var per_page = req.query.per_page || 8;

    return searchService.similarAsync({
      projectName: project,
      collectionName: name,
      ids: [id],
      per_page: per_page,
      fields: fields
    })
    .then(function(result) {
      return res.json(result);
    })
    .catch(function(result) {
      console.log(result);
      return res.status(400).json({});
    })
  });

  /*
   * find one
   */
  router.get('/items/:name/:key/:val/one', function findOne(req, res, next) {
    var key = req.params.key;
    var val = req.params.val;
    var name = req.params.name;
    var project = req.query.project;

    return collectionService.findCollectionAsync({
      name: name,
      project: project
    })
    .then(function(collection) {
      var helper = collectionHelper(collection);
      return elastic.findOneAsync({
        index: helper.getIndex(),
        type: helper.getType(),
        key: key,
        val: val
      })
    })
    .then(function(result) {
      if (!result) {
        return res.status(404).json({});
      }
      return res.json(result);
    })
    .catch(function(result) {
      console.log(result.stack);
      //return next();
      return res.status(400).json({});
    })
  });

  /*
   * item autocomplete
   * @not working yet - in progress
   */
  router.get(['/items/:name/autocomplete', '/:name/autocomplete'], function autocomplete(req, res, next) {
    var name = req.params.name;
    var project = req.query.project;
    // @todo filtering params
    searchService.suggestAsync({
      projectName: project,
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
  router.get(['/items/:name/near/:key/:gps', '/:name/near/:key/:gps'], function autocomplete(req, res, next) {
    var name = req.params.name;
    res.json({});
  });

  /*
   * get specific item
   */
  router.get(['/items/:name/:id', '/:name/:id'], function getItem(req, res, next) {
    var id = req.params.id;
    var name = req.params.name;

    return dataService.getDocumentAsync({
      collectionName: name,
      id: id
    }).then(function(result) {
      return res.json(result);
    }).catch(function(result) {
      return next(result);
    });
  });
}
