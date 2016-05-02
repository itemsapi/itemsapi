'use strict';

var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('geo helper', function() {

  var geoHelper = require('./../../src/helpers/geo');

  it('should return geo point', function test(done) {
    geoHelper.getGeoPoint('51.30, 0.08').should.be.instanceOf(Array).and.have.lengthOf(2);
    geoHelper.getGeoPoint('51.30, 0.08')[0].should.be.equal(51.30);
    geoHelper.getGeoPoint('51.30, 0.08')[1].should.be.equal(0.08);
    geoHelper.getGeoPoint('51.30,0.08')[1].should.be.equal(0.08);
    geoHelper.getGeoPoint('51.30,   0.08')[1].should.be.equal(0.08);

    should(geoHelper.getGeoPoint()).be.equal(undefined);
    done();
  });
});
