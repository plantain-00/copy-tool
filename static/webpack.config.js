const webpack = require('webpack')

module.exports = [
  {
    entry: {
      index: './static/index',
      vendor: './static/vendor'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        output: {
          comments: false
        },
        exclude: [
        ]
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: ['index', 'vendor']
      })
    ]
  },
  {
    entry: {
      worker: './static/worker'
    },
    output: {
      filename: 'static/[name].bundle.js'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        output: {
          comments: false
        },
        exclude: [
        ]
      })
    ]
  }
]
