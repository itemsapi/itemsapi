'use strict';
var _ = require('underscore');
var nconf = require('nconf');
module.exports = require('./config')(nconf.get());
