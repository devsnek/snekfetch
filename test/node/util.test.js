/* global test expect */

const FormData = require('../../src/node/FormData');
const mime = require('../../src/node/mime');

test('node/FormData behaves predictably', () => {
  const f = new FormData();
  f.append('hello', 'world');
  expect(f.length).toBe(77);
});

test('node/mimes behaves predictably', () => {
  expect(mime.lookup('js')).toBe('application/javascript');
  expect(mime.lookup('nope')).toBe('application/octet-stream');
});
