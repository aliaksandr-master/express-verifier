"use strict";

module.exports = process.env.EXPRESVERIFIER_COV ? require('./../../lib-cov') : require('./../../lib');