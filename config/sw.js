import { BroadcastUpdatePlugin } from 'workbox-broadcast-update'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { googleFontsCache, imageCache, offlineFallback, pageCache, staticResourceCache } from 'workbox-recipes'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

// eslint-disable-next-line no-restricted-globals,no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

pageCache()
googleFontsCache()
staticResourceCache()
imageCache()

offlineFallback({ pageFallback: 'index.html' })

registerRoute(
  ({ url }) => url.pathname.startsWith('/manifest.json'),
  new StaleWhileRevalidate({
    plugins: [new BroadcastUpdatePlugin()],
  }),
)

clientsClaim()

// eslint-disable-next-line no-restricted-globals
self.skipWaiting()

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', (event) => {
  // @todo message registration
  // eslint-disable-next-line no-console
  console.log([`internal SW message!`, SYSTEM.version, event])

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SYSTEM.version)
  }
})
