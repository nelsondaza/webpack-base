const System = SYSTEM

const def = { ...System }

def.device = {
  os: '',
  appVersion: '',
  systemVersion: '',
  model: '',
  token: '',
  ...def.device,
}

const callAction = (key, value) => {
  const parts = key.split('.')
  let obj = def
  let parent = def
  parts.forEach((part) => {
    parent = obj
    obj[part] = obj[part] || {}
    obj = obj[part]
  })
  const lastKey = parts.pop()
  parent[lastKey] = value
}

def.call = callAction
Object.keys(def).forEach(
  /* istanbul ignore next */
  (key) => !key.indexOf('c.') && callAction(key.replace(/^c\./, ''), def[key]),
)

def.addNotification = (...args) => def.notificationsAdd && def.notificationsAdd(...args)
def.notificationsAdd = null

window.APP = window.APP || {}
window.APP.call = def.call

export default def
