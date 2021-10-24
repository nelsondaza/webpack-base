import { withTests } from '@storybook/addon-jest'

import results from '../../dist/coverage/test-results.json'

const getTestName = (str) =>
  str
    .split('/src/')
    .slice(1)
    .join('/')
    .replace(/^packages\//, '')
    .replace(/\/?(index)?\.(tests|stories)?\.[jt]sx?$/, '')

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
  (Story, config) => {
    const jest = [getTestName(config.parameters.fileName)]

    Object.assign(config.parameters, { jest })
    return withTests({ results })(Story, config)
  },
]
