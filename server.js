const assert = require('assert');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
//const itemsjs = require('../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();
const bodyParser = require('body-parser');

app.disable('x-powered-by');
app.use(bodyParser.json({limit: '2000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.raw({limit: '2000mb'}))
app.use(bodyParser.text({limit: '5000mb', extended: true}))

app.use('/libs/urijs', express.static('node_modules/urijs'));
app.use('/libs/history.js', express.static('node_modules/history.js'));
app.use('/libs/lodash', express.static('node_modules/lodash'));
app.use('/assets', express.static('assets'));

var nunenv = require('./src/nunenv')(app, './', {
  autoescape: true,
  watch: true,
  noCache: true
});


app.set('view engine', 'html.twig');
app.set('view cache', false);
app.engine('html.twig', nunenv.render);


/**
 *
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

app.all('/search', (req, res) => {

  var filters = req.body.filters;

  var result = itemsjs.search({
    per_page: req.query.per_page || 10,
    page: req.query.page || 1,
    query: req.query.query,
    filters: filters
  });
  res.json(result);
})

app.get('/', (req, res) => {

  var page = parseInt(req.query.page) || 1;
  var per_page = parseInt(req.query.per_page) || 25;
  var query = req.query.query;

  var pages_count_limit;

  var filters = JSON.parse(req.query.filters || '{}');
  var not_filters = JSON.parse(req.query.not_filters || '{}');

  var result = itemsjs.search({
    per_page: per_page,
    page: page,
    query: query,
    filters: filters
  });

  var is_ajax = req.query.is_ajax || req.xhr;

  return res.render('views/catalog', {
    items: result.data.items,
    pagination: result.pagination,
    timings: result.timings,
    page: page,
    per_page: per_page,
    query: query,
    is_ajax: false,
    url: req.url,
    aggregations: result.data.aggregations,
    filters: filters,
    is_ajax: is_ajax,
  });

})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

