import Features from './Features'

export * from './constants'

const System = SYSTEM
const FeatureFlags = FEATURES_FLAGS

const def = { ...window.APP, ...System }

def.device = {
  os: '',
  appVersion: '',
  systemVersion: '',
  model: '',
  token: '',
  ...def.device,
}

def.api_url = `${def.env.api.host}${def.env.api.base_url || ''}`.replace(/\/+$/, '')
def.static_url = `${def.env.static.host}${def.env.static.base_url || ''}`.replace(/\/+$/, '')
def.url = `${def.env.host}${def.env.base_url || ''}`.replace(/\/+$/, '')

def.history = {
  push: () => null,
  replace: () => null,
}

const callAction = (key: string, value: string) => {
  const parts = key.split('.')
  let obj = def
  let parent = def
  parts.forEach((part) => {
    parent = obj
    // @ts-ignore
    obj[part] = obj[part] || {}
    // @ts-ignore
    obj = obj[part]
  })
  const lastKey = parts.pop()
  if (lastKey) {
    // @ts-ignore
    parent[lastKey] = value
  }
}

def.call = callAction
Object.keys(def).forEach(
  /* istanbul ignore next */
  // @ts-ignore
  (key) => !key.indexOf('c.') && callAction(key.replace(/^c\./, ''), def[key]),
)

def.addNotification = (...args: unknown[]) => def.notificationsAdd?.(...args)
def.notificationsAdd = undefined

window.APP = window.APP || {}
window.APP.call = def.call

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.info('VERSION: ', def.version)
  // eslint-disable-next-line no-console
  console.info('ENV: ', process.env.NODE_ENV || 'no-environment')
}

export const Feature = new Features()
Feature.set(FeatureFlags)

def.Feature = Feature
def.workbox = {
  reloadClients: (includeCurrent = true) =>
    includeCurrent
    && setTimeout(() => {
      document.location.href = '/'
    }, 0),
}

def.AUTH_HEADERS = {}

export default def
