'use strict';
var _ = require('lodash');

exports.checkAccess = function(input, config) {
  input = input || {}
  config = config || {}

  // normalize '*'
  if (config.tokens === '*') {
    config.tokens = ['*']
  }

  // clean restriction on ip
  if (config.ips && config.ips.indexOf('0.0.0.0') !== -1) {
    delete config.ips
  }

  // check ip
  if (config.ips && config.ips.indexOf(input.ip) === -1) {
    return false
  }

  // check method
  if (
    config.allowed_methods &&
    config.allowed_methods.indexOf(input.method) === -1 &&
    config.allowed_methods[0] !== '*'
  ) {
    return false
  }

  // check token
  if (
    config.tokens &&
    config.tokens.indexOf(input.token) === -1
  ) {
    return false
  }

  return true
};
