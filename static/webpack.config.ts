import * as webpack from 'webpack'

const mode = (process.env.NODE_ENV || 'production') as 'development' | 'production'

const config: webpack.Configuration[] = [
  {
    mode,
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
    mode,
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
]

export default config
