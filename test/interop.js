'use strict';

exports.Snekfetch = require('../');

try {
  exports.SnekfetchSync = require('../sync');
} catch (err) {} // eslint-disable-line no-empty

exports.TestRoot = global.HTTP_VERSION === 2 ?
  'https://nghttp2.org/httpbin' :
  'https://httpbin.org';

