var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');
var request = require('supertest');
var _ = require('underscore');

setup.makeSuite('item crud request', function() {
  var data = {id: 100, rating: 5, name: 'Godfather'};

  var projectService = require('./../../src/services/project');
  var collectionService = require('./../../src/services/collection');
  var documentElastic = require('./../../src/elastic/data');
  var elastic = require('./../../src/connections/elastic').getElastic();

  before(function(done) {
    projectService.ensureCollectionAsync({
      projectName: 'test',
      collectionName: 'movie'
    }).then(function(res) {
      done();
    });
  });

  it('should make successfull post request', function(done) {
    var spy = sinon.spy(documentElastic, 'addDocumentAsync');
    request(setup.getServer())
      .post('/api/v1/movie')
      .send(data)
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'test'}));
        documentElastic.addDocumentAsync.restore();
        done();
      });
  });

  it('should make successfull get request', function(done) {
    var spy = sinon.spy(documentElastic, 'getDocumentAsync');
    request(setup.getServer())
      .get('/api/v1/movie/100')
      .end(function afterRequest(err, res) {
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'test'}));
        res.should.have.property('status', 200);
        res.body.should.have.property('rating', 5);
        res.body.should.have.property('name', 'Godfather');
        documentElastic.getDocumentAsync.restore();
        done();
      });
  });

  // should take care about not existent project and validation
  xit('should make unsuccessfull get request to another project', function(done) {
    var spy = sinon.spy(documentElastic, 'getDocumentAsync');
    request(setup.getServer())
      .get('/api/v1/movie/100?project=notexistent')
      .end(function afterRequest(err, res) {
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'notexistent'}));
        res.should.have.property('status', 404);
        documentElastic.getDocumentAsync.restore();
        done();
      });
  });

  it('should make successfull get (find) request', function(done) {
    var spy = sinon.spy(elastic, 'search');
    request(setup.getServer())
      .get('/api/v1/movie')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'test'}));
        elastic.search.restore();
        done();
      });
  });

  it('should make successfull update request', function(done) {
    var spy = sinon.spy(documentElastic, 'updateDocumentAsync');
    request(setup.getServer())
      .put('/api/v1/movie/100')
      .send({rating: 6})
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'test'}));
        documentElastic.updateDocumentAsync.restore();
        done();
      });
  });

  it('should make successfull get request', function(done) {
    request(setup.getServer())
      .get('/api/v1/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        res.body.should.have.property('rating', 6);
        res.body.should.have.property('name', 'Godfather');
        done();
      });
  });


  it('should make successfull delete request', function(done) {
    request(setup.getServer())
      .delete('/api/v1/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 200);
        done();
      });
  });

  it('should get not found response', function(done) {
    request(setup.getServer())
      .get('/api/v1/movie/100')
      .end(function afterRequest(err, res) {
        res.should.have.property('status', 400);
        done();
      });
  });

  it('should make successfull multi data post request', function(done) {
    var spy = sinon.spy(documentElastic, 'addDocumentsAsync');
    request(setup.getServer())
      .post('/api/v1/movie')
      .send(_.map([data, data, data], function(val) {
        return _.omit(val, 'id');
      }))
      .end(function afterRequest(err, res) {
        res.body.should.have.property('errors', false);
        res.body.should.have.property('ids').have.lengthOf(3);
        res.should.have.property('status', 200);
        assert(spy.calledOnce);
        assert(spy.calledWithMatch({type: 'movie'}));
        assert(spy.calledWithMatch({index: 'test'}));
        documentElastic.addDocumentsAsync.restore();
        done();
      });
  });
});
