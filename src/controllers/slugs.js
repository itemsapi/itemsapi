var Promise = require('bluebird');
var _ = require('underscore');
var slugService = require('./../services/slugs');

exports.reindex = function (req, res, next) {
  slugService.reindexAsync({
    collectionName: req.params.name,
    per_page: req.query.per_page
  }).then(function(result) {
    return res.json(result)
  }).catch(function(result) {
    return next(result);
  })
}

exports.get = function (req, res, next) {
  slugService.getAsync(
    req.params.name,
    req.params.field,
    req.params.key
  ).then(function(result) {
    return res.json({
      value: result
    })
  }).catch(function(result) {
    return next(result);
  })
}

