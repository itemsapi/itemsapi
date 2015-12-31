var Promise = require('bluebird');
var _ = require('underscore');
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var statsService = Promise.promisifyAll(require('./../src/services/stats'));
var collectionService = require('./../src/services/collection');

module.exports = function(router) {

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
   * get stats
   */
  router.get('/stats', function getStats(req, res, next) {
    statsService.statsAsync({
      projectName: 'project'
    })
    .then(function(result) {
      return res.json(result);
    })
  });

}
