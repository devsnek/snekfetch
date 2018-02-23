'use strict';

/* eslint-env browser */
/* eslint-disable no-invalid-this */

function request(snek) {
  snek.options.body = snek.options.data;
  return window.fetch(snek.options.url, snek.options)
    .then((r) => r.text().then((t) => {
      const headers = {};
      for (const [k, v] of r.headers.entries())
        headers[k.toLowerCase()] = v;
      return {
        raw: t, headers,
        statusCode: r.status,
        statusText: r.statusText,
      };
    }));
}

module.exports = {
  request,
  shouldSendRaw: () => false,
  METHODS: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'PATCH'],
  Parent: Object,
  FormData: window.FormData,
  querystring: {
    parse: (str) => {
      const parsed = {};
      for (const [k, v] of new window.URLSearchParams(str).entries())
        parsed[k] = v;
      return parsed;
    },
    stringify: (obj) => new window.URLSearchParams(obj).toString(),
  },
};

