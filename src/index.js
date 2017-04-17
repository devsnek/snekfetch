// next-tick requiring stream so that by the time i actually need it webpack has processed the
// Readable and PassThrough exports
require('stream');
const browser = require('os').platform() === 'browser';
const http = require('http');
const https = require('https');
const URL = require('url');
const zlib = require('zlib');
const Stream = require('stream');
const FormData = require('./FormData');
const Package = require('../package.json');

class Snekfetch extends Stream.Readable {
  constructor(method, url, { data, headers } = { data: null, headers: {} }) {
    super();
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = headers;
    this.data = data;
    this.spent = false;
  }

  set(name, value) {
    if (name !== null && typeof name === 'object') {
      for (const key of Object.keys(name)) this.set(key, name[key]);
    } else {
      this.headers[name] = value;
    }
    return this;
  }

  attach(name, data, filename) {
    const form = this._getFormData();
    this.set('Content-Type', `multipart/form-data; boundary=${form.boundary}`);
    form.append(name, data, filename);
    this.data = form;
    return this;
  }

  send(data) {
    if (typeof data === 'object') {
      this.set('Content-Type', 'application/json');
      this.data = JSON.stringify(data);
    } else {
      this.data = data;
    }
    return this;
  }

  then(resolver = pass, rejector = pass) {
    if (this.spent) return Promise.reject(new Error('Request has been spent!'));
    return new Promise((resolve, reject) => {
      this.spent = true;
      if (!this.headers['user-agent'] && !this.headers['User-Agent'] && !this.headers['User-agent']) {
        this.set('user-agent', `snekfetch/${Snekfetch.version} (${Package.repository.url.replace(/\.?git/, '')})`);
      }
      if (this.method !== 'HEAD') this.set('Accept-Encoding', 'gzip, deflate');

      const options = URL.parse(this.url);
      options.method = this.method;
      options.headers = this.headers;

      const request = (options.protocol === 'https:' ? https : http)
      .request(options, (response) => {
        response.request = request;
        const stream = new Stream.PassThrough();
        if (this._shouldUnzip(response)) {
          response.pipe(zlib.createUnzip({
            flush: zlib.Z_SYNC_FLUSH,
            finishFlush: zlib.Z_SYNC_FLUSH,
          })).pipe(stream);
        } else {
          response.pipe(stream);
        }

        let body = [];

        stream.on('data', (chunk) => {
          if (!this.push(chunk)) this.pause();
          body.push(chunk);
        });

        stream.on('end', () => {
          this.push(null);
          const concated = Buffer.concat(body);

          if (this._shouldRedirect(response)) {
            if ([301, 302].includes(response.statusCode)) {
              this.method = this.method === 'HEAD' ? 'HEAD' : 'GET';
              this.data = null;
            }

            if (response.statusCode === 303) this.method = 'GET';
            resolve(new Snekfetch(
              this.method,
              URL.resolve(this.url, response.headers.location)),
              { data: this.data, headers: this.headers }
            );
            return;
          }

          const res = {
            request: this.options,
            body: concated,
            text: concated.toString(),
            ok: response.statusCode >= 200 && response.statusCode < 300,
            headers: response.headers,
            status: response.statusCode,
            statusText: response.statusText || http.STATUS_CODES[response.statusCode],
            url: this.url,
          };

          const type = response.headers['content-type'];
          if (type) {
            if (type.includes('application/json')) {
              try {
                res.body = JSON.parse(res.text);
              } catch (err) {} // eslint-disable-line no-empty
            } else if (type.includes('application/x-www-form-urlencoded')) {
              res.body = {};
              for (const [k, v] of res.text.split('&').map(q => q.split('='))) res.body[k] = v;
            }
          }

          if (res.ok) {
            resolve(res);
          } else {
            const err = new Error(`${res.status} ${res.statusText}`.trim());
            Object.assign(err, res);
            reject(err);
          }
        });
      });

      function handleError(err) {
        if (!err) err = new Error('Unknown error occured');
        err.request = request;
        reject(err);
      }

      request.on('abort', handleError);
      request.on('aborted', handleError);
      request.on('error', handleError);

      request.end(this.data ? this.data.end ? this.data.end() : this.data : null);
    })
    .then(resolver, rejector);
  }

  end(cb) {
    return this.then(
      (res) => cb ? cb(null, res) : res,
      (err) => cb ? cb(err, err.status ? err : null) : err
    );
  }

  catch(f) {
    return this.then(null, f);
  }

  _read() {
    this.resume();
    if (this.spent) return;
    this.then().catch(() => {}); // eslint-disable-line no-empty-function
  }

  _shouldUnzip(res) {
    if (res.statusCode === 204 || res.statusCode === 304) return false;
    if (res.headers['content-length'] === '0') return false;
    return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
  }

  _shouldRedirect(res) {
    return [301, 302, 303, 307, 308].includes(res.statusCode);
  }

  _getFormData() {
    if (!this._formData) this._formData = new FormData();
    return this._formData;
  }
}

Snekfetch.version = Package.version;

Snekfetch.METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'BREW'];
for (const method of Snekfetch.METHODS) Snekfetch[method.toLowerCase()] = (url) => new Snekfetch(method, url);

module.exports = Snekfetch;
if (browser) window.Snekfetch = Snekfetch;

function pass(x) { return x; }
