'use strict';

var async = require('async');
var Promise = require('bluebird');
var elastic = require('../elastic/search');
var _ = require('lodash');
var searchHelper = require('../helpers/search');
var collectionHelper = require('../helpers/collection');
var collectionService = require('./collection');
var slugs = require('../libs/slugs');
var log = require('../../config/logger')

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
  data.size = parseInt(data.size || 100)
  data.per_page = parseInt(data.per_page || 10)
  data.page = parseInt(data.page || 1)
  data.sort = data.sort || '_count'
  data.order = data.order || 'desc'

  if (data.aggs && _.isString(data.aggs)) {
    data.aggs = JSON.parse(data.aggs)
  }

  //log.debug(JSON.stringify(data));

  return collectionService.findCollectionAsync({
    name: data.collectionName,
  })
  .then(function(collection) {
    var helper = collectionHelper(collection);
    data.index = helper.getIndex();
    data.type = helper.getType();

    var helper2 = collectionHelper(_.clone(collection))


    if (data.facetName) {
      helper2.updateAggregation(data.facetName, 'size', data.size)
      helper2.updateAggregation(data.facetName, 'sort', data.sort)
      helper2.updateAggregation(data.facetName, 'order', data.order)
    } else if (data.fieldName) {

      if (!helper.getSchema()[data.fieldName]) {
        throw new Error('"' + data.fieldName + '" field is not supported in aggregation')
      }

      helper2.addAggregation(data.fieldName, {
        size: data.size,
        field: data.fieldName,
        sort: data.sort,
        type: 'terms',
        order: data.order
      })
    }

    data.collection = helper2.getCollection()
    return elastic.searchAsync(data, helper2.getCollection())
  })
  .then(function(res) {
    //console.log(res.aggregations.tags.tags);
    res = searchHelper().facetsConverter(data, res);
    return res;
  })
  .then(function(res) {
    if (data.facetName) {
      return _.find(res, {
        name: data.facetName
      })
    } else {
      return _.find(res, {
        name: data.fieldName
      })
    }
  })
  .then(function(res) {
    if (!res) {
      throw new Error('Facet or field doesn\'t exist or is incorrect')
    }
    return res;
  })
}

exports.getProcessedFacetAsync = function(data) {
  return exports.getFacetAsync(data)
  .then(function(facet) {
    var offset = data.per_page * (data.page - 1)
    facet.data = {
      buckets: _.chain(facet.buckets)
      .filter(function(val) {
        if (data.aggregation_query) {
          return val.key.toLowerCase().indexOf(
            data.aggregation_query.toLowerCase()
          ) !== -1
        }
        return true
      })
      .slice(
        offset,
        offset + data.per_page
      ).value()
    }
    facet.pagination = {
      page: parseInt(data.page) || 1,
      per_page: parseInt(data.per_page) || 16,
      doc_count: parseInt(facet.doc_count),
      total: parseInt(facet.total)
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

exports.countAsync = function(data) {
  return exports.searchAsync(data)
  .then(function(results) {
    return results.pagination.total
  })
}
