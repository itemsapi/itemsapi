var redis = require('redis');
var config = require('./../../config/index').get();
var client = redis.createClient(config.redis);
var logger = require('./../../config/logger');

var printed = false;
client.on("error", function (err) {
  if (!printed) {
    logger.info('redis is not provided (it is optional)');
    printed = true;
  }
});

var Promise = require('bluebird');
var _ = require('lodash');
Promise.promisifyAll(redis.RedisClient.prototype);

var setKeyValAsync = function(key, val) {
  return client.setAsync(key, JSON.stringify(val));
}

var getKeyValAsync = function(key) {
  return client.getAsync(key).then(function(res) {
    return JSON.parse(res);
  });
}

module.exports = {
  setKeyValAsync: setKeyValAsync,
  getKeyValAsync: getKeyValAsync
}
