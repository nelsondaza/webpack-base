import 'regenerator-runtime/runtime'

import Provider from 'react-redux/es/components/Provider'
import { ConnectedRouter } from 'connected-react-router'
import { render } from 'react-dom'

import App from './App'
import history from '../config/history'
import store from '../config/store'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'
import serviceWorkerRegistration from "./serviceWorkerRegistration"
import sentryRegistration from "./sentryRegistration"

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
sentryRegistration()

serviceWorkerRegistration()

renderApp()
