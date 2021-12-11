/* eslint-disable @typescript-eslint/no-var-requires */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const deepmerge = require('deepmerge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const SentryCliPlugin = require('@sentry/webpack-plugin')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { InjectManifest } = require('workbox-webpack-plugin')

const { getConfig, getFeaturesFlags, buildManifest, SYSTEM } = require('./utils')

const configBuild = getConfig('build')
let configSentry = getConfig('sentry')

const projectRoot = path.resolve(__dirname, '../')
const appConfig = path.join(projectRoot, 'config')
const appDist = path.join(projectRoot, 'dist')
const appEntry = path.join(projectRoot, 'src')
const appNodeModules = path.join(projectRoot, 'node_modules')
const packages = path.join(appEntry, 'packages')
const { publicPath } = configBuild

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

const chunkInContext = (context) => (chunk) =>
  !!context
  && (context.includes(`/${chunk}`)
    || context.includes(`/@${chunk}`)
    || context.includes(`\\${chunk}`)
    || context.includes(`\\@${chunk}`))

const capitalize = (result, word) => result + word.charAt(0).toUpperCase() + word.slice(1)

const globalCSSLoaders = (isProduction, useModules = false) => [
  isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
  {
    loader: 'css-loader',
    options: {
      importLoaders: 3,
      modules: useModules
        ? {
            getLocalIdent: (context, localIdentName, localName) => {
              if (localName.match(/^(GLOBAL_|KEEP_|_)/g)) {
                return localName.replace(/^(GLOBAL_|KEEP_|_)/g, '')
              }
              const local = context.resourcePath.substring(context.context.length).split('.')[0]
              let localPath = context.context
                .substring(context.rootContext.length)
                .replace(/([/\\]+)/g, '/')
                .replace(/(\/?)(src|packages|components)(\/)/gi, '$1')
              if (local !== '/index') {
                localPath += local.replace(/[^A-Za-z0-9_]+/gi, '_')
              }

              const localScope = localPath
                .replace(/[^A-Za-z0-9_]+/gi, ' ')
                .split(' ')
                .reduce(capitalize)

              return `${localScope}_${localName}`
            },
            localIdentName: '[folder]_[local]_[hash:base64:5]',
          }
        : undefined,
      sourceMap: !isProduction,
    },
  },
  { loader: 'postcss-loader', options: { sourceMap: !isProduction } },
  { loader: 'sass-loader', options: { sourceMap: !isProduction } },
  {
    loader: 'sass-resources-loader',
    options: {
      resources: path.join(common.appConfig, 'assets', 'scss', '**/*.scss'),
      sourceMap: !isProduction,
    },
  },
]

module.exports = (env, argv) => {
  const isProduction
    = process.env.NODE_ENV === 'production' || argv.mode === 'production' || argv.nodeEnv === 'production'
  const useStats = !!argv.stats
  const showProgress = !!argv.progress

  const sentryEnvironment = Object.keys(env).some((key) => key.startsWith('SENTRY'))
    && (
      Object.keys(env)
        .filter((key) => !!key.startsWith('SENTRY-'))?.[0]
        ?.replace(/^SENTRY-/, '')
        || 'production'
    )

  if (sentryEnvironment) {
    if (configSentry[sentryEnvironment]) {
      configSentry = deepmerge(configSentry, configSentry[sentryEnvironment])
    }
  }

  configSentry.enabled = !!configSentry.enabled && !!sentryEnvironment

  const publicEnv = {
    NODE_ENV: isProduction ? 'production' : 'development',
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
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry: { bundle: './src/index' },
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
            name: 'clip',
            priority: 5,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\]system/.test(context),
          },
          base: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${configBuild.fixedChunksPackages.find(chunkInContext(context))}`,
            priority: 4,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('tailwind'),
          },
          primary: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${configBuild.fixedChunksPackages.find(chunkInContext(context))}`,
            priority: 3,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('semantic'),
          },
          secondary: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'pkg-$1'),
            priority: 2,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\](images|form|ui)[/\\]/.test(context),
          },
          vendors: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${configBuild.fixedChunksPackages.find(chunkInContext(context))}`,
            priority: 1.1,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && configBuild.fixedChunksPackages.some(chunkInContext(context)),
          },
          node_modules: {
            chunks: 'all',
            enforce: true,
            name: 'vendors',
            priority: 1,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('node_modules'),
          },
          pkg: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'pkg-$1'),
            priority: 0,
            reuseExistingChunk: true,
            test: ({ context }) => !!context && /[/\\]src[/\\]packages[/\\]/.test(context),
          },
          common: {
            chunks: 'async',
            minChunks: 2,
            name: 'common',
            priority: 0,
            reuseExistingChunk: true,
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
      publicPath,
    },
    plugins: [
      // DefinePlugin should be the first one
      new webpack.DefinePlugin({
        process: JSON.stringify({ env: publicEnv }),
        FEATURES_FLAGS: JSON.stringify(getFeaturesFlags(process.env.NODE_ENV)),
        SYSTEM: JSON.stringify(SYSTEM),
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
      new LodashModuleReplacementPlugin({ shorthands: true }),
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
      !isProduction && new ReactRefreshWebpackPlugin(),
      isProduction
        && new InjectManifest({
          exclude: [
            /\.DS_Store$/,
            /\.gitignore$/,
            /\.map$/,
            /\.txt$/,
            /asset-manifest\.json$/,
            /indexTemplate\.html$/,
            /Thumbs\.db$/,
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
          release: SYSTEM.version,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        'core-js/es6': 'core-js/es',
        'core-js/library/fn': 'core-js/features',
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass'],
      modules: [common.appEntry, common.packages, common.appNodeModules],
    },
  }
}
