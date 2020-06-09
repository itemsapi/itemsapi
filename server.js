const assert = require('assert');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
//const itemsjs = require('../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();

app.disable('x-powered-by');
app.use(bodyParser.json({limit: '2000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.raw({limit: '2000mb'}))
app.use(bodyParser.text({limit: '5000mb', extended: true}))

/**
 * sort indexes need to load at server runtime
 */
var configuration = itemsjs.get_configuration();

if (configuration && configuration.sorting_fields) {
  console.log('sort index is loading.. please wait..');
  itemsjs.load_sort_index();
  console.log('sort index is loaded');
}

app.all('/', (req, res, next) => {

  req.configuration = itemsjs.get_configuration();

  next();
});


require('./src/dashboard')(app);
require('./src/api')(app);



app.listen(port, () => console.log(`ItemsAPI listening at http://localhost:${port}`))

