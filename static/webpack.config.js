module.exports = [
  {
    mode: process.env.NODE_ENV,
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
    mode: process.env.NODE_ENV,
    entry: {
      worker: './static/worker'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    }
  }
]
