// const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    library: 'Snekfetch',
    libraryTarget: 'window',
  },
  plugins: [
    new UglifyJSPlugin(),
  ],
  resolve: {
    alias: {
      querystring: require.resolve('./src/qs_mock'),
    },
  },
};
