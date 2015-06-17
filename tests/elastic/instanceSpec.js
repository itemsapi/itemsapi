var	assert = require('assert');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var elasticConn = require('./../../src/connections/elastic');

setup.makeSuite('elastic mapping', function() {

  before(function(done) {
    done();
  });

  describe('elastic', function() {

    it('should have elastic already initilized', function(done) {
      assert.notEqual(elasticConn.getElastic(), null);
      should.exist(elasticConn.getElastic());
      should.exist(elasticConn.getElastic().indices);
      elasticConn.getElastic().should.be.instanceof(Object);
      done();
    });

  });
});
