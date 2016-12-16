var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var slugsService = require('./../../src/services/slugs');
  var dataService = require('./../../src/services/data');
  var projectService = require('./../../src/services/project');
  var importService = require('./../../src/services/import');
  var elasticTools = require('./../../src/elastic/tools');
  var fs = require('fs-extra');

  before(function(done) {

    var data = [{
      name: 'Godfather',
      tags: ['Great movie', 'Best movie', 'Drama'],
      enabled: true
    }, {
      name: 'Fight club',
      enabled: false
    }, {
      name: 'test/test',
      enabled: true
    }]

    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).delay(30)
    .then(function(res) {
      dataService.addDocumentsAsync({
        refresh: true,
        collectionName: 'movie',
        body: data
      })
    }).delay(100)
    .then(function(res) {
      done();
    });
  });

  it('should reindex slugs movies collection', function(done) {
    slugsService.reindexAsync({
      collectionName: 'movie',
      per_page: 1
    }).then(function(res) {
      done();
    });
  });

  it('should get slug value for god-father', function(done) {
    slugsService.getAsync('movie', 'tags', 'great-movie')
    .then(function(res) {
      assert.equal(res, 'Great movie')
      done();
    });
  });

  it('should get null for incorrect values', function(done) {
    slugsService.getAsync('movie', 'tagsg', 'great-movie')
    .then(function(res) {
      assert.equal(res, null)
      done();
    });
  });

});
