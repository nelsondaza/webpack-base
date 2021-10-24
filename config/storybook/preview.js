import { withTests } from '@storybook/addon-jest'

import { withEnvironment } from './stories'
import results from '../../dist/coverage/test-results.json'

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
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  jest: results.testResults.map((t) => getTestName(t.name)),
}

export const decorators = [
  withEnvironment,
  (Story, config) => {
    console.log(['config', config])
    const jest = [getTestName(config.parameters.fileName)]

    Object.assign(config.parameters, { jest })
    return withTests({ results })(Story, config)
  },
]
