/* global test expect */

const Snekfetch = require('../');

const server = require('./server');

const TestObj = exports.TestObj = { Hello: 'world', Test: 'yes' };
const TestObjTest = exports.TestObjTest = (obj) => {
  expect(obj).not.toBeUndefined();
  expect(obj.Hello).toBe('world');
  expect(obj.Test).toBe('yes');
};

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
    .query(TestObj)
    .then((res) => {
      const { args } = res.body;
      TestObjTest(args);
      expect(args.inline).toBe('true');
    })
);

test('set should work', () =>
  Snekfetch.get('https://httpbin.org/get')
    .set(TestObj)
    .then((res) => {
      const { headers } = res.body;
      TestObjTest(headers);
    })
);

test('attach should work', () =>
  Snekfetch.post('https://httpbin.org/post')
    .attach('Hello', TestObj.Hello)
    .attach('Test', TestObj.Test)
    .then((res) => {
      const { form } = res.body;
      TestObjTest(form);
    })
);

test('send should work with json', () =>
  Snekfetch.post('https://httpbin.org/post')
    .send(TestObj)
    .then((res) => {
      const { json } = res.body;
      TestObjTest(json);
    })
);

test('send should work with urlencoded', () =>
  Snekfetch.post('https://httpbin.org/post')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(TestObj)
    .then((res) => {
      const { form } = res.body;
      TestObjTest(form);
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
  Snekfetch.get('https://httpbin.org/redirect/1')
    .then((res) => {
      expect(res.body).not.toBeUndefined();
      expect(res.body.url).toBe('https://httpbin.org/get');
    })
);
