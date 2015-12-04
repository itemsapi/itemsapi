var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('collection service', function() {

  var collectionService = require('./../../src/services/collection');
  var collectionHelper = require('./../../src/helpers/collection')

  it('should find collection', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie'
    })
    .then(function(res) {
      res.should.have.property('schema');
      res.should.have.property('aggregations');
      res.should.have.property('sortings');

      should(collectionHelper(res).getSortings()).be.instanceOf(Object);
      done();
    })
  });

  it('should find collection with defined project name', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie',
      project: 'test'
    })
    .then(function(res) {
      should(res).not.be.undefined;
      done();
    })
  });

  it('should not find collection with not existent project', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie',
      project: 'notexistent'
    })
    .then(function(res) {
      should(res).be.undefined;
      done();
    })
  });

  it('should test collection helpers', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie'
    })
    .then(function(res) {
      should(collectionHelper(res).getSortings()).be.instanceOf(Object);
      should(collectionHelper(res).getSorting('favorites')).have.property('field', 'favorites');
      should(collectionHelper(res).getSorting('wrong_value')).be.equal(null);

      should(collectionHelper(res).getAggregations()).be.instanceOf(Object);
      should(collectionHelper(res).getAggregation('actors_terms')).have.property('field', 'actors');
      should(collectionHelper(res).getAggregation('wrong_value')).be.equal(null);

      should(collectionHelper(res).getSchema()).have.property('name');
      should(collectionHelper(res).getSchema()).have.property('image');
      should(collectionHelper(res).getSchema().image).have.property('display');
      should(collectionHelper(res).getElasticSchema()).have.property('image');
      should(collectionHelper(res).getElasticSchema().image).have.property('type');
      should(collectionHelper(res).getElasticSchema().image).not.have.property('display');
      done();
    })
  });

  it('should find all collections', function(done) {
    collectionService.getCollectionsAsync()
    .then(function(res) {
      //res.should.be.instanceOf(Array).and.have.lengthOf(2);
      done();
    })
  });

  it('should filter collections', function(done) {
    collectionService.getCollectionsAsync({name: 'movie'})
    .then(function(res) {
      res.should.be.instanceOf(Array).and.have.lengthOf(1);
      done();
    })
  });

  it('should get collections list', function(done) {
    collectionService.getCollectionsListAsync()
    .then(function(res) {
      //res.should.be.instanceOf(Array).and.have.lengthOf(2);
      res[0].should.be.equal('movie');
      done();
    })
  });

  it('should add collection', function(done) {
    collectionService.addCollectionAsync({
      name: 'new-collection',
      project: 'new-project',
      schema: {}
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        res.should.have.property('schema');
        res.should.have.property('name');
        res.should.have.property('project');
        done();
      });
    })
  });

  it('should add collection', function(done) {
    collectionService.removeCollectionAsync({
      name: 'new-collection',
      project: 'new-project',
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        should(res).be.undefined;
        done();
      });
    })
  });
});
