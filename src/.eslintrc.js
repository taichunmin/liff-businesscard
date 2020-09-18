module.exports = {
  plugins: [
    'pug',
  ],
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'standard',
  ],
  globals: {
    _: 'readonly',
    axios: 'readonly',
    CryptoJS: 'readonly',
    dayjs: 'readonly',
    JSON5: 'readonly',
    liff: 'readonly',
    moment: 'readonly',
    Papa: 'readonly',
    Qs: 'readonly',
    Swal: 'readonly',
    VConsole: 'readonly',
    Vue: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'eol-last': ['error', 'never'],
    'no-return-await': 0, // 0 = off, 1 = warn, 2 = error
    'spaced-comment': ['error', 'always', { markers: ['-'] }],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
    }],
  },
}