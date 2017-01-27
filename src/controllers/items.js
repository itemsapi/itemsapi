var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../helpers/collection');
var dataService = Promise.promisifyAll(require('./../services/data'));
var projectService = Promise.promisifyAll(require('./../services/project'));
var elasticMapping = Promise.promisifyAll(require('./../elastic/mapping'));
var elastic = Promise.promisifyAll(require('./../elastic/search'));
var searchService = Promise.promisifyAll(require('./../services/search'));
var statsService = Promise.promisifyAll(require('./../services/stats'));
var collectionService = require('./../services/collection');

/*
 * get specific item
 */
exports.get = function getItem(req, res, next) {
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
};

/*
 * create specific item
 */
exports.create = function postItem(req, res, next) {
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
};


exports.clean = function deleteItem(req, res, next) {
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
};

/*
 * delete specific item
 */
exports.delete = function deleteItem(req, res, next) {
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
};


/*
 * enable / disable item
*/
exports.enabled = function (req, res, next) {
  var id = req.params.id;
  var name = req.params.name;
  var path = req.route.path;

  var enabled;
  if (req.params.enabled) {
    enabled = req.params.enabled
  } else {
    enabled = req.path.indexOf('enable') !== -1 ? true : false
  }

  dataService.enableDocumentAsync({
    name: name,
    id: id,
    enabled: enabled
  }).then(function(result) {
    return res.json(result);
  }).catch(function(result) {
    return next(result);
  });
};


exports.update = function updateItem(req, res, next) {
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
};

var searchItemsAsync = function(req, res, next) {
  var name = req.params.name;
  var project = req.query.project;

  var aggs = {};
  if (req.query.aggs) {
    aggs = JSON.parse(req.query.aggs);
  }

  var fields = req.query.fields;
  if (fields !== undefined) {
    fields = fields.split(',');
  }

  // it defines which aggregations should be loaded with search
  // empty load_aggs is best for performance but instead is not providing any aggregations
  var load_aggs = req.query.load_aggs;
  if (load_aggs === '') {
    load_aggs = []
  } else if (load_aggs !== undefined) {
    load_aggs = load_aggs.split(',');
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
    query_string: req.query.query_string || '',
    sort: req.query.sort || '',
    load_aggs: load_aggs,
    key: req.query.key || '',
    val: req.query.val || '',
    aggs: aggs,
    aroundLatLng: req.query.around_lat_lng,
    fields: fields
  })
  .then(function(result) {
    result.meta.search_time = Date.now() - time;
    return result;
  }).catch(function(error) {
    return next(error);
  })
};

exports.search = function(req, res, next) {
  return searchItemsAsync(req, res, next)
  .then(function(result) {
    return res.json(result);
  }).catch(function(error) {
    //console.log('catch');
    return next(error);
  });
};

exports.export = function(req, res, next) {
  return searchItemsAsync(req, res, next)
  .then(function(result) {
    res.type('application/octet-stream');
    return res.end(JSON.stringify(_.map(result.data.items, function(val) {
      return _.omit(val, 'id', 'score');
    }), null, 4));

  }).catch(function(result) {
    return next(result);
  });
}

exports.facets = function facets(req, res, next) {
  return searchService.getFacetsAsync({
    collectionName: req.params.name,
    size: req.query.size
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(result) {
    return next(result);
  });
};

exports.facet = function searchItems(req, res, next) {

  return searchService.getProcessedFacetAsync({
    collectionName: req.params.name,
    // facet name is an aggregation name
    facetName: req.params.facet,
    fieldName: req.params.field_name,
    size: req.query.size,
    per_page: req.query.per_page,
    page: req.query.page,
    sort: req.query.sort,
    order: req.query.order,
    aggs: req.query.aggs,
    query_string: req.query.query_string,
    aggregation_query: req.query.aggregation_query,
    query: req.query.query
  })
  .then(function(result) {
    return res.json(result);
  }).catch(function(result) {
    return next(result);
  });
}

/**
 * native elasticsearch search
 */
exports._search = function searchItems(req, res, next) {
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
    return res.status(400).json({});
  })
}

exports.similar = function similarItems(req, res, next) {
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
    query_string: req.query.query_string || '',
    fields: fields
  })
  .then(function(result) {
    return res.json(result);
  })
  .catch(function(result) {
    return res.status(400).json({});
  })
}

exports.findOne = function findOne(req, res, next) {
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
};

exports.stats = function getStats(req, res, next) {
  statsService.statsAsync({
    projectName: 'project'
  })
  .then(function(result) {
    return res.json(result);
  })
};


