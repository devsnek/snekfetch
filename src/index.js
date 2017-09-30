const browser = typeof window !== 'undefined';
const qs = require('querystring');
const Package = require('../package.json');
const transport = browser ? require('./browser') : require('./node');

/**
 * Snekfetch
 * @extends Stream.Readable
 * @extends Promise
 */
class Snekfetch extends (transport.extension || Object) {
  /**
   * Create a request, but you probably wanna use `snekfetch#method`
   * @param {string} method HTTP method
   * @param {string} url URL
   * @param {Object} opts Options
   * @param {Object} [opts.headers] Headers to initialize the request with
   * @param {Object|string|Buffer} [opts.data] Data to initialize the request with
   * @param {string|Object} [opts.query] Query to intialize the request with
   */
  constructor(method, url, opts = { headers: null, data: null, query: null, version: 1 }) {
    super();
    this.options = opts;
    this.request = transport.buildRequest.call(this, method, url, opts);
    if (opts.query) this.query(opts.query);
    if (opts.data) this.send(opts.data);
  }

  /**
   * Add a query param to the request
   * @param {string|Object} name Name of query param or object to add to query
   * @param {string} [value] If name is a string value, this will be the value of the query param
   * @returns {Snekfetch} This request
   */
  query(name, value) {
    if (this.response) throw new Error('Cannot modify query after being sent!');
    if (!this.request.query) this.request.query = browser ? new URLSearchParams() : {};
    if (name !== null && typeof name === 'object') {
      for (const [k, v] of Object.entries(name)) this.query(k, v);
    } else if (browser) {
      this.request.query.set(name, value);
    } else {
      this.request.query[name] = value;
    }
    return this;
  }

  /**
   * Add a header to the request
   * @param {string|Object} name Name of query param or object to add to headers
   * @param {string} [value] If name is a string value, this will be the value of the header
   * @returns {Snekfetch} This request
   */
  set(name, value) {
    if (this.response) throw new Error('Cannot modify headers after being sent!');
    if (name !== null && typeof name === 'object') {
      for (const key of Object.keys(name)) this.set(key, name[key]);
    } else {
      this.request.setHeader(name, value);
    }
    return this;
  }

  /**
   * Attach a form data object
   * @param {string} name Name of the form attachment
   * @param {string|Object|Buffer} data Data for the attachment
   * @param {string} [filename] Optional filename if form attachment name needs to be overridden
   * @returns {Snekfetch} This request
   */
  attach(name, data, filename) {
    if (this.response) throw new Error('Cannot modify data after being sent!');
    const form = this._getFormData();
    this.set('Content-Type', `multipart/form-data; boundary=${form.boundary}`);
    form.append(name, data, filename);
    this.data = form;
    return this;
  }

  /**
   * Send data with the request
   * @param {string|Buffer|Object} data Data to send
   * @returns {Snekfetch} This request
   */
  send(data) {
    if (this.response) throw new Error('Cannot modify data after being sent!');
    if (transport.shouldSendRaw(data)) {
      this.data = data;
    } else if (data !== null && typeof data === 'object') {
      const header = this._getRequestHeader('content-type');
      let serialize;
      if (header) {
        if (header.includes('json')) serialize = JSON.stringify;
        else if (header.includes('urlencoded')) serialize = qs.stringify;
      } else {
        this.set('Content-Type', 'application/json');
        serialize = JSON.stringify;
      }
      this.data = serialize(data);
    } else {
      this.data = data;
    }
    return this;
  }

  then(resolver, rejector) {
    return transport.finalizeRequest.call(this, {
      data: this.data ? this.data.end ? this.data.end() : this.data : null,
    })
      .then(({ response, raw, redirect, headers }) => {
        if (redirect) {
          let method = this.request.method;
          if ([301, 302].includes(response.statusCode)) {
            if (method !== 'HEAD') method = 'GET';
            this.data = null;
          } else if (response.statusCode === 303) {
            method = 'GET';
          }

          const redirectHeaders = {};
          if (this.request._headerNames) {
            for (const name of Object.keys(this.request._headerNames)) {
              if (name.toLowerCase() === 'host') continue;
              redirectHeaders[this.request._headerNames[name]] = this.request._headers[name];
            }
          } else {
            for (const name of Object.keys(this.request._headers)) {
              if (name.toLowerCase() === 'host') continue;
              const header = this.request._headers[name];
              redirectHeaders[header.name] = header.value;
            }
          }

          return new Snekfetch(method, redirect, {
            data: this.data,
            headers: redirectHeaders,
            agent: this.options._req.agent,
          });
        }

        const statusCode = response.statusCode || response.status;
        /**
         * @typedef {Object} SnekfetchResponse
         * @prop {HTTP.Request} request
         * @prop {?string|object|Buffer} body Processed response body
         * @prop {string} text Raw response body
         * @prop {boolean} ok If the response code is >= 200 and < 300
         * @prop {number} status HTTP status code
         * @prop {string} statusText Human readable HTTP status
         */
        const res = {
          request: this.request,
          get body() {
            delete res.body;
            const type = this.headers['content-type'];
            if (type && type.includes('application/json')) {
              try {
                res.body = JSON.parse(res.text);
              } catch (err) {
                res.body = res.text;
              }
            } else if (type && type.includes('application/x-www-form-urlencoded')) {
              res.body = qs.parse(res.text);
            } else {
              res.body = raw;
            }

            return res.body;
          },
          text: raw.toString(),
          ok: statusCode >= 200 && statusCode < 400,
          headers: headers || response.headers,
          status: statusCode,
          statusText: response.statusText || transport.STATUS_CODES[response.statusCode],
        };

        if (res.ok) {
          return res;
        } else {
          const err = new Error(`${res.status} ${res.statusText}`.trim());
          Object.assign(err, res);
          return Promise.reject(err);
        }
      })
      .then(resolver, rejector);
  }

  catch(rejector) {
    return this.then(null, rejector);
  }

  /**
   * End the request
   * @param {Function} [cb] Optional callback to handle the response
   * @returns {Promise} This request
   */
  end(cb) {
    return this.then(
      (res) => cb ? cb(null, res) : res,
      (err) => cb ? cb(err, err.status ? err : null) : err
    );
  }

  _read() {
    this.resume();
    if (this.response) return;
    this.catch((err) => this.emit('error', err));
  }

  _shouldUnzip(res) {
    if (res.statusCode === 204 || res.statusCode === 304) return false;
    if (res.headers['content-length'] === '0') return false;
    return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
  }

  _shouldRedirect(res) {
    return this.options.followRedirects !== false && [301, 302, 303, 307, 308].includes(res.statusCode);
  }

  _getFormData() {
    if (!this._formData) this._formData = new transport.FormData();
    return this._formData;
  }

  _addFinalHeaders() {
    if (!this.request) return;
    if (!this._getRequestHeader('user-agent')) {
      this.set('User-Agent', `snekfetch/${Snekfetch.version} (${Package.repository.url.replace(/\.?git/, '')})`);
    }
    if (this.request.method !== 'HEAD') this.set('Accept-Encoding', 'gzip, deflate');
    if (this.data && this.data.end) this.set('Content-Length', this.data.length);
  }

  get response() {
    return this.request ? this.request.res || this.request._response || null : null;
  }

  _getRequestHeader(header) {
    // https://github.com/jhiesey/stream-http/pull/77
    try {
      return this.request.getHeader(header);
    } catch (err) {
      return null;
    }
  }
}

Snekfetch.version = Package.version;

Snekfetch.METHODS = transport.METHODS.concat('BREW');
for (const method of Snekfetch.METHODS) {
  Snekfetch[method === 'M-SEARCH' ? 'msearch' : method.toLowerCase()] = (url, opts) => new Snekfetch(method, url, opts);
}

module.exports = Snekfetch;
