const browser = typeof window !== 'undefined';

let fetch;
let FormData;
if (browser) {
  fetch = window.fetch; // eslint-disable-line no-undef
  FormData = window.FormData; // eslint-disable-line no-undef
} else {
  fetch = require('node-fetch');
  FormData = require('./FormData');
}

class Fetcher {
  constructor(method, url) {
    this.url = url;
    this.method = method.toUpperCase();
    this.headers = {};
    this.data = null;
  }

  set(name, value) {
    this.headers[name] = value;
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

  end(cb) {
    const recv = {
      text: '',
      body: {},
    };
    const data = this.data ? this.data.end ? this.data.end() : this.data : null;
    return fetch(this.url, {
      method: this.method,
      headers: this.headers,
      body: data,
    }).then((res) => {
      const ctype = res.headers.get('Content-Type');
      if (ctype.includes('application/json')) {
        return res.text().then((t) => {
          recv.text = t;
          recv.body = JSON.parse(t);
          return res;
        });
      } else if (ctype.includes('application/x-www-form-urlencoded')) {
        return res.text().then((t) => {
          recv.text = t;
          recv.body = parseWWWFormUrlEncoded(t);
          return res;
        });
      } else {
        return (browser ? res.arrayBuffer() : res.buffer())
        .then((b) => {
          if (b instanceof ArrayBuffer) b = convertToBuffer(b);
          recv.body = b;
          recv.text = b.toString();
          return res;
        });
      }
    })
    .then((res) => {
      const response = Object.assign({}, res);
      response.body = recv.body;
      response.text = recv.text;
      if (res.headers.raw) {
        Object.assign(response.headers, res.headers.raw());
      } else {
        for (const [name, value] of res.headers.entries()) response.headers[name] = value;
      }
      if (response.status > 400 && response.status < 600) return cb(response, response);
      return cb(null, response);
    })
    .catch((err) => {
      cb(err);
    });
  }

  then(s, f) {
    return new Promise((resolve, reject) => {
      this.end((err, res) => {
        if (err) reject(f ? f(err) : err);
        else resolve(s ? s(res) : res);
      });
    });
  }

  catch(f) {
    return this.then(null, f);
  }

  _getFormData() {
    if (!this._formData) this._formData = new FormData();
    return this._formData;
  }
}

const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'BREW'];
for (const method of methods) Fetcher[method.toLowerCase()] = (url) => new Fetcher(method, url);

Fetcher.version = require('../package').version;

module.exports = Fetcher;
if (browser) window.Fetcher = Fetcher;

function convertToBuffer(ab) {
  function str2ab(str) {
    const buffer = new ArrayBuffer(str.length * 2);
    const view = new Uint16Array(buffer);
    for (var i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
    return buffer;
  }

  if (typeof ab === 'string') ab = str2ab(ab);
  return Buffer.from(ab);
}

function parseWWWFormUrlEncoded(str) {
  const obj = {};
  for (const [k, v] of str.split('&').map(q => q.split('='))) obj[k] = v;
  return obj;
}
