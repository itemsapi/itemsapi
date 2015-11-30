'use strict';
var _ = require('underscore');

(function(module) {
  module.getGeoPoint = function(latLng) {
    if (!latLng) {
      return;
    }
    return _.map(latLng.split(','), function(val) {
      return parseFloat(val);
    });
  };
}(exports));
