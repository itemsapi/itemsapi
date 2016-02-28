'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gzip = require('compression');
var router = express.Router();
var cors = require('cors');
var httpNotFound = 404;
var httpBadRequest = 400;
var logger = require('./config/logger')
var config = require('./config/index').get()
var apiPrefix = '/api/v1';
var morgan = require('morgan')

app.locals.environment = process.env.NODE_ENV || 'development';
app.disable('etag');
app.disable('x-powered-by');
app.use(gzip({treshold: 512}));
app.use(bodyParser.json({
  limit: '4mb'
}));

app.use(cors());
app.use(config.server.prefix || apiPrefix, router);

var winstonStream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

if (config.server.logger !== false) {
  router.use(morgan(config.server.logger, {
    stream: winstonStream
  }))
}

// all collections, stats
var itemsRoutes = require('./routes/additional')(router);

// manage collections (schema, aggregations options, sortings, etc)
var collectionsRoutes = require('./routes/collections')(router);

// get, put, post, delete, find, similar, autocomplete etc
var itemsRoutes = require('./routes/items')(router);

app.use(function errorRoute(err, req, res, next) {
  // need to test it out
  logger.error(err, err.stack)
  res.status(httpBadRequest).json(err);
  next();
});

exports.app = app;
exports.router = router;
module.exports = exports;
