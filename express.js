'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gzip = require('compression');
var router = express.Router();
var cors = require('cors');
var httpNotFound = 404;
var httpBadRequest = 400;
var apiPrefix = '/api/v1';
var logger = require('./config/logger')

var morgan = require('morgan')

app.locals.environment = process.env.NODE_ENV || 'development';
app.disable('etag');
app.disable('x-powered-by');
app.use(gzip({treshold: 512}));
app.use(bodyParser.json({
  limit: '4mb'
}));

app.use(cors());
app.use(apiPrefix, router);

var winstonStream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

// that needs to be place out of itemsapi
router.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms', {stream: winstonStream}))
router.use(function(req, res, next){
  logger.info(req.method, req.url, "query", req.query, "body", JSON.stringify(req.body));
  next();
});

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

// should export object
// app and api router and maybe another things in the future
module.exports = app;
