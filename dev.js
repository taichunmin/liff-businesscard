const _ = require('lodash')
const { build } = require('./build')
const { getenv } = require('./utils')
const finalhandler = require('finalhandler')
const https = require('https')
const livereload = require('livereload')
const log = require('debug')('app:watch')
const path = require('path')
const selfsigned = require('./selfsigned')
const serveStatic = require('serve-static')
const watch = require('node-watch')

async function main () {
  const publicDir = path.resolve(__dirname, 'dist')
  const baseUrl = _.trimEnd(getenv('BASEURL', 'https://taichunmin.idv.tw/liff-businesscard/'), '/') + '/'

  await build()
  log(`build finish. Visit: ${baseUrl}`)

  const livereloadServer = livereload.createServer({
    delay: 1000,
    port: 3000,
    server: https.createServer(selfsigned(), async (req, res) => {
      serveStatic(publicDir, {
        index: ['index.html', 'index.htm'],
      })(req, res, finalhandler(req, res))
    }),
  })
  livereloadServer.watch(publicDir)

  watch(['./src', './public'], { recursive: true }, async (e, name) => {
    const match = name.match(/^src[\\/](.+)\.pug$/)
    await build()
    if (!match) log(`"${name}" changed.`)
    else log(`${baseUrl}${match[1].replace(/\\/g, '/')}.html`)
  })
}

main()
