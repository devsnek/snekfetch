const snekfetch = require('../');
const fs = require('fs');

// snekfetch.get('https://s.gus.host/o-SNAKES.jpg').pipe(fs.createWriteStream('out.jpg'));
// snekfetch.get('https://discordapp.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3')
//   .pipe(fs.createWriteStream('ring.mp3'));

snekfetch.post('https://httpbin.org/post')
  .set('X-Boop-Me', 'Dream plz')
  .query({ a: 1, b: 2 })
  .query('c', 3)
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({ a: 1 })
  .then(console.log);
