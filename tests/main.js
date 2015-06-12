'use strict';
/*eslint no-unused-vars: 0*/

var Schema = require('node-verifier-schema');
var plugin = require('./_lib/index');
var verify = plugin();

var schema1 = new Schema('schema1');

exports.initialize = function (test) {
	test.throws(function () {
		verify('schema2');
	});

	test.throws(function () {
		verify('schema1');
	});

	test.throws(function () {
		verify({});
	});

	test.throws(function () {
		verify.query({});
	});

	test.doesNotThrow(function () {
		verify.query('schema1');
	});

	var res = {};
	var req = {
		query: {},
		params: {},
		body: {}
	};
	var next = function () {};
	var cbk = function (e, req, res, next) {

	};

	test.doesNotThrow(function () {
		verify({
			query: new Schema(),
			params: new Schema(),
			body: new Schema()
		}, cbk)(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.query('schema1', cbk)(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.params('schema1', cbk)(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.body('schema1', cbk)(req, res, next);
	});

	test.done();
};
