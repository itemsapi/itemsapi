var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');

setup.makeSuite('add data service', function() {

  var dataService = require('./../../src/services/data');
  var projectService = require('./../../src/services/project');
  var elasticData = require('./../../src/elastic/data');

  beforeEach(function(done) {
    projectService.ensureCollection({
      projectName: 'project',
      collectionName: 'city'
    }, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  it('should add documents (batch) successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'Berlin'
    };

    var spy = sinon.spy(elasticData, 'addDocuments');
    dataService.addDocuments({
      projectName: 'project',
      collectionName: 'city',
      body: [doc, doc, doc, doc],
    }, function(err, res) {
      assert.equal(err, null);
      assert.equal(res.items.length, 4);
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({index: 'project'}));
      assert(spy.calledWithMatch({type: 'city'}));

      done();
    });
  });

  it('should add all documents with configuration successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'Berlin'
    };

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments({
      projectName: 'project',
      collectionName: 'city',
      body: [doc, doc],
    }, function(err, res) {
      assert.equal(err, null);
      assert(spy.calledOnce);
      assert(spy.firstCall.calledWithMatch({projectName: 'project'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'city'}));

      dataService.addDocuments.restore();
      done();
    });
  });

  it('should add more documents successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'France'
    };

    var data = {
      projectName: 'project',
      collectionName: 'city',
      batchSize: 4,
      body: [doc, doc, doc, doc, doc, doc, doc, doc, doc, doc],
    }

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 3);
      assert(spy.firstCall.calledWithMatch({projectName: 'project'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'city'}));
      assert(spy.firstCall.calledWith(sinon.match({collectionName: 'city'})));
      dataService.addDocuments.restore();
      done();
    });
  });

  it('should add document successfully', function(done) {

    var spy = sinon.spy(elasticData, 'addDocument');
    dataService.addDocument({
      projectName: 'project',
      collectionName: 'city',
      body: {rating: 5, name: 'Berlin', id: 5},
    }, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 1);
      assert(spy.firstCall.calledWithMatch({index: 'project'}));
      assert(spy.firstCall.calledWithMatch({type: 'city'}));
      assert(spy.firstCall.calledWithMatch({id: 5}));
      assert(spy.firstCall.calledWith(sinon.match({type: 'city'})));
      elasticData.addDocument.restore();
      done();
    });
  });

  it('should get document successfully', function(done) {

    var spy = sinon.spy(elasticData, 'getDocument');
    dataService.getDocument({
      projectName: 'project',
      collectionName: 'city',
      id: 5
    }, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 1);
      assert(spy.firstCall.calledWithMatch({index: 'project'}));
      assert(spy.firstCall.calledWithMatch({type: 'city'}));
      assert(spy.firstCall.calledWithMatch({id: 5}));
      elasticData.getDocument.restore();
      done();
    });
  });
});
