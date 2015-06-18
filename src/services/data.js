'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/data');
var async = require('async');
var _ = require('lodash');

(function(module) {

  /**
   * add all documents to elastic
   * @param {Array} documents full data
   * @param {String} project_name
   * @param {String} table_name
   * @param {Integer} batch_size
   * @return {String} inserted documents count
   */
  module.addAllDocuments = function(data, callback) {

    var documents = data.documents;
    var limit = documents.length;
    var length = documents.length;

    var batch_size = data.batch_size || 1000;

    var count = 0;

    var project_name = data.project_name;
    var table_name = data.table_name;

    async.whilst(
      function () { return length > 0; },
      function (callback) {

        var removed = documents.splice(0, batch_size);

        var doc = {
          project_name: project_name,
          table_name: table_name,
          data: removed
        };

        module.addDocuments(doc, function(err, res) {
          if (err) {
            console.log(err);
          }
          return callback(err, res);
        });
        length -= removed.length;
      },
      function (err, res) {
        callback(null, limit + ' documents added');
      }
    );
  }
}(exports));

