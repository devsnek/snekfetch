/**
 * @jest-environment node
 */

'use strict';

global.HTTP_VERSION = 2;

if (process.version.split('.')[0].slice(1) >= 10)
  require('./main');
else
  test.skip('no http2 support', () => 1);
