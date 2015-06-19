var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var projectService = require('./../../src/services/project');

  before(function(done) {
    projectService.ensureCollection({
      projectName: 'project',
      collectionName: 'movie'
    }, function(err, res) {
      assert.equal(err, null);

      setTimeout(function() {
        done()
      }, 100);
    });
  });

  it('should search items', function(done) {
    searchService.search({
      collectionName: 'movie'
    }, function(err, res) {
      should.not.exist(err);
      res.should.have.property('data')
      res.data.should.have.property('items');
      res.should.have.property('pagination');
      res.pagination.should.have.property('page');
      res.pagination.should.have.property('total');
      res.pagination.should.have.property('per_page');
      res.should.have.property('meta');
      done();
    });
  });

  it('should suggest items', function(done) {
    searchService.suggest({
      collectionName: 'movie',
      query: 'bat'
    }, function(err, res) {
      should.not.exist(err);
      done();
    });
  });
});
