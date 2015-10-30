var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var sinon = require('sinon');
var setup = require('./../mocks/setup');

setup.makeSuite('import', function() {

  var importService = require('./../../src/services/import');
  var dataService = require('./../../src/services/data');

  it('should import few movies', function(done) {

    var spy = sinon.spy(dataService, 'addAllDocuments');
    importService.import({
      projectName: 'test',
      collectionName: 'movie',
      body: [{
        rating: '9.2',
        title: 'The Shawshank Redemption',
        year: '1994'
      }, {
        rating: '9.2',
        title: 'The Godfather',
        year: '1972'
      }]
    }, function(err, res) {
      assert.equal(err, null);
      assert.notEqual(res, null);
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({projectName: 'test'}));
      assert(spy.calledWithMatch({collectionName: 'movie'}));
      done();
    });
  });


});
