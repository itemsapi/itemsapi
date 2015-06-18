var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var database = require('./../mocks/database');
var dataService = require('./../../src/services/data');
var projectService = require('./../../src/services/project');
var elasticData = require('./../../src/elastic/data');
var model = require('./../../src/models/table');
var db = null;
var sinon = require('sinon');
var setup = require('./../mocks/setup');

setup.makeSuite('add data service', function() {

  before(function(done) {
    var data = {
      project_name: 'project',
      table_name: 'country',
      properties: {
        name: {type: "string", store: true },
        rating: {type: "integer", store: true }
      }
    }

    projectService.addTogether(data, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  it('should add data to project successfully', function(done) {
    var data = {
      project_name: 'project',
      table_name: 'country',
      data: {
        name: "Germany",
        lang: "german",
        rating: 5
      }
    };

    var spy = sinon.spy(elasticData, "addDocument");
    dataService.addDocument(data, function(err, res) {
      assert.equal(err, null);
      res.should.be.ok;
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({index: 'project'}));
      assert(spy.calledWithMatch({type: 'country'}));
      done();
    });
  });

  it('should add documents (batch) successfully', function(done) {
    var o = {
      "rating":"6",
      "name":"France"
    };
    var data = {
      "project_name": "project",
      "table_name": "country2",
      data: [o,o,o,o],
    }

    var spy = sinon.spy(model, "add");
    var spy2 = sinon.spy(elasticData, "addDocuments");
    dataService.addDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(res.items.length, 4);
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({project_name: 'project'}));
      assert(spy.calledWithMatch({table_name: 'country2'}));

      assert(spy2.calledOnce);
      assert(spy2.calledWithMatch({index: 'project'}));
      assert(spy2.calledWithMatch({type: 'country2'}));

      done();
    });
  });

  it('should add all documents with configuration successfully', function(done) {
    var data = {
      "project_name": "project",
      "table_name": "country",
      documents: [{
        "rating":"6",
        "name":"Russia"
      }, {
        "rating":"6",
        "name":"Canada"
      }],
    }

    var spy = sinon.spy(dataService, "addDocuments");
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert(spy.calledOnce);
      assert(spy.firstCall.calledWithMatch({project_name: 'project'}));
      assert(spy.firstCall.calledWithMatch({table_name: 'country'}));

      dataService.addDocuments.restore();
      done();
    });
  });

  it('should add more documents successfully', function(done) {
    var o = {
      "rating":"6",
      "name":"France"
    };

    var data = {
      "project_name": "project",
      "table_name": "country9",
      "batch_size": 4,
      documents: [o, o, o, o, o, o, o, o, o, o],
    }

    var spy = sinon.spy(dataService, "addDocuments");
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 3);
      assert(spy.firstCall.calledWithMatch({project_name: 'project'}));
      assert(spy.firstCall.calledWithMatch({table_name: 'country9'}));
      assert(spy.firstCall.calledWith(sinon.match({table_name: 'country9'})));
      dataService.addDocuments.restore();
      done();
    });
  });
});
