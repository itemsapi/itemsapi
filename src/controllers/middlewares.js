var config = require('./../../config/index').get();
var helper = require('./../helpers/security')

/*
 * delete collection
 */
exports.checkAccess = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!helper.checkAccess({
      token: token,
      method: req.method,
      ip: req.ip
    }, config)) {
      return res.status(403).send({
        message: 'Access denied'
      })
    }

    return next();
};
