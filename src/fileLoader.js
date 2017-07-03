const fs = require('fs');
const path = require('path');
const mime = require('./mime');
const EventEmitter = require('events');

// class Emitter404 extends EventEmitter {
//   on(event) {
//     if (event === 'data') {
//       this.emit('open');
//       this.emit('end');
//     }
//   }
// }
// Emitter404.prototype.meme = true;

function request(options) {
  const createStream = options.method === 'GET' ? fs.createReadStream : fs.createWriteStream;

  const filename = options.href.replace('file://', '');

  const req = new EventEmitter();
  req._headers = {};
  req.setHeader = noop;
  req.end = () => {
    let stream = createStream(filename);
    stream.on('error', () => {
      req.emit('response', stream);
    });
    stream.statusCode = 200;
    req.res = stream;
    stream.headers = {
      'content-length': 0,
      'content-type': mime.lookup(path.extname(filename)),
    };
    stream.on('end', () => {
      stream.headers['content-length'] = stream.bytesRead;
    });
    stream.on('open', () => {
      req.emit('response', stream);
    });
  };
  return req;
}

function noop() {} // eslint-disable-line no-empty-function

module.exports = {
  request,
};
