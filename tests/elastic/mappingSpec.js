var	assert = require('assert');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var Promise = require('bluebird');

setup.makeSuite('elastic mapping', function() {

  var model = Promise.promisifyAll(require('./../../src/elastic/mapping'));

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

    it('should not exists', function(done) {
      model.existsIndex({
        index: 'test'
      }, function(err, res) {
        should.not.exist(err, null);
        should.equal(false, res);
        done();
      });
    });

    it('should create index in elastic successfully', function(done) {
      model.addIndex({
        index: 'test'
      }, function(err, res) {
        assert.equal(err, null);
        done();
      });
    });

    it('should exists', function(done) {
      model.existsIndex({
        index: 'test'
      }, function(err, res) {
        should.not.exist(err, null);
        should.equal(true, res);
        done();
      });
    });

    it('should delete index in elastic successfully', function(done) {
      model.deleteIndex({
        index: 'test'
      }, function(err, res) {
        should.not.exist(err, null);
        res.should.have.property('acknowledged', true);
        done();
      });
    });

    it('should not exists', function(done) {
      model.existsIndex({
        index: 'test'
      }, function(err, res) {
        should.not.exist(err, null);
        should.equal(false, res);
        done();
      });
    });

    it('should create index in elastic successfully', function(done) {
      model.addIndex({
        index: 'test'
      }, function(err, res) {
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
        index: 'test',
        type: 'city',
        body: {
          properties: {
            message: {type: "string", store: true },
            name: {type: "string", store: true }
          }
        }
      }

      model.addMapping(mapping, function(err, res) {
        should.not.exist(err, null);
        mapping.type = 'image';
        model.addMapping(mapping, function(err, res) {
          should.not.exist(err, null);
          done();
        });
      });
    });
  });

  describe('get data', function() {
    it('should get elastic mapping successfully', function(done) {
      model.getMappingForType({
        index: 'test',
        type: 'city'
      }, function(err, res) {
        assert.equal(err, null);
        res.should.have.property('message');
        res.should.have.property('name');
        res.should.have.not.property('rating');
        done();
      });
    });

    it('should validate get mapping', function(done) {
      model.getMappingForType({
        index: 'test',
        type: 'cityy'
      }, function(err, res) {
        should(err).be.ok;
        done();
      });
    });

    it('should update mapping in elastic successfully', function(done) {
      model.addMapping({
        index: 'test',
        type: 'city',
        body: {
          properties: {
            message: {type: "string", store: true },
            name: {type: "string", store: true },
            rating: {type: "integer", store: true }
          }
        }
      }, function(err, res) {
        assert.equal(err, null);
        done();
      });
    });

    it('should get updated elastic mapping successfully', function(done) {
      model.getMappingForType({
        index: 'test',
        type: 'city'
      }, function(err, res) {
        assert.equal(err, null);
        res.should.have.property('message');
        res.should.have.property('name');
        res.should.have.property('rating');
        done();
      });
    });

    it('should check if mapping exists successfully', function(done) {
      model.existsMappingAsync({
        index: 'test',
        type: 'city'
      }).then(function (res) {
        should.equal(res, true);
        done();
      })
    });

    it('should delete mapping successfully', function(done) {
      model.deleteMappingAsync({
        index: 'test',
        type: 'city',
        masterTimeout: 1
      }).then(function (res) {
        res.should.have.property('acknowledged', true);
        done();
      })
    });

    it('should check if mapping exists successfully', function(done) {
      model.existsMappingAsync({
        index: 'test',
        type: 'city'
      }).then(function (res) {
        should.equal(res, false);
        done();
      })
    });

    it('should delete mapping successfully twice', function(done) {
      model.deleteMappingAsync({
        index: 'test',
        type: 'city'
      }).then(function (res) {
        res.should.have.property('acknowledged', true);
        res.should.have.property('notExisted', true);
        done();
      })
    });

    it('should not find mapping', function(done) {
      model.getMappingForType({
        index: 'test',
        type: 'city'
      }, function(err, res) {
        should.exist(err);
        should.not.exist(res);
        done();
      });
    });


  });
});
