const fs = require('fs');
const path = require('path');
const mime = require('./mime');
const EventEmitter = require('events');
const Stream = require('stream');

class Stream404 extends Stream.Readable {
  constructor() {
    super();
    this.statusCode = 404;
  }

  on(event, handler) {
    if (['end', 'open'].includes(event)) handler();
  }

  _read() {}
}

function request(options) {
  const createStream = options.method === 'GET' ? fs.createReadStream : fs.createWriteStream;

  const filename = options.href.replace('file://', '');

  const req = new EventEmitter();
  req._headers = {};
  req.setHeader = () => {}; // eslint-disable-line no-empty-function
  req.end = () => {
    const stream = should404(filename) ? new Stream404() : createStream(filename);
    req.res = stream;
    stream.headers = {
      'content-length': 0,
      'content-type': mime.lookup(path.extname(filename)),
    };
    stream.on('open', () => {
      req.emit('response', stream);
    });
    if (stream instanceof Stream404) return;
    stream.statusCode = 200;
    stream.on('end', () => {
      stream.headers['content-length'] = stream.bytesRead;
    });
  };
  return req;
}

function should404(p) {
  try {
    return fs.lstatSync(p).isDirectory();
  } catch (err) {
    return true;
  }
}

module.exports = {
  request,
};
