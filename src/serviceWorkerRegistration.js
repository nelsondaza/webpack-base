import { Workbox } from 'workbox-window'

const SERVICE_WORKER_CHECK_INTERVAL = 1000 * 60 * 60 * 3 // every 3 hours

export default () => {
  // @todo move service worker to a separate file
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    let swUpdateInterval
    let newVersionFound = false

    window.addEventListener('load', async () => {
      const wb = new Workbox('/sw.js')

      // https://developers.google.com/web/tools/workbox/modules/workbox-window
      wb.addEventListener('installed', async (/* event */) => {
        // Resources are into the Cache Storage
      })

      wb.addEventListener('waiting', (/* event */) => {
        // A new service worker has installed, but it can't activate
        // until all tabs running the current version have fully unloaded.
      })

      wb.addEventListener('controlling', async (/* event */) => {
        // Page is been controlled by a service worker

        // event.isUpdate === true => New version controlled after page refresh
        // event.isUpdate === false => New version controlled after manual SW update
        newVersionFound = true
      })

      wb.addEventListener('activated', async (event) => {
        // Service worker is managing the page

        // @todo add custom message or notification on new version
        // newVersionFound && !event.isUpdate

        if (newVersionFound || event.isUpdate) {
          // force all client to reload for new version
          await wb.messageSW({ type: 'RELOAD_CLIENTS' })
        } else {
          // Cached assets should all be available now.
        }
      })

      try {
        await wb.register()

        swUpdateInterval = setInterval(async () => {
          await wb.update()
        }, SERVICE_WORKER_CHECK_INTERVAL) // check every minute for new version
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Service Worker Failed to Register', e)
      }

      if (
        !!window?.Notification?.permission
        && window.Notification.permission !== 'granted'
        && window.Notification.permission !== 'blocked'
      ) {
        window.Notification.requestPermission()
      }
    })

    window.addEventListener('unload', () => clearInterval(swUpdateInterval))
  }
}
