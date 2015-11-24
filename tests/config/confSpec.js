'use strict';

var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('conf tool', function() {

  var config = require('./../../config/index');

  before(function before(done) {
    done();
  });

  after(function after(done) {
    done();
  });

  it('should return project name in testing env', function test(done) {
    config.project.name.should.be.equal('test');
    done();
  });
});
