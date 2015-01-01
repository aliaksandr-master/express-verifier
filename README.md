[![npm](http://img.shields.io/npm/v/express-verifier.svg?style=flat-square)](https://www.npmjs.com/package/express-verifier)
[![npm](http://img.shields.io/npm/l/express-verifier.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/aliaksandr-pasynkau/express-verifier.svg?style=flat-square)](https://david-dm.org/aliaksandr-pasynkau/express-verifier)
[![devDependency Status](https://david-dm.org/aliaksandr-pasynkau/express-verifier/dev-status.svg?style=flat-square)](https://david-dm.org/aliaksandr-pasynkau/express-verifier#info=devDependencies)
[![Build Status](https://travis-ci.org/aliaksandr-pasynkau/express-verifier.svg?branch=master&style=flat-square)](https://travis-ci.org/aliaksandr-pasynkau/express-verifier)
[![Coverage Status](https://img.shields.io/coveralls/aliaksandr-pasynkau/express-verifier.svg?style=flat-square)](https://coveralls.io/r/aliaksandr-pasynkau/express-verifier?branch=master)

express-verifier
================

body, params, query verifier middleware for express framework (nodejs)

all rules see https://www.npmjs.com/package/express-verifier

```js
var express = require('express');
var bodyParser = require('body-parser');
var verifier = require('express-verifier');

var app = express();

var verify = verifier({
	cwd: __dirname + '/specs/'
});

app.get('/', verify.query(function (required, optional) {
	required('sortby', ['type string', {'contains': ['key', 'value']}]);
	optional('orderby', ['type string', {'contains': ['ASC', 'DESC']}]);
}), function (req, res) {
	res.send({
		done: {
			body: req.body,
			query: req.query,
			params: req.params,
			headers: req.headers
		}
	});
});

app.post('/(:id)/', verify('get-user.yml'), resource);

```

define verifier by yaml
get-user.yml:
```yaml
---
schema:
    body:
        first_name:
            - type string
            - min_length 3
            - max_length 20
        last_name:
            - type string
            - min_length 3
            - max_length 20
        middle_name?:
            - type string
            - min_length 3
            - max_length 20
    params:
        id:
            - type: string
            - format: ^\d+$
    query:
        orderby?:
            - type: string
            - contains:
                - ASC
                - DESC
```

## verifierConstructor

```js
var verifierConstructor = require('express-verifier');

var verifier = verifierConstructor(options);
```

### options
#### options.cwd
`String` - root path of yaml specs

#### options.preparePath( path )
`function` - prepare yaml-loader path. must return path string

## verifier

Set by schema. Schema must have fields "query", "params", "body", "headers"
```js
var verifierConstructor = require('express-verifier');
var verifier = verifierConstructor();
var Schema = verifierConstructor.Schema;

var schema = Schema().object(function () {
	this.field('params').object(function () {
		this.required('id', [ 'format ^\\d+$' ]);
	});

	this.field('body').object(function (required, optional) {
		required('sortby',  ['type string', {'contains': ['key', 'value']}]);
    	optional('orderby', ['type string', {'contains': ['ASC', 'DESC']}]);
	});
});

app.get('/(:id)/', verifier(schema), function () {
	// ...
});
```


```js
var verifierConstructor = require('express-verifier');
var verifier = verifierConstructor();
var Schema = verifierConstructor.Schema;

var schemaParams = new Schema().object(function (required) {
	required('id', [ 'format ^\\d+$' ]);
});

var schemaBody = new Schema().object(function (required, optional) {
	required('sortby',  ['type string', {'contains': ['key', 'value']}]);
	optional('orderby', ['type string', {'contains': ['ASC', 'DESC']}]);
});

app.get('/(:id)/', verifier.params(schemaParams), verifier.body(schemaBody), verifier.headers('get-user-headers.yaml'), function () {
	// ...
});
```
