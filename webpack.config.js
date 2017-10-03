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
    /*
    new webpack.DefinePlugin({
      'process.env': {
        SREPO: `"${meta.repo}"`,
        SVERSION: `"${meta.version}"`,
      },
    }),
    */
  ],
};
