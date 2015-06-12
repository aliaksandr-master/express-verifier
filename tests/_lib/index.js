'use strict';
/*eslint no-process-env: 0 */

module.exports = process.env.EXPRESVERIFIER_COV ? require('./../../lib-cov') : require('./../../lib');
