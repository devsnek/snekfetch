'use strict';

/* eslint-env browser */

window.fetch = require('node-fetch');
window.URLSearchParams = require('url').URLSearchParams;
window.FormData = require('form-data');
window.TextDecoder = require('util').TextDecoder;

const { Snekfetch, TestRoot } = require('../interop');

require('../main');

test('arraybuffer evil works', () =>
  Snekfetch.get(`${TestRoot}/get`, { responseType: 'arraybuffer' })
    .then((res) => {
      expect(res.body.url).toContain('/get');
    }));
