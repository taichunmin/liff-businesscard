const _ = require('lodash')
const fs = require('fs').promises
const log = require('debug')('app:index')
const ncp = require('ncp').ncp
const path = require('path')
const pug = require('pug')

ncp.limit = 16

function ncpAsync (source, destination, options) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, options, err => err ? reject(err) : resolve())
  })
}

function getenv (key, defaultval) {
  return _.get(process, ['env', key], defaultval)
}

exports.build = async () => {
  const PUG_OPTIONS = {
    basedir: path.resolve(__dirname, 'src'),
    baseUrl: _.trimEnd(getenv('BASEURL', 'https://taichunmin.idv.tw/liff-businesscard/'), '/') + '/',
  }

  // copy public files
  await ncpAsync('public', 'dist', {
    stopOnErr: true,
  })

  // compile pug files
  const pugFiles = _.map(_.filter(await fs.readdir(path.join(PUG_OPTIONS.basedir, 'forms')), file => {
    return file.indexOf('.') !== 0 && (file.slice(-4) === '.pug')
  }), file => `forms/${file}`)
  pugFiles.push('index.pug', 'share.pug')

  for (const file of pugFiles) {
    try {
      const html = pug.renderFile(path.resolve(__dirname, 'src', file), PUG_OPTIONS)
      await fs.writeFile(path.resolve(__dirname, 'dist', file.replace(/\.pug$/, '.html')), html)
    } catch (err) {
      log(err)
      throw err
    }
  }
}
