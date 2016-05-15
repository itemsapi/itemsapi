'use strict';

var async = require('async');
var Promise = require('bluebird');
var elastic = require('../elastic/search');
var _ = require('lodash');
var searchHelper = require('../helpers/search');
var collectionHelper = require('../helpers/collection');
var collectionService = require('./collection');
var slugs = require('../libs/slugs');

exports.getFacetsAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    data.index = helper.getIndex();
    data.type = helper.getType();
    var collection_temp = _.clone(collection)

    if (data.size) {
      if (_.isArray(collection_temp.aggregations)) {
        collection_temp.aggregations = _.map(collection_temp.aggregations, function(val) {
          val.size = data.size;
          return val;
        })
      } else {
        collection_temp.aggregations = _.mapValues(collection_temp.aggregations, function(val) {
          val.size = data.size;
          return val;
        })
      }
    }

    data.collection = collection_temp;
    return elastic.searchAsync(data, collection_temp);
  })
  .then(function(res) {
    res = searchHelper().facetsConverter(data, res);
    return res;
  })
}

exports.getFacetAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    data.index = helper.getIndex();
    data.type = helper.getType();
    var collection_temp = _.clone(collection)

    if (data.size) {
      if (_.isArray(collection_temp.aggregations)) {
        var index = _.findIndex(collection_temp.aggregations, {
          name: data.facetName
        })
        collection_temp.aggregations[index].size = data.size
      } else {
        collection_temp.aggregations[data.facetName].size = data.size
      }
    }

    data.collection = collection_temp;
    return elastic.searchAsync(data, collection_temp);
  })
  .then(function(res) {
    res = searchHelper().facetsConverter(data, res);
    return res;
  })
  .then(function(res) {
    return _.find(res, {
      name: data.facetName
    })
  })
  .then(function(res) {
    if (!res) {
      throw new Error('facet doesnt exist')
    }
    return res;
  })
}

/**
 * search documents
 */
exports.searchAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);

    // determine if we should lookup for slug value
    var slug = slugs.getSlugInfo(data)

    var getSlugAsync = slug ? slugs.getSlugAsync(
      helper.getName(),
      slug.key,
      slug.val,
      helper.getSlugs()
    ) : Promise.resolve(null)

    return getSlugAsync.then(function(res) {
      // update user input (aggs or key, val)
      // looks little bit dirty here but do the job with pretty url
      if (res) {
        if (data.key && data.val) {
          data.val = res;
        } else if (data.aggs && _.keys(data.aggs).length === 1) {
          data.aggs[_.keys(data.aggs)[0]] = [res];
        }
      }
      data.collection = collection;
      data.index = helper.getIndex();
      data.type = helper.getType();
      return elastic.searchAsync(data, collection);
    })
  })
  .then(function(res) {
    return searchHelper().searchConverter(data, res);
  })
}

/**
 * similar documents
 */
exports.similarAsync = function(data) {
  return collectionService.findCollectionAsync({
    name: data.collectionName,
    project: data.projectName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    //data.collection = collection;
    data.index = helper.getIndex();
    data.type = helper.getType();
    //delete data.collection;
    return elastic.similarAsync(data);
  })
  .then(function(res) {
    return searchHelper().similarConverter(data, res);
  })
}
