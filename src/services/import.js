'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../elastic/mapping');
var async = require('async');

(function(module) {

    /**
     * import json and create full project
     */
    module.import = function(data, callback) {

        var mapping = data.mapping;
        var documents = data.documents;

        projectService.addTogether(mapping, function(err, res) {
            if (err) {
                return callback(err);
            }


            var docs = {
                project_name: mapping.project_name,
                table_name: mapping.table_name,
                documents: documents
            };

            dataService.addAllDocuments(docs, function(err, res) {
                if (err) {
                    return callback(err);
                }
                callback(null, res);
            });

        });

    }

}(exports));

