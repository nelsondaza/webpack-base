import 'regenerator-runtime/runtime'

import Provider from 'react-redux/es/components/Provider'
import { ConnectedRouter } from 'connected-react-router'
import { render } from 'react-dom'
import { Workbox } from 'workbox-window'

import App from './App'
import history from '../config/history'
import store from '../config/store'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'

const renderApp = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App name={SYSTEM.appName} version={SYSTEM.version} />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app'),
  )
}

if (module.hot) {
  // Enable Webpack hot module replacement
  module.hot.accept(renderApp)
}

// If you are not using sentry remove this complete if to reduce the bundle size
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_ENABLED) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { configureScope, init } = require('@sentry/browser')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Integrations } = require('@sentry/tracing')

  init({
    dsn: SYSTEM.sentry.dns,
    release: SYSTEM.version,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  })

  // @todo You have to change this values or put them some where else
  // https://docs.sentry.io/platforms/javascript/?platform=browser#capturing-the-user
  configureScope((scope) => {
    scope.setUser({
      id: 'unknown',
      username: 'anonymous',
      name: 'anonymous',
      email: 'anonymous',
      avatar: '',
    })
  })
}

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const wb = new Workbox('/sw.js')

    // https://developers.google.com/web/tools/workbox/modules/workbox-window
    wb.addEventListener('installed', (event) => {
      console.log([`SW installed!`, SYSTEM.version, event])
    })

    wb.addEventListener('waiting', (event) => {
      console.log([`SW waiting!`, SYSTEM.version, event])

      console.log(
        `A new service worker has installed, but it can't activate`
          + `until all tabs running the current version have fully unloaded.`,
        SYSTEM.version,
        event,
      )
    })

    wb.addEventListener('controlling', (event) => {
      console.log([`SW controlling!`, SYSTEM.version, event])
    })

    wb.addEventListener('activated', async (event) => {
      console.log([`SW activated!`, SYSTEM.version, event])

      // `event.isUpdate` will be true if another version of the service
      // worker was controlling the page when this version was registered.
      if (!event.isUpdate) {
        console.log('Service worker activated for the first time!', SYSTEM.version, event)

        // If your service worker is configured to precache assets, those
        // assets should all be available now.
      } else {
        console.log('Service worker activated again!', SYSTEM.version, event)
        let newVersion = 'undefined'
        try {
          newVersion = await wb.messageSW({ type: 'GET_VERSION' })
        } catch (e) {
          console.log(['Error messageSW', e])
        }
        if (window.confirm(`A new version "${newVersion}" is available.\n  Current: ${SYSTEM.version}.\nReload?`)) {
          window.location.reload()
        }
      }
    })

    wb.addEventListener('message', (event) => {
      console.log([`SW message!`, SYSTEM.version, event])

      if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage(SYSTEM.version)
      }
    })

    wb.register()
  })
}

renderApp()
