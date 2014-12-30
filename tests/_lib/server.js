"use strict";

var Schema = require('node-verifier-schema');
var plugin = require('./index');

var express = require('express');

var bodyParser = require('body-parser');

var app = express();

var verify = plugin({
	preparePath: function (filepath) {
		return __dirname + '/specs/' + filepath;
	}
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', verify('root.yml'), function (req, res) {
	console.log('get:', 123123);
	res.send({done: req.body});
});

app.post('/(:id)/', verify('root.yml'), function (req, res) {
	console.log('post:', 123123);
	res.send({done: req.body});
});

app.use(function (err, req, res, next) {
	console.log(req.method, req.url, err);

	if (err instanceof Schema.ValidationError) {
		res.send({
			error: err
		});
		return;
	}

	next(err);
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;
