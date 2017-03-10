const mimes = require('./mimes');
const mimeOfBuffer = require('./mimeOfBuffer');

function lookupMime(ext) {
  return mimes[ext] || mimes.bin;
}

function lookupBuffer(buffer) {
  const type = mimeOfBuffer(buffer);
  if (type) return type.mime;
  else return mimes.bin;
}

module.exports = {
  buffer: lookupBuffer,
  lookup: lookupMime,
};
