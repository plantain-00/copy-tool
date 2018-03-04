const webpack = require('webpack')

module.exports = [
  {
    entry: {
      index: './static/index'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all'
          }
        }
      }
    }
  },
  {
    entry: {
      worker: './static/worker'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    }
  }
]
