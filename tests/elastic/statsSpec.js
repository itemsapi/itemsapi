var	assert = require('assert');
var async = require('async');
var should = require('should');
var setup = require('./../mocks/setup');
var Promise = require('bluebird');

setup.makeSuite('elastic stats', function() {

  var mapping = Promise.promisifyAll(require('./../../src/elastic/mapping'));
  var stats = require('./../../src/elastic/stats');

  before(function(done) {
    // not necessary anymore as indices are generated in setup
    /*mapping.addIndex({
      index: 'test'
    }, function(err, res) {
      assert.equal(err, null);
    });*/
    done();
  });

  it('should show stats', function(done) {
    stats.getIndicesAsync()
    .then(function(res) {
      //console.log(res[0]);
      done();
    });
  });

});
