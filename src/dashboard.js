const express = require('express');
const itemsjs = require('./clients/itemsjs');
const itemsjs_pool = require('./pool/itemsjs');
const Promise = require('bluebird');

const router = express.Router();

/**
 * @TODO
 * migrate to VUE
 */
router.use('/libs/urijs', express.static('node_modules/urijs'));
router.use('/libs/history.js', express.static('node_modules/history.js'));
router.use('/libs/lodash', express.static('node_modules/lodash'));
router.use('/assets', express.static('assets'));

router.param('index_name', function (req, res, next) {
  res.locals.index_name = req.params.index_name;
  next();
})

router.get('/', async function(req, res) {

  var indices = await itemsjs.list_indexes({
    page: req.query.page,
    per_page: req.query.per_page
  });
  var rows = await Promise.all(indices.data)
  .map(async v => {

    try {
      var result = await itemsjs_pool.search(v.index_name);
      v.total = result.pagination.total;

    } catch (err) {
      //console.log(v)
      //console.log(err.message)
    }

    return v;

  }, {concurrency: 4});

  return res.render('views/indices', {
    pagination: indices.pagination,
    indices: indices,
    rows: rows
  });
})

router.get('/:index_name/modal-facet/:name', async function(req, res) {

  var filters = req.query.filters;
  var not_filters = req.query.not_filters;

  var facet = await itemsjs.aggregation(req.params.index_name, {
    name: req.params.name,
    filters: filters,
    page: req.query.page || 1,
    per_page: 100,
  });

  return res.render('views/modals-content/facet', {
    facet: facet,
    pagination: facet.pagination,
    filters: filters,
    not_filters: not_filters,
    name: req.params.name
  });
})

router.get('/:index_name', async (req, res) => {

  var page = parseInt(req.query.page) || 1;
  var per_page = parseInt(req.query.per_page) || 30;
  var query = req.query.query ? req.query.query : '';
  var query_tokens = itemsjs.tokenize(query);
  var facets_fields = req.query.facets_fields ? req.query.facets_fields.split(',').filter(x => !!x) : null;

  var sorting_fields = [];

  var configuration = itemsjs.get_configuration(req.params.index_name);

  if (configuration) {
    sorting_fields = configuration.sorting_fields;
  }

  var order = req.query.order || 'desc';
  var sort_field = req.query.sort_field;

  var filters = JSON.parse(req.query.filters || '{}');
  var not_filters = JSON.parse(req.query.not_filters || '{}');

  try {
    var result = await itemsjs_pool.search(req.params.index_name, {
      per_page: per_page,
      page: page,
      query: query,
      order: order,
      sort_field: sort_field,
      facets_fields: facets_fields,
      search_native: true,
      not_filters: not_filters,
      filters: filters
    });
  } catch (err) {

    return res.status(400).json({
      message: err.message
    });
  }

  var is_ajax = req.query.is_ajax || req.xhr;

  return res.render('views/catalog', {
    items: result.data.items,
    pagination: result.pagination,
    timings: result.timings,
    page: page,
    per_page: per_page,
    order: order,
    sorting_fields: sorting_fields,
    sort_field: sort_field,
    query: query,
    query_tokens: query_tokens,
    is_ajax: false,
    url: req.url,
    aggregations: result.data.aggregations,
    filters: filters,
    not_filters: not_filters,
    is_ajax: is_ajax,
  });
})

module.exports = router;
