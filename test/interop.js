const Snekfetch = require('../');

exports.Snekfetch = new Proxy(Snekfetch, {
  get(target, prop) {
    const p = target[prop];
    if (typeof p === 'function') {
      return (url, options = {}) =>
        p(url, Object.assign(options, { version: global.HTTP_VERSION }));
    }
  },
});

exports.TestRoot = global.HTTP_VERSION === 2 ?
  'https://nghttp2.org/httpbin' :
  'https://httpbin.org';
