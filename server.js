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

  //console.log(req.query);
  //console.log(req.body);
  //console.log(req.body[0]);
  //console.log(JSON.parse(req.body));

  var filters = req.body.filters;

  var result = itemsjs.search({
    per_page: req.query.per_page || 10,
    page: req.query.page || 1,
    query: req.query.query,
    filters: filters
  });
  res.json(result);
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

