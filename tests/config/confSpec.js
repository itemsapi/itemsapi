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
    config.get().project.name.should.be.equal('test');
    config.get().elasticsearch.should.be.an.Object;
    config.get().elasticsearch.should.be.an.Object;
    config.get().server.should.be.an.Object;
    config.set('test', 'test');
    config.get().test.should.be.equal('test');
    config.merge({
      test: 'test2',
      a: {
        b: 'b',
        c: 'c'
      }
    });
    config.get().test.should.be.equal('test2');
    config.get().a.b.should.be.equal('b');
    config.get().a.c.should.be.equal('c');
    config.merge({
      a: {
        b: 'b2'
      }
    });
    config.get().a.b.should.be.equal('b2');
    config.get().a.c.should.be.equal('c');
    done();
  });
});
