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
    'originalError.response.headers',
    'originalError.response.status',
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

window.logError = ({ err, fatal = false }) => {
  err.message = _.get(err, 'response.data.message', err.message)
  console.error(window.errorToJson(err))
  if (window.gtagError) window.gtagError(err, fatal)
}

window.getCsv = async (url, cachetime = 3e4) => {
  const csv = _.trim(_.get(await axios.get(url, {
    params: { cachebust: _.floor(Date.now() / cachetime) },
  }), 'data'))
  return _.get(Papa.parse(csv, {
    encoding: 'utf8',
    header: true,
  }), 'data', [])
}

window.httpBuildQuery = obj => Qs.stringify(obj, { arrayFormat: 'brackets' })

window.encodeBase64url = str => Base64.encode(str).replace(/[+/=]/g, c => _.get({ '+': '-', '/': '_', '=': '' }, c))

window.decodeBase64url = str => {
  try {
    return Base64.decode(str.replace(/[-_]/g, c => _.get({ '-': '+', _: '/' }, c)))
  } catch (err) {
    return null
  }
}

window.encodeGzip = (() => {
  const cBase64 = CryptoJS.enc.Base64
  const WordArray = CryptoJS.lib.WordArray
  const base64ToUrl = str => str.replace(/[+/=]/g, c => _.get({ '+': '-', '/': '_', '=': '' }, c))
  const deflate = window.pako.deflate
  return str => base64ToUrl(cBase64.stringify(WordArray.create(deflate(str))))
})()

window.decodeGzip = (() => {
  const cBase64 = CryptoJS.enc.Base64
  const inflate = window.pako.inflate
  const urlToBase64 = str => str.replace(/[-_]/g, c => _.get({ '-': '+', _: '/' }, c))
  const wordToArrayBuffer = wordArr => {
    const len = wordArr.words.length
    const view = new DataView(new ArrayBuffer(len << 2))
    for (let i = 0; i < len; i++) view.setInt32(i << 2, wordArr.words[i])
    return view.buffer.slice(0, wordArr.sigBytes)
  }
  return base64 => {
    const buffer = wordToArrayBuffer(cBase64.parse(urlToBase64(base64)))
    return inflate(new Uint8Array(buffer), { to: 'string' })
  }
})()

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
