;(() => {
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

  const errToJson = err => ({
    ..._.pick(err, ERROR_KEYS),
    ...(_.isNil(err.originalError) ? {} : { originalError: errToJson(err.originalError) }),
  })

  const logError = err => { console.error(errToJson(err)) }

  const getCsv = async (url, cachetime = 3e4) => {
    const csv = _.trim(_.get(await axios.get(url, {
      params: { cachebust: _.floor(Date.now() / cachetime) },
    }), 'data'))
    return _.get(Papa.parse(csv, {
      encoding: 'utf8',
      header: true,
    }), 'data', [])
  }

  const httpBuildQuery = obj => Qs.stringify(obj, { arrayFormat: 'brackets' })

  const encodeBase64url = str => Base64.encode(str).replace(/[+/=]/g, c => _.get({ '+': '-', '/': '_', '=': '' }, c))

  const decodeBase64url = str => {
    try {
      return Base64.decode(str.replace(/[-_]/g, c => _.get({ '-': '+', _: '/' }, c)))
    } catch (err) {
      return null
    }
  }

  const encodeGzip = (() => {
    const cBase64 = CryptoJS.enc.Base64
    const WordArray = CryptoJS.lib.WordArray
    const base64ToUrl = str => str.replace(/[+/=]/g, c => _.get({ '+': '-', '/': '_', '=': '' }, c))
    const deflate = window.pako.deflate
    return str => base64ToUrl(cBase64.stringify(WordArray.create(deflate(str))))
  })()

  const decodeGzip = (() => {
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

  const beautifyFlex = obj => {
    if (_.isArray(obj)) return _.map(obj, window.beautifyFlex)
    if (!_.isPlainObject(obj)) return obj
    const grp = _.groupBy(_.toPairs(obj), pair => (_.isArray(pair[1]) || _.isPlainObject(pair[1])) ? 'b' : 'a')
    _.each(grp.b, v => { v[1] = window.beautifyFlex(v[1]) })
    return _.fromPairs([..._.sortBy(grp.a, '0'), ..._.sortBy(grp.b, '0')])
  }

  const sleep = t => new Promise(resolve => { setTimeout(resolve, t) })

  const getSearchParam = key => (new URL(window.location).searchParams.get(key))

  const parseJsonOrDefault = (str, defaultValue) => {
    try {
      if (!_.isString(str)) return defaultValue
      return JSON5.parse(str)
    } catch (err) {
      return defaultValue
    }
  }

  _.extend(window, { beautifyFlex, decodeBase64url, decodeGzip, encodeBase64url, encodeGzip, errToJson, getCsv, getSearchParam, httpBuildQuery, logError, parseJsonOrDefault, sleep })
})()
