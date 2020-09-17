const selfsigned = require('selfsigned')

// @see https://github.com/digitalbazaar/forge#x509
module.exports = () => {
  const pems = selfsigned.generate([
    { shortName: 'CN', value: 'localhost' },
    { shortName: 'C', value: 'TW' },
    { shortName: 'ST', value: 'Taipei' },
    { shortName: 'L', value: 'Taipei' },
    { shortName: 'O', value: 'Test' },
    { shortName: 'OU', value: 'Test' },
  ], {
    algorithm: 'sha256',
    days: 3650,
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
  // console.log(JSON.stringify(pems))
  return { cert: pems.cert, key: pems.private }
}
