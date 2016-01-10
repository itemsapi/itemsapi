var Promise = require('bluebird');
var _ = require('underscore');
var projectService = Promise.promisifyAll(require('./../src/services/project'));
var elasticMapping = Promise.promisifyAll(require('./../src/elastic/mapping'));
var statsService = Promise.promisifyAll(require('./../src/services/stats'));
var collectionService = require('./../src/services/collection');

module.exports = function(router) {

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
