const rules = require('./webpack.rules');
const CopyPlugin = require("copy-webpack-plugin");
const {
    EnvironmentPlugin
  } = require("webpack");

rules.push({
    test: /\.css$/,
    use: [{
        loader: 'style-loader'
    }, {
        loader: 'css-loader'
    }],
});

rules.push({
    test: /\.js?$/,
    exclude: /node_modules/,
    use: [{
        loader: 'babel-loader',
    }]
});

rules.push({
    test: /\.(js|jsx)$/,
    use: 'react-hot-loader/webpack',
    include: /node_modules/
})
const assets = ['assets', 'icons', 'png'];
module.exports = {
    // Put your normal webpack config below here
    module: {
        rules,
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: "src/assets",
                to: "assets"
            }, ],
        }),
        new EnvironmentPlugin({
            ...require('dotenv').config().parsed
        }),
    ],
};