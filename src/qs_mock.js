module.exports = {
  parse: (str) => {
    const parsed = {};
    for (const [k, v] of new window.URLSearchParams(str).entries())
      parsed[k] = v;
    return parsed;
  },
  stringify: (obj) => new window.URLSearchParams(obj).toString(),
};
