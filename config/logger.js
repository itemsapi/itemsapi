var winston = require('winston')
var config = require('./index').get()

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.server.logging_level || 'info'
    }),
  ]
});

module.exports = logger;
