// needs to provide custom configuration here
var redis = require('redis');
var client = redis.createClient();
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
