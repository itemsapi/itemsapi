var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');

setup.makeSuite('item crud request', function() {
  var data = {id: 100, rating: 5, name: 'Godfather'};
  var projectService = require('./../../src/services/project');

  before(function(done) {
    projectService.ensureCollection({
      projectName: 'project',
      collectionName: 'movie'
    }, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  it('should make successfull post request', function(done) {
    request(setup.getServer())
      .post('/api/item/movie')
      .send(data)
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should make successfull get request', function(done) {
    request(setup.getServer())
      .get('/api/item/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('rating', 5);
        res.body.should.have.property('name', 'Godfather');
        done();
      });
  });

  it('should make successfull update request', function(done) {
    request(setup.getServer())
      .put('/api/item/movie/100')
      .send({rating: 6})
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should make successfull get request', function(done) {
    request(setup.getServer())
      .get('/api/item/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('rating', 6);
        res.body.should.have.property('name', 'Godfather');
        done();
      });
  });


  it('should make successfull delete request', function(done) {
    request(setup.getServer())
      .delete('/api/item/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should get not found response', function(done) {
    request(setup.getServer())
      .get('/api/item/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 404);
        done();
      });
  });
});
