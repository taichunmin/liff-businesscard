require('dotenv').config()

const { build } = require('./build')
const finalhandler = require('finalhandler')
const http = require('http')
const livereload = require('livereload')
const log = require('debug')('app:watch')
const path = require('path')
const serveStatic = require('serve-static')
const watch = require('node-watch')

async function main () {
  await build(true)
  log('build finish.')

  const publicDir = path.resolve(__dirname, 'dist')

  const livereloadServer = livereload.createServer({
    delay: 500,
  })
  livereloadServer.watch(publicDir)

  const staticServer = http.createServer((req, res) => {
    serveStatic(publicDir, {
      index: ['index.html', 'index.htm'],
    })(req, res, finalhandler(req, res))
  })
  staticServer.listen(3000)

  watch('./src', { recursive: true }, async (e, name) => {
    const match = name.match(/src[\\/](.+)\.pug/)
    if (!match) log(`"${name}" changed.`)
    else log(`http://localhost:3000/${match[1].replace(/\\/g, '/')}.html`)
    await build(true)
  })
}

main()
