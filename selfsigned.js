const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

exports.createRsaCert = ({ attrs, extensions }) => {
  // generate cert
  const pki = forge.pki
  const keypair = pki.rsa.generateKeyPair(4096)
  const cert = pki.createCertificate()
  cert.publicKey = keypair.publicKey
  cert.serialNumber = '01'
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 100)

  if (!attrs) throw TypeError('attrs is required')
  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  if (extensions) cert.setExtensions(extensions)
  cert.sign(keypair.privateKey, forge.md.sha256.create())

  return {
    cert: pki.certificateToPem(cert),
    key: pki.privateKeyToPem(keypair.privateKey),
  }
}

exports.getCertOrCreate = () => {
  const CERTIFICATE_FILE = './.certificate.json'
  if (fs.existsSync(path.join(__dirname, CERTIFICATE_FILE))) return require(CERTIFICATE_FILE)
  const cert = exports.createRsaCert({
    attrs: [
      { shortName: 'CN', value: 'localhost' },
      { shortName: 'C', value: 'TW' },
      { shortName: 'ST', value: 'Taipei' },
      { shortName: 'L', value: 'Taipei' },
      { shortName: 'O', value: 'Test' },
      { shortName: 'OU', value: 'Test' },
    ],
    extensions: [
      { name: 'basicConstraints', cA: true },
      {
        cRLSign: true,
        dataEncipherment: true,
        digitalSignature: true,
        keyCertSign: true,
        keyEncipherment: true,
        name: 'keyUsage',
        nonRepudiation: true,
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
  fs.writeFileSync(path.join(__dirname, CERTIFICATE_FILE), JSON.stringify(cert, null, 2))
  return cert
}
