var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic data', function() {

  var mapping = require('./../../src/elastic/mapping');
  var dataModel = require('./../../src/elastic/data');
  var searchModel = require('./../../src/elastic/search');

  before(function(done) {
    dataModel.addDocument({
      index: 'test',
      type: 'movie',
      id: 1000,
      refresh: true,
      body: {
        name: "Fight club",
        permalink: "fight-club",
        tags: ["drama", "psychology"],
        actors: ["Edward Norton", "Brad Pitt"]
      }
    }, function(err, res) {
      res.should.have.property('_index', 'test');
      res.should.have.property('_type', 'movie');
      done();
    })
  });

  describe('find items', function() {
    it('should find item by permalink', function(done) {
      searchModel.findOneAsync({
        type: 'movie',
        index: 'test',
        key: 'permalink',
        val: 'fight-club'
      }).then(function(res){
        res.should.have.property('permalink', 'fight-club');
        done();
      });
    });

    it('should find item by one tag', function(done) {
      searchModel.findOneAsync({
        type: 'movie',
        index: 'test',
        key: 'tags',
        val: 'drama'
      }).then(function(res){
        res.should.have.property('permalink', 'fight-club');
        done();
      });
    });

    it('should find item by actor', function(done) {
      searchModel.findOneAsync({
        type: 'movie',
        index: 'test',
        key: 'actors',
        //val: 'brad pitt'
        val: 'Brad Pitt'
        //val: 'pitt'
      }).then(function(res){
        res.should.have.property('permalink', 'fight-club');
        done();
      });
    });

    xit('should find item by slug actor', function(done) {
      searchModel.findOneAsync({
        type: 'movie',
        index: 'test',
        key: 'actors',
        val: 'Brad pitt'
      }).then(function(res){
        res.should.have.property('permalink', 'fight-club');
        done();
      });
    });

    it('should not find item by not existent tag', function(done) {
      searchModel.findOneAsync({
        type: 'movie',
        index: 'test',
        key: 'tags',
        val: 'comedy'
      }).then(function(res){
        should(res).equal(null);
        done();
      });
    });
  });
});
