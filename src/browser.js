function buildRequest(method, url, options) {
  this.request = fetch(url, {
    method, headers: options.headers,
  });
}

function finalizeRequest() {
  return true;
}

function shouldSendRaw() {
  return false;
}

module.exports = {
  buildRequest, finalizeRequest, shouldSendRaw,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  FormData: window.FormData,
};
