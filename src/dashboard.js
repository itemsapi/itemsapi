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
});

router.get('/', async function(req, res) {

  const indices = await itemsjs.list_indexes({
    page: req.query.page,
    per_page: req.query.per_page
  });
  const rows = await Promise.all(indices.data)
    .map(async v => {

      try {
        const result = await itemsjs_pool.search(v.index_name);
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
});

router.get('/:index_name/modal-facet/:name', async function(req, res) {

  const filters = req.query.filters;
  const not_filters = req.query.not_filters;

  const facet = await itemsjs.aggregation(req.params.index_name, {
    name: req.params.name,
    filters: filters,
    not_filters: not_filters,
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
});

router.get('/:index_name', async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const per_page = parseInt(req.query.per_page) || 30;
  const query = req.query.query ? req.query.query : '';
  const query_tokens = itemsjs.tokenize(query);
  const facets_fields = req.query.facets_fields ? req.query.facets_fields.split(',').filter(x => !!x) : null;

  let sorting_fields = [];

  const configuration = itemsjs.get_configuration(req.params.index_name);

  if (configuration) {
    sorting_fields = configuration.sorting_fields;
  }

  const order = req.query.order || 'desc';
  const sort_field = req.query.sort_field;

  const filters = JSON.parse(req.query.filters || '{}');
  const not_filters = JSON.parse(req.query.not_filters || '{}');

  let result;
  try {
    result = await itemsjs_pool.search(req.params.index_name, {
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

  const is_ajax = req.query.is_ajax || req.xhr;

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
    url: req.url,
    aggregations: result.data.aggregations,
    filters: filters,
    not_filters: not_filters,
    is_ajax: is_ajax,
  });
});

module.exports = router;
