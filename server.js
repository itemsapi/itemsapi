const assert = require('assert');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
//const itemsjs = require('../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();

const api_router = require('./src/api');
const dashboard_router = require('./src/dashboard');

app.disable('x-powered-by');
app.use(bodyParser.json({limit: '2000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.raw({limit: '2000mb'}))
app.use(bodyParser.text({limit: '5000mb', extended: true}))

/**
 * @TODO
 * remove once dashboard is migrated to VUE
 */
var nunenv = require('./src/nunenv')(app, './', {
  autoescape: true,
  watch: true,
  noCache: true
});

app.set('view engine', 'html.twig');
app.set('view cache', false);
app.engine('html.twig', nunenv.render);


app.all('*', (req, res, next) => {

  if (req.url === '/') {

    return res.redirect('/dashboard');
  }

  next();
});

app.get('/status', (req, res) => {
  res.json({status: 'ok'});
});

app.use('/dashboard', dashboard_router);

app.use(function(req, res, next) {

  // @TODO
  // validate index_name

  //console.log(req.params);
  //console.log(req.query);
  //console.log(req.url);

  return api_router(req, res, next);
});

app.listen(port, () => console.log(`ItemsAPI listening at http://localhost:${port}`))
