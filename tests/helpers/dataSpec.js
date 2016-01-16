'use strict';

var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('geo helper', function() {

  var dataHelper = require('./../../src/helpers/data');

  it('should convert string to array', function test(done) {

    var schema = {
      tags: {type: 'string', display: 'array'}
    }

    var doc = [{
      tags: 'tag1, tag2',
      name: 'name'
    }, {
      tags: 'a',
      name: 'name'
    }]

    var result = dataHelper.inputMapper(doc, schema);
    result[0].should.have.property('tags', ['tag1', 'tag2']);

    done();
  });

  it('should ignores converting array to array', function test(done) {
    var schema = {
      tags: {type: 'string', display: 'array'}
    }

    var doc = [{
      tags: ['tag1', 'tag2'],
      name: 'name'
    }, {
      tags: ['tag1', 'tag2'],
      name: 'name'
    }]

    var result = dataHelper.inputMapper(doc, schema);
    result[0].should.have.property('tags', ['tag1', 'tag2']);
    done();
  });

  it('process only one doc', function test(done) {
    var schema = {
      tags: {type: 'string', display: 'array'}
    }

    var doc = {
      tags: 'tag1, tag2',
      name: 'name'
    }

    var result = dataHelper.inputMapper(doc, schema);
    result.should.have.property('tags', ['tag1', 'tag2']);
    result.should.have.property('name', 'name');

    var result = dataHelper.inputMapper(doc, schema, {fields: 'schema'});
    result.should.have.property('tags', ['tag1', 'tag2']);
    result.should.not.have.property('name');

    var result = dataHelper.inputMapper(doc, schema, {fields: ['name']});
    result.should.not.have.property('tags');
    result.should.have.property('name');
    done();
  });
});
