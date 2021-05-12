const _ = require('lodash')
const ncp = require('ncp').ncp

exports.getenv = (key, defaultval) => _.get(process, ['env', key], defaultval)

exports.getBaseurl = (() => {
  const baseurl = _.trimEnd(exports.getenv('BASEURL', 'https://localhost:3000/'), '/') + '/'
  return () => baseurl
})()

exports.ncp = (() => {
  ncp.limit = 16
  return (source, destination, options) => new Promise((resolve, reject) => {
    ncp(source, destination, options, err => err ? reject(err) : resolve())
  })
})()

exports.errToPlainObj = (() => {
  const ERROR_KEYS = [
    'address',
    'code',
    'data',
    'dest',
    'errno',
    'info',
    'message',
    'name',
    'path',
    'port',
    'reason',
    'response.data',
    'response.headers',
    'response.status',
    'stack',
    'status',
    'statusCode',
    'statusMessage',
    'syscall',
  ]
  return err => _.pick(err, ERROR_KEYS)
})()
