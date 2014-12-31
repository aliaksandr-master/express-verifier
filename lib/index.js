"use strict";

var _ = require('lodash');
var path = require('path');
var Schema = require('node-verifier-schema');
var loader = require('node-verifier-schema/load');

var defaultsOptions = {
	cwd: process.cwd(),

	preparePath: function (filepath) {
		return path.join(this.cwd, filepath);
	},

	prepareSchema: function (schema, options) {
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
	}
};

var verifierObject = function (name) {
	return function (schema, options) {
		schema = options.prepareSchema(schema, options, name);
		var verifier = schema.verifier(options);

		var verf = function (req, res, next) {
			verifier.verify(req[name], next);
		};

		verf.schema = schema;
		return verf;
	};
};

var expressVerifier = function (globalOptions) {
	var verifier = function (object, options) {
		options = _.extend({}, defaultsOptions, globalOptions, options);

		var keys = _.keys(verifier.objects);

		if (!_.isPlainObject(object)) {
			object = options.prepareSchema(object, options).fields;
		}

		var verifiers = [];
		_.each(keys, function (key) {
			if (_.has(object, key)) {
				verifiers.push({
					name: key,
					verify: verifier.objects[key](object[key], options)
				});
			}
		});

		if (!verifiers.length) {
			throw new Error('invalid parameters for verify');
		}

		var middleware = function (req, res, next) {
			Schema.utils.iterate.array(middleware.verifiers, function (obj, index, done) {
				obj.verify(req, res, function (err) {
					if (err instanceof Schema.ValidationError) {
						err.object = obj.name;
					}

					done(err);
				});
			}, next);
		};

		middleware.verifiers = verifiers;

		return middleware;
	};

	verifier.objects = {
		body: verifierObject('body'),
		query: verifierObject('query'),
		params: verifierObject('params'),
		headers: verifierObject('headers')
	};

	_.each(verifier.objects, function (v, k) {
		verifier[k] = function (object, options) {
			var obj = {};
			obj[k] = object;
			return verifier(obj, options);
		};
	});

	return verifier;
};

expressVerifier.Verifier = Schema.Verifier;

module.exports = expressVerifier;
