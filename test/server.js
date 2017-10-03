const http = require('http');

const port = 30001;
const hostname = 'localhost';

const server = http.createServer((req, res) => {
  res.end('hi');
});

server.on('connection', (socket) => {
  socket.unref();
  socket.setTimeout(1500);
});

server.keepAliveTimeout = 1000;

server.listen(port, hostname);

module.exports = {
  server,
  port,
  hostname,
  start: (c) => server.listen(port, hostname, c),
  stop: (c) => server.close(c),
};
