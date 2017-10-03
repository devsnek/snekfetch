const zlib = require('zlib');
const qs = require('querystring');
const http = require('http');
const https = require('https');
const URL = require('url');
const Stream = require('stream');
const FormData = require('./FormData');

const transports = {
  http,
  https,
  file: require('./transports/file'),
  http2: require('./transports/http2'),
};

function buildRequest(method, url) {
  const options = URL.parse(url);
  if (!options.protocol) throw new Error('URL must have a valid protocol');
  const transport = this.options.version === 2 ? transports.http2 : transports[options.protocol.replace(':', '')];
  options.method = method.toUpperCase();
  if (this.options.headers) options.headers = this.options.headers;
  if (this.options.agent) {
    options.agent = this.options.agent;
  } else if (transport.Agent && this.options.followRedirects !== false) {
    options.agent = new transport.Agent({ keepAlive: true });
  }
  this.options._req = options;
  const request = transport.request(options);
  return request;
}

function finalizeRequest({ data }) {
  return new Promise((resolve, reject) => {
    const request = this.request;

    let socket;

    const handleError = (err) => {
      if (!err) err = new Error('Unknown error occured');
      err.request = request;
      reject(err);
      if (socket) socket.removeListener('error', handleError);
    };

    request.once('abort', handleError);
    request.once('error', handleError);
    request.once('socket', (s) => {
      socket = s;
      s.once('error', handleError);
    });

    request.once('response', (response) => {
      if (socket) socket.removeListener('error', handleError);
      let stream = response;
      if (this._shouldUnzip(response)) {
        stream = response.pipe(zlib.createUnzip({
          flush: zlib.Z_SYNC_FLUSH,
          finishFlush: zlib.Z_SYNC_FLUSH,
        }));
      }

      const body = [];

      stream.on('data', (chunk) => {
        if (this.options.version !== 2) if (!this.push(chunk)) this.pause();
        body.push(chunk);
      });

      stream.once('end', () => {
        if (this.options.version === 2) for (const item of body) this.push(item);
        this.push(null);
        const raw = Buffer.concat(body);

        let redirect = false;
        if (this._shouldRedirect(response)) {
          redirect = /^https?:\/\//i.test(response.headers.location) ?
            response.headers.location :
            URL.resolve(makeURLFromRequest(request), response.headers.location);
        }
        resolve({ response, raw, redirect });
      });
    });

    this._addFinalHeaders();
    if (this.request.query) this.request.path = `${this.request.path}?${qs.stringify(this.request.query)}`;
    if (Array.isArray(data)) {
      for (const chunk of data) request.write(chunk);
      request.end();
    } else if (data instanceof Stream) {
      data.pipe(request);
    } else if (data instanceof Buffer) {
      this.set('Content-Length', Buffer.byteLength(data));
      request.end(data);
    } else {
      request.end(data);
    }
  });
}

function shouldSendRaw(data) {
  return data instanceof Buffer || data instanceof Stream;
}

function makeURLFromRequest(request) {
  return URL.format({
    protocol: request.connection.encrypted ? 'https:' : 'http:',
    hostname: request.getHeader('host'),
    pathname: request.path.split('?')[0],
    query: request.query,
  });
}


module.exports = {
  buildRequest, finalizeRequest, shouldSendRaw,
  METHODS: http.METHODS,
  STATUS_CODES: http.STATUS_CODES,
  FormData,
  extension: Stream.Readable,
};
