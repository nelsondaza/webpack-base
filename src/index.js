import 'regenerator-runtime/runtime'

import Provider from 'react-redux/es/components/Provider'
import { ConnectedRouter } from 'connected-react-router'
import { render } from 'react-dom'

import App from './App'
import history from '../config/history'
import store from '../config/store'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'

const renderApp = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
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
    scope.setUser({ id: 'unknown', username: 'anonymous', name: 'anonymous', email: 'anonymous', avatar: '' })
  })
}

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // eslint-disable-next-line no-console
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        // eslint-disable-next-line no-console
        console.log('SW registration failed: ', registrationError)
      })
  })
}

renderApp()
