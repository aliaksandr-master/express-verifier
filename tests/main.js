"use strict";

var _ = require('lodash');
require('colors');
var Schema = require('node-verifier-schema');
var plugin = require('./_lib/index');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

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

	test.done();
};