/* eslint-disable global-require,@typescript-eslint/no-var-requires */
const baseConfig = require('../../webpack.config')

module.exports = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    builder: 'webpack5',
  },
  webpackFinal: (config) => {
    const localConfig = baseConfig({}, config.mode)
    const rules = [
      ...config.module.rules.filter((r) => `${r.test}` !== '/\\.css$/'),
      ...localConfig.module.rules.filter((r) => `${r.test}` === '/\\.s?[ac]ss$/i'),
    ]
    Object.assign(config.module, { rules })

    return config
  },
  stories: ['../../src/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: {
    check: true, // type-check stories during Storybook build
  },
}
