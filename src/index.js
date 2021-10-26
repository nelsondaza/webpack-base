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
