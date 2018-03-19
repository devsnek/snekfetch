/**
 * @jest-environment node
 */

'use strict';

global.HTTP_VERSION = 2;

const hasHttp2 = (() => {
  const [a, b, c] = process.version.split('.');
  return (+a.slice(1) * 0x1000) + (+b * 0x100) + +c >= 38912;
})();

if (hasHttp2)
  require('./main');
else
  test.skip('no http2 support', () => 1);
