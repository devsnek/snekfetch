const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    library: 'Snekfetch',
    libraryTarget: 'window',
  },
  plugins: [
    new UglifyJSPlugin()
  ],
};
