import { Workbox } from 'workbox-window'

const SERVICE_WORKER_CHECK_INTERVAL = 1000 * 60 * 60 * 3 // every 3 hours
const UPDATE_RETRY_INTERVAL = 1000 * 60 * 30 // every 30 min

export default ({ onNewVersionFound, onRegistered }) => {
  // @todo move service worker to a separate file
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    let swUpdateInterval
    let retryUpdateInterval

    window.addEventListener('load', async () => {
      const wb = new Workbox('/sw.js')

      const reloadClients = async (includeCurrent = true) => {
        const type = includeCurrent ? 'RELOAD_CLIENTS' : 'RELOAD_OTHER_CLIENTS'

        // first fallback to reload all clients
        setTimeout(() => {
          setTimeout(() => {
            if (type === 'RELOAD_CLIENTS') {
              // last fallback to reload current client
              document.location.reload()
            }
          }, 600)
          navigator.serviceWorker?.controller?.postMessage({ type })
        }, 600)
        await wb.messageSW({ type })
      }

      // https://developers.google.com/web/tools/workbox/modules/workbox-window
      wb.addEventListener('installed', async (/* event */) => {
        // Resources are into the Cache Storage
      })

      wb.addEventListener('waiting', (/* event */) => {
        // A new service worker has installed, but it can't activate
        // until all tabs running the current version have fully unloaded.
      })

      wb.addEventListener('controlling', async (/* event */) => {
        // Page is being controlled by a service worker
        // event.isUpdate === true => New version controlled after page refresh
        // event.isUpdate === false => New version controlled after manual SW update
      })

      wb.addEventListener('activated', async (event) => {
        // Service worker is managing the page
        clearInterval(retryUpdateInterval)

        if (onNewVersionFound) {
          onNewVersionFound({
            event,
            reloadClients,
            workbox: wb,
          })

          retryUpdateInterval = setInterval(
            () =>
              onNewVersionFound({
                event,
                reloadClients,
                workbox: wb,
              }),
            UPDATE_RETRY_INTERVAL,
          )
        } else if (event.isUpdate) {
          await reloadClients()
          retryUpdateInterval = setInterval(() => reloadClients(), UPDATE_RETRY_INTERVAL)
        }
      })

      try {
        await wb.register()
        if (onRegistered) {
          onRegistered({
            reloadClients,
            workbox: wb,
          })
        }

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

    window.addEventListener('unload', () => {
      clearInterval(retryUpdateInterval)
      clearInterval(swUpdateInterval)
    })
  }
}
