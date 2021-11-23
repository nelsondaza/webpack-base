export default () => {
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
}
