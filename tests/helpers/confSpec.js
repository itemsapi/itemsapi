'use strict';

var should = require('should');
var nconf = require('nconf');
var fs = require('fs');

describe('conf tool', function addSuite() {

  var data = {
    collections: {
      song: {},
      movie: {}
    }
  };

  var configHelper = require('./../../src/helpers/config')(data);

  var configFile = './config/test.json';
  if (fs.existsSync(configFile) === false) {
    throw Error('Couldnt find ' + configFile);
  }
  nconf.file('overrides', {file: configFile});



  before(function before(done) {
    done();
  });

  after(function after(done) {
    done();
  });

  it('should return full object', function test(done) {
    nconf.get().should.be.instanceof(Object)
    nconf.get().should.have.property('collections');
    done();
  });

  it('should return collections names', function test(done) {
    var names = configHelper.collectionsNames();
    names.should.be.instanceof(Array).and.have.lengthOf(2);
    should.deepEqual(names, ['song', 'movie'])
    done();
  });

});
