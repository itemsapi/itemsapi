var Promise = require('bluebird');
var _ = require('underscore');
var collectionHelper = require('./../helpers/collection');
var projectService = Promise.promisifyAll(require('./../services/project'));
var elasticMapping = Promise.promisifyAll(require('./../elastic/mapping'));
var collectionService = require('./../services/collection');

/*
 * returns elasticsearch mapping for collection
 */
exports.get = function getCollectionInfo(req, res, next) {
  var name = req.params.name;
  return collectionService.findCollectionAsync({
    name: name
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    return elasticMapping.getMappingAsync({
      index: helper.getIndex(),
      type: helper.getType()
    })
  })
  .then(function(mapping) {
    return res.json(mapping);
  })
};

/*
 * update elasticsearch mapping
 */
exports.update = function (req, res, next) {
  var name = req.params.name;
  return projectService.updateMappingAsync({
    collectionName: name
  })
  .then(function(result) {
    return res.json(result);
  })
}

/*
 * add elasticsearch mapping
 */
exports.create = function (req, res, next) {
  var name = req.params.name;
  return projectService.addMappingAsync({
    collectionName: name
  })
  .then(function(result) {
    return res.json(result);
  })
}
