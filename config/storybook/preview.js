import { withTests } from '@storybook/addon-jest'

import { withEnvironment } from './stories'

let results = {}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-unresolved
  results = require('../../dist/coverage/test-results.json')
  // eslint-disable-next-line no-empty
} catch (e) {}

// eslint-disable-next-line no-console
console.log(['results', results])

const getTestName = (str) =>
  typeof str === 'string'
    ? str
      .split('/src/')
      .slice(1)
      .join('/')
      .replace(/^packages\//, '')
      .replace(/\/?(index)?\.(tests|stories)?\.[jt]sx?$/, '')
    : ''

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: false,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  jest: (results.testResults || []).map((t) => getTestName(t.name)),
}

export const decorators = [
  withEnvironment,
  (Story, config) => {
    // eslint-disable-next-line no-console
    console.log(['config', config])
    const jest = [getTestName(config.parameters.fileName)]

    Object.assign(config.parameters, { jest })
    return withTests({ results })(Story, config)
  },
]
