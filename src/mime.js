const mimes = require('./mimes');
const mimeOfBuffer = require('./mimeOfBuffer');

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
