var Promise = require('bluebird');
var _ = require('underscore');
//var helper = require('./../helpers/collection');
var config = require('./../../config/index').get();

/*
 * delete collection
 */
exports.checkAccess = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (
      config.allowed_methods &&
      config.allowed_methods.length > 0 &&
      config.allowed_methods.indexOf(req.method) === -1 &&
      config.tokens.indexOf(token) === -1
    ) {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      })
    }

    return next();
};
