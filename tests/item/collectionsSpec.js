var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');
var _ = require('underscore');

setup.makeSuite('collections management by api', function() {

  before(function(done) {
    done();
  });

  it('should find collection', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/movie')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('name', 'movie');
        res.body.should.have.property('table');
        res.body.should.have.property('schema');
        res.body.should.have.property('aggregations');
        done();
      });
  });

  it('should not find collection', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/blackhole')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 404);
        done();
      });
  });

  it('should update collection', function(done) {
    request(setup.getServer())
      .post('/api/v1/collections/movie/partial')
      .send({test: true})
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should find updated collection', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/movie')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('name', 'movie');
        //res.body.should.have.property('test', true);
        done();
      });
  });

  it('should add collection', function(done) {
    request(setup.getServer())
      .post('/api/v1/collections')
      .send({
        name: 'temporary',
        project: 'temporary',
        schema: {}
      })
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should find added collection', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/temporary')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('name', 'temporary');
        done();
      });
  });

  it('should remove collection', function(done) {
    request(setup.getServer())
      .delete('/api/v1/collections/temporary')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should not find removed collection', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/temporary')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 404);
        done();
      });
  });

  xit('should get all collections', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections')
      .end(function afterRequest(err, res) {
        console.log(res.body);
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should add mapping', function(done) {
    request(setup.getServer())
      .post('/api/v1/collections/movie/mapping')
      .end(function afterRequest(err, res) {
        res.body.should.have.property('acknowledged', true);
        done();
      });
  });

  it('should get mapping', function(done) {
    request(setup.getServer())
      .get('/api/v1/collections/movie/mapping')
      .end(function afterRequest(err, res) {
        res.body.should.have.property('test');
        res.body.test.should.have.property('mappings');
        done();
      });
  });

  it('should update mapping', function(done) {
    request(setup.getServer())
      .put('/api/v1/collections/movie/mapping')
      .end(function afterRequest(err, res) {
        res.body.should.have.property('acknowledged', true);
        done();
      });
  });
});
