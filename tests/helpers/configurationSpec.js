'use strict';

var should = require('should');
var assert = require('assert');
//var helper = require('../index');
var helper = require('./../../src/helpers/configuration');

describe('configuration', function() {

  it('should generate conf', function test(done) {
    var data = [{
      name: 'Godfather',
      name2: 'Godfather, godfather the movie',
      tags: ['Drama', 'Crime fiction'],
      tags2: 'Drama, Crime, Fiction',
      rating: 10,
      rating2: 5.6,
      flag: false,
      image: 'path/path.jpg',
      date: '06/22/2015',
      //date2: '06-06-2015',
      location: '81.36, 16.40',
      location2: '81.36   ,  16.40',
      location3: {
        latitude: '81.36',
        longitude: '16.40'
      }
    }]

    var conf = helper.generateConfiguration(data);
    var schema = conf.schema;
    conf.schema.should.have.property('name');
    schema.name.should.have.property('type', 'string')
    schema.name.should.have.property('type', 'string')
    schema.image.should.have.property('display', 'image')
    schema.tags.should.have.property('type', 'string')
    schema.tags.should.have.property('display', 'array')
    schema.tags2.should.have.property('type', 'string')
    schema.tags2.should.have.property('display', 'array')
    schema.date.should.have.property('type', 'date')
    //schema.date2.should.have.property('type', 'date')
    schema.rating.should.have.property('type', 'integer')
    schema.rating2.should.have.property('type', 'float')
    schema.location.should.have.property('type', 'geo_point')
    schema.location2.should.have.property('type', 'geo_point')
    schema.location3.should.have.property('type', 'geo_point')
    schema.flag.should.have.property('type', 'boolean')

    var aggregations = conf.aggregations;
    aggregations.should.have.property('rating');
    schema.should.have.property('name');
    schema.should.have.property('location');
    //console.log(aggregations);
    var sortings = conf.sortings;
    sortings.should.not.be.instanceOf(Array)
    done();
  });
});
