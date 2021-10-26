import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { registerRoute } from 'workbox-routing'

// eslint-disable-next-line no-restricted-globals,no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST)

// Cache Google Fonts with a stale-while-revalidate strategy, with
// a maximum number of entries.
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [new ExpirationPlugin({ maxEntries: 20 })],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate(),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
)

// workbox.core.skipWaiting()
// workbox.core.clientsClaim()
//
// workbox.routing.registerRoute(
//   new RegExp('http://localhost:7070/'),
//   new workbox.strategies.StaleWhileRevalidate(),
// )
//
// self.addEventListener('push', (event) => {
//   const title = 'Get Started With Workbox'
//   const options = {
//     body: event.data.text(),
//   }
//   event.waitUntil(self.registration.showNotification(title, options))
// })
//
