'use strict';

var app = require('./_lib/server');
var tester = require('nodeunit-express/tester')({
	prepare: function (res) {
		res.body = JSON.parse(res.body);
		return res;
	}
});

exports['get /'] = {
	'invalid - sortby is undefined': tester(app, {
		uri: '/',
		expect: {
			statusCode: 400,
			body: {
				error: {
					name: 'ValidationError',
					rule: 'required',
					params: null,
					path: ['sortby'],
					object: 'query'
				}
			}
		}
	}),

	'invalid - sortby is invalid': tester(app, {
		uri: '/?sortby=hey',
		expect: {
			statusCode: 400,
			body: {
				error: {
					name: 'ValidationError',
					rule: 'contains',
					params: [ 'key', 'value' ],
					value: 'hey',
					path: ['sortby'],
					object: 'query'
				}
			}
		}
	}),

	'valid - sortby': tester(app, {
		uri: '/?sortby=key',
		expect: {
			statusCode: 200
		}
	}),

	'invalid - orderby is invalid': tester(app, {
		uri: '/?sortby=key&orderby=bla',
		expect: {
			statusCode: 400,
			body: {
				error: {
					name: 'ValidationError',
					rule: 'contains',
					params: [ 'ASC', 'DESC' ],
					value: 'bla',
					path: ['orderby'],
					object: 'query'
				}
			}
		}
	}),

	'valid - orderby': tester(app, {
		uri: '/?sortby=key&orderby=ASC',
		expect: {
			statusCode: 200
		}
	})
};

exports['post /(:id)/'] = {
	'valid': tester(app, {
		uri: '/123/',
		method: 'POST',
		body: {
			'first_name': 'Vasia',
			'last_name': 'Pupkin'
		},
		expect: {
			statusCode: 200
		}
	}),

	'invalid': tester(app, {
		uri: '/asd/',
		method: 'POST',
		body: { 'first_name': 'Vasia', 'last_name': 'Pupkin' },
		expect: {
			body: {
				error: {
					name: 'ValidationError',
					rule: 'format',
					params: '^\\d+$',
					value: 'asd',
					path: ['id'],
					object: 'params'
				}
			}
		}
	}),

	'invalid - middle_name': tester(app, {
		uri: '/123/',
		method: 'POST',
		body: {
			'first_name': 'Vasia',
			'last_name': 'Pupkin',
			'middle_name': ''
		},
		expect: {
			body: {
				error: {
					name: 'ValidationError',
					rule: 'min_length',
					params: 3,
					value: '',
					path: ['middle_name'],
					object: 'body'
				}
			}
		}
	}),

	'invalid - last_name': tester(app, {
		uri: '/123/',
		method: 'POST',
		body: {
			'first_name': 'Vasia'
		},
		expect: {
			body: {
				error: {
					name: 'ValidationError',
					rule: 'required',
					params: null,
					path: ['last_name'],
					object: 'body'
				}
			}
		}
	}),

	'invalid - middle_name - invalid': tester(app, {
		uri: '/123/',
		method: 'POST',
		body: {
			'first_name': 'Vasia',
			'last_name': 'asdasd',
			'middle_name': 12313
		},
		expect: {
			body: {
				error: {
					name: 'ValidationError',
					rule: 'type',
					params: 'string',
					value: 12313,
					path: ['middle_name'],
					object: 'body'
				}
			}
		}
	})
};
