/* global test expect beforeAll afterAll */

const Snekfetch = require('../');

const server = require('./server');

test('should return a promise', () => {
  expect(Snekfetch.get('https://httpbin.org/get').end())
    .toBeInstanceOf(Promise);
});

test('should reject with error on network failure', () => {
  const invalid = 'http://localhost:6969';
  /* https://gc.gy/❥ȗ.png
   return expect(Snekfetch.get(invalid).end())
    .rejects.toBeInstanceOf(Error);*/
  return Snekfetch.get(invalid).catch((err) => {
    expect(err.name).toMatch(/(Fetch)?Error/);
  });
});

test('should resolve on success', () =>
  Snekfetch.get('https://httpbin.org/anything').then((res) => {
    expect(res.body.method).toBe('GET');
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res).toHaveProperty('text');
    expect(res).toHaveProperty('body');
  })
);

test('end should work', () =>
  Snekfetch.get('https://httpbin.org/anything').end((err, res) => {
    expect(err).toBe(null);
    expect(res.body).not.toBeUndefined();
  })
);

test('should reject if response is not between 200 and 300', () =>
  Snekfetch.get('https://httpbin.org/404').catch((err) => {
    expect(err.status).toBe(404);
    expect(err.ok).toBe(false);
  })
);

test('query should work', () =>
  Snekfetch.get('https://httpbin.org/get?inline=true')
    .query({ test: 1, hello: 'world' })
    .then((res) => {
      const { args } = res.body;
      expect(args).not.toBeUndefined();
      expect(args.inline).toBe('true');
      expect(args.test).toBe('1');
      expect(args.hello).toBe('world');
    })
);

test('set should work', () =>
  Snekfetch.get('https://httpbin.org/get')
    .set({ Test: 1, Hello: 'world' })
    .then((res) => {
      const { headers } = res.body;
      expect(headers).not.toBeUndefined();
      expect(headers.Test).toBe('1');
      expect(headers.Hello).toBe('world');
    })
);

test('attach should work', () =>
  Snekfetch.post('https://httpbin.org/post')
    .attach('test', '1')
    .attach('hello', 'world')
    .then((res) => {
      const { form } = res.body;
      expect(form).not.toBeUndefined();
      expect(form.test).toBe('1');
      expect(form.hello).toBe('world');
    })
);

test('send should work with json', () =>
  Snekfetch.post('https://httpbin.org/post')
    .send({ test: 1, hello: 'world' })
    .then((res) => {
      const { json } = res.body;
      expect(json).not.toBeUndefined();
      expect(json.test).toBe(1);
      expect(json.hello).toBe('world');
    })
);

test('send should work with urlencoded', () =>
  Snekfetch.post('https://httpbin.org/post')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({ test: 1, hello: 'world' })
    .then((res) => {
      const { form } = res.body;
      expect(form).not.toBeUndefined();
      expect(form.test).toBe('1');
      expect(form.hello).toBe('world');
    })
);

test('invalid json is just text', () =>
  Snekfetch.get(`http://localhost:${server.port}/invalid-json`)
    .then((res) => {
      expect(res.body).toBe('{ "a": 1');
    })
);

test('x-www-form-urlencoded response body', () =>
  Snekfetch.get(`http://localhost:${server.port}/form-urlencoded`)
    .then((res) => {
      const { body } = res;
      expect(body.test).toBe('1');
      expect(body.hello).toBe('world');
    })
);

test('redirects', () =>
  Snekfetch.get('https://httpbin.org/redirect/5')
    .then((res) => {
      expect(res.body).not.toBeUndefined();
      expect(res.body.url).toBe('https://httpbin.org/get');
    })
);
