const express = require('express');
const bodyParser = require('body-parser');
const { resolve } = require('path');

module.exports = class TestServer {
  constructor() {
    this.server = express();
    this.listener = null;
    this.routes = resolve(process.cwd(), 'test', 'www');

    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
    this.server.use(express.static(this.routes));

    this.server.get('/redirect', (req, res) => {
      res.redirect(302, '/success');
    });
  }

  start() {
    this.listener = this.server.listen(8081);
  }

  stop() {
    this.listener.close();
  }
};
