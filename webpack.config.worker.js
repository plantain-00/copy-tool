const webpack = require("webpack");

module.exports = {
    entry: {
        worker: "./static/worker",
        "service-worker": "./static/service-worker"
    },
    output: {
        filename: "static/[name].bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        })
    ]
};
