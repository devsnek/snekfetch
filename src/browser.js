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

function finalizeRequest() {
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
  FormData: window.FormData,
};
