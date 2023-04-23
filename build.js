require('dotenv').config()

const _ = require('lodash')
const { errToPlainObj, genSitemap, getBaseurl, getenv, ncp } = require('./utils')
const { inspect } = require('util')
const fg = require('fast-glob')
const fsPromises = require('fs').promises
const htmlMinifier = require('html-minifier').minify
const log = require('debug')('app:index')
const path = require('path')
const pug = require('pug')
const UglifyJS = require('uglify-js')

exports.build = async () => {
  const sitemapUrls = []

  const GTAG_API_SECRET = Buffer.from('YW81Z2RTeTlTNFM4YWJFSVRBWXdmUQ', 'base64url').toString()
  const PUG_OPTIONS = {
    basedir: path.resolve(__dirname),
    baseurl: getBaseurl(),
    GTAG_API_SECRET: getenv('GTAG_API_SECRET', GTAG_API_SECRET),
    GTAG_ID: getenv('GTAG_ID', 'G-GZZ1VHK5ZD'),
    NODE_ENV: getenv('NODE_ENV', 'production'),
    ..._.fromPairs(_.map([
      'LIFFID_FULL',
      'LIFFID_SHARE_CSV',
      'LIFFID_SHARE',
    ], k => [_.camelCase(k), getenv(k)])),
  }

  const htmlMinifierOptions = {
    caseSensitive: true,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: code => UglifyJS.minify(code).code,
    removeCDATASectionsFromCDATA: true,
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
  }

  // copy public files
  await ncp('src', 'dist', {
    stopOnErr: true,
    filter: filename => !/\.pug$/.test(filename), // 複製除了 .pug 之外的檔案
  })

  // compile pug files
  const pugFiles = _.map(await fg('src/**/*.pug'), file => file.slice(4))

  let pugErrors = 0
  for (const file of pugFiles) {
    try {
      let html = pug.renderFile(path.resolve(__dirname, 'src', file), PUG_OPTIONS)
      if (PUG_OPTIONS.NODE_ENV === 'production') html = htmlMinifier(html, htmlMinifierOptions)
      const dist = path.resolve(__dirname, 'dist', file.replace(/\.pug$/, '.html'))
      await fsPromises.mkdir(path.dirname(dist), { recursive: true })
      await fsPromises.writeFile(dist, html)
      sitemapUrls.push(new URL(file.replace(/\.pug$/, '.html').replace(/index\.html$/, ''), PUG_OPTIONS.baseurl).href)
    } catch (err) {
      _.set(err, 'data.src', `./src/${file}`)
      log(`Failed to render pug, err = ${inspect(errToPlainObj(err), { depth: 100, sorted: true })}`)
      pugErrors++
    }
  }
  if (pugErrors) throw new Error(`Failed to render ${pugErrors} pug files.`)

  // sitemap
  await genSitemap({ baseurl: PUG_OPTIONS.baseurl, dist: path.resolve(__dirname, 'dist'), urls: sitemapUrls })
}
