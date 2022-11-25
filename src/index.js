import 'regenerator-runtime/runtime'

import { ConnectedRouter } from 'connected-react-router'
import { createRoot } from 'react-dom/client'
import Provider from 'react-redux/es/components/Provider'

import System from 'system'

import history from '../config/history'
import store from '../config/store'

import App from './App'
import sentryRegistration from './sentryRegistration'
import serviceWorkerRegistration from './serviceWorkerRegistration'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'
import './globals.scss'

System.history = history

const root = createRoot(document.getElementById('app'))

const renderApp = () => {
  root.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App name={System.env.appName} version={System.version} />
      </ConnectedRouter>
    </Provider>,
  )
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
