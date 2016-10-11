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

    xit('should not exists', function(done) {
      model.existsIndex({
        index: 'test'
      }, function(err, res) {
        should.not.exist(err, null);
        should.equal(false, res);
        done();
      });
    });

    xit('should create index in elastic successfully', function(done) {
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

    it('adds settings', function(done) {
      model.addSettingsAsync({
        index: 'test2',
        body: {
          index: {
            analysis: {
              analyzer: {
                analyzer_keyword: {
                  tokenizer: "keyword",
                  filter: "lowercase"
                }
              }
            }
          }
        }
      }).then(function(res) {
        model.getSettingsAsync({
          index: 'test2'
        }).then(function(res) {
          res.should.have.property('test2')
          //console.log(JSON.stringify(res));
          res.test2.settings.index.should.have.property('creation_date')
          res.test2.settings.index.should.have.property('uuid')
          res.test2.settings.index.analysis.analyzer.should.have.property('analyzer_keyword')
          done();
        })
      })
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

    it('should update mapping in elastic second time successfully', function(done) {
      model.updateMapping({
        index: 'test',
        type: 'city',
        body: {
          properties: {
            message: {type: "string", store: false },
            name: {type: "string", store: true },
            geo: {type: "geo_point", store: true },
            rating: {type: "integer", store: true }
          }
        }
      }, function(err, res) {
        console.log(err);
        console.log(res);
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
        console.log(res);
        res.should.have.property('message');
        res.should.have.property('name');
        res.should.have.property('rating');
        res.should.have.property('geo');
        done();
      });
    });

    it('should get original elastic mapping', function(done) {
      model.getMappingAsync({
        index: 'test',
        type: 'city'
      }).then(function(res) {
        //console.log(JSON.stringify(res, null, 4));
        res.should.have.property('test');
        res.test.should.have.property('mappings');
        res.test.mappings.should.have.property('city');
        res.test.mappings.city.properties.should.have.property('name');
        done();
      });
    });

    it('should get original elastic mapping properties', function(done) {
      model.getOneMappingAsync({
        index: 'test',
        type: 'city'
      }).then(function(res) {
        //console.log(JSON.stringify(res, null, 4));
        res.should.have.property('index');
        res.should.have.property('type');
        res.properties.should.have.property('message');
        res.properties.should.have.property('name');
        res.properties.should.have.property('rating');
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

    it('should delete not existent mapping successfully', function(done) {
      model.deleteMappingAsync({
        index: 'test',
        type: 'city_not_exists'
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
