var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('collection service', function() {

  var collectionService = require('./../../src/services/collection');
  var collectionHelper = require('./../../src/helpers/collection')

  before(function(done) {
    collectionService.removeCollectionAsync({
      name: 'new-collection'
    })
    .then(function(res) {
      done();
    })
  })

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
      name: 'movie'
    })
    .then(function(res) {
      should(res).not.be.undefined;
      done();
    })
  });

  xit('should find collection with undefined project name', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie',
      project: undefined
    })
    .then(function(res) {
      should(res).not.be.undefined;
      res.should.have.property('schema');
      done();
    })
  });

  xit('should not find collection with not existent project', function(done) {
    collectionService.findCollectionAsync({
      name: 'movie',
      project: 'notexistent'
    })
    .then(function(res) {
      should.fail('error should be here')
    })
    .catch(function(err) {
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
      schema: {}
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        res.should.have.property('schema');
        res.should.have.property('name');
        res.should.have.property('created_at');
        res.should.have.property('updated_at');
        done();
      });
    })
  });

  it('should throw error if name not provided', function(done) {
    collectionService.addCollectionAsync({})
    .catch(function(err) {
      done();
    })
  });

  it('should forbid adding duplicate collection', function(done) {
    collectionService.addCollectionAsync({
      name: 'new-collection',
      schema: {
        name: {
          type: 'string',
          store: true
        }
      }
    })
    .catch(function(err) {
      done();
    })
  });

  it('should update collection partially', function(done) {
    return collectionService.partialUpdateCollectionAsync({
      test: true
    }, {
      name: 'new-collection'
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        //console.log(res);
        res.should.have.property('name', 'new-collection');
        res.should.have.property('test', true);
        res.should.have.property('schema');
        res.should.have.property('created_at');
        res.should.have.property('updated_at');
        done();
      });
    })
  });

  it('should update schema in collection partially', function(done) {
    return collectionService.partialUpdateCollectionAsync({
      schema: {
        permalink: {
          type: 'string',
          store: true
        }
      }
    }, {
      name: 'new-collection'
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        res.should.have.property('name', 'new-collection');
        res.should.have.property('test', true);
        res.should.have.property('schema');
        res.schema.should.have.property('permalink');
        res.schema.should.not.have.property('name');
        done();
      });
    })
  });

  it('should update collection (replace)', function(done) {
    return collectionService.updateCollectionAsync({
      test: false,
      name: 'new-collection'
    }, {
      name: 'new-collection'
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
        name: 'new-collection'
      })
      .then(function(res) {
        res.should.have.property('name', 'new-collection');
        res.should.have.property('test', false);
        res.should.not.have.property('schema');
        done();
      });
    })
  });

  it('should not update unexistent collection', function(done) {
    collectionService.updateCollectionAsync({
      test: true
    }, {
      name: 'new-collection-2'
    })
    .catch(function(err) {
      done();
    })
  });

  it('should remove collection', function(done) {
    collectionService.removeCollectionAsync({
      name: 'new-collection'
    })
    .then(function(res) {
      collectionService.findCollectionAsync({
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
});
