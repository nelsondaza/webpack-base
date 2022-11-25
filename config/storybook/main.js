/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const baseConfig = require('../webpack.config')

module.exports = {
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-jest',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          fsCache: true,
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    disableTelemetry: true,
    builder: 'webpack5',
    options: {
      lazyCompilation: true,
    },
  },
  staticDirs: ['../../static'],
  webpackFinal: (config) => {
    const localConfig = baseConfig({}, config.mode)

    // Use local CSS rules instead of storybook's
    const rules = [
      ...config.module.rules.filter((r) => `${r.test}` !== '/\\.css$/'),
      ...localConfig.module.rules.filter((r) => `${r.test}` === '/\\.s?[ac]ss$/i'),
    ]
    Object.assign(config.module, { rules })

    Object.assign(config.resolve, {
      alias: {
        ...config.resolve.alias,
        // This is a @storybook/addon-jest error, check:
        // https://github.com/storybookjs/storybook/issues/14856
        path: require.resolve('path-browserify'),
      },
      modules: [...config.resolve.modules, ...localConfig.resolve.modules],
      plugins: [...(config.resolve?.plugins || []), ...(localConfig.resolve?.plugins || []), new TsconfigPathsPlugin()],
    })

    config.plugins.push(
      localConfig.plugins[0], // DefinePlugin
      new MiniCssExtractPlugin({
        chunkFilename: 'css/[name].[contenthash].css',
        filename: 'css/[name].[contenthash].css',
        ignoreOrder: true,
      }),
    )

    return config
  },
  stories: ['../../src/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: {
    check: true, // type-check stories during Storybook build
  },
}
