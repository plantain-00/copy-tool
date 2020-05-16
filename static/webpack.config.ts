import * as webpack from 'webpack'

export default [
  {
    mode: process.env.NODE_ENV || 'production',
    entry: {
      index: './static/index.ts'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' }
      ]
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
    mode: process.env.NODE_ENV || 'production',
    entry: {
      worker: './static/worker.ts'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' }
      ]
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    }
  }
] as webpack.Configuration[]
