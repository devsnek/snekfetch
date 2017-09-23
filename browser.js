const browser = require('./src/isBrowser');
const Snekfetch = require('./src/index.js');

module.exports = Snekfetch;

if (browser) {
  window.Snekfetch = Snekfetch;
} else {
  // eslint-disable-next-line no-console
  console.warn('Warning: Attempting to use browser version of Snekfetch in a non-browser environment!');
}
