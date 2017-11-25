const syncify = require('@snek/syncify');
const Snekfetch = require('.');

const oldEnd = Snekfetch.prototype.end;

Snekfetch.prototype.end = function end() {
  return syncify(oldEnd.call(this));
};

module.exports = Snekfetch;
