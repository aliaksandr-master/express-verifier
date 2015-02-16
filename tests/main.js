"use strict";

var Schema = require('node-verifier-schema');
var plugin = require('./_lib/index');

var verify = plugin();

var schema1 = new Schema('schema1');

exports['initialize'] = function (test) {
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

	var req = {
		query: {},
		params: {},
		body: {}
	};
	var res = {};
	var next = function () {};

	test.doesNotThrow(function () {
		verify({
			query: new Schema(),
			params: new Schema(),
			body: new Schema()
		}, function (err, req, res, next) {})(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.query('schema1', function (err, req, res, next) {})(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.params('schema1', function (err, req, res, next) {})(req, res, next);
	});

	test.doesNotThrow(function () {
		verify.body('schema1', function (err, req, res, next) {})(req, res, next);
	});

	test.done();
};