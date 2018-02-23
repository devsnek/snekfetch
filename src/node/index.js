'use strict';

const zlib = require('zlib');
const { parse: UrlParse, resolve: UrlResolve } = require('url');
const socket = require('./socket');
const Stream = require('stream');
const querystring = require('querystring');
const { METHODS, STATUS_CODES } = require('http');
const Package = require('../../package');
const FormData = require('./FormData');

function request(snek, options = snek.options) {
  return new Promise(async (resolve, reject) => {
    Object.assign(options, UrlParse(options.url));

    if (!options.headers['user-agent'])
      options.headers['user-agent'] = `snekfetch/${Package.version} (${Package.homepage})`;

    let data = options.data;
    if (data && data.end)
      data = data.end();

    if (!options.headers['content-length']) {
      let length = 0;
      if (data) {
        try {
          length = Buffer.byteLength(data);
        } catch (err) {} // eslint-disable-line no-empty
      }
      options.headers['content-length'] = length;
    }

    let req;
    let http2 = false;
    try {
      if (options.connection) {
        req = socket.http2req(options.connection, options);
        http2 = true;
      } else {
        const O = await socket(options);
        req = O.req;
        if (O.http2)
          http2 = true;
        if (O.connection)
          options.connection = O.connection;
      }
    } catch (err) {
      reject(err);
      return;
    }

    req.on('error', reject);

    const body = [];
    let headers;
    let statusCode;
    let statusText;

    const handleResponse = (stream) => {
      if (statusCode === undefined)
        throw new Error('response timing error');
      if (options.redirect === 'follow' && [301, 302, 303, 307, 308].includes(statusCode)) {
        resolve(request(snek, {
          ...options,
          url: UrlResolve(options.url, headers.location),
        }));
        if (req.abort)
          req.abort();
        else if (req.close)
          req.close();
        return;
      }

      if (shouldUnzip(statusCode, headers)) {
        stream = stream.pipe(zlib.createUnzip({
          flush: zlib.Z_SYNC_FLUSH,
          finishFlush: zlib.Z_SYNC_FLUSH,
        }));
      }

      stream.on('data', (chunk) => {
        if (!snek.push(chunk))
          snek.pause();
        body.push(chunk);
      });

      stream.once('end', () => {
        snek.push(null);
        const raw = Buffer.concat(body);
        if (headers === undefined)
          throw new Error('response timing error');
        if (options.connection)
          options.connection.close();
        resolve({ raw, headers, statusCode, statusText });
      });
    };

    req.on('response', (res) => {
      if (!http2) {
        statusCode = res.statusCode;
        statusText = res.statusMessage || STATUS_CODES[statusCode];
        headers = res.headers;
        handleResponse(res);
      } else {
        statusCode = res[':status'];
        statusText = STATUS_CODES[statusCode];
        headers = res;
        handleResponse(req);
      }
    });

    if (data instanceof Stream)
      data.pipe(req);
    else if (data instanceof Buffer)
      req.write(data);
    else if (data)
      req.write(data);
    req.end();
  });
}

function shouldSendRaw(data) {
  return data instanceof Buffer || data instanceof Stream;
}

function shouldUnzip(statusCode, headers) {
  if (statusCode === 204 || statusCode === 304)
    return false;
  if (+headers['content-length'] === 0)
    return false;
  return /^\s*(?:deflate|gzip)\s*$/.test(headers['content-encoding']);
}

module.exports = {
  request,
  shouldSendRaw,
  querystring,
  METHODS,
  FormData,
  Parent: Stream.Readable,
};
