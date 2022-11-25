/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const SentryCliPlugin = require('@sentry/webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { InjectManifest } = require('workbox-webpack-plugin')

const {
  buildManifest,
  getConfig,
  getFeaturesFlags,
  getSystemVars,
  setConfigEnvironment,
  getConfigEnvironment,
} = require('./utils')

const configBuild = getConfig('build')

const projectRoot = path.resolve(__dirname, '../')
const appConfig = path.join(projectRoot, 'config')
const appDist = path.join(projectRoot, 'dist')
const appEntry = path.join(projectRoot, 'src')
const appNodeModules = path.join(projectRoot, 'node_modules')
const packages = path.join(appEntry, 'packages')

const common = {
  appConfig,
  appDist,
  appEntry,
  appNodeModules,
  outputPath: path.join(appDist, configBuild.outputPath),
  packages,
  projectRoot,
  staticPath: path.join(projectRoot, 'static'),
}

const isChunkInContext = (context) => (chunk) =>
  !!context
  && (new RegExp(`node_modules[\\\\/]@?${chunk}[\\\\/]`, 'ig').test(context)
    || new RegExp(`node_modules[\\\\/]@?${chunk}$`, 'i').test(context))

const getChunk = (context, packs = configBuild.fixedChunksPackages) =>
  context ? packs.find(isChunkInContext(context)) : ''

const getChunkName = (context, packs = configBuild.fixedChunksPackages) =>
  (getChunk(context, packs) || 'unknown').split('|')[0].replace(/[^a-z\d-]+/gi, '')

const capitalize = (result, word) => result + word.charAt(0).toUpperCase() + word.slice(1)

const globalCSSLoaders = (isProduction, useModules = false) => [
  isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
  {
    loader: 'css-loader',
    options: {
      importLoaders: 3,
      modules: useModules
        ? {
          getLocalIdent: (context, _localIdentName, localName) => {
            if (localName.match(/^(GLOBAL_|KEEP_|_)/g)) {
              return localName.replace(/^(GLOBAL_|KEEP_|_)/g, '')
            }
            const local = context.resourcePath.substring(context.context.length).split('.')[0]
            let localPath = context.context
              .substring(context.rootContext.length)
              .replace(/([/\\]+)/g, '/')
              .replace(/(\/?)(src|packages|components)(\/)/gi, '$1')
            if (local !== '/index') {
              localPath += local.replace(/\W+/g, '_')
            }

            const localScope = localPath.replace(/\W+/g, ' ').split(' ').reduce(capitalize)

            return `${localScope}_${localName}`
          },
          localIdentName: '[folder]_[local]_[hash:base64:5]',
        }
        : undefined,
      sourceMap: true,
    },
  },
  { loader: 'postcss-loader', options: { sourceMap: true } },
  { loader: 'sass-loader', options: { sourceMap: true } },
  {
    loader: 'sass-resources-loader',
    options: {
      resources: path.join(common.appConfig, 'assets', 'scss', '**/*.scss'),
      sourceMap: true,
    },
  },
]

module.exports = (env, argv) => {
  const isProduction
    = process.env.NODE_ENV === 'production' || argv.mode === 'production' || argv.nodeEnv === 'production'
  process.env.NODE_ENV = isProduction ? 'production' : 'development'

  const useStats = !!argv.stats
  const showProgress = !!argv.progress

  const sentryEnvironment
    = Object.keys(env).some((key) => key.startsWith('SENTRY'))
    && Object.keys(env)
      .find((key) => !!key.startsWith('SENTRY-'))
      ?.replace(/^SENTRY-/, '')

  setConfigEnvironment(sentryEnvironment || process.env.NODE_ENV)

  const configSentry = getConfig('sentry')
  configSentry.enabled = !!configSentry.enabled && !!sentryEnvironment

  const publicEnv = {
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_ENABLED: configSentry.enabled,
  }

  Object.assign(process.env, publicEnv, {
    SENTRY_AUTH_TOKEN: configSentry.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: configSentry.SENTRY_ORG,
    SENTRY_PROJECT: configSentry.SENTRY_PROJECT,
  })

  return {
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      liveReload: true,
      port: configBuild.devServer.port,
      static: {
        directory: common.staticPath,
      },
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    entry: { b: './src/index' },
    mode: process.env.NODE_ENV,
    module: {
      rules: [
        {
          exclude: [common.packages],
          include: [common.appConfig, common.appEntry, common.appNodeModules],
          test: /\.s?[ac]ss$/i,
          use: globalCSSLoaders(isProduction),
        },
        {
          include: [common.packages],
          test: /\.s?[ac]ss$/i,
          use: globalCSSLoaders(isProduction, true),
        },
        {
          exclude: [common.appNodeModules],
          loader: 'ts-loader',
          options: {
            getCustomTransformers: () => ({
              before: [!isProduction && ReactRefreshTypeScript()].filter(Boolean),
            }),
            transpileOnly: true,
          },
          test: /\.[jt]sx?$/,
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          type: 'asset',
          generator: {
            filename: 'img/[name][ext]',
          },
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf)$/i,
          type: 'asset',
          generator: {
            filename: 'fonts/[name][ext]',
          },
        },
      ],
    },
    optimization: {
      chunkIds: 'deterministic',
      emitOnErrors: false,
      minimize: isProduction,
      moduleIds: 'deterministic',
      nodeEnv: process.env.NODE_ENV,
      splitChunks: {
        automaticNameDelimiter: '-',
        chunks: 'all',
        cacheGroups: {
          clip: {
            chunks: 'all',
            enforce: true,
            name: 'c-',
            priority: 8,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\]system[/\\]/.test(context),
          },
          base: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `v-${getChunkName(context)}`,
            priority: 7,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('node_modules/tailwind'),
          },
          primary: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `v-${getChunkName(context)}`,
            priority: 6,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('node_modules/semantic'),
          },
          secondary: {
            chunks: 'async',
            name: ({ context }) => context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'p-$1'),
            priority: 5,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\](images|form|ui)[/\\]/.test(context),
          },
          vendors_base: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `v-${getChunkName(context)}`,
            priority: 4,
            reuseExistingChunk: false,
            test: ({ context }) => !!getChunk(context),
          },
          vendors: {
            chunks: 'async',
            name: ({ context }) => `v-${getChunkName(context, configBuild.dynamicChunksPackages)}`,
            priority: 3,
            reuseExistingChunk: false,
            test: ({ context }) => !!getChunk(context, configBuild.dynamicChunksPackages),
          },
          node_modules: {
            chunks: 'async',
            name: 'v-',
            priority: 2,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('/node_modules/'),
          },
          pkg: {
            chunks: 'async',
            name: ({ context }) => context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'p-$1'),
            priority: 1,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\]/.test(context),
          },
          common: {
            chunks: 'async',
            minChunks: 2,
            name: 'co',
            priority: 0,
            reuseExistingChunk: false,
            // test: ({ context }, chunk) => {
            //   if (chunk && chunk[0]) {
            //     // eslint-disable-next-line no-console
            //     console.log(`${chunk[0].name} -> ${context}`)
            //   } else {
            //     console.log(chunk, context)
            //   }
            //   return true
            // },
          },
        },
      },
    },
    output: {
      chunkFilename: 'js/[name].[chunkhash].js',
      filename: 'js/[name].[chunkhash].js',
      path: common.outputPath,
      publicPath: configBuild.publicPath,
    },
    performance: {
      maxEntrypointSize: 1024 * 1024 * 4,
      maxAssetSize: 1024 * 1024 * 0.8,
    },
    plugins: [
      // DefinePlugin should be the first one
      new webpack.DefinePlugin({
        FEATURES_FLAGS: JSON.stringify(getFeaturesFlags(getConfigEnvironment())),
        SYSTEM: JSON.stringify(getSystemVars({ sentry: { enabled: publicEnv.SENTRY_ENABLED } })),
      }),
      isProduction
        && new CopyWebpackPlugin({
          patterns: [
            { from: common.staticPath, to: '' },
            {
              from: path.resolve(common.staticPath, 'manifest.json'),
              to: 'manifest.json',
              transform(content) {
                return buildManifest(content)
              },
            },
          ],
        }),
      new HtmlWebpackPlugin({
        cache: true,
        favicon: path.join(common.staticPath, 'favicon.ico'),
        filename: 'index.html',
        template: path.join(common.staticPath, 'indexTemplate.html'),
      }),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
      useStats
        && new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          defaultSizes: 'parsed',
          openAnalyzer: false,
          reportFilename: path.join(common.appDist, `bundleAnalyzer${isProduction ? 'Prod' : 'Dev'}.html`),
        }),
      new MiniCssExtractPlugin({
        chunkFilename: 'css/[name].[contenthash].css',
        filename: 'css/[name].[contenthash].css',
        ignoreOrder: true,
      }),
      new ForkTsCheckerWebpackPlugin(),
      !isProduction && new ReactRefreshWebpackPlugin(),
      isProduction
        && new InjectManifest({
          exclude: [
            /\.DS_Store$/,
            /\.gitignore$/,
            /\.map$/,
            /\.txt$/,
            /\.xml$/,
            /\.json$/,
            /\.html$/,
            /\.svg$/,
            /\.db$/,
            /fonts/,
            /emojis/,
            /icon-\d{3,}/,
          ],
          swDest: 'sw.js',
          swSrc: './config/sw.js',
        }),
      showProgress
        && new webpack.ProgressPlugin({
          activeModules: true,
          entries: true,
          modules: true,
          modulesCount: 1,
          profile: true,
        }),
      isProduction
        && configSentry.enabled
        && new SentryCliPlugin({
          include: common.outputPath,
          ignore: ['sw.js'],
          release: getSystemVars().version,
        }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        // 'core-js/es6': 'core-js/es',
        'core-js/library/fn': 'core-js/features',
        lodash: 'lodash-es',
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass'],
      modules: [common.appEntry, common.packages, common.appNodeModules],
    },
    watchOptions: {
      ignored: ['**/*.{tests,stories,cy}.{js,jsx,ts,tsx}', './dist'],
    },
  }
}
