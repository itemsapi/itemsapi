var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var projectService = require('./../../src/services/project');
  var importService = require('./../../src/services/import');
  var elasticTools = require('./../../src/elastic/tools');
  var fs = require('fs-extra');

  before(function(done) {
    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).delay(30).then(function(res) {
      done();
    });
  });

  it('should search items', function(done) {
    searchService.searchAsync({
      collectionName: 'movie'
    }).then(function(res) {
      res.should.have.property('data')
      res.data.should.have.property('items');
      res.should.have.property('pagination');
      res.pagination.should.have.property('page');
      res.pagination.should.have.property('total');
      res.pagination.should.have.property('per_page');
      res.should.have.property('meta');
      done();
    });
  });


  describe('should search and sort items', function(done) {

    before(function(done) {
      fs.readFileAsync(__dirname + '/../fixtures/cities.json')
      .then(function(res) {
        return JSON.parse(res);
      })
      .then(function(res) {
        importService.import({
          projectName: 'test',
          collectionName: 'city',
          body: res
        }, function(err, res) {
          return elasticTools.refreshAsync({
          }).then(function(res) {
            done();
          });
        });
      })
    });

    it('should sort by city name', function(done) {
      searchService.searchAsync({
        collectionName: 'city',
        projectName: 'test',
        sort: 'city'
      }).then(function(res) {
        res.should.have.property('data')
        res.data.should.have.property('items').and.be.lengthOf(6);
        res.data.items[0].should.have.property('city', 'Berlin');
        done();
      });
    });

    it('should sort by geolocation (london)', function(done) {
      searchService.searchAsync({
        collectionName: 'city',
        projectName: 'test',
        sort: 'distance',
        aroundLatLng: '51.30, 0.08' // london
      }).then(function(res) {
        res.should.have.property('data')
        res.data.items[0].should.have.property('city', 'London');
        done();
      });
    });

    it('should sort by geolocation (moscow)', function(done) {
      searchService.searchAsync({
        collectionName: 'city',
        projectName: 'test',
        sort: 'distance',
        aroundLatLng: '55.45, 37.37' // moscow
      }).then(function(res) {
        res.should.have.property('data');
        res.data.items[0].should.have.property('city', 'Moscow');
        done();
      });
    });

    it('should sort by geolocation (empty location input)', function(done) {
      searchService.searchAsync({
        collectionName: 'city',
        projectName: 'test',
        sort: 'distance',
        aroundLatLng: undefined
      }).then(function(res) {
        res.should.have.property('data');
        res.data.should.have.property('items');
        done();
      });
    });
  });



  it('should suggest items', function(done) {
    searchService.suggestAsync({
      collectionName: 'movie',
      query: 'bat'
    }).then(function(res) {
      done();
    });
  });
});
