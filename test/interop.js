function makeProxy(fetch) {
  return new Proxy(fetch, {
    get(target, prop) {
      const p = target[prop];
      if (typeof p === 'function') {
        return (url, options = {}) =>
          p(url, Object.assign(options, { version: global.HTTP_VERSION }));
      }
    },
  });
}

exports.Snekfetch = makeProxy(require('../'));

Object.defineProperty(exports, 'SnekfetchSync', {
  configurable: true,
  get() {
    delete this.SnekfetchSync;
    this.SnekfetchSync = makeProxy(require('../sync'));
    return this.SnekfetchSync;
  },
});

exports.TestRoot = global.HTTP_VERSION === 2 ?
  'https://nghttp2.org/httpbin' :
  'https://httpbin.org';

