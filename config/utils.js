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
    return config[key] || { empty: true }
  }
  return config
}

const getFeaturesFlags = (environment) => {
  const ffPath = path.resolve(__dirname, `feature_flags/${environment}.yml`)
  let flags = {}

  if (fs.existsSync(ffPath)) {
    flags = load(fs.readFileSync(ffPath, 'utf8')) || {}
    flags.feature_flags = flags.feature_flags || 'on'
  }

  // for security reasons Feature flags are on in production unless explicitly turned off
  flags.feature_flags = flags.feature_flags || (environment === 'production' ? 'on' : 'off')

  // eslint-disable-next-line no-console
  console.log('FEATURES_FLAGS: ', flags.feature_flags)

  return flags
}

// like 1.0.20.01.06.0434
const createVersion = () => {
  const date = new Date()
  return [
    1,
    0,
    `00${date.getUTCFullYear()}`.slice(-2),
    `00${date.getUTCMonth() + 1}`.slice(-2),
    `00${date.getUTCDate()}`.slice(-2),
    `00${date.getUTCHours()}`.slice(-2) + `00${date.getUTCMinutes()}`.slice(-2),
  ].join('.')
}

const SYSTEM = {
  env: getConfig('system'),
  sentry: {
    dns: getConfig('sentry').SENTRY_DSN,
  },
  version: createVersion(),
}
// eslint-disable-next-line no-console
console.log('VERSION: ', SYSTEM.version)

const buildManifest = (buffer) => {
  const manifest = JSON.parse(buffer.toString())
  const configManifest = getConfig('manifest')

  return JSON.stringify({
    ...manifest,
    ...configManifest,
    version: SYSTEM.version,
  })
}

module.exports = {
  buildManifest,
  createVersion,
  getConfig,
  getFeaturesFlags,
  SYSTEM,
}
