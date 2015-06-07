var express = require('express')
var elasticsearch = require('elasticsearch')
var mongodb = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var async = require('async')
var nconf = require('nconf')
var nconf = require('winston')
var initialize = require('express-init');

var app = express()

var middleware = function (req, res, next) {
    next()
};

var db;

middleware.init = function(app, callback) {

    async.parallel([
        function(done){
        var client = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'trace'
        });
        console.log("Connected correctly to elastic search server");

        done();
    },
    function(done) {
        var url = 'mongodb://localhost:27017/myproject';

        MongoClient.connect(url, function(err, res) {
            console.log("Connected correctly to mongodb server");
            db = res;
            done();
        });
    }
    ],
    function(err, results) {
        //console.log('mongo and es is initialized');
        callback();
    });
};



app.use(middleware);

app.use(function (req, res, next) {
    next();
});

/*
 * create new elastic item
 */
app.post('/item/song', function addItem(req, res, next) {
})

/*
 * update elastic item
 */
app.put('/item/song/:id', function addItem(req, res, next) {
})

/*
 * find item with intelligent searching 
 */
app.get('/item/song/find', function findItems(req, res, next) {
})

/**
 * autocomplete for specific collection
 * input: query, custom fields
 */
app.get('/item/song/autocomplete', function autocomplete(req, res) {
})

/**
 * find similar items to provided one
 */
app.get('/item/song/similar', function similarItems(req, res) {
})

/**
 * find nearest items to provided current gps
 */
app.get('/item/song/near/:key/:gps', function findNearestItems(req, res) {
})

initialize(app, function(err) {
  if (err)
    throw new Error(err);

  // the middleware is initialized now, so start the server
  app.listen(3000);
});
