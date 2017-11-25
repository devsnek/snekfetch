const syncify = require('@snek/syncify');
const Snekfetch = require('.');

class SnekfetchSync extends Snekfetch {
  end() {
    return syncify(super.end());
  }
}

module.exports = SnekfetchSync;
