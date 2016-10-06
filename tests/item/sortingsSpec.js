var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');
var _ = require('underscore');

setup.makeSuite('it tests sortings', function() {
  var data = [
    {id: 1, rating: 1, name: 'b'},
    {id: 2, rating: 2, name: 'b'},
    {id: 3, rating: 3, name: 'b'},
    {id: 4, rating: 5, name: 'e'},
    {id: 5, rating: 4, name: 'b'},
    {id: 6, rating: 6, name: 'a'}
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

  it('should make basic sort', function(done) {
    request(setup.getServer())
      .get('/api/v1/items/movie?sort=alphabetically')
      .end(function afterRequest(err, res) {
        console.log(res.body.data.items);
        res.should.have.property('status', 200);
        res.body.pagination.should.have.property('total', 6);

        _.map(res.body.data.items, 'name').should.eql(
            ['a', 'b', 'b', 'b', 'b', 'e']
        )
        done();
      });
  });

  it('should make multi field sorting', function(done) {
    request(setup.getServer())
      .get('/api/v1/items/movie?sort=mix')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.pagination.should.have.property('total', 6);

        console.log(JSON.stringify(res.body));

        _.map(res.body.data.items, 'name').should.eql(
            ['a', 'b', 'b', 'b', 'b', 'e']
        )

        _.map(res.body.data.items, 'rating').should.eql(
            [6, 4, 3, 2, 1, 5]
        )
        done();
      });
  });
});
