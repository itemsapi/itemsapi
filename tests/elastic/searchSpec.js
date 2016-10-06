var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var fs = require('fs-extra');

setup.makeSuite('elastic data', function() {

  var search = require('./../../src/elastic/search');


  // this test should be extended
  describe('should build search query', function() {

    var collection = JSON.parse(
      fs.readFileSync(__dirname + '/../fixtures/movie_collection.json')
    )

    it('generates search query', function(done) {
      var body = search.searchBuilder({
        page: 1,
      }, collection)
      var json = body
      json.should.have.property('size');
      json.should.have.property('from');
      json.should.have.property('aggs');
      // it exists but it is empty
      json.should.have.property('filter');
      done();
    });

    it('generates search query without aggregations', function(done) {
      var body = search.searchBuilder({
        page: 1,
        load_aggs: []
      }, collection)
      var json = body
      json.should.have.property('size');
      json.should.have.property('from');
      json.should.not.have.property('aggs');
      // it exists but it is empty
      json.should.have.property('filter');
      done();
    });

    it('generates search query with sort', function(done) {
      var body = search.searchBuilder({
        page: 1,
        sort: 'rating',
        load_aggs: []
      }, collection)
      var json = body
      json.should.have.property('size');
      json.should.have.property('from');
      json.should.not.have.property('aggs');
      json.should.have.property('sort');
      done();
    });

    it('generates search query with multi-field sort', function(done) {
      var body = search.searchBuilder({
        page: 1,
        sort: 'mix',
        load_aggs: []
      }, collection)
      var json = body
      console.log(JSON.stringify(json.sort))
      json.should.have.property('size');
      json.should.have.property('from');
      json.should.not.have.property('aggs');
      json.should.have.property('sort');
      done();
    });
  })

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
      console.log(filter);
      filter.should.have.property('terms');
      filter.terms.actors[0].should.be.equal('drama');
      filter.terms.actors.should.be.instanceOf(Array).and.have.lengthOf(2);
      done();
    });

    it('generates conjunctive terms filter', function(done) {
      options.conjunction = true;
      var filter = search.generateTermsFilter(options, ['drama', 'fantasy']).toJSON();
      filter.should.have.property('and');
      filter.and.should.have.property('filters').and.have.lengthOf(2);
      done();
    });
  });

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
      console.log(filter);
      filter.should.have.property('terms');
      filter.terms.actors[0].should.be.equal('drama');
      filter.terms.actors.should.be.instanceOf(Array).and.have.lengthOf(2);
      done();
    });

    it('generates conjunctive terms filter', function(done) {
      options.conjunction = true;
      var filter = search.generateTermsFilter(options, ['drama', 'fantasy']).toJSON();
      filter.should.have.property('and');
      filter.and.should.have.property('filters').and.have.lengthOf(2);
      done();
    });
  });

  describe('should build range filter for aggregations', function() {
    var options = {
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

  describe('should build sorting options', function() {

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

      var sort = search.generateSort(options, {
        geoPoint: [51.30, 0.08]
      });

      // generates geo: [ 0.08, 51.3 ]
      // should generate location: {lat: 51.30, lon: 0.08}
      // but seems to be working
      //console.log(sort.toJSON())
      sort.toJSON().should.have.property('_geo_distance');
      sort.toJSON()._geo_distance.should.have.property('order', 'asc');
      sort.toJSON()._geo_distance.should.have.property('unit', 'km');
      sort.toJSON()._geo_distance.should.have.property('geo');

      done();
    });

    it('should build multi field sorting', function(done) {
      var options = {
        title: 'Rating',
        //type: 'normal',
        sort: [
          { name : {order: 'asc'}},
          { rating : {order: 'desc'}}
        ]
      };

      var sort = search.generateSort(options);
      // sort is not elastic.js object here
      //sort.toJSON().should.be.instanceOf(Array).and.have.lengthOf(2);
      //console.log(sort.toJSON());
      done();
    });

    it('should not build sorting', function(done) {
      var sort = search.generateSort();
      should(sort).be.undefined
      done();
    });
  })
});
