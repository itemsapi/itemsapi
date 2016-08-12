var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');
var _ = require('lodash')

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var dataService = require('./../../src/services/data');
  var projectService = require('./../../src/services/project');
  var importService = require('./../../src/services/import');
  var elasticTools = require('./../../src/elastic/tools');
  var search = require('./../../src/elastic/search');
  var fs = require('fs-extra');

  before(function(done) {

    fs.readFileAsync(__dirname + '/../fixtures/movies_similar.json')
    .then(function(res) {
      return JSON.parse(res);
    })
    .then(function(res) {
      return importService.importAsync({
        collectionName: 'movie',
        index: 'test',
        body: res
      })
    })
    .delay(10)
    .then(function(res) {
      return elasticTools.refreshAsync({
        index: 'test'
      }).then(function(res) {
        done();
      })
    })
  });

  it('should get similar movies (collaborative filtering)', function(done) {
    searchService.similarAsync({
      collectionName: 'movie',
      index: 'test',
      ids: [1],
      fields: ['tags']
    }).then(function(res) {
      should.exists(res.meta)
      should.exists(res.pagination)
      should.exists(res.data)
      _.map(res.data.items, 'id').should.eql(
        [3, 2, 4]
      )
      done();
    });
  });

  it('should get similar movies and filter by query string', function(done) {
    searchService.similarAsync({
      collectionName: 'movie',
      index: 'test',
      ids: [1],
      fields: ['tags'],
      query_string: 'name:movie2'
    }).then(function(res) {
      should.exists(res.meta)
      should.exists(res.pagination)
      should.exists(res.data)
      _.map(res.data.items, 'id').should.eql(
        [3]
      )
      done();
    });
  });
})
