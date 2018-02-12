window.URLSearchParams = require('url').URLSearchParams;

const mock = require('../../src/qs_mock');

test('stringify', () => {
  expect(mock.stringify({ a: 1, b: 'meme', c: true })).toEqual('a=1&b=meme&c=true');
});

test('parse', () => {
  expect(mock.parse('a=1&b=meme&c=true')).toEqual({ a: '1', b: 'meme', c: 'true' });
});
