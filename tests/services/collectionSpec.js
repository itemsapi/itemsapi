var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('collection service', function() {

  var collectionService = require('./../../src/services/collection');
  var collectionHelper = require('./../../src/helpers/collection')

  it('should find collection', function(done) {
    collectionService.findCollectionAsync('movie')
    .then(function(res) {
      res.should.have.property('schema');
      res.should.have.property('aggregations');
      res.should.have.property('sortings');

      should(collectionHelper(res).getSortings()).be.instanceOf(Object);
      done();
    })
  });

  it('should test collection helpers', function(done) {
    collectionService.findCollectionAsync('movie')
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
      res.should.be.instanceOf(Array).and.have.lengthOf(2);
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
      res.should.be.instanceOf(Array).and.have.lengthOf(2);
      res[0].should.be.equal('movie');
      done();
    })
  });
});
