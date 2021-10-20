/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const projectRoot = path.resolve(__dirname, './')
const appConfig = path.join(projectRoot, 'config')
const appDist = path.join(projectRoot, 'dist')
const appEntry = path.join(projectRoot, 'src')
const appNodeModules = path.join(projectRoot, 'node_modules')
const packages = path.join(appEntry, 'packages')
const publicPath = '/'

const common = {
  appConfig,
  appDist,
  appEntry,
  appNodeModules,
  outputPath: path.join(appDist, 'public'),
  packages,
  projectRoot,
  staticPath: path.join(projectRoot, 'static'),
}
const fixedChunks = [
  'core-js',
  'emoji-mart',
  'gsap',
  'd3',
  'i18next',
  'lodash',
  'moment',
  'react-dom',
  'react',
  'react-router-dom',
  'recharts',
  'rxjs',
  'sentry',
  'tailwind',
  'semantic',
  'rc-',
]
const chunkInContext = (context) => (chunk) =>
  !!context &&
  (context.includes(`/${chunk}`) ||
    context.includes(`/@${chunk}`) ||
    context.includes(`\\${chunk}`) ||
    context.includes(`\\@${chunk}`))

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
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    argv.mode === 'production' ||
    argv.nodeEnv === 'production'
  const useStats = !!argv.stats
  const showProgress = !!argv.progress

  process.env.NODE_ENV = isProduction ? 'production' : 'development'

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
      port: 7070,
      static: {
        directory: common.staticPath,
      },
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry: { bundle: './src/index' },
    module: {
      rules: [
        {
          exclude: [common.packages],
          include: [common.appConfig, common.appEntry, common.appNodeModules],
          test: /\.s?[ac]ss$/i,
          use: globalCSSLoaders(isProduction),
        },
        {
          include: [packages],
          test: /\.s?[ac]ss$/i,
          use: globalCSSLoaders(isProduction, true),
        },
        {
          exclude: [common.appNodeModules],
          loader: 'ts-loader',
          test: /\.[jt]sx?$/,
        },
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/',
            publicPath,
          },
          test: /\.(jpe?g|png|gif|svg)$/i,
        },
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
            publicPath,
          },
          test: /\.(woff(2)?|eot|ttf|otf)$/,
        },
      ],
    },
    optimization: {
      chunkIds: 'named',
      emitOnErrors: false,
      minimize: isProduction,
      minimizer: [
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
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
            test: ({ context }) =>
              !!context && /[/\\]src[/\\]packages[/\\]app[/\\]src[/\\]App/.test(context),
          },
          base: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${fixedChunks.find(chunkInContext(context))}`,
            priority: 4,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('tailwind'),
          },
          primary: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${fixedChunks.find(chunkInContext(context))}`,
            priority: 3,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && context.includes('semantic'),
          },
          secondary: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) =>
              context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'pkg-$1'),
            priority: 2,
            reuseExistingChunk: false,
            test: ({ context }) =>
              !!context && /[/\\]src[/\\]packages[/\\](images|form|ui)[/\\]/.test(context),
          },
          vendors: {
            chunks: 'all',
            enforce: true,
            name: ({ context }) => `vendors-${fixedChunks.find(chunkInContext(context))}`,
            priority: 1.1,
            reuseExistingChunk: false,
            test: ({ context }) => !!context && fixedChunks.some(chunkInContext(context)),
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
            name: ({ context }) =>
              context.replace(/.+[\\/]src[\\/]packages[\\/]([^\\/]+)[\\/].+/, 'pkg-$1'),
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
      isProduction &&
        new CopyWebpackPlugin({
          patterns: [{ from: common.staticPath, to: '' }],
        }),
      new HtmlWebpackPlugin({
        cache: true,
        favicon: path.join(common.staticPath, 'favicon.ico'),
        filename: 'index.html',
        template: path.join(common.staticPath, 'indexTemplate.html'),
      }),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
      new LodashModuleReplacementPlugin(),
      useStats &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          defaultSizes: 'parsed',
          openAnalyzer: false,
          reportFilename: path.join(
            common.appDist,
            `bundleAnalyzer${isProduction ? 'Prod' : 'Dev'}.html`,
          ),
        }),
      new MiniCssExtractPlugin({
        chunkFilename: 'css/[name].[contenthash].css',
        filename: 'css/[name].[contenthash].css',
        ignoreOrder: true,
      }),
      !isProduction && new ReactRefreshWebpackPlugin(),
      showProgress &&
        new webpack.ProgressPlugin({
          activeModules: true,
          entries: true,
          modules: true,
          modulesCount: 1,
          profile: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {},
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass'],
      modules: [common.appEntry, common.packages, common.appNodeModules],
    },
  }
}
