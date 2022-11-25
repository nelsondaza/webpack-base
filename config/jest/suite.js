import 'regenerator-runtime/runtime'
import Enzyme, { mount, render, shallow } from 'enzyme'
import { createElement as createReactElement } from 'react'

import store from '../store'

import { ajaxInterceptor, epicToPromise } from './suiteEpics'

// enzyme-adapter-react-17 requires polyfills before importing
// eslint-disable-next-line import/newline-after-import,import/order
import { TextDecoder, TextEncoder } from 'node:util'
global.TextEncoder = TextEncoder
window.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
window.TextDecoder = TextDecoder
// eslint-disable-next-line import/first,import/order
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

Enzyme.configure({ adapter: new Adapter() })

global.ajaxIntercept = ajaxInterceptor.intercept
global.ajaxInterceptor = ajaxInterceptor
global.epicToPromise = epicToPromise
global.mount = mount
global.render = render
global.shallow = shallow

jest.mock('rxjs/ajax', () => ({
  ajax: {
    get: (...args) => global.ajaxInterceptor.get(...args),
    post: (...args) => global.ajaxInterceptor.post(...args),
    delete: (...args) => global.ajaxInterceptor.delete(...args),
    put: (...args) => global.ajaxInterceptor.put(...args),
    patch: (...args) => global.ajaxInterceptor.patch(...args),
  },
}))

/*
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
  withTranslation: () => Component => Component,
}))
*/

const fileReaderProps = {
  abort: jest.fn(),
  addEventListener: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  readAsBinaryString: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  removeEventListener: jest.fn(),
}

global.FileReader = () => fileReaderProps
global.FileReader.prototype = fileReaderProps

HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  putImageData: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
})

HTMLCanvasElement.prototype.toBlob = jest.fn()

HTMLCanvasElement.prototype.toDataURL = jest.fn()

const createElementConnected = (Component, props) => createReactElement(Component, { ...props, store })

const createElement = (Component, props, connected) => {
  if (connected) {
    return createElementConnected(Component, props)
  }
  return createReactElement(Component, props)
}

// react-redux's connect now uses React.memo() to wrap connected component
// so there's technically two levels of wrapping going on.
const diveInto = (component, connected) => (connected ? component.dive().dive() : component)
const createScope = (type, Component, props, options, connected) => {
  const element = createElement(Component, props, connected)
  let scope = null
  if (type === 'shallow') {
    scope = shallow(element, options)
  } else if (type === 'mount') {
    scope = mount(element, options)
  } else if (type === 'render') {
    scope = render(element)
  }
  return diveInto(scope, connected)
}

global.createTestComponent = (Component, props = {}, options = {}) => {
  const connected = !!options.connected
  const scopeType = options.scopeType || 'shallow'

  const component = {
    scope: createScope(scopeType, Component, props, options, connected),
  }

  Object.defineProperty(component, 'mounted', {
    get: () => {
      if (!component.mountComponent) {
        component.mountComponent = createScope('mount', Component, props, options, connected)
      }
      return component.mountComponent
    },
  })
  Object.defineProperty(component, 'rendered', {
    get: () => {
      if (!component.renderComponent) {
        component.renderComponent = createScope('render', Component, props, options, connected)
      }
      return component.renderComponent
    },
  })
  Object.defineProperty(component, 'shallowed', {
    get: () => {
      if (!component.shallowComponent) {
        component.shallowComponent = createScope('shallow', Component, props, options, connected)
      }
      return component.shallowComponent
    },
  })

  Object.defineProperty(component, 'instance', {
    get: () => component.scope.instance(),
  })

  Object.defineProperty(component, 'remount', {
    value: () => {
      if (scopeType === 'mount') {
        component.scope.unmount()
        return component.scope.mount()
      }

      if (component.mountComponent) {
        component.mounted.unmount()
        return component.mounted.mount()
      }
      return component.mounted
    },
  })

  Object.defineProperty(component, 'getProps', {
    value: () => (component.scope.instance() ? component.scope.instance().props : {}),
  })

  Object.defineProperty(component, 'getProp', {
    value: (key) => (component.scope.instance() ? component.scope.instance().props[key] : undefined),
  })

  Object.defineProperty(component, 'setProps', {
    value: (p) => component.scope.setProps(p),
  })

  Object.defineProperty(component, 'setProp', {
    value: (key, value) => component.scope.setProps({ [key]: value }),
  })

  Object.defineProperty(component, 'getState', {
    value: (key) => (key ? component.scope.state()[key] : component.scope.state()),
  })

  Object.defineProperty(component, 'setState', {
    value: (state, callback) =>
      callback ? component.scope.setState(state, callback) : component.scope.setState(state),
  })

  const beforeAndAfterTests = () => {
    beforeEach(() => {
      component.scope = createScope(scopeType, Component, props, options, connected)
      delete component.mountComponent
      delete component.renderComponent
      delete component.shallowComponent
    })

    afterEach(() => {
      if (scopeType === 'mount') {
        component.scope.unmount()
      }
      if (component.mountComponent && component.mountComponent.length) {
        component.mountComponent.unmount()
      }
    })

    afterAll(() => {
      if (global.gc) {
        global.gc()
      }
    })
  }

  beforeAndAfterTests()

  return component
}

global.createTestComponentConnected = (Component, props = {}, options = {}) =>
  createTestComponent(Component, props, { ...options, connected: true })

global.expectChange = ({ async = false, by = '_un1_set2_value3_', fn, from = '_un1_set2_value3_', of, to }) => {
  if (by !== '_un1_set2_value3_') {
    const ini = of()
    fn()

    if (!async) {
      // Increased not applied
      return expect(of()).toBe(ini + by)
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Increased not applied
        expect(of()).toBe(ini + by)
        resolve()
      })
    })
  }

  if (from === '_un1_set2_value3_') {
    // Initial value error
    expect(of()).not.toEqual(to)
  } else {
    // Initial value error
    expect(of()).toEqual(from)
  }

  fn()

  if (!async) {
    // Final value error
    return expect(of()).toEqual(to)
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      // Final value error
      expect(of()).toEqual(to)
      resolve()
    })
  })
}

global.expectNoChange = ({ async = false, fn, from = '_un1_set2_value3_', of }) => {
  // Initial value
  const initial = of()
  if (from !== '_un1_set2_value3_') {
    // Initial value error
    expect(initial).toEqual(from)
  }

  fn()

  if (!async) {
    if (from !== '_un1_set2_value3_') {
      // Initial value error
      expect(of()).toEqual(from)
    }

    // Final value
    return expect(of()).toEqual(initial)
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      if (from !== '_un1_set2_value3_') {
        // Initial value error
        expect(of()).toEqual(from)
      }

      // Final value
      expect(of()).toEqual(initial)
      resolve()
    })
  })
}

global.expectBecameTrue = ({ fn, of, async }) =>
  global.expectChange({
    async,
    callee: global.expectBecameTrue,
    fn,
    of,
    to: true,
  })

global.expectBecameFalse = ({ fn, of, async }) =>
  global.expectChange({
    async,
    callee: global.expectBecameFalse,
    fn,
    of,
    to: false,
  })

global.expectKeys = (obj, keys) => expect(Object.keys(obj).sort()).toEqual(keys.sort())

// @todo remove after migrate to react-test-library
// eslint-disable-next-line no-console
if (!console.errorOriginal) {
  // eslint-disable-next-line no-console
  console.errorOriginal = console.error
  // eslint-disable-next-line no-console
  console.error = (...args) => {
    const newArgs = args.filter(
      (arg) => typeof arg !== 'string' || !arg.includes('ReactDOM.render is no longer supported in React 18'),
    )
    if (newArgs.length) {
      // eslint-disable-next-line no-console
      console.errorOriginal(...newArgs)
    }
  }
}
