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
				console.log('>>>BODY>>>', req.body);
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
				verifiers.push(_.extend({
					verify: verifier.verify.bind(verifier),
					name: key
				}, options.objects[key]));
			}
		});

		if (!verifiers.length) {
			throw new Error('invalid parameters for verify');
		}

		return function (req, res, next) {
			Schema.utils.iterate.array(verifiers, function (object, index, done) {
				var value = object.get(req, res);
				object.verify(value, function (err) {
					if (err instanceof Schema.ValidationError) {
						err.object = object.name;
					}

					done(err);
				});
			}, next);
		};
	};
};

expressVerifier.Verifier = Schema.Verifier;

module.exports = expressVerifier;
