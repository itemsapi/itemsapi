var winston = require('winston')
var util = require('util');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
  ]
});

module.exports = logger;
