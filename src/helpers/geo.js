'use strict';
var _ = require('underscore');

exports.getGeoPoint = function(latLng) {
  if (!latLng) {
    return;
  }
  return _.map(latLng.split(','), function(val) {
    return parseFloat(val);
  });
};
