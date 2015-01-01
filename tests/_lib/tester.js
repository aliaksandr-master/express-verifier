"use strict";

var _ = require('lodash');
var nodeunitExpress = require('nodeunit-express');

var defaultOptions = {
	method: 'get',
	uri: '/',
	headers: {},
	body: undefined,

	expect: {
		//status: undefined,
		//body: undefined,
		//headers: undefined
	},

	prepare: function (res) {
		return res;
	},

	tester: 'nodeunit',

	testers: {
		nodeunit: function (options, response, args) {
			var test = args[0];

			_.each(options.expect, function (v, k) {
				if (_.isFunction(v)) {
					test.ok(!!v(response[k], response, options, args), 'unexpected result in "' + k + '"');
					return;
				}

				test.deepEqual(response[k], v, 'unexpected result in "' + k + '"');
			});

			test.done();
		}
	}
};

module.exports = function (globalOptions) {
	globalOptions = _.merge(_.cloneDeep(defaultOptions), globalOptions);
	return function (app, testCase) {
		var options = _.merge(_.cloneDeep(globalOptions), testCase);

		return function () {
			var args = _.toArray(arguments);
			var expressAppTester = nodeunitExpress(app);

			_.each(options.headers, function (v, k) {
				expressAppTester.set(k, v);
			});

			if (options.body !== undefined) {
				if (!_.isString(options.body)) {
					expressAppTester.set('content-type', 'application/json');
					expressAppTester.write(JSON.stringify(options.body));
				} else {
					expressAppTester.write(options.body);
				}
			}

			expressAppTester[options.method.toLowerCase()](options.uri).expect(function(response) {
				response = options.prepare(response);
				options.testers[options.tester](options, response, args);
				expressAppTester.close();
			});
		};
	};
};