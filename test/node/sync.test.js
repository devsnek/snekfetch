/**
 * @jest-environment node
 */

/* global test expect */

const { SnekSync, TestRoot } = require('../interop');

test('sync get', () => {
  const res = SnekSync.get(`${TestRoot}/get`).end();
  expect(res.body).not.toBeUndefined();
});
