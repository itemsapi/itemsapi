var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs')

setup.makeSuite('project service', function() {

  var projectService = require('./../../src/services/project');
  var collectionService = require('./../../src/services/collection');
  var statsService = require('./../../src/services/stats');
  var elasticClient = require('./../../src/connections/elastic');


  before(function(done){
    //nock.disableNetConnect();
    //nock.enableNetConnect();
    done();
  });

  beforeEach(function(done){
    var cars = JSON.parse(
      fs.readFileSync(__dirname + '/../fixtures/cars.json')
    )
    nock('https://raw.githubusercontent.com')
    .get('/itemsapi/itemsapi-example-data/master/items/cars.json')
    .reply(200, cars)
    done();
  });


  xit('should create project successfully', function(done) {
    projectService.addProjectAsync({
      projectName: 'test'
    }).then(function(res) {
      done();
    });
  });

  it('should ensure project exists', function(done) {
    projectService.ensureProjectAsync({
      projectName: 'test'
    }).then(function(res) {
      done();
    });
  });

  it('should create collection with configuration', function(done) {
    var data = {
      projectName: 'test',
      collectionName: 'city'
    }

    projectService.ensureCollectionAsync(data)
    .then(function(res) {
      done();
    });
  });

  it('should create collection with configuration once again', function(done) {
    var data = {
      projectName: 'test',
      collectionName: 'city'
    }

    projectService.ensureCollectionAsync(data)
    .then(function(res) {
      done();
    });
  });

  it('should check collection info', function(done) {
    var data = {
      projectName: 'test',
      collectionName: 'city'
    }

    projectService.collectionInfoAsync(data)
    .then(function(res) {
      //should.not.exist(err);
      res.should.have.property('name', 'city');
      res.should.have.property('display_name');
      res.should.have.property('count');
      done();
    })
  });

  it('should fail when check collection info', function(done) {
    var data = {
      projectName: 'test',
      collectionName: 'notExisted'
    }

    projectService.collectionInfoAsync(data)
    .catch(function(res) {
      res.should.be.instanceOf(Error);
      done();
    })
  });

  it('should check stats', function(done) {
    statsService.statsAsync({
      projectName: 'test',
    })
    .then(function(res) {
      res.should.have.property('documents_count');
      res.should.have.property('collections_count');
      done();
    })
  });

  it('should create project from scratch', function(done) {
    var data = {
      name: 'restaurants',
      auto: true,
      data: [{
        geo: '82.30, 62.20',
        city: 'Alert',
        country_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/23px-Flag_of_Canada.svg.png',
        country: 'Canada',
        rating: 3.41,
        name: 'Ambrose Stream Restaurant',
        likes: [
          'tia',
          'royal',
          'maudie',
          'doug',
          'paul',
          'roel'
        ]
      }]
    }

    projectService.createProjectAsync(data)
    .then(function(res) {
      res.should.have.property('name', 'restaurants');
      return collectionService.findCollectionAsync({
        name: 'restaurants'
      })
    })
    .then(function(res) {
      res.should.have.property('name', 'restaurants');
      res.should.have.property('schema');
      res.should.have.property('aggregations');
      res.aggregations.should.have.property('rating');
      res.should.have.property('sortings');
      return collectionService.removeCollectionAsync({
        name: 'restaurants'
      })
    })
    .then(function(res) {
      done();
    })
  });

  it('should create project from scratch but using url', function(done) {
    var data = {
      name: 'cars',
      url: 'https://raw.githubusercontent.com/itemsapi/itemsapi-example-data/master/items/cars.json'
    }

    projectService.createProjectAsync(data)
    .then(function(res) {
      res.should.have.property('name', 'cars');
      return collectionService.findCollectionAsync({
        name: 'cars'
      })
    })
    .then(function(res) {
      res.should.have.property('name', 'cars');
      res.should.have.property('schema');
      res.should.have.property('aggregations');
      //res.aggregations.should.have.property('rating');
      res.should.have.property('sortings');
      return collectionService.removeCollectionAsync({
        name: 'cars'
      })
    })
    .then(function(res) {
      done();
    })
  });


});
