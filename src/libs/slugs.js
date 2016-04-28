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
 * get slug from aggs or key, val properties
 * return null when sluggify is not required
 */
var getSlugInfo = function(data) {
  if (!data) {
    return null;
  }

  if (data.key && data.val) {
    return {
      key: data.key,
      val: data.val
    }
  } else if (data.aggs && _.keys(data.aggs).length === 1) {
    var key = _.keys(data.aggs)[0];
    if (_.isString(data.aggs[key])) {
      return {
        key: key,
        val: data.aggs[key]
      }
    } else if (data.aggs[key].length === 1) {
      return {
        key: key,
        val: data.aggs[key][0]
      }
    }
  }
  return null;
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
  getSlugInfo: getSlugInfo,
  getSlugAsync: getSlugAsync
}
