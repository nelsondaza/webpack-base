/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs')
const path = require('path')
const { load } = require('js-yaml')

const filePath = path.resolve(__dirname, '.env.yml')

let config
if (fs.existsSync(filePath)) {
  config = load(fs.readFileSync(filePath, 'utf8')) || {}
} else {
  throw new Error("Main config file not found '/config/.env.yml'")
}

const getConfig = (key = undefined) => {
  if (key) {
    return config[key] || undefined
  }
  return config
}

module.exports = {
  getConfig,
}
