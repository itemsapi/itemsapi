var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');
var sinon = require('sinon');

setup.makeSuite('elastic data', function() {

  var redis = require('./../../src/libs/redis');
  var keymapper = require('./../../src/libs/slugs');

  var is_skipped = false;
  var client = require('redis').createClient();
  client.on('error', function (err) {
    is_skipped = true;
  });

  before(function(done) {
    done();
  });

  describe('redis operations', function() {
    before(function(done) {
      if (is_skipped) {
        this.skip();
      }
      done();
    });
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

    before(function(done) {
      if (is_skipped) {
        this.skip();
      }
      done();
    });

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
        keymapper.getSlugAsync('movie', 'name', 'the-butterfly-effect', ['name'])
        .then(function(res){
          res.should.be.equal('The Butterfly Effect')
          done();
        });
      });
    });
    it('should save string key for one document', function(done) {
      var document = {
        name: 'Fight Club',
        actors: ['Edward Norton', 'Brad Pitt']
      }
      var spy = sinon.spy(redis, 'setKeyValAsync');
      keymapper.setSlugsAsync('movie', ['name', 'actors', 'fake'], document)
      .then(function(res){
        assert.equal(spy.callCount, 3);
        redis.getKeyValAsync('movie_actors_brad-pitt').then(function(res){
          res.should.be.equal('Brad Pitt')
          spy.restore();
          done();
        });
      });
    });

    it('should not save anything', function(done) {
      var document = {
        name: 'Fight Club',
        actors: ['Edward Norton', 'Brad Pitt']
      }
      var spy = sinon.spy(redis, 'setKeyValAsync');
      keymapper.setSlugsAsync('movie', [], document)
      .then(function(res){
        assert.equal(spy.callCount, 0);
        spy.restore();
        done();
      });
    });

    it('should not save anything2', function(done) {
      var spy = sinon.spy(redis, 'setKeyValAsync');
      keymapper.setSlugsAsync('movie', [], [])
      .then(function(res){
        assert.equal(spy.callCount, 0);
        spy.restore();
        done();
      });
    });

    it('should not find anything', function(done) {
      var document = {
        name: 'Fight Club',
        actors: ['Edward Norton', 'Brad Pitt']
      }
      var spy = sinon.spy(redis, 'getKeyValAsync');
      keymapper.getSlugAsync('movie', 'name', 'the-butterfly-effect', [])
      .then(function(res){
        assert.equal(spy.callCount, 0);
        should(res).be.null
        spy.restore();
        done();
      });
    });
  });
  describe('get slug info from user input', function() {
    it('should get info', function(done) {
      var slug = keymapper.getSlugInfo({
        key: 'actors',
        val: 'brad-pitt'
      })
      slug.should.have.property('key', 'actors')
      slug.should.have.property('val', 'brad-pitt')

      var slug = keymapper.getSlugInfo({
        aggs: { actors: [ 'brad-pitt' ] }
      })
      slug.should.have.property('key', 'actors')
      slug.should.have.property('val', 'brad-pitt')

      var slug = keymapper.getSlugInfo({
        aggs: { actors: 'brad-pitt'}
      })
      slug.should.have.property('key', 'actors')
      slug.should.have.property('val', 'brad-pitt')

      var slug = keymapper.getSlugInfo({
        aggs: { actors: ['Brad Pitt', 'Angelina Jolie']}
      })
      should(slug).be.null

      var slug = keymapper.getSlugInfo({
        aggs: { actors: ['Brad Pitt'], tags: ['Drama']}
      })
      should(slug).be.null

      var slug = keymapper.getSlugInfo({
        aggs: {}
      })
      should(slug).be.null

      var slug = keymapper.getSlugInfo()
      should(slug).be.null
      done();
    });
  })

});
