import { Workbox, WorkboxLifecycleEvent } from 'workbox-window'

const SERVICE_WORKER_CHECK_INTERVAL = 1000 * 60 * 60 * 3 // every 3 hours
const UPDATE_RETRY_INTERVAL = 1000 * 60 * 15 // every 15 min

export type Type = {
  onNewVersionFound?: (params: {
    event: WorkboxLifecycleEvent
    reloadClients: (includeCurrent?: boolean) => Promise<void>
    workbox: Workbox
  }) => void
  onRegistered: (params: { reloadClients: (includeCurrent?: boolean) => Promise<void>; workbox: Workbox }) => void
}

export default ({ onNewVersionFound, onRegistered }: Type) => {
  let swUpdateInterval: NodeJS.Timeout | string | number | undefined
  let retryUpdateInterval: NodeJS.Timeout | string | number | undefined
  let isRegistrationStarted = false

  const serviceWorkerRegistration = async () => {
    if (isRegistrationStarted) {
      return
    }

    isRegistrationStarted = true

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
    wb.addEventListener('activated', async (event) => {
      // console.log('Service worker activated...')

      if (!event.isUpdate) {
        // console.log('Service worker activated for the first time...')
        return
      }
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

    wb.addEventListener('activating', (/* event */) => {
      // console.log('Service worker activating...')
    })

    wb.addEventListener('controlling', async (/* event */) => {
      // Page is being controlled by a service worker
      // event.isUpdate === true => New version controlled after page refresh
      // event.isUpdate === false => New version controlled after manual SW update
      // console.log('Service worker controlling...')
    })

    wb.addEventListener('installed', async (/* event */) => {
      // Resources are into the Cache Storage
      // console.log('Service worker installed...')
    })

    wb.addEventListener('installing', async (/* event */) => {
      // Resources are into the Cache Storage
      // console.log('Service worker installing...')
    })

    wb.addEventListener('message', async (/* event */) => {
      // Resources are into the Cache Storage
      // console.log('Service worker message...')
    })

    wb.addEventListener('redundant', async (/* event */) => {
      // Resources are into the Cache Storage
      // console.log('Service worker redundant...')
    })

    wb.addEventListener('waiting', (/* event */) => {
      // A new service worker has installed, but it can't activate
      // until all tabs running the current version have fully unloaded.
      // console.log('Service worker waiting...')
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
      && !!window?.Notification?.requestPermission
      && window.Notification.permission !== 'granted'
      && window.Notification.permission !== 'denied'
    ) {
      await window.Notification.requestPermission()
    }
  }

  // @todo move service worker to a separate file
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      serviceWorkerRegistration()
    })
    window.addEventListener('unload', () => {
      clearInterval(retryUpdateInterval)
      clearInterval(swUpdateInterval)
    })

    setTimeout(() => {
      serviceWorkerRegistration()
    }, 3000)
  }
}
