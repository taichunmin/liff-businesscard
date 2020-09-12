window.errorToJson = (() => {
  const ERROR_KEYS = [
    'address',
    'code',
    'data',
    'dest',
    'errno',
    'info',
    'message',
    'name',
    'originalError.response.data',
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
  return err => _.transform(ERROR_KEYS, (json, k) => {
    if (_.hasIn(err, k)) _.set(json, k, _.get(err, k))
  }, {})
})()

window.getCsv = async (csv) => {
  const res = _.trim(_.get(await axios.get(csv, {
    params: { cachebust: +new Date() },
  }), 'data'))
  return _.get(Papa.parse(res, {
    encoding: 'utf8',
    header: true,
  }), 'data', [])
}

window.httpBuildQuery = obj => Qs.stringify(obj, { arrayFormat: 'brackets' })

window.encodeBase64url = str => Base64.encode(str).replace(/[+/=]/g, c => _.get({ '+': '-', '/': '_', '=': '' }, c))

window.decodeBase64url = str => Base64.decode(str.replace(/[-_]/g, c => _.get({ '-': '+', _: '/' }, c)))

// copy(beautifyFlex())
window.beautifyFlex = obj => {
  if (_.isArray(obj)) return _.map(obj, window.beautifyFlex)
  if (!_.isPlainObject(obj)) return obj
  const grp = _.groupBy(_.toPairs(obj), pair => (_.isArray(pair[1]) || _.isPlainObject(pair[1])) ? 'b' : 'a')
  _.each(grp.b, v => { v[1] = window.beautifyFlex(v[1]) })
  return _.fromPairs([..._.sortBy(grp.a, '0'), ..._.sortBy(grp.b, '0')])
}

window.sleep = t => new Promise(resolve => { setTimeout(resolve, t) })

window.getSearchParam = key => (new URL(window.location).searchParams.get(key))

window.parseJsonOrDefault = (str, defaultValue) => {
  try {
    if (!_.isString(str)) return defaultValue
    return JSON5.parse(str)
  } catch (err) {
    return defaultValue
  }
}
