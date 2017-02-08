'use strict';

var should = require('should');
var assert = require('assert');
//var helper = require('../index');
var helper = require('./../../src/helpers/configuration');
var _ = require('lodash')

describe('configuration', function() {

  it('should detect field type', function test(done) {
    var type = helper.detectFieldType('a', ['a', 'a,b,c,d', 'c']);
    type.should.be.equal('array')

    var type = helper.detectFieldType('a', ['a', 'a', 'c']);
    type.should.be.equal('repeatable_string')

    var type = helper.detectFieldType('a', ['a', 'b', 'c']);
    type.should.be.equal('string')

    var type = helper.detectFieldType('a', ['a', 'b', 'c', '', '', '']);
    type.should.be.equal('string')

    //var type = helper.detectFieldType('$90 million', ['$90 million','$65,000,000', '£1 billion']);
    //type.should.be.equal('string')

    var type = helper.detectFieldType('81.36, 16.40');
    type.should.be.equal('geo')

    var type = helper.detectFieldType('size=1304,1385&ok=true');
    // should not be but ok..
    type.should.be.equal('array')

    // should be detected as integer finally
    var type = helper.detectFieldType('8.29');
    type.should.be.equal('string')

    var type = helper.detectFieldType('8888');
    type.should.be.equal('string')

    var type = helper.detectFieldType(81.36);
    type.should.be.equal('float')

    var type = helper.detectFieldType(false);
    type.should.be.equal('boolean')

    var type = helper.detectFieldType('06/22/2015');
    type.should.be.equal('date')

    done();
  });

  it('should generate conf', function test(done) {
    var data = [{
      name: 'Godfather',
      name2: 'Godfather, godfather the movie',
      permalink: 'godfather-1972',
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
    schema.name.should.not.have.property('index')
    schema.name.should.have.property('type', 'string')
    schema.image.should.have.property('display', 'image')
    schema.tags.should.have.property('type', 'string')
    schema.tags.should.have.property('display', 'array')
    schema.tags2.should.have.property('type', 'string')
    schema.tags2.should.have.property('display', 'array')
    //schema.date.should.have.property('type', 'date')
    //schema.date2.should.have.property('type', 'date')
    schema.rating.should.have.property('type', 'integer')
    schema.rating2.should.have.property('type', 'float')
    schema.location.should.have.property('type', 'geo_point')
    schema.location2.should.have.property('type', 'geo_point')
    schema.location3.should.have.property('type', 'geo_point')
    schema.flag.should.have.property('type', 'boolean')
    conf.schema.should.have.property('permalink');
    schema.permalink.should.have.property('type', 'string')
    schema.permalink.should.have.property('index', 'not_analyzed')

    var aggregations = conf.aggregations;
    aggregations.should.have.property('rating');
    schema.should.have.property('name');
    schema.should.have.property('location');
    var sortings = conf.sortings;
    sortings.should.not.be.instanceOf(Array)
    done();
  });

  it('should generate ranges', function test(done) {
    var numbers = [1, 11]

    var ranges = helper.generateRanges(numbers, 5);
    ranges.should.be.eql([1,3,5,7,9,11])
    //console.log(helper.generateRangesForElastic(ranges));

    var numbers = [1,4]
    var ranges = helper.generateRanges(numbers, 3)
    ranges.should.be.eql([1,2,3,4])

    var numbers = [1,10]
    var ranges = helper.generateRanges(numbers, 4)
    ranges.should.be.eql([1,3,5,7,10])

    var numbers = [1950,2016]
    var ranges = helper.generateRanges(numbers, 5)
    ranges.should.be.eql([1950, 1963, 1976, 1989, 2002, 2016])

    var numbers = [1930,2015]
    var ranges = helper.generateRanges(numbers, 5)

    var numbers = [1, 13333]
    var ranges = helper.generateRanges(numbers, 5)

    var numbers = [3, 10]
    var ranges = helper.generateRanges(numbers)
    ranges.should.be.eql([3, 4, 5, 6, 7, 8, 10])

    var numbers = [2.5, 9.9]
    var ranges = helper.generateRanges(numbers)
    ranges.should.be.eql([2, 3, 4, 5, 6, 7, 8, 10])

    var numbers = [2,4]
    var ranges = helper.generateRanges(numbers);
    ranges.should.be.eql([2, 3, 4])
    done();
  });

  it('should generate range aggregation', function test(done) {
    var data = [{
      rating: 10
    }, {
      rating: 3
    }, {
      rating: 5
    }]

    var conf = helper.generateConfiguration(data);
    var aggregations = conf.aggregations;
    aggregations.should.have.property('rating');
    //console.log(aggregations.rating.ranges);
    done();
  });

});
