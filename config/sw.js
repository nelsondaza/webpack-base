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
  ({ url }) => console.log(url) || url.pathname.startsWith('/manifest.json'),
  new StaleWhileRevalidate({
    plugins: [new BroadcastUpdatePlugin()],
  }),
)

// eslint-disable-next-line no-restricted-globals
self.skipWaiting()
clientsClaim()
