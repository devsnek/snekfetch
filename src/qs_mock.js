function parse(str) {
  const q = new window.URLSearchParams(str);
  const p = {};
  for (const [k, v] of q.entries()) p[k] = v;
  return p;
}

function stringify(obj) {
  return new window.URLSearchParams(obj).toString();
}

module.exports = { parse, stringify };
