"use strict";

var _ = require('lodash');
var path = require('path');
var Schema = require('node-verifier-schema');
var loader = require('node-verifier-schema/load');

var prepareSchema = function (options, schema) {
	var _rawSchema = schema;
	if (_.isString(schema)) {
		if (/\.(yaml|yml)$/.test(schema)) {
			schema = options.preparePath(schema);
			schema = loader(schema);
		} else {
			schema = Schema.get(schema);
		}
	} else if (_.isFunction(schema)) {
		schema = new Schema();
		_rawSchema(schema);
	}

	if (!(schema instanceof Schema)) {
		throw new Error('must be Schema instance. ' + _rawSchema + ' given');
	}

	return schema;
};

var defaultsOptions = {
	preparePath: function (filepath) {
		return path.join(process.cwd(), filepath);
	},

	objects: {
		params: {
			get: function (req, res) {
				return req.params;
			}
		},

		query: {
			get: function (req, res) {
				return req.query;
			}
		},

		headers: {
			get: function (req, res) {
				return req.headers;
			}
		},

		body: {
			get: function (req, res) {
				return req.body;
			}
		}
	}
};

var expressVerifier = function (options) {
	options = _.merge(defaultsOptions, options);

	return function (object) {
		var keys = _.keys(options.objects);
		if (!_.isPlainObject(object)) {
			var schema = prepareSchema(options, object);
			object = _.pick(schema.fields, keys);
			console.log(object);
		}

		var verifiers = [];
		_.each(keys, function (key) {
			if (object[key]) {
				var verifier = prepareSchema(options, object[key]).verifier();
				verifiers.push({
					verify: verifier.verify.bind(verifier),
					name: key,
					get: options.objects[key]
				});
			}
		});

		if (!verifiers.length) {
			throw new Error('invalid parameters for verify');
		}

		return function (req, res, next) {
			console.log('>>>1', req.body, req.query, req.params, req.headers);
			console.log('>>>', verifiers);
			Schema.utils.iterate.array(verifiers, function (object, index, done) {
				var value = object.get(req, res);
				console.log('>>>2', value);
				object.verify(value, function (err) {
					if (err instanceof Schema.ValidationError) {
						err.object = object.name;
					}

					console.log(err);

					done(err);
				});
			}, next);
			console.log('>>>end');
		};
	};
};

expressVerifier.Verifier = Schema.Verifier;

module.exports = expressVerifier;
