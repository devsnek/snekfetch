const mimes = require('./mimes.json');
const mimeOfBuffer = require('./mimeOfBuffer.js');

function lookupMime(ext) {
  return mimes[ext.replace(/^\./, '')] || mimes.bin;
}

function lookupBuffer(buffer) {
  return mimeOfBuffer(buffer) || mimes.bin;
}

module.exports = {
  buffer: lookupBuffer,
  lookup: lookupMime,
};
