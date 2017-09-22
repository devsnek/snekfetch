const browser = typeof window !== 'undefined';
const webpack = !!process.env.__SNEKFETCH_WEBPACK__;

const Snekfetch = require('./src/index.js');

module.exports = Snekfetch;

if (browser && webpack) {
  window.Snekfetch = Snekfetch;
} else if (!browser) {
  // eslint-disable-next-line no-console
  console.warn('Warning: Attempting to use browser version of Snekfetch in a non-browser environment!');
}
