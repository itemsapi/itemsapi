var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');
var _ = require('lodash');

setup.makeSuite('collections storage', function() {


  describe('json storage', function() {
    var storage = require('./../../src/storage/collection/json')

    it('should find collection', function(done) {
      storage.findCollectionAsync({
        name: 'movie'
      })
      .then(function(res) {
        res.should.have.property('schema');
        res.should.have.property('aggregations');
        res.should.have.property('sortings');

        //should(collectionHelper(res).getSortings()).be.instanceOf(Object);
        done();
      })
    });
  })

  describe('mongodb storage', function() {
    var storage = require('./../../src/storage/collection/mongodb')


    before(function(done) {
      storage.removeCollectionsAsync()
      .then(function(res) {
        done();
      })
    })

    it('should add collection', function(done) {
      storage.addCollectionAsync({
        name: 'new-collection',
        schema: {
          a: 'ok'
        }
      })
      .then(function(res) {
        storage.findCollectionAsync({
          name: 'new-collection'
        })
        .then(function(res) {
          res.should.have.property('schema');
          res.schema.should.have.property('a', 'ok');
          res.should.have.property('name');
          res.should.have.property('created_at');
          res.should.have.property('updated_at');
          done();
        });
      })
    });

    it('should update collection partially', function(done) {
      return storage.partialUpdateCollectionAsync({
        schema: {
          a: 'ok2'
        }
      }, {
        name: 'new-collection'
      })
      .then(function(res) {
        storage.findCollectionAsync({
          name: 'new-collection'
        })
        .then(function(res) {
          res.should.have.property('schema');
          res.should.not.have.property('normalSchema');
          res.schema.should.have.property('a', 'ok2');
          res.should.have.property('name');
          res.should.have.property('created_at');
          res.should.have.property('updated_at');
          done();
        });
      })
    });

    it('should not update unexistent collection', function(done) {
      storage.updateCollectionAsync({
        type: 'type'
      }, {
        name: 'new-collection-2'
      })
      .catch(function(err) {
        done();
      })
    });

    it('should get collections list', function(done) {
      storage.getCollectionsAsync()
      .then(function(res) {
        var collection = _.first(res)
        collection.should.have.property('schema');
        collection.should.not.have.property('normalSchema');
        collection.schema.should.have.property('a', 'ok2');
        collection.should.have.property('name');
        collection.should.have.property('created_at');
        collection.should.have.property('updated_at');
        done()
      })
    });

    it('should remove collection', function(done) {
      storage.removeCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        storage.findCollectionAsync({
          name: 'new-collection'
        })
        .then(function(res) {
          should.fail('error should be here')
          done();
        })
        .catch(function(err) {
          done();
        })
      })
    });

  })
});
