var database = require('./src/connections/database');
var elastic = require('./src/connections/elastic');
var async = require('async')
var nconf = require('nconf')
var winston = require('winston')
var fs  = require('fs')




var config_file = './config/test.json';
nconf.use('memory');
nconf
.argv({
    'logger': {
        alias: 'logger',
        describe: 'Use it for verbose',
        demand: false,
        default: false
    }
})

.file('overrides', { file: config_file })
.file('defaults', { file: './config/root.json' })
;

//console.log(nconf.get('logger'));

if (nconf.get('logger') !== true) {
    winston
    .remove(winston.transports.Console);
}



async.parallel([
    function(done){

    database.init(function(err, res) {
        //Clean up
        database.flushdb(function(err) {
            if(err) {
                winston.error(err);
                throw new Error(err);
            }

            winston.info('test_database flushed');
            done();


        });
    });
},
function(done) {
    elastic.init();
    elastic.flushdb({index: '*'}, function(err, res) {
        //console.log('zero');
        done();
    });
}
],
function(err, results) {

    var projectService = require('./src/services/project');
    var importService = require('./src/services/import');
    var dataService = require('./src/services/data');

    console.log('import tool is starting..');


    var importFromPackage = function(name, callback) {

        var mapping = JSON.parse(fs.readFileSync('./import/data/' + name + '/mapping.json', 'utf8'));
        var documents = JSON.parse(fs.readFileSync('./import/data/' + name + '/documents.json', 'utf8'));

        var data = {mapping: mapping, documents: documents};

        importService.importer(data, function(err, res) {
            if (err) {
                return callback(err);
            }
            return callback(null, res);
        })

    }
    importFromPackage('yopler', function(err, res) {
        console.log(err);
        console.log(res);
    });

    importFromPackage('film', function(err, res) {
        console.log(err);
        console.log(res);
    });
});






