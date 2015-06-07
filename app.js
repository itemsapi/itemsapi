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


app.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
});


app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/project/add', function (req, res) {

    var project = {name: 'projekt', created_at: new Date()};

    var collection = db.collection('projects');
    collection.insert(project, function(err, result) {
        console.log("Inserted project");
        console.log(result);
        res.send('add')
        //callback(result);
    });

    console.log('bombowo');
})

app.get('/project/list', function (req, res) {

    var collection = db.collection('projects');
    collection.find({}).toArray(function(err, docs) {
        console.log("Found the following records");
        console.dir(docs)
        //callback(docs);
        res.send(docs)
    });
})

/**
 * input: name, array of columns
 */
app.get('/table/add', function (req, res) {
    res.send('list')
})

/**
 * input: column with configuration
 */
app.get('/table/field/add', function (req, res) {
    res.send('list')
})

/**
 * Intelligent search through table
 * input: query, custom fields
 */
app.get('/table/search', function (req, res) {
    res.send('list')
})

/**
 * input: id
 */
app.get('/table/similar', function (req, res) {
    res.send('similar')
})

/**
 * input: ids
 */
app.get('/table/comparison', function (req, res) {
    res.send('similar')
})

/**
 * input: geo, distance
 */
app.get('/table/near', function (req, res) {
    res.send('similar')
})

/**
 * input: query, fields
 */
app.get('/table/suggester', function (req, res) {
    res.send('similar')
})


initialize(app, function(err) {
  if (err)
    throw new Error(err);

  // the middleware is initialized now, so start the server
  app.listen(3000);
});


/*var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})*/
