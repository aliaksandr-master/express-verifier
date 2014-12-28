"use strict";

module.exports = require('grunto')(function(grunt) {

	return {
		jshint: {
			options: grunt.file.readJSON('.jshintrc'),
			all: [
				'**/*.{js,json}',
				'!node_modules/**/*.{js,json}',
				'!lib-cov/**/*.{js,json}'
			]
		}
	};

});