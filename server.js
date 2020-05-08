const assert = require('assert');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
//const itemsjs = require('../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();
const bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '2000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.raw({limit: '2000mb'}))
app.use(bodyParser.text({limit: '5000mb', extended: true}))

/**
 * at this stage this is just a js variable
 */
var configuration;

/**
 *
 */
app.post('/configuration', (req, res) => {

  configuration = req.body;

  //console.log(req);
  //console.log(req.body);

  res.json({
    status: 'configuration accepted'
  });
});



/**
 * indexing data here
 */
app.post('/index', bodyParser({defer: true}), (req, res) => {

  var configuration = {
    "searchableFields": [
      "couriers"
    ],
    "aggregations": {
      "couriers": {
        "title": "Couriers",
        "size": 10,
        "conjunction": true
      },
      "psp_providers": {
        "title": "PSP",
        "size": 10,
        "conjunction": true
      },
      "country": {
        "title": "Country",
        "size": 10,
        "conjunction": false
      },
      "tech": {
        "title": "Tech",
        "size": 10,
        "conjunction": true
      }
    }
  }

  if (req.body.json_path) {

    itemsjs.index({
      json_path: req.body.json_path,
      configuration: configuration
    });

  } else {

    itemsjs.index({
      json_string: req.body,
      configuration: configuration
    });
  }


  res.json({
    status: 'indexed'
  });
});

app.get('/', (req, res) => {

  var couriers = req.query.couriers || '';
  var country = req.query.country || '';
  var psp_providers = req.query.psp_providers || '';
  var tech = req.query.tech || '';

  var result = itemsjs.search({
    per_page: req.query.per_page || 10,
    page: req.query.page || 1,
    searchableFields: ['couriers', 'psp_providers', 'tech', 'country'],
    //query: req.query.query,
    filters: {
      couriers: couriers.split(',').filter(v => !!v),
      psp_providers: psp_providers.split(',').filter(v => !!v),
      country: country.split(',').filter(v => !!v),
      tech: tech.split(',').filter(v => !!v),
    }
  });
  res.json(result);
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

