import 'regenerator-runtime/runtime'

import Provider from 'react-redux/es/components/Provider'
import { ConnectedRouter } from 'connected-react-router'
import { render } from 'react-dom'

import System from 'system'

import App from './App'
import history from '../config/history'
import sentryRegistration from './sentryRegistration'
import serviceWorkerRegistration from './serviceWorkerRegistration'
import store from '../config/store'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'

System.history = history

const renderApp = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App name={System.env.appName} version={System.version} />
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
sentryRegistration()

serviceWorkerRegistration({
  onNewVersionFound: ({ reloadClients }) => {
    // eslint-disable-next-line no-restricted-globals,no-alert
    if (confirm('Hay una nueva versión disponible, ¿deseas actualizar?')) {
      reloadClients()
    }
  },
  onRegistered: ({ reloadClients, workbox }) => {
    System.workbox = workbox || {}
    System.workbox.reloadClients = reloadClients
  },
})

renderApp()
