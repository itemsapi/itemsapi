module.exports = function(router, client) {
  var limiter = require('express-limiter')(router, client)

  limiter({
    path: '*',
    method: 'get',
    //lookup: 'connection.remoteAddress',
    lookup: 'headers.x-forwarded-for',
    total: 120,
    expire: 1000 * 60 * 2,
    //expire: 1000 * 60 * 60,
    onRateLimited: function (req, res, next) {
      next({ message: 'Rate limit exceeded', status: 429 })
    }
  })
}

