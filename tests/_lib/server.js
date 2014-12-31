"use strict";

var _ = require('lodash');
require('colors');
var Schema = require('node-verifier-schema');
var plugin = require('./index');

var express = require('express');

var bodyParser = require('body-parser');

var app = express();

var verify = plugin({
	cwd: __dirname + '/specs/'
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var resource = function (req, res) {
	res.send({
		done: {
			body: req.body,
			query: req.query,
			params: req.params,
			headers: req.headers
		}
	});
};

app.get('/', verify('root.yml'), resource);

app.post('/(:id)/', verify('root.yml'), resource);

app.get('/some/', verify.query(function (schema) {
	schema.required('sortby', ['type string', {'contains': ['key', 'value']}]);
	schema.optional('orderby', ['type string', {'contains': ['ASC', 'DESC']}]);
}), resource);

app.use(function (err, req, res, next) {
	if (err instanceof Schema.ValidationError) {
		res.send({
			error: err
		});
		return;
	}

	next(err);
});

var server = app.listen(3000, function () {
	console.log('>>'.green, 'Server started at ' + ('http://' + server.address().address + ':' + server.address().port).red);
});

module.exports = app;
