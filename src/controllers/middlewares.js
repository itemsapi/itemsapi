var config = require('./../../config/index').get();

/*
 * delete collection
 */
exports.checkAccess = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (
      config.allowed_methods &&
      config.allowed_methods !== '*' &&
      config.allowed_methods.indexOf(req.method) === -1 &&
      config.tokens.indexOf(token) === -1
    ) {
      return res.status(403).send({
        message: 'No token provided'
      })
    }

    return next();
};
