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

    wb.addEventListener('activated', (event) => {
      // `event.isUpdate` will be true if another version of the service
      // worker was controlling the page when this version was registered.
      if (!event.isUpdate) {
        console.log('Service worker activated for the first time!', SYSTEM.version, event)

        // If your service worker is configured to precache assets, those
        // assets should all be available now.
      } else {
        console.log('Service worker activated again!', SYSTEM.version, event)
      }
    })

    wb.addEventListener('waiting', (event) => {
      console.log(
        `A new service worker has installed, but it can't activate`
          + `until all tabs running the current version have fully unloaded.`,
        SYSTEM.version,
        event,
      )

      // // `event.wasWaitingBeforeRegister` will be false if this is
      // // the first time the updated service worker is waiting.
      // // When `event.wasWaitingBeforeRegister` is true, a previously
      // // updated service worker is still waiting.
      // // You may want to customize the UI prompt accordingly.
      //
      // // Assumes your app has some sort of prompt UI element
      // // that a user can either accept or reject.
      // const prompt = createUIPrompt({
      //   onAccept: () => {
      //     // Assuming the user accepted the update, set up a listener
      //     // that will reload the page as soon as the previously waiting
      //     // service worker has taken control.
      //     wb.addEventListener('controlling', (event) => {
      //       window.location.reload();
      //     });
      //
      //     wb.messageSkipWaiting();
      //   },
      //
      //   onReject: () => {
      //     prompt.dismiss();
      //   }
      // });
    })

    wb.addEventListener('message', (event) => {
      console.log(`message!`, event)
      if (event.data.type === 'CACHE_UPDATED') {
        const { updatedURL } = event.data.payload

        console.log(`A newer version of ${updatedURL} is available!`, SYSTEM.version, event)
      }
    })

    wb.addEventListener('installed', SYSTEM.version, (event) => {
      if (!event.isUpdate) {
        console.log(`NO UPDATE!`, SYSTEM.version, event)
      } else {
        console.log(`UPDATE!`, SYSTEM.version, event)
      }
    })

    wb.register()
  })

  // window.addEventListener('load', () => {
  //   navigator.serviceWorker
  //     .register('/sw.js')
  //     .then((registration) => {
  //       // eslint-disable-next-line no-console
  //       console.log('SW registered: ', registration)
  //       console.log('SW registered: ', registration)
  //       console.log('SW registered: ', registration)
  //
  //       navigator.serviceWorker.addEventListener('message', async (event) => {
  //         console.log('index sw' ,event.data.meta)
  //         // Optional: ensure the message came from workbox-broadcast-update
  //         if (event.data.meta === 'workbox-broadcast-update') {
  //           // const { cacheName, updatedURL } = event.data.payload
  //
  //           // Do something with cacheName and updatedURL.
  //           // For example, get the cached content and update
  //           // the content on the page.
  //           // const cache = await caches.open(cacheName)
  //           // const updatedResponse = await cache.match(updatedURL)
  //           // const updatedText = await updatedResponse.text()
  //         }
  //       })
  //
  //     })
  //     .catch((registrationError) => {
  //       // eslint-disable-next-line no-console
  //       console.log('SW registration failed: ', registrationError)
  //     })
  // })
}

renderApp()
