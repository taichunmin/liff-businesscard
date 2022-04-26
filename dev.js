const { build } = require('./build')
const { getBaseurl } = require('./utils')
const { promises: fsPromises } = require('fs')
const finalhandler = require('finalhandler')
const https = require('https')
const livereload = require('livereload')
const log = require('debug')('app:watch')
const path = require('path')
const serveStatic = require('serve-static')
const watch = require('node-watch')

async function readMkcert () {
  try {
    const [cert, key] = await Promise.all([
      fsPromises.readFile(path.resolve(__dirname, 'mkcert/cert.pem')),
      fsPromises.readFile(path.resolve(__dirname, 'mkcert/key.pem')),
    ])
    return { cert, key }
  } catch (err) {
    throw new Error('Failed to load mkcert. Please run "yarn mkcert" first.')
  }
}

async function main () {
  const publicDir = path.resolve(__dirname, 'dist')
  const baseurl = getBaseurl()
  await build()
  log(`build finish. Visit: ${baseurl}`)

  const livereloadServer = livereload.createServer({
    delay: 1000,
    port: 3000,
    server: https.createServer(await readMkcert(), async (req, res) => {
      serveStatic(publicDir, {
        index: ['index.html', 'index.htm'],
      })(req, res, finalhandler(req, res))
    }),
  })

  watch(['./component', './i18n', './layout', './src'], { recursive: true, delay: 1000 }, async (e, name) => {
    const match = name.match(/^src[\\/](.+)\.pug$/)
    await build()
    if (!match) log(`"${name}" changed.`)
    else log(`${baseurl}${match[1].replace(/\\/g, '/')}.html`)
    livereloadServer.refresh('')
  })
}

main()
