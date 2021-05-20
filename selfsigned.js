const fs = require('fs')
const path = require('path')
const selfsigned = require('selfsigned')
const { inspect } = require('util')

// @see https://github.com/digitalbazaar/forge#x509
const CERTIFICATE_FILE = './.certificate.json'
module.exports = () => {
  if (fs.existsSync(path.join(__dirname, CERTIFICATE_FILE))) return require(CERTIFICATE_FILE)
  const pems = selfsigned.generate([
    { shortName: 'CN', value: 'localhost' },
    { shortName: 'C', value: 'TW' },
    { shortName: 'ST', value: 'Taipei' },
    { shortName: 'L', value: 'Taipei' },
    { shortName: 'O', value: 'Test' },
    { shortName: 'OU', value: 'Test' },
  ], {
    algorithm: 'sha256',
    days: 36500,
    keySize: 2048,
    extensions: [
      { name: 'basicConstraints', cA: true },
      {
        dataEncipherment: true,
        digitalSignature: true,
        keyCertSign: true,
        keyEncipherment: true,
        name: 'keyUsage',
        nonRepudiation: true,
      },
      {
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        name: 'extKeyUsage',
        serverAuth: true,
        timeStamping: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
        ],
      },
    ],
  })
  console.log(`Generate new selfsigned certificate and save to "${CERTIFICATE_FILE}": ${inspect(pems)}`)
  const certificate = { cert: pems.cert, key: pems.private }
  fs.writeFileSync(path.join(__dirname, CERTIFICATE_FILE), JSON.stringify(certificate, null, 2))
  return certificate
}
