import { BroadcastUpdatePlugin } from 'workbox-broadcast-update'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { googleFontsCache, imageCache, offlineFallback, pageCache, staticResourceCache } from 'workbox-recipes'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

// eslint-disable-next-line no-restricted-globals,no-underscore-dangle
const swManifest = self.__WB_MANIFEST
const currentAppVersion = SYSTEM.version

// eslint-disable-next-line no-restricted-globals
const { addEventListener, clients, registration, skipWaiting } = self

// Claiming control to start runtime caching asap
clientsClaim()

// Cache and serve resources from __WB_MANIFEST array
precacheAndRoute(swManifest)
cleanupOutdatedCaches()

pageCache()
googleFontsCache()
staticResourceCache()
imageCache()

offlineFallback({ pageFallback: 'index.html' })

registerRoute(
  ({ url }) => url.pathname.startsWith('/sw.js'),
  new StaleWhileRevalidate({
    plugins: [new BroadcastUpdatePlugin()],
  }),
)

addEventListener('install', (event) => {
  // Putting resources into the Cache Storage

  event.waitUntil(skipWaiting())
})

addEventListener('activate', (/* event */) => {
  // Managing versions
})

addEventListener('fetch', (/* event */) => {
  // Extracting from the cache and serving the resources
})

addEventListener('message', (event) => {
  // Messages from clients

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage(currentAppVersion)
  } else if (event.data?.type === 'GET_CLIENTS') {
    event.ports[0]?.postMessage(clients)
  } else if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(skipWaiting())
  } else if (event.data?.type === 'RELOAD_CLIENTS' || event.data?.type === 'RELOAD_OTHER_CLIENTS') {
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        clientList
          .filter((client) => event.data.type === 'RELOAD_CLIENTS' || client.id !== event.source?.id)
          .forEach((client) => {
            try {
              if (client.navigate) {
                client.navigate(client.url)
              }
              // eslint-disable-next-line no-empty
            } catch (e) {}
          })
        event.ports[0]?.postMessage(true)
        return true
      })
  }
})

addEventListener('sync', (/* event */) => {
  // Background sync
})

// PUSH NOTIFICATIONS

addEventListener('push', async (event) => {
  // Receive push notification and show a notification

  let notification = {
    // actions: [
    //   {
    //     action: 'explore',
    //     icon: '/icon-16x16.png',
    //     placeholder: '',
    //     title: 'Explore this new world',
    //   },
    //   {
    //     action: 'close',
    //     icon: '/icon-32x32.png',
    //     placeholder: '',
    //     title: 'Close',
    //   },
    // ],
    badge: undefined,
    body: 'Something you might want to check out.',
    data: { arrivalAt: Date.now() },
    icon: '/icon-32x32.png',
    image: '/icon-180x180.png',
    lang: undefined,
    renotify: false,
    requireInteraction: false,
    silent: false,
    tag: undefined,
    timestamp: Date.now(),
    title: 'New notification',
    vibrate: [100, 50, 100],
  }

  try {
    const json = event.data.json()
    notification = {
      ...notification,
      ...json,
    }
  } catch (e1) {
    try {
      notification.body = event.data.text()
      // eslint-disable-next-line no-empty
    } catch (e2) {}
  }

  try {
    await registration.showNotification(notification.title, notification)
    // eslint-disable-next-line no-empty
  } catch (e) {}
})

addEventListener('notificationclick', (event) => {
  // Custom notification actions

  const { action, data } = event.notification

  event.notification.close()

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        const client = clientList.find((c) => c.visibilityState === 'visible')
        if (client) {
          if (!action && data?.redirectURL) {
            try {
              if (client.navigate) {
                client.navigate(data.redirectURL)
              }
              // eslint-disable-next-line no-empty
            } catch (e) {}
          }
          client.focus()
        } else {
          // there are no visible windows. Open one.
          clients.openWindow(data?.redirectURL || '/')
        }

        return null
      }),
  )
})

addEventListener('notificationclose', (/* event */) => {
  // Closing notification action
})
