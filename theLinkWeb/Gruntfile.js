module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var request = require('request');
  
  // Project configuration.
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
  
      concurrent: {
        dev: {
          tasks   : ['nodemon:dev','watch:dev'],
          options : {
            logConcurrentOutput: true
          }
        },
         prod: {
          tasks   : ['nodemon:prod','watch:prod'],
          options : {
            logConcurrentOutput: true
          }
        }
      },
      nodemon: {
        dev: {
          script  : './server.js',
          options : {
            args        : ['-L'],
            nodeArgs    : ['--debug=5859'],
            ext         : 'js hjs json',
            ignore      : ['node_modules/**'],
            legacyWatch : true
          }
        },
        prod: {
          script  : './server.js',
          options : {
            args        : ['-L'],
            ext         : 'js hjs json',
            ignore      : ['node_modules/**'],
            legacyWatch : true
          }
        }
      },
      watch: {
        dev:{
          files : ['./app/src/**'],
          tasks : ['buildDev'],
          options: {
            livereload: true
          }
        },
        prod:{
          files : ['./app/src/**'],
          tasks : ['buildDev'],
          options: {
            livereload: true
          }
        }
      },
      clean: { // Clean up files & folders
          dist: ['./app/dist/']
      },
      copy: { // Copy files from src to dist
        dist: {
          files:[
            {
              expand: true,
              cwd: './app/src/',
              src: ['**'],
              dest: './app/dist/'
            },
             { // Copy the clientside config file to be served by the webserver.
              expand: true, 
              cwd: './config/',
              src: 'client-conf.js',
              dest: './app/dist/src/thelink/',
            },
            { // Copy the clientside help file to be included in the app
              expand: true, 
              cwd: './config/',
              src: 'HelpTour.js',
              dest: './app/dist/src/thelink/',
            }]
          },
          bower: {
            files:[
            {
              expand: true,
              cwd: './bower_components',
              src: ['**'],
              dest: './app/dist/bower_components'
            }]
          }
      },
  
  
      // Scan javascript files and do replacement of environment-specific variables
      preprocess: {
        prod: {
          options: {
            inline: true,
            context: {
              env: 'prod'
            }
          },
          src: './app/dist/src/**/*.js'
        },
        dev: {
          options: {
            inline: true,
            context: {
              env: 'dev'
            }
          },
          src: './app/dist/src/**/*.js'
        }
      },

      // Javascript minification. (Do not mangle the files.)
      uglify: {
        dev: {
          options: {
            mangle: false
          },
          files: [
            {
              expand: true,
              cwd: './app/dist/src',
              src: ['**/*.js'],
              dest: './app/dist/src'
            },
          ]
        },
        prod: {
          options: {
            mangle: false
          },
          files: [
            {
              expand: true,
              cwd: './app/dist/src',
              src: ['**/*.js'],
              dest: './app/dist/src'
            },
          ]
        }
      }
  });


  // Tasks
  grunt.registerTask('buildDev', ['copy:dist','copy:bower','preprocess:dev']);
  grunt.registerTask('buildProd', ['copy:dist','copy:bower','preprocess:prod','uglify:prod']);

  grunt.registerTask('devEnvironment', ['buildDev', 'concurrent:dev']);
  grunt.registerTask('prodEnvironment',['buildProd', 'concurrent:prod']);
};
