var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic data', function() {

  var search = require('./../../src/elastic/search');

  describe('should build range filter for aggregations', function() {
    var options = {
      //name: 'actors_terms',
      type: 'terms',
      field: 'actors',
      size: 10,
      title: 'Actors'
    };

    it('generates terms filter', function(done) {
      var filter = search.generateTermsFilter(options, ['drama', 'fantasy']).toJSON();
      filter.should.have.property('terms');
      filter.terms.actors[0].should.be.equal('drama');
      filter.terms.actors.should.be.instanceOf(Array).and.have.lengthOf(2);
      done();
    });
  });

  describe('should build range filter for aggregations', function() {
    var options = {
      //name: 'rating_range',
      type: 'range',
      field: 'rating',
      title: 'Rating range',
      ranges: [
        {name: '0 - 1', lte: 1},
        {name: '7 - 8', gte: 7, lte: 8},
        {name: '8 - 9', gte: 8, lte: 9},
        {name: '9 - 10', gte: 9},
      ]
    }

    it('generates range for one basic option', function(done) {
      var filter = search.generateRangeFilter(options, ['8 - 9']).toJSON();
      filter.should.have.property('or');
      filter.or.should.have.property('filters').and.be.instanceOf(Array);
      filter.or.filters[0].range.rating.should.have.property('gte', 8);
      filter.or.filters[0].range.rating.should.have.property('lte', 9);
      done();
    });

    it('generates range filter for two options', function(done) {
      var filter = search.generateRangeFilter(options, ['8 - 9', '7 - 8']).toJSON();
      filter.or.should.have.property('filters').and.be.instanceOf(Array).and.have.lengthOf(2);
      filter.or.filters[0].range.rating.should.have.property('gte', 8);
      filter.or.filters[0].range.rating.should.have.property('lte', 9);
      filter.or.filters[1].range.rating.should.have.property('gte', 7);
      filter.or.filters[1].range.rating.should.have.property('lte', 8);
      done();
    });

    it('generates range filter for edge options', function(done) {
      var filter = search.generateRangeFilter(options, ['9 - 10']).toJSON();
      filter.or.should.have.property('filters').and.be.instanceOf(Array).and.have.lengthOf(1);
      filter.or.filters[0].range.rating.should.have.property('gte', 9);
      filter.or.filters[0].range.rating.should.not.have.property('lte');
      done();
    });

    it('should not generate range filter for not existent options or empty input', function(done) {
      var filter = search.generateRangeFilter(options, []).toJSON();
      filter.or.should.have.property('filters').and.be.instanceOf(Array).and.have.lengthOf(0);

      var filter = search.generateRangeFilter(options, ['wrong']).toJSON();
      filter.or.should.have.property('filters').and.be.instanceOf(Array).and.have.lengthOf(0);
      done();
    });
  })

  it('should build sorting based on configuration', function(done) {
    var options = {
      title: 'Best rating',
      type: 'normal',
      order: 'desc',
      field: 'rating'
    };
    var sort = search.generateSort(options);
    sort.toJSON().should.have.property('rating', {order: 'desc'});
    done();
  });

  it('should build sorting with different configuration', function(done) {
    var options = {
      title: 'Best rating',
      type: 'normal',
      order: 'asc',
      field: 'rating'
    };
    var sort = search.generateSort(options);
    sort.toJSON().should.have.property('rating', {order: 'asc'});
    done();
  });

  it('should build geo sorting', function(done) {
    var options = {
      title: 'Distance',
      type: 'geo',
      order: 'asc',
      field: 'geo'
    };

    var sort = search.generateSort(options);
    sort.toJSON().should.have.property('_geo_distance');
    sort.toJSON()._geo_distance.should.have.property('order', 'asc');
    sort.toJSON()._geo_distance.should.have.property('unit', 'km');
    sort.toJSON()._geo_distance.should.have.property('geo');

    done();
  });
});
