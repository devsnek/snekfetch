function buildRequest(method, url, options) {
  return {
    url, method, options,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
  };
}

function finalizeRequest({ data }) {
  this._addFinalHeaders();
  if (this.request.query) {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(this.request.query)) query.set(k, v);
    this.request.url = `${this.request.url}?${query}`;
  }
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
