const deasync = require('@snek/deasync');
const Snekfetch = require('.');

const oldEnd = Snekfetch.prototype.end;

Snekfetch.prototype.end = function end() {
  return deasync(oldEnd.call(this));
};

module.exports = Snekfetch;
