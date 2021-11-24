const featureToBoolean = (feature) =>
  feature && (feature.enabled !== undefined || !!feature.users || !!feature.access)
    ? !!feature.enabled
    : !!feature && feature !== 'off' && feature !== 'OFF'

const featureToValue = (feature) => (feature !== null && typeof feature === 'object' ? feature.value : feature)

const parseObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'string' && value.startsWith('!!js/regexp ')) {
      const fragments = value.match(/!!js\/regexp \/(.*?)\/([gimy])?$/)
      Object.assign(obj, { [key]: new RegExp(fragments[1], fragments[2] || '') })
    }
  })
  return obj
}

const parseAsFeature = (data) => {
  const enabled = featureToBoolean(data)

  return {
    access: data && typeof data === 'object' && data.access && data.access.length ? data.access.map(parseObject) : null,
    enabled,
    users: data && typeof data === 'object' && data.users && data.users.length ? data.users.map(parseObject) : null,
    value: featureToValue(data),
  }
}

const testExpresionOrString = (expresion, comparedTo) => {
  if (expresion === null || expresion === undefined || comparedTo === null || comparedTo === undefined) {
    return false
  }

  return !!expresion && expresion.test ? expresion.test(comparedTo) : `${expresion}` === `${comparedTo}`
}

const matchesUser = (featUser, user) =>
  !!user
  && (testExpresionOrString(featUser.email, user.email)
    || testExpresionOrString(featUser.username, user.username)
    || testExpresionOrString(featUser.id, user.id))

const matchesAccess = (featAccess, access) =>
  access
  // eslint-disable-next-line no-bitwise
  && ((access.level && !!(featAccess.level & access.level)) || testExpresionOrString(featAccess.scope, access.scope))

class Features {
  enabled = false

  callbacks = {}

  features = {}

  getUser = Function.prototype

  addCallback = ({ callback, feature, validator }) => {
    if (validator(feature)) {
      callback()
    } else {
      this.callbacks[feature] = this.callbacks[feature] || []
      this.callbacks[feature].push({ callback, validator })
    }
  }

  checkCallbacks = () => {
    Object.keys(this.callbacks).forEach((feature) => {
      this.callbacks[feature].filter(({ validator }) => validator()).forEach(({ callback }) => callback())
      this.callbacks[feature] = this.callbacks[feature].filter(({ validator }) => !validator())
    })
  }

  isEnabled = (feature, callback = null) => {
    if (callback) {
      this.addCallback({ callback, feature, validator: () => this.isEnabled(feature) })
    }
    return !this.enabled || !!this.features[feature]?.enabled || this.isEnabledForUser(feature, this.getUser())
  }

  isEnabledForUser = (feature, user, callback = null) => {
    if (!this.enabled) {
      return true
    }

    if (callback) {
      this.addCallback({
        callback,
        feature,
        validator: () => this.isEnabledForUser(feature, user),
      })
    }

    if (user && this.features[feature]) {
      const { users } = this.features[feature]
      if (users && users.length) {
        for (let c = 0; c < users.length; c += 1) {
          const featUser = users[c]
          if (matchesUser(featUser, user)) {
            return true
          }
        }
      } else {
        return this.features[feature].enabled
      }
    }
    return false
  }

  isEnabledWithAccess = (feature, userAccess, callback = null) => {
    if (callback) {
      this.addCallback({
        callback,
        feature,
        validator: () => this.isEnabledWithAccess(feature, userAccess),
      })
    }

    if (!this.enabled) {
      return true
    }

    if (userAccess && this.features[feature]) {
      const { access } = this.features[feature]
      if (access && access.length) {
        for (let c = 0; c < access.length; c += 1) {
          const featAccess = access[c]
          if (matchesAccess(featAccess, userAccess)) {
            return true
          }
        }
      } else {
        return this.features[feature].enabled
      }
    }
    return false
  }

  resetFeatures = () => {
    this.features = {}
  }

  set = (object) => {
    Object.keys(object).forEach((name) => {
      this.features[name] = parseAsFeature(object[name])
    })
    this.enabled = !!this.features.features_flags?.enabled
    this.checkCallbacks()
  }

  setUserFunction = (func) => {
    this.getUser = func
    this.checkCallbacks()
  }

  value = (feature, defaultValue = undefined) => (this.isEnabled(feature) ? this.features[feature].value : defaultValue)

  valueForUser = (feature, user, defaultValue) => {
    if (this.enabled && !!this.features[feature]) {
      const { users } = this.features[feature]
      if (users && users.length) {
        for (let c = 0; c < users.length; c += 1) {
          const featUser = users[c]
          if (matchesUser(featUser, user)) {
            return featUser.value !== undefined ? featUser.value : defaultValue
          }
        }
      } else {
        return this.features[feature].value !== undefined ? this.features[feature].value : defaultValue
      }
    }
    return defaultValue
  }
}

export default Features
