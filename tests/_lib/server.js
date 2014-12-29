"use strict";

var plugin = require('./index');

var express = require('express');

var app = express();

var verify = plugin({
	preparePath: function (filepath) {
		return __dirname + '/specs/' + filepath;
	}
});

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', verify('root.yml'), function (req, res) {
	console.log(123123);
});

app.use(function (err, req, res, next) {
	console.log(err);
});

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

module.exports = app;
