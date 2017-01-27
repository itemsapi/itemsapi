var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs-extra');
var Promise = require('bluebird');

setup.makeSuite('project service', function() {

  var projectService = require('./../../src/services/project');
  var collectionService = require('./../../src/services/collection');
  var statsService = require('./../../src/services/stats');
  var elasticClient = require('./../../src/connections/elastic');
  var importService = require('./../../src/services/import');
  var elasticTools = require('./../../src/elastic/tools');
  var elasticData = require('./../../src/elastic/data');
  var mapping = Promise.promisifyAll(require('./../../src/elastic/mapping'));

  /*var is_skipped = true;
  before(function(done) {
    if (is_skipped) {
      this.skip();
    }
    done();
  });

  // force delete
  before(function(done){
    return collectionService.removeCollectionAsync({
      name: 'reindex'
    })
    .then(function(res) {
      return mapping.deleteIndexAsync({
        index: 'reindex'
      })
    })
    .then(function(res) {
      done()
    })
    .catch(function(err) {
      console.log('there was nothing to delete');
      done()
    })
  })

  before(function(done){
    var cities = JSON.parse(fs.readFileSync(__dirname + '/../fixtures/cities.json'))

    projectService.createProjectAsync({
      name: 'reindex',
      auto: true,
      data: cities
    })
    .then(function(res) {
      return elasticTools.refreshAsync()
    })
    .then(function(res) {
      done()
    })
  })

  beforeEach(function(done){
    done();
  });

  after(function(done){
    done();
  })


  it('should check index and type name', function(done) {
    return collectionService.findCollectionAsync({
      name: 'reindex'
    })
    .then(function(res) {
      res.should.not.have.property('index', 'reindex');
      res.should.not.have.property('type', 'reindex');
      done()
    })
  })

  it('should reindex index / type', function(done) {
    var data = {
      old_type: 'reindex',
      old_index: 'reindex',
      new_type: 'reindex_2',
      new_index: 'reindex'
    }

    projectService.reindexAsync(data)
    .then(function(res) {
      return projectService.getMappingForTypeAsync({
        collectionName: 'reindex'
      })
      .then(function(res) {
        res.should.not.have.property('name');
        res.should.have.property('city');

        return elasticData.countDocumentsAsync({
          index: 'reindex',
          type: 'reindex'
        })
      })
      .then(function(res) {
        assert.equal(6, res)
        return mapping.getMappingForTypeAsync({
          index: 'reindex',
          type: 'reindex_2'
        })
      })
      .then(function(res) {
        // name is missing because it not exists in data
        res.should.not.have.property('name');
        res.should.have.property('city');
        return elasticTools.refreshAsync({
        })
      })
      .then(function(res) {
        return elasticData.countDocumentsAsync({
          index: 'reindex',
          type: 'reindex_2'
        })
      })
      .then(function(res) {
        assert.equal(6, res)
        done();
      })
    })
  })

  it('should reindex whole project (collection + mapping)', function(done) {
    var data = {
      collectionName: 'reindex',
      new_type: 'reindex_3',
      new_index: 'reindex'
    }

    projectService.reindexCollectionAsync(data)
    .then(function(res) {
      return projectService.getMappingForTypeAsync({
        collectionName: 'reindex'
      })
    })
    .then(function(res) {
      // name is missing because it not exists in data
      //res.should.have.property('name');
      res.should.have.property('city');
      return elasticData.countDocumentsAsync({
        index: 'reindex',
        type: 'reindex'
      })
    })
    .then(function(res) {
      assert.equal(6, res)
      return collectionService.findCollectionAsync({
        name: 'reindex'
      })
    })
    .then(function(res) {
      res.should.have.property('index', 'reindex');
      res.should.have.property('name');
      res.should.have.property('type', 'reindex_3');
      done()
    })
  })

  it('should make smart reindexing with old index and random type', function(done) {

    projectService.reindexCollectionAsync({
      collectionName: 'reindex'
    })
    .then(function(res) {
      return collectionService.findCollectionAsync({
        name: 'reindex'
      })
    })
    .then(function(res) {
      res.should.have.property('index');
      res.should.have.property('name');
      done()
    })
  })

  it('should change mapping after changing collection schema and reindexing', function(done) {
    var data = {
      collectionName: 'reindex',
      new_type: 'reindex_new_mapping'
    }

    return collectionService.findCollectionAsync({
      name: data.collectionName
    })
    .then(function(res) {
      res.schema.permalink = {
        type: 'string',
        store: true,
        index: 'not_analyzed'
      }

      collectionService.partialUpdateCollectionAsync({
        schema: res.schema
      }, {
        name: data.collectionName
      })
    })
    .then(function(res) {
      return mapping.deleteMappingAsync({
        index: 'reindex',
        type: 'reindex_new_mapping'
      })
    })
    .then(function(res) {
      projectService.reindexCollectionAsync(data)
    })
    .then(function(res) {
      return elasticTools.refreshAsync()
    })
    .delay(500)
    .then(function(res) {
      return mapping.getMappingForTypeAsync({
        index: 'reindex',
        type: 'reindex_new_mapping'
      })
    })
    .then(function(res) {
      res.should.have.property('city');
      res.should.have.property('permalink');
      res.permalink.should.have.property('index', 'not_analyzed');
      done()
    })
  })
  */
});
