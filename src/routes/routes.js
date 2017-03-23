var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../helpers/collection');
var dataService = Promise.promisifyAll(require('./../services/data'));
var projectService = Promise.promisifyAll(require('./../services/project'));
var elasticMapping = Promise.promisifyAll(require('./../elastic/mapping'));
var elastic = Promise.promisifyAll(require('./../elastic/search'));
var searchService = Promise.promisifyAll(require('./../services/search'));
var collectionService = require('./../services/collection');
var items = require('./../controllers/items');
var collections = require('./../controllers/collections');
var slugs = require('./../controllers/slugs');
var mappings = require('./../controllers/mappings');
var projects = require('./../controllers/projects');
var middlewares = require('./../controllers/middlewares');

/**
 * the order of routes matter
 */
module.exports = function(router) {

  /*
   * check access by token
   */
  router.all('*', middlewares.checkAccess)

  /*
   * get stats
   */
  router.get('/stats', items.stats);

  /*
   * reindex slugs
   */
  router.put('/slugs/:name/reindex', slugs.reindex);

  /*
   * get value for slug key
   */
  router.get('/slugs/:name/:field/:key', slugs.get);

  /*
   * delete collection
   */
  router.delete('/collections/:name', collections.delete);

  /*
   * create collection
   */
  router.post('/collections', collections.create);

  /*
   * generate collection based on items (read only)
   */
  router.post('/collections/generate', collections.generate);

  /*
   * update specific collection
   */
  router.put('/collections/:name', collections.update);

  /*
   * partial update specific collection
   */
  router.post('/collections/:name/partial', collections.partialUpdate);

  /*
   * get collection
   */
  router.get('/collections/:name', collections.get);

  /*
   * get collections
   */
  router.get('/collections', collections.getall);

  /*
   * processed collection info (schema, table, etc)
   * second route is deprecated
   */
  router.get(['/collections/:name/metadata', '/:name/metadata'], collections.metadata);

  /*
   * reindex collection
   * (create new mapping on custom index/type, copy data there, and update collection configuration)
   */
  router.put('/collections/:name/reindex', collections.reindex);

  /*
   * returns elasticsearch mapping for collection
   */
  router.get('/collections/:name/mapping', mappings.get);

  /*
   * update elasticsearch mapping
   */
  router.put('/collections/:name/mapping', mappings.update);

  /*
   * add elasticsearch mapping
   */
  router.post('/collections/:name/mapping', mappings.create);

  /*
   * create project (collection + mapping + items)
   */
  router.post('/projects', projects.create);

  /*
   * create specific item
   */
  router.post(['/items/:name'], items.create);

  /*
   * clean items
   */
  router.delete(['/items/:name'], items.clean);

  /*
   * delete specific item
   */
  router.delete(['/items/:name/:id'], items.delete);

  /*
   * enable / disable item
   */
  router.put(['/items/:name/:id/enable', '/items/:name/:id/disable', '/items/:name/:id/enabled/:enabled'], items.enabled);

  /*
   * update specific item
   */
  router.put(['/items/:name/:id', '/:name/:id'], items.update);

  /*
   * search items
   */
  router.get(['/items/:name'], items.search);

  /*
   * search items
   */
  router.get(['/items/:name/export'], items.export);

  /**
   * get list of facets with values
   * not specified in documentation. not recommended to use
   */
  router.get(['/facets/:name'], items.facets);

  /**
   * get facet with values (configured by size)
   * not specified in documentation. not recommended to use
   */
  router.get(['/facets/:name/:facet'], items.facet);

  /**
   * get facet with values (configured by size)
   */
  router.get(['/aggregations/:name/:facet'], items.facet);

  /**
   * get facet with values (configured by size)
   */
  router.get(['/aggregations/:name/field/:field_name'], items.facet);

  /*
   * search items using native (prefiltered) elasticsearch /_search endpoint
   */
  router.post(['/items/:name/_search'], items._search);

  /*
   * mapping
   * @deprecated
   * not sure if dashboard not using it
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
  router.get('/items/:name/:id/similar', items.similar);

  /*
   * find one
   */
  router.get('/items/:name/:key/:val/one', items.findOne);

  /*
   * get specific item
   */
  router.get(['/items/:name/:id'], items.get);
}
