const connect = require('undb/browser/connect');
const { onChange } = require('.')

module.exports = connect(onChange);
