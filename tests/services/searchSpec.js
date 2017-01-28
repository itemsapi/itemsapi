var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('search service', function() {

  var searchService = require('./../../src/services/search');
  var dataService = require('./../../src/services/data');
  var projectService = require('./../../src/services/project');
  var importService = require('./../../src/services/import');
  var elasticTools = require('./../../src/elastic/tools');
  var fs = require('fs-extra');

  before(function(done) {

    var data = [{
      name: 'Godfather',
      enabled: true
    }, {
      name: 'Fight club',
      enabled: false
    }, {
      name: 'test/test',
      enabled: true
    }]

    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).delay(30)
    .then(function(res) {
      dataService.addDocumentsAsync({
        refresh: true,
        collectionName: 'movie',
        body: data
      })
    }).delay(100)
    .then(function(res) {
      done();
    });
  });

  it('should search items', function(done) {
    searchService.searchAsync({
      collectionName: 'movie'
    }).then(function(res) {
      res.should.have.property('data')
      res.data.should.have.property('items').and.lengthOf(3);
      res.data.should.have.property('aggregations');
      res.data.aggregations.should.be.an.instanceOf(Object);
      res.data.aggregations.should.not.be.an.instanceOf(Array);
      res.data.aggregations.should.have.property('tags');
      res.should.have.property('pagination');
      res.pagination.should.have.property('page', 1);
      res.pagination.should.have.property('total');
      res.pagination.should.have.property('per_page');
      res.should.have.property('meta');
      done();
    });
  });

  it('should search godfather', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'godfather'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(1);
      done();
    });
  });

  it('should search with not alphanumeric input', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'test/test'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(1);
      done();
    });
  });

  it('should search in conjunctive way (AND instead of OR between query words)', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'godfather fight'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(0);
      done();
    });
  });

  // https://www.elastic.co/guide/en/elasticsearch/reference/1.7/query-dsl-query-string-query.html
  it('should search using the querystring language', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query_string: 'name:FIG*'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(1);
      done();
    });
  });

  it('should search using the querystring language 2', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query_string: 'name:FIG* OR name:Godfather'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(2);
      done();
    });
  });

  it('should search using the query and querystring language', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'fight',
      query_string: 'name:FIG* OR name:Godfather'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(1);
      done();
    });
  });

  it('should search using the query and querystring language 2', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'fight',
      query_string: 'enabled:false'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(1);
      done();
    });
  });

  it('should search using the query and querystring language 3', function(done) {
    searchService.searchAsync({
      collectionName: 'movie',
      query: 'godfather',
      query_string: 'enabled:false'
    }).then(function(res) {
      res.data.should.have.property('items').and.lengthOf(0);
      done();
    });
  });

  it('should search city and get aggregations as array', function(done) {
    searchService.searchAsync({
      collectionName: 'city'
    }).then(function(res) {
      res.should.have.property('data')
      res.data.should.have.property('items');
      res.data.should.have.property('aggregations');
      res.data.aggregations.should.be.an.instanceOf(Array);
      res.data.aggregations[0].should.have.property('name', 'country');
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

    it('should return results count', function(done) {
      searchService.countAsync({
        collectionName: 'city'
      }).then(function(res) {
        assert.equal(res, 6)
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

  it('should get all facets for movie (object)', function(done) {
    searchService.getFacetsAsync({
      collectionName: 'movie'
    }).then(function(res) {
      res.should.be.an.instanceOf(Array);
      done();
    });
  });

  it('should get all facets for city (array)', function(done) {
    searchService.getFacetsAsync({
      collectionName: 'city'
    }).then(function(res) {
      res.should.be.an.instanceOf(Array);
      done();
    });
  });

  it('should get city country facet', function(done) {
    searchService.getFacetAsync({
      collectionName: 'city',
      facetName: 'country',
      size: 100
    }).then(function(res) {
      res.should.be.an.instanceOf(Object);
      res.should.have.property('name', 'country');
      res.should.have.property('type', 'terms');
      res.should.have.property('size', 100);
      done();
    });
  });

  it('should get movie actors_terms facet', function(done) {
    searchService.getFacetAsync({
      collectionName: 'movie',
      facetName: 'actors_terms',
      size: 100
    }).then(function(res) {
      res.should.be.an.instanceOf(Object);
      res.should.have.property('name', 'actors_terms');
      res.should.have.property('title', 'Actors');
      res.should.have.property('type', 'terms');
      res.should.have.property('size', 100);
      done();
    });
  });

  it('should not get movie notexistent_terms facet', function(done) {
    searchService.getFacetAsync({
      collectionName: 'movie',
      facetName: 'notexistent_terms'
    }).catch(function(res) {
      done();
    })
  });

  xit('should suggest items', function(done) {
    searchService.suggestAsync({
      collectionName: 'movie',
      query: 'bat'
    }).then(function(res) {
      done();
    });
  });
});
