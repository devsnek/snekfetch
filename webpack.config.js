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
  module: {
    rules: [
      {
        test: require.resolve('./package.json'),
        use: {
          loader: 'json-filter-loader',
          options: {
            used: ['name', 'homepage'],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      querystring: require.resolve('./src/qs_mock'),
    },
  },
};
