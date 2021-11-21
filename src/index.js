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
        <App name={SYSTEM.env.appName} version={SYSTEM.version} />
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

// @todo move service worker to a separate file
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  let swUpdateInterval
  let newVersionFound = false

  window.addEventListener('load', async () => {
    const wb = new Workbox('/sw.js')

    // https://developers.google.com/web/tools/workbox/modules/workbox-window
    wb.addEventListener('installed', async (event) => {
      // Resources are into the Cache Storage
    })

    wb.addEventListener('waiting', (event) => {
      // A new service worker has installed, but it can't activate
      // until all tabs running the current version have fully unloaded.
    })

    wb.addEventListener('controlling', async (event) => {
      // Page is been controlled by a service worker

      // event.isUpdate === true => New version controlled after page refresh
      // event.isUpdate === false => New version controlled after manual SW update
      newVersionFound = true
    })

    wb.addEventListener('activated', async (event) => {
      // Service worker is managing the page

      // @todo add custom message or notification on new version
      // newVersionFound && !event.isUpdate

      if (newVersionFound || event.isUpdate) {
        // force all client to reload for new version
        await wb.messageSW({ type: 'RELOAD_CLIENTS' })
      } else {
        // Cached assets should all be available now.
      }
    })

    await wb.register()

    swUpdateInterval = setInterval(async () => {
      await wb.update()
    }, 1000 * 60) // check every minute for new version

    if (
      !!window?.Notification?.permission
      && window.Notification.permission !== 'granted'
      && window.Notification.permission !== 'blocked'
    ) {
      window.Notification.requestPermission()
    }
  })

  window.addEventListener('unload', () => clearInterval(swUpdateInterval))
}

renderApp()
