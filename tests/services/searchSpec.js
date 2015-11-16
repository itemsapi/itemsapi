var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var projectService = require('./../../src/services/project');

  before(function(done) {
    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).delay(30).then(function(res) {
      done();
    });
  });

  it('should search items', function(done) {
    searchService.searchAsync({
      collectionName: 'movie'
    }).then(function(res) {
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
    searchService.suggestAsync({
      collectionName: 'movie',
      query: 'bat'
    }).then(function(res) {
      done();
    });
  });
});
