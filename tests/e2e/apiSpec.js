'use strict';
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('supertest'));
var should = require('should');
var setup = require(__dirname + '/../mocks/setup');

setup.makeSuite('creating items', function addSuite() {

  before(function before(done) {
    done();
  });

  after(function after(done) {
    done();
  });

  var id;

  it('should be able to post movie', function test(done) {
    request(setup.getServer())
      .post('/api/v1/movie')
      .send({
        body: {
          name: 'fight club',
          key: 'value'
        }
      })
      .end(function afterRequest(err, res) {
        should.exists(res.body.id);
        id = res.body.id;
        should.exists(res.body.project);
        should.exists(res.body.collection);
        res.status.should.equal(200);
        done();
      });
  });

  it('should be able to get movie by id', function test(done) {
    request(setup.getServer())
      .get('/api/v1/movie/' + id)
      .end(function afterRequest(err, res) {
        //console.log(res.body);
        res.status.should.equal(200);
        res.body.body.name.should.equal('fight club');
        res.body.body.key.should.equal('value');
        done();
      });
  });

  // doesnt work until mapping is not loaded
  xit('should be able to get movie by key val', function test(done) {
    request(setup.getServer())
      //.get('/api/v1/items/movie/id/' + id + '/one')
      //.get('/api/v1/items/movie/name/fight club/one')
      .get('/api/v1/items/movie/key/value/one')
      .end(function afterRequest(err, res) {
        res.status.should.equal(200);
        //res.body.body.name.should.equal('fight club');
        done();
      });
  });

  // temporary turned off
  it('should be able to post many movies', function test(done) {
    request(setup.getServer())
      .post('/api/v1/movie')
      .send([{name: 'god father 1'}, {name: 'god father 2'}])
      .end(function afterRequest(err, res) {
        res.body.ids.should.be.lengthOf(2);
        //should.exists(res.body.project);
        should.exists(res.body.collection);
        res.status.should.equal(200);
        done();
      });
  });

  it('should fail to post movie', function test(done) {
    request(setup.getServer())
      .post('/api/v1/movie')
      .send({
      })
      .end(function afterRequest(err, res) {
        res.status.should.equal(400);
        done();
      });
  });
});
