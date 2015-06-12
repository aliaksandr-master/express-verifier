'use strict';

var _ = require('lodash');
var path = require('path');
var Schema = require('node-verifier-schema');
var iterate = require('async-iterate');

var defaultsOptions;

var ExpressVerifier = function (globalOptions) {
	globalOptions = _.extend({}, defaultsOptions, globalOptions);

	var verifier = function (schems, options) {
		if (_.isFunction(options)) {
			options = {
				callback: options
			};
		}

		options = _.extend({}, globalOptions, options);

		if (!_.isPlainObject(schems)) {
			schems = options.prepareSchema(schems, options).fields;
		}

		var middleware = function (req, res, next) {
			iterate.each(middleware.verifiers, function (vierifier, _index, done) {
				vierifier.verify(req, res, function (err) {
					if (err instanceof ExpressVerifier.Schema.ValidationError) {
						err.object = vierifier.name;
					}

					done(err);
				});
			}, function (err) {
				options.callback(err, req, res, next);
			});
		};

		middleware.verifiers = _.transform(verifier.components, function (verifiers, component, name) {
			if (!_.has(schems, name)) {
				return;
			}

			verifiers.push({
				name: name,
				verify: component(schems[name], options)
			});
		}, []);

		if (!middleware.verifiers.length) {
			throw new Error('invalid parameters for verify');
		}

		return middleware;
	};

	verifier.components = {};

	_.each(globalOptions.componentNames, function (name) {
		verifier.components[name] = function (schema, options) {
			var middleware = function (req, res, next) {
				middleware.verifier.verify(middleware.getData(req, res), next);
			};

			middleware.schema = options.prepareSchema(schema, options);
			middleware.verifier = middleware.schema.verifier(options);
			middleware.getData = options.getData(name);

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

defaultsOptions = {
	cwd: process.cwd(),

	componentNames: [
		'params',
		'headers',
		'query',
		'body'
	],

	getData: function (name) {
		return function (req, res) {
			return req[name];
		};
	},

	callback: function (err, req, res, next) {
		next(err);
	},

	preparePath: function (filepath) {
		return path.join(this.cwd, filepath);
	},

	prepareSchema: function (schema, options) {
		var _rawSchema = schema;

		if (_.isString(schema)) {
			if (/\.(yaml|yml)$/.test(schema)) {
				schema = options.preparePath(schema);
				schema = ExpressVerifier.Schema.load(schema);
			} else {
				schema = ExpressVerifier.Schema.get(schema);
			}
		} else if (_.isFunction(schema)) {
			schema = new ExpressVerifier.Schema();

			_rawSchema.call(schema, schema.required.bind(schema), schema.optional.bind(schema));
		}

		if (!(schema instanceof ExpressVerifier.Schema)) {
			throw new Error('must be Schema instance. ' + _rawSchema + ' given');
		}

		return schema;
	}
};


ExpressVerifier.Schema = Schema;

module.exports = ExpressVerifier;
