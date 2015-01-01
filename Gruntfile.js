"use strict";

module.exports = require('grunto')(function(grunt) {

	grunt.registerTask('default', [
		'newer:jshint:all',
		'nodeunit',
		'watch'
	]);

	return {
		nodeunit: {
			all: [
				'tests/*.js'
			],
			options: {
			}
		},
		'jshint': {
			options: grunt.file.readJSON('.jshintrc'),
			all: [
				'**/*.{js,json}',
				'!node_modules/**/*.{js,json}',
				'!lib-cov/**/*.{js,json}'
			]
		},
		watch: {
			files: [
				'lib/**/*',
				'tests/**/*'
			],
			tasks: [
				'newer:jshint:all',
				'nodeunit'
			]
		}
	};

});