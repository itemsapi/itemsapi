var should = require('should');
var dataService = require('./../../src/services/data');
var projectService = require('./../../src/services/project');
var elasticData = require('./../../src/elastic/data');
var sinon = require('sinon');
var setup = require('./../mocks/setup');

setup.makeSuite('add data service', function() {

  before(function(done) {
    var data = {
      projectName: 'project',
      collectionName: 'country'
    }

    projectService.ensureCollection(data, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  it('should add data to project successfully', function(done) {
    var data = {
      projectName: 'project',
      collectionName: 'country',
      data: {
        name: 'Germany',
        lang: 'german',
        rating: 5
      }
    };

    var spy = sinon.spy(elasticData, 'addDocument');
    dataService.addDocument(data, function(err, res) {
      assert.equal(err, null);
      res.should.be.ok;
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({index: 'project'}));
      assert(spy.calledWithMatch({type: 'country'}));
      done();
    });
  });

  xit('should add documents (batch) successfully', function(done) {
    var o = {
      'rating':'6',
      'name':'France'
    };
    var data = {
      'projectName': 'project',
      'collectionName': 'country2',
      data: [o,o,o,o],
    }

    var spy = sinon.spy(model, 'add');
    var spy2 = sinon.spy(elasticData, 'addDocuments');
    dataService.addDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(res.items.length, 4);
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({projectName: 'project'}));
      assert(spy.calledWithMatch({collectionName: 'country2'}));

      assert(spy2.calledOnce);
      assert(spy2.calledWithMatch({index: 'project'}));
      assert(spy2.calledWithMatch({type: 'country2'}));

      done();
    });
  });

  xit('should add all documents with configuration successfully', function(done) {
    var data = {
      'projectName': 'project',
      'collectionName': 'country',
      documents: [{
        'rating':'6',
        'name':'Russia'
      }, {
        'rating':'6',
        'name':'Canada'
      }],
    }

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert(spy.calledOnce);
      assert(spy.firstCall.calledWithMatch({projectName: 'project'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'country'}));

      dataService.addDocuments.restore();
      done();
    });
  });

  xit('should add more documents successfully', function(done) {
    var o = {
      'rating':'6',
      'name':'France'
    };

    var data = {
      'projectName': 'project',
      'collectionName': 'country9',
      'batch_size': 4,
      documents: [o, o, o, o, o, o, o, o, o, o],
    }

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 3);
      assert(spy.firstCall.calledWithMatch({projectName: 'project'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'country9'}));
      assert(spy.firstCall.calledWith(sinon.match({collectionName: 'country9'})));
      dataService.addDocuments.restore();
      done();
    });
  });
});
