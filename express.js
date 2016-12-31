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

app.set('trust proxy', true)

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

// initialize all routes
var itemsRoutes = require('./routes/routes')(router);

app.use(function errorRoute(err, req, res, next) {
  logger.error(err, err.stack)

  if (err.message) {
    res.status(httpBadRequest).json({
      error: err.message
    })
  } else {
    res.status(httpBadRequest).json({
      error: 'unknown error'
    })
  }
  next();
});

exports.app = app;
exports.router = router;
module.exports = exports;
