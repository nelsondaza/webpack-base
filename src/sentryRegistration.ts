import { Scope } from '@sentry/browser'

import System from 'system'

export default () => {
  if (process.env.NODE_ENV === 'production' && System.sentry?.enabled) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { configureScope, init } = require('@sentry/browser')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Integrations } = require('@sentry/tracing')

    init({
      dsn: System.sentry.dns,
      release: System.version,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0,
    })

    // @todo You have to change this values or put them some where else
    // https://docs.sentry.io/platforms/javascript/?platform=browser#capturing-the-user
    configureScope((scope: Scope) => {
      scope.setUser({
        id: 'unknown',
        username: 'anonymous',
        name: 'anonymous',
        email: 'anonymous',
        avatar: '',
      })
    })
  }
}
