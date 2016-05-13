'use strict';

var should = require('should');
var setup = require('./../mocks/setup');
var assert = require('assert');

setup.makeSuite('geo helper', function() {

  var dataHelper = require('./../../src/helpers/data');

  describe('array field', function() {
    // in the future array field goes into extraSchema
    it('should convert string to array', function test(done) {

      var collection = {
        schema: {
          tags: {type: 'string', display: 'array'}
        }
      }

      var doc = [{
        tags: 'tag1, tag2',
        name: 'name'
      }, {
        tags: 'a',
        name: 'name'
      }]

      var result = dataHelper.inputMapper(doc, collection);
      result[0].should.have.property('tags', ['tag1', 'tag2']);

      done();
    });

    it('should ignores converting array to array', function test(done) {
      var collection = {
        schema: {
          tags: {type: 'string', display: 'array'}
        }
      }

      var doc = [{
        tags: ['tag1', 'tag2'],
        name: 'name'
      }, {
        tags: ['tag1', 'tag2'],
        name: 'name'
      }]

      var result = dataHelper.inputMapper(doc, collection);
      result[0].should.have.property('tags', ['tag1', 'tag2']);
      done();
    });

    it('process only one doc', function test(done) {
      var collection = {
        schema: {
          tags: {type: 'string', display: 'array'}
        }
      }

      var doc = {
        tags: 'tag1, tag2',
        name: 'name'
      }

      var result = dataHelper.inputMapper(doc, collection);
      result.should.have.property('tags', ['tag1', 'tag2']);
      result.should.have.property('name', 'name');
      /*
      var result = dataHelper.inputMapper(doc, collection, {fields: 'schema'});
      result.should.have.property('tags', ['tag1', 'tag2']);
      result.should.not.have.property('name');

      var result = dataHelper.inputMapper(doc, collection, {fields: ['name']});
      result.should.not.have.property('tags');
      result.should.have.property('name');*/
      done();
    });

  })

  describe('enabled field', function() {
    it('enabled field default true', function test(done) {
      var collection = {
        extraSchema: {
          enabled: {}
        }
      }

      var doc = {
        name: 'name'
      }

      var result = dataHelper.inputMapper(doc, collection);
      result.should.have.property('name', 'name');
      result.should.have.property('enabled', true);
      done();
    });

    it('enabled field set false', function test(done) {
      var collection = {
        extraSchema: {
          enabled: {}
        }
      }

      var doc = {
        name: 'name',
        enabled: false
      }

      var result = dataHelper.inputMapper(doc, collection);
      result.should.have.property('name', 'name');
      result.should.have.property('enabled', false);
      done();
    });

    it('enabled field undefined', function test(done) {
      var collection = {
      }

      var doc = {
        name: 'name'
      }

      var result = dataHelper.inputMapper(doc, collection);
      result.should.have.property('name', 'name');
      result.should.not.have.property('enabled');
      done();
    });

    it('enabled field default false', function test(done) {
      var collection = {
        extraSchema: {
          enabled: {
            default: false
          }
        }
      }

      var doc = {
        name: 'name'
      }

      var result = dataHelper.inputMapper(doc, collection);
      result.should.have.property('name', 'name');
      result.should.have.property('enabled', false);
      done();
    });
  })
});
