module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		karma: {  
		  unit: {
		    options: {
		      frameworks: ['jasmine'],
		      singleRun: false,
		      browsers: ['PhantomJS'],
		      files: [
		        'node_modules/jquery/dist/jquery.min.js',
		      	'node_modules/jasmine-jquery/lib/jasmine-jquery.js',

		      	{ pattern: 'images/icons/*', watched: false, served: true, included: false},
		      	{ pattern: 'services/json/taxonomy/v2/hierarchical.json', watched: false, served: true, included: false},
		      	{ pattern: 'js/*.js', watched: false, served: true, included: false},
		      	{ pattern: 'js/app/lib/**/*.js', watched: false, served: true, included: false},

		      	{ pattern: 'js/nyt5/reskin/masthead.js', watched: true, served: true, included: false},
		      	{ pattern: 'js/nyt5/reskin/masthead-tests.js', watched: true, served: true, included: true},

		        { pattern: 'js/**/*.html', watched: true, served: true, included: false}
		      ]
		    }
		  }
		}
	});

	grunt.registerTask('test', ['karma']);
};
