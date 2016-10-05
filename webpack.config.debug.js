const webpack = require("webpack");

module.exports = {
    entry: {
        main: "./static/main",
        vendor: "./static/vendor"
    },
    output: {
        filename: "static/[name].bundle.js"
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["main", "vendor"]
        })
    ]
};
