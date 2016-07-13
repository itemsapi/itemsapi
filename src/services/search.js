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

  data.size = parseInt(data.size || 100),
  data.per_page = parseInt(data.per_page || 10),
  data.page = parseInt(data.page || 1),
  data.order = data.order || '_count',
  data.desc = data.desc || 'desc'

  return collectionService.findCollectionAsync({
    name: data.collectionName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    data.index = helper.getIndex();
    data.type = helper.getType();

    var helper2 = collectionHelper(_.clone(collection))
    helper2.updateAggregation(data.facetName, 'size', data.size)
    helper2.updateAggregation(data.facetName, 'order', data.order)
    helper2.updateAggregation(data.facetName, 'desc', data.desc)

    data.collection = helper2.getCollection()
    return elastic.searchAsync(data, helper2.getCollection())
  })
  .then(function(res) {
    //console.log(res.aggregations.tags.tags);
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

exports.getProcessedFacetAsync = function(data) {
  return exports.getFacetAsync(data)
  .then(function(facet) {
    var offset = data.per_page * (data.page - 1)
    facet.data = {
      buckets: facet.buckets.slice(
        offset,
        offset + data.per_page
      )
    }
    facet.pagination = {
      page: data.page,
      per_page: data.per_page,
      total: facet.doc_count
    }

    facet.meta = {
      title: facet.title,
      name: facet.name,
      type: facet.type
    }

    facet = _.omit(facet, ['doc_count', 'size', 'title', 'name', 'type', 'buckets'])
    return facet
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
