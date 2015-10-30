var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic crud', function() {

  var mapping = require('./../../src/elastic/mapping');
  var dataModel = require('./../../src/elastic/data');

  before(function(done) {
    done();
  });


  it('should add document to elastic successfully', function(done) {
    var data = {
      index: 'test',
      type: 'country',
      id: 100,
      body: {
        name: 'Germany',
        lang: 'german',
        rating: 5
      }
    };

    dataModel.addDocument(data, function(err, res) {
      should.not.exist(err);
      should.exist(res._id);
      res.should.have.property('_id', '100');
      should.exist(res._type);
      should.exist(res._index);
      done();
    });
  });

  it('should find document', function(done) {
    dataModel.getDocument({
      index: 'test',
      type: 'country',
      id: '100'
    }, function(err, res) {
      should.not.exist(err);
      res._source.should.have.property('rating', 5);
      res._source.should.have.property('lang', 'german');
      done();
    });
  });

  it('should partially update document', function(done) {
    dataModel.updateDocument({
      index: 'test',
      type: 'country',
      id: '100',
      body: {rating: 4}
    }, function(err, res) {
      should.not.exist(err);
      res.should.have.property('_id', '100');
      res.should.have.property('_type', 'country');
      res.should.have.property('_index', 'test');
      res.should.have.property('_version', 2);
      done();
    });
  });

  it('should find updated document', function(done) {
    dataModel.getDocument({
      index: 'test',
      type: 'country',
      id: '100'
    }, function(err, res) {
      should.not.exist(err);
      res.should.have.property('_id', '100');
      res.should.have.property('_version', 2);
      res.should.have.property('found', true);
      res._source.should.have.property('rating', 4);
      res._source.should.have.property('lang', 'german');
      done();
    });
  });

  it('should delete document', function(done) {
    dataModel.deleteDocument({
      index: 'test',
      type: 'country',
      id: '100'
    }, function(err, res) {
      should.not.exist(err);
      res.should.have.property('_id', '100');
      res.should.have.property('_version', 3);
      res.should.have.property('found', true);
      done();
    });
  });

  it('should not find updated document after delete', function(done) {
    dataModel.getDocument({
      index: 'test',
      type: 'country',
      id: '100'
    }, function(err, res) {
      should.exist(err);
      should.not.exist(res);
      done();
    });
  });
});
