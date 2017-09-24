function buildRequest(method, url) {
  return {
    url, method,
    redirect: this.options.followRedirects ? 'follow' : 'manual',
    _headers: {},
    setHeader(name, value) {
      this._headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this._headers[name.toLowerCase()];
    },
  };
}

function finalizeRequest({ data }) {
  this._addFinalHeaders();
  if (this.request.query) this.request.url = `${this.request.url}?${this.request.query}`;
  if (data) this.request.body = data;
  return fetch(this.request.url, this.request)
    .then((r) => r.text().then((t) => {
      const headers = {};
      for (const [k, v] of r.headers) headers[k.toLowerCase()] = v;
      return { response: r, raw: t, headers };
    }));
}

function shouldSendRaw() {
  return false;
}

module.exports = {
  buildRequest, finalizeRequest, shouldSendRaw,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  STATUS_CODES: {},
  FormData: window.FormData,
};
