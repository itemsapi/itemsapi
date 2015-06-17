var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic data', function() {

  var mapping = require('./../../src/elastic/mapping');
  var dataModel = require('./../../src/elastic/data');

  before(function(done) {
    var data = {
      projectName: 'project',
      tableName: 'country',
      properties: {
        name: {type: "string", store: true },
        rating: {type: "integer", store: true }
      }
    }

    done();
  });

  describe('validation', function() {
    it('validate missing fields', function(done) {

      dataModel.addDocument({}, function(err, res) {
        assert.notEqual(err, null);
        err.should.have.property('index');
        err.should.have.property('body');
        err.should.have.property('type');
        done();
      });

    });

  });

  describe('add data', function() {

    it('should add document to elastic successfully', function(done) {
      var data = {
        index: 'project',
        type: 'country',
        id: 1,
        body: {
          name: "Germany",
          lang: "german",
          rating: 5
        }
      };

      dataModel.addDocument(data, function(err, res) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('add multiple data', function() {

    it('should add multiple document to elastic successfully', function(done) {
      var docs = [{
        data: {
          name: 'anglia'
        }
      }, {
        data: {
          name: 'anglia6'
        }
      }];

      var data = {
        index: 'project',
        type: 'country',
        body: docs
      };

      dataModel.addDocuments(data, function(err, res) {
        assert.equal(err, null);
        res.items.should.be.an.instanceOf(Array).with.lengthOf(2);
        res.should.have.property('errors', false);
        done();
      });
    });
  });
});
