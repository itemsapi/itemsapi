'use strict';
var _ = require('lodash');
var ipaddr = require('ipaddr.js');


exports.checkAccess = function(input, config) {
  input = input || {}
  config = config || {}

  // normalize '*'
  if (config.tokens === '*') {
    config.tokens = ['*']
  }

  // clean restriction on ip
  if (config.allowed_ips && config.allowed_ips.indexOf('0.0.0.0') !== -1) {
    delete config.allowed_ips
  }

  // check ip
  if (config.allowed_ips && input.ip && _.findIndex(config.allowed_ips, function(ip) {
    return _.isEqual(ipaddr.process(input.ip), ipaddr.process(ip)) === true
  }) === -1) {
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
