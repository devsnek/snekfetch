const syncify = require('@snek/syncify');
const Snekfetch = require('.');

const originalEnd = Snekfetch.prototype.end;
Snekfetch.prototype.end = function end() {
  return syncify(originalEnd.call(this));
};

module.exports = Snekfetch;
