'use strict';

const http = require('http');

const ref = require.main === module;

const server = http.createServer((req, res) => {
  if (!ref)
    req.connection.unref();
  switch (req.url) {
    case '/invalid-json':
      res.setHeader('Content-Type', 'application/json');
      res.end('{ "a": 1');
      break;
    case '/form-urlencoded':
      res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      res.end('test=1&hello=world');
      break;
    case '/echo': {
      req.on('data', (c) => { res.write(c); });
      req.on('end', () => { res.end(); });
      break;
    }
    default:
      res.end();
      break;
  }
});

server.on('connection', (socket) => {
  if (!ref)
    socket.unref();
});

server.listen(0);

exports.port = server.address().port;

if (ref)
  console.log(exports.port); // eslint-disable-line no-console
