'use strict';

module.exports = require('grunto')(function (grunt) {

	grunt.registerTask('test', [
		'newer:eslint',
		'nodeunit'
	]);

	grunt.registerTask('default', [
		'test',
		'watch'
	]);

	return {
		nodeunit: {
			all: [
				'tests/*.js'
			]
		},
		eslint: {
			all: [
				'**/*.js',
				'!node_modules/**/*',
				'!lib-cov/**/*'
			]
		},
		watch: {
			files: [
				'lib/**/*.js',
				'!node_modules/**/*',
				'!lib-cov/**/*'
			],
			tasks: [
				'test'
			]
		}
	};
});
