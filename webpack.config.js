const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');

const capitalize = (result, word) => result + word.charAt(0).toUpperCase() + word.slice(1)

module.exports = (env, argv) => {
  const isProduction = process.env.NODE_ENV === 'production' || argv.mode === 'production'
  process.env.NODE_ENV = isProduction ? 'production' : 'development'

  return {
    devServer: {
      'static': {
        directory: path.resolve(__dirname, 'static'),
      }
    },
    entry: [
      'react-hot-loader/patch',
      './src/index'
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
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
                },
                sourceMap: !isProduction,
              },
            },
            'postcss-loader'
          ]
        },
        {
          test: /\.ts(x)?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
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
                },
                sourceMap: !isProduction,
              },
            },
            'sass-loader'
          ]
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
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{from: path.join(path.resolve(__dirname, 'static')), to: ''}],
      }),
      new HtmlWebpackPlugin({
        cache: true,
        favicon: path.join(path.resolve(__dirname, 'static'), 'favicon.ico'),
        filename: 'index.html',
        template: path.join(path.resolve(__dirname, 'static'), 'indexTemplate.html'),
      }),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      new LodashModuleReplacementPlugin,
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new MiniCssExtractPlugin()
    ],
    resolve: {
      extensions: [
        '.tsx',
        '.ts',
        '.js'
      ],
      alias: {
        'react-dom': '@hot-loader/react-dom'
      }
    },
  }
};
