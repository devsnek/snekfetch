[![npm](https://img.shields.io/npm/v/snekfetch.svg?maxAge=3600)](https://www.npmjs.com/package/snekfetch)
[![npm](https://img.shields.io/npm/dt/snekfetch.svg?maxAge=3600)](https://www.npmjs.com/package/snekfetch)
[![David](https://david-dm.org/guscaplan/snekfetch.svg)](https://david-dm.org/guscaplan/snekfetch)

[![NPM](https://nodei.co/npm/snekfetch.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/snekfetch/)

# snekfetch

Just do http requests without all that weird nastiness from other libs

response.text is raw and always present  
response.body will be a buffer or an object and is not always present

you can `end` or `then` or `catch` a request just like superagent.  
You can also await it.  
It extends Stream.Readable.

```js
const snekfetch = require('snekfetch');

snekfetch.get('https://s.gus.host/o-SNAKES-80.jpg')
  .then(r => fs.writeFile('download.jpg', r.body));

snekfetch.get('https://s.gus.host/o-SNAKES-80.jpg')
  .pipe(fs.createWriteStream('download.jpg'));
```

```js
const snekfetch = require('snekfetch');

snekfetch.post('https://httpbin.org/post')
  .send({ meme: 'dream' })
  .then(r => console.log(r.body));
```

```js
const snekfetch = require('snekfetch');
const id = 'channel id';

snekfetch.post(`https://discordapp.com/api/channels/${id}/messages`)
  .set('Authorization', 'Super Secret Token')
  .set('Content-Type', 'application/json')
  .send({ 'memes' })
  .then(res => console.log(res));
```

```js
const snekfetch = require('snekfetch');
const key = 'your secret key';
const cx = 'your secret cx';
const query = 'you google search query';
const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&safe=high&q=${encodeURI(query)}`;

snekfetch.get(url)
  .then(res => {
	  if (res.body.queries.request[0].totalResults === '0') console.log('No results!');
	  else console.log(res.body.items[0].link);
});
```
