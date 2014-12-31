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
						err.object = object.name;
					}

					done(err);
				});
			}, next);
		};

		middleware.verifiers = verifiers;

		return middleware;
	};

	verifier.objects = {
		params: function (schema, options) {
			schema = options.prepareSchema(schema, options, 'params');
			var verifier = schema.verifier(options);

			var verf = function (req, res, next) {
				verifier.verify(req.params, next);
			};

			verf.schema = schema;
			return verf;
		},
		query: function (schema, options) {
			schema = options.prepareSchema(schema, options, 'query');
			var verifier = schema.verifier(options);

			var verf = function (req, res, next) {
				verifier.verify(req.query, next);
			};

			verf.schema = schema;
			return verf;
		},
		body: function (schema, options) {
			schema = options.prepareSchema(schema, options, 'body');
			var verifier = schema.verifier(options);

			var verf = function (req, res, next) {
				verifier.verify(req.body, next);
			};

			verf.schema = schema;
			return verf;
		}
	};

	return verifier;
};

expressVerifier.Verifier = Schema.Verifier;

module.exports = expressVerifier;
