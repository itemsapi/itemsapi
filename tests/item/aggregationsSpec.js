var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');
var _ = require('underscore');

setup.makeSuite('item crud request', function() {
  var data = [
    {id: 1, rating: 9, name: 'godfather', tags: ['drama', 'criminal']},
    {id: 2, rating: 9, name: 'gladiator', tags: ['drama', 'war', 'history']},
    {id: 3, rating: 9, name: 'inception', tags: ['sf']}
  ];

  var projectService = require('./../../src/services/project');
  var collectionService = require('./../../src/services/collection');
  var documentElastic = require('./../../src/elastic/data');
  var elasticTools = require('./../../src/elastic/tools');

  before(function(done) {
    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).then(function(res) {
      request(setup.getServer())
      .post('/api/v1/items/movie')
      .send(data)
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        return elasticTools.refreshAsync({
        }).then(function(res) {
          done();
        });
      });
    });
  });

  it('should get all aggregations', function(done) {
    request(setup.getServer())
      .get('/api/v1/items/movie')
      .end(function afterRequest(err, res) {
        //console.log(res.body);
        res.should.have.property('status', 200);
        res.body.pagination.should.have.property('total', 3);
        var aggregations = res.body.data.aggregations;
        //console.log(aggregations);
        aggregations.should.have.property('tags');
        aggregations.should.have.property('director_terms');
        aggregations.should.have.property('actors_terms');
        done();
      });
  });

  it('should make search only with requested aggregations', function(done) {
    request(setup.getServer())
      .get('/api/v1/items/movie?load_aggs=tags,director_terms')
      .end(function afterRequest(err, res) {
        //console.log(res.body);
        res.should.have.property('status', 200);
        res.body.pagination.should.have.property('total', 3);
        var aggregations = res.body.data.aggregations;
        aggregations.should.have.property('tags');
        aggregations.should.have.property('director_terms');
        aggregations.should.not.have.property('actors_terms');
        done();
      });
  });

  it('should make search only with no aggregations', function(done) {
    request(setup.getServer())
      .get('/api/v1/items/movie?load_aggs=')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.pagination.should.have.property('total', 3);
        var aggregations = res.body.data.aggregations;
        should.not.exist(aggregations);
        done();
      });
  });
});
