//const itemsjs = require('../../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();

module.exports = function(app) {

  app.get('/configuration', (req, res) => {

    var result = itemsjs.get_configuration();
    res.json(result);
  });
  /**
   * update configuration
   */
  app.post('/configuration', (req, res) => {

    itemsjs.set_configuration(req.body);

    console.log(req.body);
    console.log('configuration added');

    res.json({
      status: 'configuration accepted'
    });
  });

  /**
   * manually load sort indexes
   */
  app.post('/load-sort-index', (req, res) => {

    console.log('loading sort index');
    itemsjs.load_sort_index();

    res.json({
      status: 'loaded sort index'
    });
  });

  /**
   * reset full index
   */
  app.post('/reset', (req, res) => {

    itemsjs.reset();

    res.json({
    });
  });

  /**
   * @TODO
   * add 404
   */
  app.get('/items/:id', (req, res) => {

    var result = itemsjs.get_item(parseInt(req.params.id, 10));
    res.json(result);
  });

  /**
   */
  app.delete('/items/:id', (req, res) => {

    var result = itemsjs.delete_item(parseInt(req.params.id, 10));
    res.json(result);
  });

  /**
   * @TODO
   * add 404
   */
  app.post('/items/:id/update', (req, res) => {

    var result = itemsjs.update_item(req.body);
    res.json(result);
  });

  /**
   * @TODO
   * add 404
   */
  app.post('/items/:id/partial', (req, res) => {

    var result = itemsjs.partial_update_item(parseInt(req.params.id, 10), req.body);
    res.json(result);
  });


  /**
   * indexing data here
   */
  app.post('/items', (req, res) => {

    itemsjs.index({
      json_object: req.body
    });

    res.json({
      status: 'indexed'
    });
  });

  /**
   * indexing data here
   */
  app.post('/index', (req, res) => {

    var data = {};

    if (req.body.json_path) {
      data.json_path = req.body.json_path;
    } else {
      data.json_string = req.body;
    }

    itemsjs.index(data);

    res.json({
      status: 'indexed'
    });
  });

  /**
   * this is for API
   */
  app.get('/facet', (req, res) => {

    var filters = req.body.filters;

    var result = itemsjs.aggregation({
      per_page: req.query.per_page || 10,
      page: req.query.page || 1,
      name: req.query.name
    });

    res.json(result);
  })

  app.all('/search', (req, res) => {

    var filters = req.body.filters;
    var not_filters = req.body.not_filters;
    var facets_fields = req.query.facets_fields ? req.query.facets_fields.split(',').filter(x => !!x) : null;

    var result = itemsjs.search({
      per_page: req.query.per_page || 10,
      page: req.query.page || 1,
      query: req.query.query,
      order: req.query.order,
      sort_field: req.query.sort_field,
      not_filters: not_filters,
      facets_fields: facets_fields,
      filters: filters
    });
    res.json(result);
  })
}
