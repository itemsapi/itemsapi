var config = require('./index').get();
var logger = require('./logger');

// if we have more mongodb usage then we can move it into server.js
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');
var connection = mongoose.connect(
  config.mongodb.uri,
  config.mongodb.options
)

if (process.env.NODE_ENV !== 'test') {
  connection.catch(function(err) {
    logger.error('Connection failed in ItemsAPI to mongodb at: ', config.mongodb.uri)
  })
}

module.exports = mongoose
