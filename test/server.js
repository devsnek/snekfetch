const http = require('http');

const server = http.createServer((req, res) => {
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
    default:
      res.end();
      break;
  }
});
server.on('connection', (socket) => socket.unref());
server.listen(0);
exports.port = server.address().port;

