const itemsjs = require('./clients/itemsjs');
const itemsjs_pool = require('./pool/itemsjs');

const express = require('express');
const router = express.Router();

router.get('/:index_name/status', (req, res) => {
  res.json({status: 'ok'});
});

router.use(function(req, res, next) {

  if (process.env.API_KEY && process.env.API_KEY !== req.query.api_key) {
    return res.status(401).json({
      message: 'correct api_key is required'
    });
  }

  return next();
});

router.get('/:index_name/configuration', (req, res) => {

  const result = itemsjs.get_configuration(req.params.index_name);
  res.json(result);
});

/**
 * update configuration
 */
router.post('/:index_name/configuration', async (req, res) => {

  await itemsjs_pool.set_configuration(req.params.index_name, req.body);

  console.log(req.body);
  console.log('configuration added');

  res.json({
    status: 'configuration accepted'
  });
});

/**
 * manually load sort indexes
 * @TODO deprecated
 */
router.post('/:index_name/load-sort-index', (req, res) => {

  console.log('loading sort index');
  itemsjs.load_sort_index(req.params.index_name);

  res.json({
    status: 'loaded sort index'
  });
});

/**
 * reset full index
 * @TODO move to core c++ and make mutex
 */
router.post('/:index_name/reset', (req, res) => {

  itemsjs.reset(req.params.index_name);

  res.json({
  });
});

/**
 * @TODO
 * add 404
 */
router.get('/:index_name/items/:id', (req, res) => {

  const result = itemsjs.get_item(req.params.index_name, parseInt(req.params.id, 10));
  res.json(result);
});

/**
*/
router.delete('/:index_name/items/:id', async (req, res) => {

  const result = await itemsjs.delete_item(req.params.index_name, parseInt(req.params.id, 10));
  res.json(result);
});

/**
 * @TODO
 * add 404
 */
router.post('/:index_name/items/:id/update', (req, res) => {

  const result = itemsjs.update_item(req.params.index_name, req.body);
  res.json(result);
});

/**
 * @TODO
 * add 404
 */
router.post('/:index_name/items/:id/partial', (req, res) => {

  const result = itemsjs.partial_update_item(req.params.index_name, parseInt(req.params.id, 10), req.body);
  res.json(result);
});


/**
 * indexing data here
 */
router.post('/:index_name/items', async (req, res) => {

  await itemsjs_pool.index(req.params.index_name, {
    json_object: req.body
  });

  res.json({
    status: 'indexed'
  });
});

/**
 * indexing data here
 */
router.post('/:index_name/index', async (req, res) => {

  const data = {};

  if (req.body.json_path) {
    data.json_path = req.body.json_path;
  } else {
    data.json_string = req.body;
  }

  try {
    await itemsjs_pool.index(req.params.index_name, data);
  } catch (err) {

    return res.status(400).json({
      message: err.message
    });
  }

  res.json({
    status: 'indexed'
  });
});

/**
 * this is for API
 */
router.get('/:index_name/facet', async (req, res) => {

  const result = await itemsjs.aggregation(req.params.index_name, {
    per_page: req.query.per_page || 10,
    page: req.query.page || 1,
    name: req.query.name
  });

  res.json(result);
});

router.all('/:index_name/search', async (req, res) => {

  let filters;
  let not_filters;
  let facets_fields;

  if (req.body.filters) {
    filters = req.body.filters;
  } else {
    filters = JSON.parse(req.query.filters || '{}');
  }

  if (req.body.not_filters) {
    not_filters = req.body.not_filters;
  } else {
    not_filters = JSON.parse(req.query.not_filters || '{}');
  }

  if (req.body.facets_fields) {
    facets_fields = req.body.facets_fields ? req.body.facets_fields.split(',').filter(x => !!x) : null;
  } else {
    facets_fields = req.query.facets_fields ? req.query.facets_fields.split(',').filter(x => !!x) : null;
  }

  let result;
  try {
    result = await itemsjs_pool.search(req.params.index_name, {
      per_page: parseInt(req.body.per_page || req.query.per_page || 10),
      page: parseInt(req.body.page || req.query.page || 1),
      query: req.body.query || req.query.query,
      order: req.body.order || req.query.order,
      sort_field: req.body.sort_field || req.query.sort_field,
      not_filters: not_filters,
      facets_fields: facets_fields,
      filters: filters
    });
  } catch (err) {

    return res.status(400).json({
      message: err.message
    });
  }

  return res.json(result);
});

module.exports = router;
