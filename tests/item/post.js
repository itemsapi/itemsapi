var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');

setup.makeSuite('item post request', function() {
  var data = {rating: 5, name: 'Godfather'};
  var projectService = require('./../../src/services/project');

  beforeEach(function(done) {
    projectService.ensureCollection({
      projectName: 'project',
      collectionName: 'movie'
    }, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  it('should make successfull request', function(done) {
    request(setup.getServer())
      .post('/api/item/movie')
      .send(data)
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

});
