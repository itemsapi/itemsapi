'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gzip = require('compression');
var nconf = require('nconf');
var port = nconf.get('server').port;
var _ = require('underscore');
var router = express.Router();
var cors = require('cors');
var server;
var httpNotFound = 404;
var httpBadRequest = 400;
var Promise = require('bluebird');


app.locals.environment = process.env.NODE_ENV || 'development'; // set env var
app.disable('etag');
app.disable('x-powered-by');
app.use(gzip({treshold: 512}));
app.use(bodyParser.json({
  limit: '4mb'
}));
app.use(cors());
app.use('/api/item', router);

var elastic = require('./src/connections/elastic');
elastic.init();

var client = require('redis').createClient()
var limiter = require('express-limiter')(router, client)

// this is only temporary - finally it should goes to load balancer
limiter({
  path: '*',
  method: 'get',
  //lookup: 'connection.remoteAddress',
  lookup: 'headers.x-forwarded-for',
  total: 120,
  expire: 1000 * 60 * 2,
  //expire: 1000 * 60 * 60,
  onRateLimited: function (req, res, next) {
    next({ message: 'Rate limit exceeded', status: 429 })
  }
})


var itemsRoutes = require('./routes/items')(router);
var itemsRoutes = require('./routes/additional')(router);


app.use(function errorRoute(err, req, res, next) {
  console.log(err);
  res.status(httpBadRequest).json(err);
  next();
});


/**
 * start server
 */
exports.start = function start(done) {
  server = app.listen(port, function afterListen() {
    done(server);
  });
};


/**
 * stop server
 */
exports.stop = function start() {
  server.close();
};

exports.app = app;
