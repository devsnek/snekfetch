'use strict';

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: require.resolve('.'),
  output: {
    filename: 'browser.js',
    library: 'Snekfetch',
    libraryTarget: 'umd',
  },
  plugins: [
    new UglifyJSPlugin(),
  ],
};
