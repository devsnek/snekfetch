const { Agent } = require('http');
const net = require('net');
const tls = require('tls');
const { Agent: AgentSSL } = require('https');

class ForeverAgent extends Agent {
  constructor(options = {}) {
    super();
    this.requests = {};
    this.sockets = {};
    this.freeSockets = {};
    this.maxSockets = options.maxSockets || Agent.defaultMaxSockets;
    this.minSockets = options.minSockets || ForeverAgent.defaultMinSockets;
    this.on('free', (socket, host, port) => {
      const name = getConnectionName(host, port);

      if (this.requests[name] && this.requests[name].length) {
        this.requests[name].shift().onSocket(socket);
      } else if (this.sockets[name] && this.sockets[name].length < this.minSockets) {
        if (!this.freeSockets[name]) this.freeSockets[name] = [];
        this.freeSockets[name].push(socket);
        const onIdleError = () => socket.destroy();
        socket._onIdleError = onIdleError;
        socket.on('error', onIdleError);
      } else {
        socket.destroy();
      }
    });
  }

  addRequest(req, host, port) {
    const name = getConnectionName(host, port);
    if (typeof host !== 'string') {
      port = host.port;
      host = host.host;
    }

    if (this.freeSockets[name] && this.freeSockets[name].length > 0 && !req.useChunkedEncodingByDefault) {
      const idleSocket = this.freeSockets[name].pop();
      idleSocket.removeListener('error', idleSocket._onIdleError);
      delete idleSocket._onIdleError;
      req._reusedSocket = true;
      req.onSocket(idleSocket);
    } else {
      this.addRequestNoreuse(req, host, port);
    }
  }

  removeSocket(s, name, host, port) {
    if (this.sockets[name]) {
      let index = this.sockets[name].indexOf(s);
      if (index !== -1) {
        this.sockets[name].splice(index, 1);
      }
    } else if (this.sockets[name] && this.sockets[name].length === 0) {
      delete this.sockets[name];
      delete this.requests[name];
    }

    if (this.freeSockets[name]) {
      let index = this.freeSockets[name].indexOf(s);
      if (index !== -1) {
        this.freeSockets[name].splice(index, 1);
        if (this.freeSockets[name].length === 0) {
          delete this.freeSockets[name];
        }
      }
    }

    if (this.requests[name] && this.requests[name].length) {
      this.createSocket(name, host, port).emit('free');
    }
  }
}

ForeverAgent.defaultMinSockets = 5;

ForeverAgent.prototype.createConnection = net.createConnection;
ForeverAgent.prototype.addRequestNoreuse = Agent.prototype.addRequest;

class ForeverAgentSSL extends ForeverAgent {
  createConnection(port, host, options = {}) {
    if (typeof port === 'object') options = port;
    else if (typeof host === 'object') options = host;
    if (typeof port === 'number') options.port = port;
    if (typeof host === 'string') options.host = host;
    return tls.connect(options);
  }
}
ForeverAgentSSL.prototype.addRequestNoreuse = AgentSSL.prototype.addRequest;

ForeverAgent.SSL = ForeverAgentSSL;

function getConnectionName(host, port) {
  if (typeof host === 'string') return `${host}:${port}`;
  else return `${host.host}:${host.port}:${host.localAddress ? `${host.localAddress}:` : ':'}`;
}

module.exports = ForeverAgent;

