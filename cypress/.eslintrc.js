// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  env: {
    'cypress/globals': true,
  },
  extends: ['plugin:cypress/recommended'],
  globals: {
    cy: true,
    Cypress: true,
  },
  plugins: ['cypress'],
  rules: {
    'no-unused-expressions': 'off',
  },
}
