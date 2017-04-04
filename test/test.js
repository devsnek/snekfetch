global.__PLZ_GIVE_NEW_SNEKFETCH = true;

const snekfetch = require('../');
const fs = require('fs');

// snekfetch.get('https://s.gus.host/o-SNAKES.jpg').pipe(fs.createWriteStream('out.jpg'));
snekfetch.get('https://httpbin.org/gzip').then(console.log);
