'use strict';

var should = require('should');
var setup = require('./../mocks/setup');
var _ = require('lodash')

setup.makeSuite('collection helper', function() {

  var collectionService = require('./../../src/services/collection');
  var collectionHelper = require('./../../src/helpers/collection')

  var collection;
  var cityCollection;
  before(function(done) {
    collectionService.findCollectionAsync({
      name: 'movie'
    })
    .then(function(res) {
      collection = res;
      return collectionService.findCollectionAsync({
        name: 'city'
      })
    })
    .then(function(res) {
      cityCollection = res;
      done();
    })
  });

  it('get proper sortings options', function(done) {
    var helper = collectionHelper(collection)
    should(helper.getSortings()).be.instanceOf(Object);
    should(helper.getSortings()).have.property('favorites');
    should(helper.getSortings()).have.property('played');
    should(helper.getSortings()).have.property('played');

    should(helper.getSorting('played')).be.instanceOf(Object);
    should(helper.getSorting('played3')).be.null;
    should(helper.getDefaults('sort')).be.undefined;
    should(helper.getDefaultSorting()).be.null;
    should(helper.getChosenSortingKey('played')).be.equal('played');
    should(helper.getChosenSortingKey('played3')).be.undefined;
    done();
  })

  it('get proper sortings options2', function(done) {
    var collection1 = _.clone(collection)
    collection1.defaults = {
      sort: 'played'
    }
    var helper = collectionHelper(collection1)
    should(helper.getSortings()).be.instanceOf(Object);
    should(helper.getSortings()).have.property('favorites');
    should(helper.getSortings()).have.property('played');
    should(helper.getSortings()).have.property('played');

    should(helper.getSorting('played')).be.instanceOf(Object);
    should(helper.getDefaults('sort')).be.equal('played');
    should(helper.getDefaultSorting()).be.instanceOf(Object)
    should(helper.getDefaultSorting()).have.property('field', 'played')
    should(helper.getDefaultSorting()).have.property('type', 'normal')
    should(helper.getChosenSortingKey('played')).be.equal('played');
    should(helper.getChosenSortingKey('played3')).be.equal('played');

    done();
  })

  // some tests are redundant
  it('should test collection helpers', function(done) {
    should(collectionHelper(collection).getSortings()).be.instanceOf(Object);
    should(collectionHelper(collection).getSorting('favorites')).have.property('field', 'favorites');
    should(collectionHelper(collection).getSorting('wrong_value')).be.equal(null);

    should(collectionHelper(collection).getAggregations()).be.instanceOf(Object);
    should(collectionHelper(collection).getAggregation('actors_terms')).have.property('field', 'actors');
    should(collectionHelper(collection).getAggregation('wrong_value')).be.equal(null);
    done();
  });

  it('should test collection elasticsearch schema', function(done) {
    should(collectionHelper(collection).getSchema()).have.property('name');
    should(collectionHelper(collection).getSchema()).have.property('image');
    should(collectionHelper(collection).getSchema().image).have.property('display');
    should(collectionHelper(collection).getElasticSchema()).have.property('image');
    should(collectionHelper(collection).getElasticSchema().image).have.property('type');
    should(collectionHelper(collection).getElasticSchema().image).not.have.property('display');
    done();
  });

  it('should test index and type name', function(done) {
    var helper = collectionHelper(collection)
    should(helper.getName()).be.equal('movie');
    should(helper.getType()).be.equal('movie');
    should(helper.getIndex()).be.equal('test');
    done();
  });

  it('should update aggregation', function(done) {
    // aggregations is object of object
    var helper = collectionHelper(_.clone(collection))
    helper.updateAggregation('tags', 'size', 15)
    var aggregation = helper.getAggregation('tags')
    aggregation.should.have.property('size', 15)
    aggregation.should.have.property('type', 'terms')
    aggregation.should.have.property('field', 'tags')

    // aggregations is array of object
    var helper = collectionHelper(_.clone(cityCollection))
    helper.updateAggregation('country', 'size', 15)
    var aggregation = helper.getAggregation('country')
    aggregation.should.have.property('size', 15)
    aggregation.should.have.property('type', 'terms')

    done();
  });

});
