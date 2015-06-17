var	assert = require('assert');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic mapping', function() {

  var model = require('./../../src/elastic/mapping');

  before(function(done) {
    done();
  });

  describe('index', function() {

    it('should validate index in elastic successfully', function(done) {
      model.addIndex({}, function(err, res) {
        assert.notEqual(err, null);
        err.should.have.property('index');
        done();
      });
    });

    it('should create index in elastic successfully', function(done) {
      var mapping = {
        index: 'project'
      }

      model.addIndex(mapping, function(err, res) {
        assert.equal(err, null);
        done();
      });
    });
  });

  describe('adding data', function() {
    it('should validate adding data to elastic successfully', function(done) {

      model.addMapping({}, function(err, res) {
        assert.notEqual(err, null);
        err.should.have.property('index');
        err.should.have.property('type');
        err.should.have.property('body');
        done();
      });
    });

    it('should create mapping in elastic successfully', function(done) {
      var mapping = {
        index: 'project',
        type: 'city',
        body: {
          properties: {
            message: {type: "string", store: true },
            name: {type: "string", store: true }
          }
        }
      }

      model.addMapping(mapping, function(err, res) {
        assert.equal(err, null);
        mapping.type = 'image';
        model.addMapping(mapping, function(err, res) {
          assert.equal(err, null);
          done();
        });
      });
    });
  });

  describe('get data', function() {
    it('should get elastic mapping successfully', function(done) {

      var mapping = {
        index: 'project',
        type: 'city'
      }

      model.getMappingForType(mapping, function(err, res) {
        assert.equal(err, null);
        res.should.have.property('message');
        res.should.have.property('name');
        res.should.have.not.property('rating');
        done();
      });
    });

    it('should validate get mapping', function(done) {

      var mapping = {
        index: 'project',
        type: 'cityy'
      }
      model.getMappingForType(mapping, function(err, res) {
        should(err).be.ok;
        done();
      });
    });

    it('should update mapping in elastic successfully', function(done) {

      var mapping = {
        index: 'project',
        type: 'city',
        body: {
          properties: {
            message: {type: "string", store: true },
            name: {type: "string", store: true },
            rating: {type: "integer", store: true }
          }
        }
      }

      model.addMapping(mapping, function(err, res) {
        assert.equal(err, null);
        done();
      });
    });

    it('should get updated elastic mapping successfully', function(done) {

      var mapping = {
        index: 'project',
        type: 'city'
      }

      model.getMappingForType(mapping, function(err, res) {
        assert.equal(err, null);
        res.should.have.property('message');
        res.should.have.property('name');
        res.should.have.property('rating');
        done();
      });
    });
  });
});
