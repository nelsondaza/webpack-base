const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack');

const projectRoot = path.resolve(__dirname, './')
const appDist = path.join(projectRoot, 'dist')
const appEntry = path.join(projectRoot, 'src')
const appConfig = path.join(projectRoot, 'config')
const packages = path.join(appEntry, 'packages')
const appNodeModules = path.join(projectRoot, 'node_modules')

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

const capitalize = (result, word) => result + word.charAt(0).toUpperCase() + word.slice(1)

const globalCSSLoaders = (isProduction, useModules = false) => [
  isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
  {
    loader: 'css-loader',
    options: {
      importLoaders: 3,
      modules: useModules ? {
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
      } : undefined,
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
  const isProduction = process.env.NODE_ENV === 'production' || argv.mode === 'production'
  process.env.NODE_ENV = isProduction ? 'production' : 'development'

  return {
    devServer: {
      hot: true,
      'static': {
        directory: common.staticPath,
      }
    },
    entry: [
      './src/index'
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: [{ loader: 'babel-loader', options: { plugins: isProduction ? [] : ['react-refresh/babel'] } }],
          exclude: /node_modules/
        },
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
          test: /\.ts(x)?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.svg$/,
          use: 'file-loader'
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                mimetype: 'image/png'
              }
            }
          ]
        }
      ]
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    output: {
      path: common.outputPath,
      filename: '[name].[contenthash].js'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{from: common.staticPath, to: ''}],
      }),
      new HtmlWebpackPlugin({
        cache: true,
        favicon: path.join(common.staticPath, 'favicon.ico'),
        filename: 'index.html',
        template: path.join(common.staticPath, 'indexTemplate.html'),
      }),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      new LodashModuleReplacementPlugin,
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new MiniCssExtractPlugin(),
      !isProduction && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {},
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass'],
      modules: [common.appEntry, common.packages, common.appNodeModules],
    },
  }
};
