'use strict';
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

exports.elasticsearch = function(url) {
  if (url.indexOf('http') === -1) {
    url = 'http://' + url
  }

  return request.getAsync({
    url: url
  })
  .then(function(result) {
    return JSON.parse(result.body)
  })
  .then(function(result) {
    return {
      elasticsearch_status: 200,
      version: result.version.number
    }
  })
  .catch(function(err) {
    return {
      elasticsearch_status: 500
    }
  })
}

