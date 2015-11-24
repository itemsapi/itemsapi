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

  it('should find all collections', function(done) {
    collectionService.getCollectionsAsync()
    .then(function(res) {
      res.should.be.instanceOf(Array).and.have.lengthOf(2);
      done();
    })
  });

  it('should filter collections', function(done) {
    collectionService.getCollectionsAsync({collection: 'movie'})
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
