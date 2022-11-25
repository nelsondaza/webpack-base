import { defineConfig } from 'cypress'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const watchAndReload = require('cypress-watch-and-reload/plugins')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getConfig } = require('../config/utils')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackConfig = require('../config/webpack.config')

const mergeConfig = (_on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const {
    env: { envGroup },
  } = config
  const cypressConf = getConfig('cypress')

  const env = {
    ...config.env,
    ...cypressConf.env,
    ...(cypressConf.env[envGroup] || cypressConf.env.dev),
    'cypress-watch-and-reload': {
      watch: ['../src'],
    },
  }
  const baseUrl = cypressConf.env[envGroup].baseUrl || cypressConf.env.baseUrl || cypressConf.baseUrl || config.baseUrl
  const newConfig = {
    // Cypress initial configuration
    ...config,
    experimentalInteractiveRunEvents: true,
    experimentalSessionAndOrigin: true,
    testIsolation: 'on',
    ...cypressConf,
    env,
    screenshotOnRunFailure: !process.env.CI,
    video: !process.env.CI,
    baseUrl,
  }

  return newConfig.watchForFileChanges ? watchAndReload(newConfig) : newConfig
}

export default defineConfig({
  component: {
    specPattern: ['./src/**/*.cy.tsx'],
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: webpackConfig({}, {}),
    },
    indexHtmlFile: 'support/index.html',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('cypress-fail-fast/plugin')(on, config)

      on('before:spec', (_spec) => {
        // seed the database before each spec
        // await seedDB();
      })
      on('task', {
        // "db:reset": seedDB,
      })

      return mergeConfig(on, config)
    },
  },
})
