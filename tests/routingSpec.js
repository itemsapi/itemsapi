'use strict';
var request = require('supertest');
var should = require('should');
var setup = require(__dirname + '/mocks/setup');

setup.makeSuite('routing', function addSuite() {

    var projectService = require('./../src/services/project');
    before(function(done) {
        projectService.ensureCollectionAsync({
            projectName: 'test',
            collectionName: 'movie'
        }).delay(30).then(function(res) {
            done();
        });
    });

    after(function after(done) {
        done();
    });

    it('should exist', function test(done) {
        should.exist(setup.getServer());
        done();
    });

    it('should be able to post movie', function test(done) {
        request(setup.getServer())
        .post('/api/v1/items/movie')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    it('should be able to get movie by id', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/movie/5')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    it('should be able to get city by id', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/city/5')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    it('should be able to update movie by id', function test(done) {
        request(setup.getServer())
        .put('/api/v1/items/movie/5')
        .send({})
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    it('should be able to get movies', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/movie')
        .end(function afterRequest(err, res) {
            //res.status.should.not.equal(404);
            res.status.should.equal(200);
            done();
        });
    });

    it.skip('should be able to get similar movies', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/movie/5/similar')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    it('should be able to make autocomplete', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/movie/autocomplete')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });

    xit('should be able to find nearest items', function test(done) {
        request(setup.getServer())
        .get('/api/v1/items/movie/near/address/52.512973,13.452529')
        .end(function afterRequest(err, res) {
            res.status.should.not.equal(404);
            done();
        });
    });
});
