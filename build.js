const Package = require('./package.json');
const browserify = require('browserify');
const envify = require('envify/custom');

const b = browserify({
  entries: ['./browser.js'],
  noParse: Object.entries(Package.browser)
    .filter(([, k]) => k === false)
    .map(([v]) => require.resolve(v)),
  transform: [
    envify({
      __SNEKFETCH_BROWSER_BUILD__: 'true',
    }),
  ],
});

b.bundle().pipe(process.stdout);

