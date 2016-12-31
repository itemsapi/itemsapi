'use strict';

var should = require('should');
var assert = require('assert');
var setup = require('./../mocks/setup');

setup.makeSuite('security helper', function() {

  var helper = require('./../../src/helpers/security');

  it('should check access', function test(done) {
    assert.equal(true, helper.checkAccess())

    assert.equal(true, helper.checkAccess({
    }, {
    }))

    assert.equal(true, helper.checkAccess({
      ip: '127.0.0.1'
    }, {
      allowed_ips: ['127.0.0.1']
    }))

    assert.equal(false, helper.checkAccess({
      ip: '127.0.0.1'
    }, {
      allowed_ips: ['127']
    }))

    assert.equal(true, helper.checkAccess({
      ip: '::ffff:127.0.0.1'
    }, {
      allowed_ips: ['127.0.0.1']
    }))

    assert.equal(true, helper.checkAccess({
      ip: '127.0.0.1'
    }, {
      allowed_ips: ['0.0.0.0']
    }))

    assert.equal(true, helper.checkAccess({
      ip: '8.8.8.8'
    }, {
      allowed_ips: ['127.0.0.1', '8.8.8.8']
    }))

    assert.equal(false, helper.checkAccess({
      ip: '8.8.8.8'
    }, {
      allowed_ips: ['127.0.0.1']
    }))

    assert.equal(true, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: ['POST']
    }))

    assert.equal(true, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: ['POST', 'GET']
    }))

    assert.equal(true, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: ['*']
    }))

    assert.equal(true, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: '*'
    }))

    assert.equal(false, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: ['GET']
    }))

    assert.equal(false, helper.checkAccess({
      method: 'POST'
    }, {
      allowed_methods: []
    }))

    assert.equal(true, helper.checkAccess({
      token: 'key'
    }, {
      tokens: ['key']
    }))

    assert.equal(true, helper.checkAccess({
      token: 'key2'
    }, {
      tokens: ['key1', 'key2']
    }))

    assert.equal(false, helper.checkAccess({
      token: 'wrong'
    }, {
      tokens: ['key1', 'key2']
    }))

    assert.equal(false, helper.checkAccess({
      token: 'wrongkey',
      method: 'POST'
    }, {
      tokens: ['key1'],
      allowed_methods: ['POST']
    }))

    done();
  });
});
