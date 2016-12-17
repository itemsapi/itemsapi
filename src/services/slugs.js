var collectionService = require('./collection');
var collectionHelper = require('./../helpers/collection');
var searchService = require('./../../src/services/search');
var Promise = require('bluebird');
var _ = require('lodash')
var slugs = require('../libs/slugs');
var logger = require('./../../config/logger');

/**
 * reindex slugs for collection
 * it can be optimized with aggregation results
 */
exports.reindexAsync = function(data) {
  var per_page = data.per_page || 1000
  return collectionService.findCollectionAsync({
    name: data.collectionName
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);

    return searchService.countAsync({
      collectionName: data.collectionName,
    }).then(function(count) {
      logger.info('Reindexing started.. Please wait..')
      logger.profile('slugs reindexing')
      return Promise.map(_.range(Math.ceil(count / per_page)), function(i) {
        return searchService.searchAsync({
          collectionName: data.collectionName,
          page: i + 1,
          per_page: per_page
        }).then(function(res) {
          //console.log(res.data.items);
          return res.data.items
        }).map(function(item) {
          return slugs.setSlugsAsync(
            helper.getName(),
            helper.getSlugs(),
            item
          ).then(function(res) {
          })
        }, {concurrency: 100})
      }, {concurrency: 1})
      .then(function() {
        logger.profile('slugs reindexing')
      });
    })

  }).then(function(res) {
    return res;
  })
}


/**
 * get slug value for key
 */
exports.getAsync = function(collection, field, slug) {
  return slugs.getSlugAsync(collection, field, slug, [field])
}
