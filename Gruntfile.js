'use strict';

module.exports = function gruntInit(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          quiet: false,
          reporter: 'spec'
        },
        src: ['tests/*/*Spec.js']
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          nodeArgs: ['--debug'],
          cwd: __dirname,
          ignore: ['node_modules/**'],
          watch: ['.'],
          delay: 1000,
          legacyWatch: true
        }
      }
    }

  });

  // load npm tasks
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-test');

  // register tasks
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('node', ['nodemon']);
  grunt.registerTask('default', ['test']);
};
