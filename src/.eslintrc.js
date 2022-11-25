// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  env: {
    jest: true,
  },
  extends: [
    'plugin:jest-dom/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:testing-library/react',
  ],
  globals: {
    ajaxIntercept: true,
    createTestComponent: true,
    createTestComponentConnected: true,
    epicToPromise: true,
    expectBecameFalse: true,
    expectBecameTrue: true,
    expectChange: true,
    expectKeys: true,
    expectNoChange: true,
  },
  plugins: ['jest', 'jest-dom', 'testing-library'],
  rules: {
    'jest/expect-expect': 'off',
    'jest/no-disabled-tests': 'off',
  },
}
