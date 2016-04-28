var redis = require('./redis');
var Promise = require('bluebird')
var _ = require('lodash')
var slug = require('slug')

/**
 * it sets pretty url mapping in key val database
 * @collection name of collection (prefix)
 * @slugs list of fields to make pretty
 * docs list of docs or just one doc
 */
var setSlugsAsync = function(collection, slugs, docs) {
  var promises = [];
  if (!_.isArray(docs)) {
    docs = [docs];
  }

  for (var i = 0 ; i < slugs.length ; ++i) {
    var values = _.flatten(_.map(docs, slugs[i]))
    // skip empty or undefined
    values = _.filter(values, function(o) { return !!o; });
    promises = promises.concat(_.map(values, function(val) {
      var prettyurl = slug(val, {lower: true});
      var key = collection + '_' + slugs[i] + '_' + prettyurl;
      return redis.setKeyValAsync(key, val);
    }))
  }
  return Promise.all(promises);
}

/**
 * return original value for slug
 * i.e. fight-club -> Fight Club
 */
var getSlugAsync = function(collection, field, slug, slugs) {
  if (!_.isArray(slugs) || slugs.indexOf(field) === -1) {
    return Promise.resolve(null);
  }
  return redis.getKeyValAsync(collection + '_' + field + '_' + slug)
}

module.exports = {
  setSlugsAsync: setSlugsAsync,
  getSlugAsync: getSlugAsync
}
