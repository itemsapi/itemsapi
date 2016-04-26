var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('elastic data', function() {

  var redis = require('./../../src/libs/redis');
  var keymapper = require('./../../src/libs/slugs');

  before(function(done) {
    done();
  });

  describe('redis operations', function() {
    it('should save json key', function(done) {
      redis.setKeyValAsync('abcd', {a: 'b'}).then(function(res){
        redis.getKeyValAsync('abcd').then(function(res){
          res.should.have.property('a', 'b')
          done();
        });
      });
    });

    it('should save number key', function(done) {
      redis.setKeyValAsync('abcd', 100).then(function(res){
        redis.getKeyValAsync('abcd').then(function(res){
          res.should.be.equal(100)
          done();
        });
      });
    });

    it('should save string key', function(done) {
      redis.setKeyValAsync('abcd', 'customvalue').then(function(res){
        redis.getKeyValAsync('abcd').then(function(res){
          res.should.be.equal('customvalue')
          done();
        });
      });
    });
  });

  describe('keymapper operations', function() {
    it('should save string key for multi documents', function(done) {
      var documents = [{
        name: 'Matrix Reloaded',
        actors: ['Keanu Reeves', 'Carrie-Anne Moss']
      }, {
        name: 'The Butterfly Effect',
        actors: 'Ashton Kutcher',
        tags: ['a', 'b']
      }, {
        name: 'The Butterfly Effect',
        actors: ''
      }]

      keymapper.setSlugsAsync('movie', ['name', 'actors', 'fake'], documents)
      .then(function(res){
          redis.getKeyValAsync('movie_actors_keanu-reeves').then(function(res){
            res.should.be.equal('Keanu Reeves')
            keymapper.getSlugAsync('movie', 'name', 'the-butterfly-effect').then(function(res){
              res.should.be.equal('The Butterfly Effect')
              done();
            });
          });
      });
    });
    it('should save string key for one document', function(done) {
      var document = {
        name: 'Fight Club',
        actors: ['Edward Norton', 'Brad Pitt']
      }

      keymapper.setSlugsAsync('movie', ['name', 'actors', 'fake'], document)
      .then(function(res){
          redis.getKeyValAsync('movie_actors_brad-pitt').then(function(res){
            res.should.be.equal('Brad Pitt')
            done();
          });
      });
    });
  });
});
