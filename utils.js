const _ = require('lodash')

exports.getenv = (key, defaultval) => _.get(process, ['env', key], defaultval)
