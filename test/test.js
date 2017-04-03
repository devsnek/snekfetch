const snekfetch = require('../src');

snekfetch.get('https://httpbin.org/gzip').then(console.log);
