/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { getConfig } = require('../../config/utils')
/**
 * @type {Cypress.PluginConfig}
 */

module.exports = (on, config) => {
  const {
    env: { envGroup },
  } = config
  const cypressConf = getConfig('cypress')

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // `env` is the merged values, can be found at Cypress.env()

  const env = {
    ...config.env,
    ...cypressConf.env,
    ...(cypressConf.env[envGroup] || cypressConf.env.dev),
  }
  const baseUrl = cypressConf.env[envGroup].baseUrl || cypressConf.env.baseUrl || cypressConf.baseUrl || config.baseUrl
  return {
    ...config,
    ...cypressConf,
    baseUrl,
    env,
  }
}
