var Promise = require('bluebird');
var projectService = Promise.promisifyAll(require('./../services/project'));

/*
 * create project (collection, mapping, items)
 */
exports.create = function createProject(req, res, next) {
  var data = req.query
  data.data = req.body

  return projectService.createProjectAsync(data)
  .then(function(result) {
    return res.json(result);
  }).catch(function(result) {
    return next(result);
  })
};
