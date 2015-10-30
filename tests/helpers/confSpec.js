'use strict';

var should = require('should');
var nconf = require('nconf');
var fs = require('fs');

describe('conf tool', function addSuite() {

  var configFile = './config/test.json';
  if (fs.existsSync(configFile) === false) {
    throw Error('Couldnt find ' + configFile);
  }
  nconf.file('overrides', {file: configFile});

  var data = {collections: nconf.get('collections')}
  var configHelper = require('./../../src/helpers/config')(data);

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
    should.deepEqual(names, ['movie', 'city'])
    done();
  });

  it('should return processed metadata', function test(done) {
    var metadata = configHelper.getMetadata('movie');
    metadata.should.have.property('table');
    metadata.table.should.have.property('fields');
    var fields = metadata.table.fields;
    //console.log(fields);
    fields.should.have.property('name');
    //fields.name.should.have.property('type', 'string');
    done();
  });
});
