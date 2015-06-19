var winston = require('winston');
var should = require('should');
var setup = require('./../mocks/setup');

setup.makeSuite('project service', function() {

  var projectService = require('./../../src/services/project');
  var elasticClient = require('./../../src/connections/elastic');

  it('should create project successfully', function(done) {
    projectService.addProject({
      projectName: 'project'
    }, function(err, res) {
      should.not.exist(err);
      done();
    });
  });

  it('should create collection with configuration', function(done) {
    var data = {
      projectName: 'project',
      collectionName: 'city'
    }

    projectService.ensureCollection(data, function(err, res) {
      should.not.exist(err);
      done();
    });
  });

  it('should create collection with configuration once again', function(done) {
    var data = {
      projectName: 'project',
      collectionName: 'city'
    }

    projectService.ensureCollection(data, function(err, res) {
      should.not.exist(err);
      done();
    });
  });
});
