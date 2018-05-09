'use strict';

module.exports = {
  mode: 'production',
  entry: require.resolve('.'),
  output: {
    filename: 'browser.js',
    library: 'Snekfetch',
    libraryTarget: 'umd',
  },
};
