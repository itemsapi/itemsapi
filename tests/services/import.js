var	assert = require('assert');
var async = require('async');
var winston = require('winston');
var should = require('should');
var importService = require('./../../src/services/import');
var sinon = require('sinon');
var setup = require('./../mocks/setup');

setup.makeSuite('import', function() {

  before(function(done) {
    done();
  });

  it('should import few movies', function(done) {

    var data = {
      documents: [{
        'rating':'9.2',
        'title':'The Shawshank Redemption',
        'year':'1994'
      }, {
        'rating':'9.2',
        'title':'The Godfather',
        'year':'1972'
      }],
      collectionName: 'movie'
    }


    //var spy = sinon.spy(dataService, "addAllDocuments");
    importService.import(data, function(err, res) {
      assert.equal(err, null);
      //assert.notEqual(res, null);
      //assert(spy.calledOnce);
      //assert(spy.calledWithMatch({project_name: 'project'}));
      //assert(spy.calledWithMatch({table_name: 'movies'}));
      //done();
    });
  });


});
