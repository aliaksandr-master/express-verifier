"use strict";

var _ = require('lodash');
var path = require('path');
var Schema = require('node-verifier-schema');
var loader = require('node-verifier-schema/load');
var iterate = require('async-iterate');

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
			_rawSchema.call(schema, schema.required.bind(schema), schema.optional.bind(schema));
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

		if (!_.isPlainObject(object)) {
			object = options.prepareSchema(object, options).fields;
		}

		var verifiers = _.reduce(verifier.componentNames, function(verifiers, name) {
			if (_.has(object, name)) {
				verifiers.push({
					name: name,
					verify: verifier.components[name](object[name], options)
				});
			}

			return verifiers;
		}, []);

		if (!verifiers.length) {
			throw new Error('invalid parameters for verify');
		}

		var middleware = function (req, res, next) {
			iterate.each(middleware.verifiers, function (obj, index, done) {
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

	verifier.componentNames = ['params', 'headers', 'query', 'body'];
	verifier.components = {};

	_.each(verifier.componentNames, function (name) {
		verifier.components[name] = function (schema, options) {
			schema = options.prepareSchema(schema, options);
			var verifier = schema.verifier(options);

			var middleware = function (req, res, next) {
				verifier.verify(middleware.getData(req, res), next);
			};

			middleware.schema = schema;
			middleware.verifier = verifier;

			middleware.getData = function (req, res) {
				return req[name];
			};

			return middleware;
		};

		verifier[name] = function (object, options) {
			var obj = {};
			obj[name] = object;
			return verifier(obj, options);
		};
	});

	return verifier;
};

expressVerifier.Schema = Schema;
expressVerifier.Verifier = Schema.Verifier;

module.exports = expressVerifier;
